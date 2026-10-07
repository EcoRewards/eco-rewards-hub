const host = process.env.DEPLOY_HOST || "35.178.105.63";
const path = "/home/ubuntu/eco-rewards-hub";

// The build is compiled by the deploy workflow and uploaded to incoming-dist,
// so the server only installs runtime dependencies, migrates and restarts. The
// running app is left untouched until the last two steps, which means a failed
// install or migration no longer takes the API down with it.
const postDeploy = [
    "npm install --omit=dev --no-audit --no-fund --prefer-offline",
    "npm run migrate",
    `rsync -a --delete ${path}/incoming-dist/ ${path}/source/dist/`,
    "pm2 startOrRestart ecosystem.config.js --env production",
    "pm2 save"
].join(" && ");

module.exports = {
    apps : [{
        name: "eco-rewards-hub",
        script: "dist/src/start.js",
        node_args: "--tls-min-v1.0",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }],
    deploy : {
        production : {
            "ssh_options": "StrictHostKeyChecking=no",
            "key": "deploy.key",
            "user": "ubuntu",
            "host": [host],
            "ref": "origin/master",
            "repo": "git@github.com:EcoRewards/eco-rewards-hub.git",
            "path": path,
            "post-deploy": postDeploy,
            "env"  : {
                "NODE_ENV": "production"
            }
        }
    }
};
