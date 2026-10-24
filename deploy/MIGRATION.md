# Migrating the hub off Ubuntu 18.04

## Why

The production box is a t3.micro running **Ubuntu 18.04 (EOL 2023), MariaDB
10.1.48 (EOL 2020) and Node 16.20.2 (EOL 2023)**. Node cannot be upgraded in
place: 18.04 has glibc 2.27 and Node 18+ needs 2.28, so a 24.x binary will not
start at all. That leaves the API on a runtime with no security fixes —
`CVE-2026-111497`, the Brotli decoder out-of-bounds write, among them.

It is also memory-bound and oversized on everything else: 949MB RAM with 225MB
free, against a load average of 0.08 and 97.8% CPU idle.

## Target

| | from | to |
|---|---|---|
| instance | t3.micro, 1GB, x86 | **t4g.small, 2GB, arm64** (Graviton) |
| OS | Ubuntu 18.04 | **Ubuntu 26.04 LTS** (to 2031) |
| Node | 16.20.2 | **24.x via NodeSource** (to 2028-04) |
| MariaDB | 10.1.48 | **11.8.6** (Ubuntu main, fully supported) |
| TLS | ALB + ACM | **Caddy + Let's Encrypt** |

AMI: `ami-00627c8cb63796b98` (26.04, arm64, gp3, eu-west-2).

Dropping the ALB is most of the saving. It costs **$19.05/mo plus $7.21 for the
two Elastic IPs bolted to its ENIs**, to serve 0.03 requests/second with no LCU
charge at all — 63% of the pre-tax bill. On-demand, the move takes the monthly
bill from **$41.97 to about $20.52 ex-tax** while doubling the RAM.

## Already done on the old box

- 2GB swap, `swappiness=10`, in `/etc/fstab`
- EBS gp2 → gp3 (100 → 3,000 IOPS)
- Port 8080 closed to the internet, restricted to the ALB's security group

## Rehearsed, with timings

A full dry run on Ubuntu 26.04 + Node 24.22.1 + MariaDB 11.8.6 + Caddy 2.11.7,
restoring a real production dump:

| step | time |
|---|---|
| `mysqldump --single-transaction` (212MB, 42MB gz) | **4.6s** |
| restore into MariaDB 11.8 | **8s** |
| verify row counts | <1s |

All 10 tables, 295,548 journeys and 23,574 members came through clean; 11.8
upgraded the row format Compact → Dynamic by itself. `/groups`, `/locations`
and `/scheme/6/report` all returned correct data through Caddy.

**Expect 1-2 minutes of downtime**, dominated by orchestration rather than data.

### Two things the rehearsal found

1. **MariaDB 11.8 authenticates `root@localhost` via `unix_socket`.** The app
   connects over TCP as root with no password, so it dies on boot with
   `Access denied for user 'root'@'localhost'`. `provision.sh` restores the
   10.1 behaviour (empty `mysql_native_password`). The better fix is a
   dedicated user with env-var credentials, but `getDatabaseConfig()` reads
   `config/database.json` only, so that is a code change — worth doing as a
   follow-up, not during the cutover.
2. **Ubuntu's `nodejs` is 22.22.1**, which predates the Brotli fix, and Ubuntu
   has the CVE marked "needs evaluation" on every release. Use NodeSource.

## Cutover

### 1. Launch (no downtime)

- t4g.small, `ami-00627c8cb63796b98`, eu-west-2a, 20GB gp3
- New security group: **22, 80 and 443**. 80 is required — Let's Encrypt's
  HTTP-01 challenge uses it.
- Allocate and associate an Elastic IP.

### 2. Provision (no downtime)

```sh
git clone https://github.com/EcoRewards/eco-rewards-hub.git /tmp/hub
/tmp/hub/deploy/provision.sh
```

Then copy `.env` to `/home/ubuntu/eco-rewards-hub/source/.env` and add the
deploy public key to `~ubuntu/.ssh/authorized_keys`.

### 3. Dress rehearsal (no downtime)

Restore a dump taken while the old box is still serving, start the app, and
check it answers on `127.0.0.1:8080`. This is throwaway data — its only job is
to prove the box works before you stop writes.

### 4. Cutover (1-2 minutes)

```sh
# on the old box - stop writes
pm2 stop eco-rewards-hub
mysqldump -u root --single-transaction --routines --triggers --events \
  --default-character-set=utf8mb4 ecorewards | gzip -1 > /tmp/eco.sql.gz

# on the new box
gunzip -c eco.sql.gz | mariadb -u root ecorewards
mariadb -u root -N -e 'select count(*) from ecorewards.journey'   # expect ~295,500
cd /home/ubuntu/eco-rewards-hub/source && npm run migrate
pm2 start ecosystem.config.js --env production
curl -s localhost:8080/health
```

Then point DNS at the new box: replace the `api.ecorewards.co.uk` A-ALIAS
(currently targeting `eco-api-...elb.amazonaws.com`) with an **A record to the
new Elastic IP**. It resolves at a 60s TTL, so propagation is about a minute.

Once DNS resolves, `sudo systemctl start caddy` — it will obtain the
certificate on first request.

### 5. Verify

```sh
curl -sI https://api.ecorewards.co.uk/health            # 200, HTTP/2, valid cert
curl -s  https://api.ecorewards.co.uk/groups | head -c 200
```

Check `/tap` is landing: `pm2 logs eco-rewards-hub`. The LoRaWAN devices report
around the clock at 12-34/hour, so taps should appear within minutes.

### 6. Afterwards

- Update `DEPLOY_HOST` in `ecosystem.config.js`, the `SSH_KNOWN_HOSTS` secret,
  and `node-version` in `deploy.yml`; drop 16 from the CI matrix.
- Leave the old instance **stopped, not terminated**, for a week or two.
- Release the two Elastic IPs that were attached to the ALB, then delete the
  ALB and its target group. They bill until they are gone.
- Nothing health-checks the app once the ALB is gone — add an uptime check on
  `/health`.

## Rollback

Before DNS is changed: nothing to undo, the old box is still live.

After: point the A record back at the ALB alias and start the old app. Writes
that landed on the new box in between are lost, so roll back promptly or not at
all. The window is small because the old box keeps its data untouched.

## Pick a quiet window

There is no idle period — `/tap` runs 24/7. The lightest is **02:00-05:00** at
around 35 requests/hour, where a 2-minute freeze would expect to miss about one
tap. Return 503 rather than refusing connections, since TTN retries webhooks on
5xx.
