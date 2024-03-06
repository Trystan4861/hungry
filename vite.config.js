import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@': path.resolve(__dirname, 'src'), // Establece el alias para el directorio src
    }
  }
})
