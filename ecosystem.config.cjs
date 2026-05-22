module.exports = {
  apps: [
    {
      name: "foodtrip-api-ts",
      script: "./dist/index.js",
      instances: "1",
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      ignore_watch: ["node_modules", "public/uploads", "logs", ".git"],
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      max_memory_restart: "500M",
      kill_timeout: 5000,
      kill_signal: "SIGTERM",
      wait_ready: true,
      listen_timeout: 8000, // ✅ Increased from 3000 to 8000
      max_restarts: 30, // ✅ Increased from 10
      min_uptime: "30s", // ✅ Increased from 10s
    },
  ],
};
