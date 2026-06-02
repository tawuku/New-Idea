/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: "nexus-api",
      cwd: "./apps/api",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        HOST: "0.0.0.0",
      },
      error_file: "../../logs/api-error.log",
      out_file: "../../logs/api-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: "nexus-web",
      cwd: "./apps/web",
      // After `pnpm build`, Next.js standalone server is at .next/standalone/server.js
      script: "./.next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      error_file: "../../logs/web-error.log",
      out_file: "../../logs/web-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
