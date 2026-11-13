import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

const srcPath = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      },
    }),
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
