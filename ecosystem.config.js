module.exports = {
    apps: [
        {
            name: "redis-utilities-backend",
            script: 'npm',
            args: 'run pm2-backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env_production: {
                NODE_ENV: "production",
            },
            error_file: "./logs/pm2/backend-error.log",
            out_file: "./logs/pm2/backend-out.log",
            log_date_format: 'YYYY-MM-DD HH:mm Z',
        },
        {
            name: "redis-utilities-frontend",
            script: 'npm',
            args: 'run pm2-frontend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env_production: {
                NODE_ENV: "production",
            },
            error_file: "./logs/pm2/frontend-error.log",
            out_file: "./logs/pm2/frontend-out.log",
            log_date_format: 'YYYY-MM-DD HH:mm Z',
        },
    ],
};