/**
 * PM2 process definition for the NestJS API.
 *
 * The frontend applications are compiled to static files and are served by
 * Nginx; only the API belongs in PM2.
 */
const apiDirectory = process.env.MACHI_SERVICE_API_CWD || '/opt/machi-service/current/apps/api';
const environmentFile = process.env.MACHI_SERVICE_ENV_FILE || '/etc/machi-service/api.env';

module.exports = {
  apps: [
    {
      name: 'machi-service-api',
      cwd: apiDirectory,
      script: 'dist/src/main.js',
      interpreter: '/usr/local/bin/node',
      node_args: `--env-file=${environmentFile}`,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: '512M',
      kill_timeout: 30000,
      time: true,
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
