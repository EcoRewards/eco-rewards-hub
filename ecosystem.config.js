module.exports = {
    apps : [{
        name: "eco-rewards-hub",
        interpreter: "./node_modules/.bin/ts-node",
        script: "src/start.ts",
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
            "host": ["3.8.141.48"],
            "ref": "origin/master",
            "repo": "git@github.com:EcoRewards/eco-rewards-hub.git",
            "path": "/home/ubuntu/eco-rewards-hub",
            "post-deploy": "npm install && npm install --only=dev && npm run migrate && pm2 startOrRestart ecosystem.config.js --env production",
            "env"  : {
                "NODE_ENV": "production"
            }
        }
    }
};
