import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa'

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
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
     },
    })
  ],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@': path.resolve(__dirname, 'src'),
    },
  },
});