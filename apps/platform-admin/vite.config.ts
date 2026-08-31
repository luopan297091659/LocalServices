import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

function normalizedPublicPath(): string {
  const value = process.env.VITE_PUBLIC_PATH?.trim() ?? '';
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

export default defineConfig({
  base: `${normalizedPublicPath()}/platform-admin/`,
  plugins: [vue()],
  server: { host: '0.0.0.0', proxy: { '/api': 'http://127.0.0.1:3001', '/uploads': 'http://127.0.0.1:3001' } },
});
