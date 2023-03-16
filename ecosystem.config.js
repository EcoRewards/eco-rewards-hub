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
            "host": ["35.178.105.63"],
            "ref": "origin/master",
            "repo": "git@github.com:EcoRewards/eco-rewards-hub.git",
            "path": "/home/ubuntu/eco-rewards-hub",
            "post-deploy": "pm2 stop ecosystem.config.js && npm install --include=dev && npm run migrate && npm run prepublishOnly && pm2 start ecosystem.config.js",
            "env"  : {
                "NODE_ENV": "production"
            }
        }
    }
};
