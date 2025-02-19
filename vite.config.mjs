import { defineConfig } from 'vite';
import fs from 'fs';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server:{
    https:{
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost-cert.pem'),
    },
    host: 'localhost',
    port: 5173,
  },
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
      '@':            path.resolve(__dirname, 'src'),
      '@assets':      path.resolve(__dirname, 'src/assets'),
      '@css':         path.resolve(__dirname, 'src/assets/css'),
      '@components':  path.resolve(__dirname, 'src/components'),
      '@slots':       path.resolve(__dirname, 'src/slots'), 
    },
  },
});