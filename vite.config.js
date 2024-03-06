import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { readFileSync } from 'fs';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-index-html',
      transformIndexHtml(html) {
        return readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      },
    },
  ],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@': path.resolve(__dirname, 'src'),
    },
  },
});