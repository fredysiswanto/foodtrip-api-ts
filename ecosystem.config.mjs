export default {
  apps: [
    {
      name: "foodtrip-api-ts",
      script: "dist/index.js",
      cwd: "./",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_restarts: 5,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
