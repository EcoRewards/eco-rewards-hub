module.exports = {
    apps : [{
        name: "eco-rewards-hub",
        script: "dist/src/start.js",
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
            "key": "deploy",
            "user": "ubuntu",
            "host": ["35.178.27.220"],
            "ref": "origin/master",
            "repo": "git@github.com:EcoRewards/eco-rewards-hub.git",
            "path": "/home/ubuntu/eco-rewards-hub",
            "post-deploy": "npm install && npm run migrate && npm run prepublishOnly && pm2 startOrRestart ecosystem.config.js --env production",
            "env"  : {
                "NODE_ENV": "production"
            }
        }
    }
};
