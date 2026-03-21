import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ 
      autoCodeSplitting: true,
      enableRouteGeneration: true
    }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // Используем prompt вместо autoUpdate для избежания ошибок
      includeAssets: [
        'icons/favicon-16x16.png',
        'icons/favicon-32x32.png',
        'icons/icon72.png',
        'icons/icon96.png',
        'icons/icon128.png',
        'icons/icon144.png',
        'icons/icon152.png',
        'icons/icon192.png',
        'icons/icon384.png',
        'icons/icon512.png',
        'icons/maskable-icon-192x192.png',
        'icons/maskable-icon-512x512.png'
      ],
      
      manifest: {
        name: 'KindPlate',
        short_name: 'KindPlate',
        description: 'KindPlate — заведения отдают нераспроданную еду со скидкой. Экономьте и помогайте планете.',
        theme_color: '#10b981',
        background_color: '#111827',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['food', 'shopping', 'lifestyle']
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/uploads\/offers\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offers-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /\/customer\/(sellers|vendors)\?.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-readonly-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\/.*/, /^\/uploads\/.*/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },

      devOptions: {
        enabled: false, // Отключаем Service Worker в dev режиме для избежания ошибок
        type: 'module'
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Позволяет подключаться с других устройств
    port: 3000, // Изменяем порт на 3000 как в package.json
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['@tanstack/react-router', '@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'vaul', '@radix-ui/react-dialog', '@radix-ui/react-slot'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['axios', 'dayjs', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  optimizeDeps: {
    exclude: [
      '@tanstack/react-devtools',
      '@tanstack/react-router-devtools',
      'react-map-gl',
      'mapbox-gl'
    ],
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-router',
      'lucide-react',
      'vaul',
      'axios'
    ],
    force: true
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
})
