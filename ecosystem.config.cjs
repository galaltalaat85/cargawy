// PM2 process file for a VPS deployment: `pm2 start ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: "cargawy",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1, // in-memory rate limiting assumes one instance; add Redis before scaling out
      exec_mode: "fork",
      max_memory_restart: "900M",
      env: { NODE_ENV: "production" },
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      time: true,
    },
  ],
};
