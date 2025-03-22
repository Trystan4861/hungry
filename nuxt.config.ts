// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    process.env.NODE_ENV === 'production'
      ? ['@vite-pwa/nuxt', {
          manifest: {
            name: 'nHungry - Lista de la Compra',
            short_name: 'nHungry',
            description: 'Gestiona tu lista de la compra con facilidad',
            theme_color: '#4CAF50',
            icons: [
              { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/ik\.imagekit\.io\/.*/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24, // 1 día
                  },
                },
              },
            ],
          },
        }]
      : '',
  ],
  components: [
    {
      global: true,
      path: '~/components',
      pathPrefix: false,
    },
  ],
  css: [
    'bootstrap/dist/css/bootstrap.min.css', // Agrega Bootstrap
    '~/css/app.vue.css',  // Tu archivo CSS personalizado
  ],
  build: {
    transpile: ['bootstrap'], // Asegura que Bootstrap se transpile
  },
  typescript: {
    strict: true
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    resolve: {
      alias: {
        '~/types': 'types'
      }
    }
  },
})
