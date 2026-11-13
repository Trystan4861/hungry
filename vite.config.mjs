import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const srcPath = (path) => fileURLToPath(new URL(path, import.meta.url));
const appPackage = JSON.parse(readFileSync(srcPath('./package.json'), 'utf8'));

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
  },
  plugins: [
    vue(),
    {
      name: 'hungry-service-worker',
      apply: 'build',
      generateBundle() {
        const worker = readFileSync(srcPath('./src/service-worker.js'), 'utf8')
          .replace('__APP_VERSION__', `${appPackage.version}-${appPackage.revision}`);
        this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: worker });
      },
    },
  ],
  resolve: {
    alias: {
      '@': srcPath('./src'),
      '@assets': srcPath('./src/assets'),
      '@css': srcPath('./src/assets/css'),
      '@components': srcPath('./src/components'),
      '@slots': srcPath('./src/slots'),
    },
  },
});
