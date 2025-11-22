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
      includeAssets: ['favicon.ico', 'kandlate.png', 'logo192.png', 'logo512.png'],
      
      manifest: {
        name: 'KindPlate - Спасаем еду от выбрасывания',
        short_name: 'KindPlate',
        description: 'Платформа для покупки готовой еды с коротким сроком годности',
        theme_color: '#10b981',
        background_color: '#111827',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'kandlate.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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
      },
      registerType: 'prompt' // Вместо autoUpdate используем prompt для контроля обновлений
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
