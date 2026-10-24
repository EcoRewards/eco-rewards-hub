#!/usr/bin/env bash
#
# Provision a fresh eco-rewards-hub host: Ubuntu 26.04 LTS, arm64, t4g.small.
# Replaces the Ubuntu 18.04 / Node 16 / MariaDB 10.1 box, and terminates TLS
# with Caddy instead of an ALB. See MIGRATION.md for the full cutover.
#
# Run as ubuntu on a bare instance:  sudo -v && ./provision.sh
#
set -euo pipefail

NODE_MAJOR=${NODE_MAJOR:-24}
DOMAIN=${DOMAIN:-api.ecorewards.co.uk}
APP_DIR=/home/ubuntu/eco-rewards-hub
DB=ecorewards

echo "==> swap (the old box had none, and a restore needs headroom)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf >/dev/null
  sudo sysctl -q -w vm.swappiness=10
fi

echo "==> base packages"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq curl ca-certificates gnupg rsync git unattended-upgrades

echo "==> Node ${NODE_MAJOR} from NodeSource"
# Not the Ubuntu package: 26.04 ships nodejs 22.22.1, which predates the
# 22.23.4 Brotli fix (CVE-2026-111497), and Ubuntu still has that CVE marked
# "needs evaluation" on every release. NodeSource tracks upstream.
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt-get install -y -qq nodejs
node -v

echo "==> MariaDB"
sudo apt-get install -y -qq mariadb-server
sudo tee /etc/mysql/mariadb.conf.d/60-eco.cnf >/dev/null <<'CNF'
[mysqld]
bind-address = 127.0.0.1
# 2GB box, ~160MB of data: the working set fits in memory with room to spare.
innodb_buffer_pool_size = 512M
max_connections = 50
CNF
sudo systemctl restart mariadb
sudo systemctl enable -q mariadb
sudo mariadb -e "create database if not exists ${DB} character set utf8mb4 collate utf8mb4_general_ci"

# 11.8 authenticates root@localhost via unix_socket, so the app's TCP
# connection as root is refused and it dies on boot. 10.1 used an empty
# mysql_native_password, which is what config/database.json still expects.
# This restores that, no more and no less. MIGRATION.md has the follow-up.
sudo mariadb -e "alter user 'root'@'localhost' identified via mysql_native_password using password(''); flush privileges;"

echo "==> Caddy (official repo, not the 2.6.2 in the Ubuntu archive)"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq caddy
sudo install -d -o caddy -g caddy /var/log/caddy
sudo cp "$(dirname "$0")/Caddyfile" /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable -q caddy
# Not started: the ACME HTTP-01 challenge needs DNS pointing here first.
sudo systemctl stop caddy 2>/dev/null || true

echo "==> pm2"
sudo npm install -g pm2@latest
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

echo "==> deploy layout (what pm2 deploy expects)"
mkdir -p "${APP_DIR}"/{source,incoming-dist,shared}
ln -sfn "${APP_DIR}/source" "${APP_DIR}/current"

echo "==> unattended security upgrades"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

cat <<EOF

Provisioned for ${DOMAIN}. Still to do by hand (MIGRATION.md steps 3-5):
  1. Copy .env into ${APP_DIR}/source/.env  (never in git)
  2. Add the deploy public key to ~ubuntu/.ssh/authorized_keys
  3. Restore the database dump
  4. Point DNS here, then: sudo systemctl start caddy
EOF
