import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { readFileSync } from 'fs';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-index-html',
      transformIndexHtml() {
        return readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      },
    },
    VitePWA({
      /* other options */
      /* enable sw on development */
      devOptions: {
        enabled: true
        /* other options */
      }
    })
  ],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@': path.resolve(__dirname, 'src'),
    },
  },
});