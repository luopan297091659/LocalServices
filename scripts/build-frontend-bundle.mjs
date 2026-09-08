import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configuredPath = process.env.VITE_PUBLIC_PATH?.trim() || '/local-services';
const publicPath = configuredPath === '/' ? '' : `/${configuredPath.replace(/^\/+|\/+$/g, '')}`;

if (!/^\/[a-z0-9][a-z0-9/_-]*$/.test(publicPath) || publicPath.includes('//')) {
  throw new Error('VITE_PUBLIC_PATH must be a safe non-root path such as /local-services');
}

const buildEnvironment = {
  ...process.env,
  VITE_PUBLIC_PATH: publicPath,
  VITE_API_URL: process.env.VITE_API_URL || `${publicPath}/api/v1`,
};

for (const workspace of ['@local/web-client', '@local/merchant-admin', '@local/platform-admin']) {
  const isWindows = process.platform === 'win32';
  const result = spawnSync(
    isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm',
    isWindows ? ['/d', '/s', '/c', `npm run build --workspace=${workspace}`] : ['run', 'build', `--workspace=${workspace}`],
    {
    cwd: rootDirectory,
    env: buildEnvironment,
    stdio: 'inherit',
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const outputDirectory = resolve(rootDirectory, 'artifacts', 'frontend', publicPath.slice(1));
rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const sources = [
  ['apps/web-client/dist', '.'],
  ['apps/merchant-admin/dist', 'merchant-admin'],
  ['apps/platform-admin/dist', 'platform-admin'],
];
for (const [source, destination] of sources) {
  const sourceDirectory = resolve(rootDirectory, source);
  if (!existsSync(sourceDirectory)) throw new Error(`Build output is missing: ${source}`);
  cpSync(sourceDirectory, resolve(outputDirectory, destination), { recursive: true });
}

console.log(`Frontend bundle created: ${outputDirectory}`);
