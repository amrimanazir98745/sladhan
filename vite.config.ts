import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico', 'favicon.png', 'app-logo.svg',
          'favicon-32x32.png', 'apple-touch-icon.png',
          'apple-touch-icon-precomposed.png',
          'icon-192.png', 'icon-512.png',
          'bg-pattern.svg',
        ],
        workbox: {
          // Cache all JS, CSS, HTML, SVG, PNG, ico, audio
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2,mp3,m4a}'],
          // Max 50 MB per audio file
          maximumFileSizeToCacheInBytes: 55 * 1024 * 1024,
          // Network-first for navigation (always fresh HTML if online)
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            // Google Fonts — cache-first
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: {
          short_name: 'SL Prayer Times',
          name: 'SL Prayer Times',
          description: 'Sri Lanka 100% Offline Prayer Times, Hijri Calendar, Tasbih & Duas',
          icons: [
            { src: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
            { src: '/icon-192.png',         type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
            { src: '/icon-512.png',         type: 'image/png', sizes: '512x512', purpose: 'any maskable' },
            { src: '/app-logo.svg',         type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
          ],
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0A2A35',
          theme_color: '#0E4A5C',
          categories: ['utilities', 'lifestyle'],
          prefer_related_applications: false,
          shortcuts: [
            {
              name: 'Prayer Schedule',
              short_name: 'Schedule',
              url: '/?tab=today',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Digital Tasbih',
              short_name: 'Tasbih',
              url: '/?tab=tasbih',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
          ],
        },
        devOptions: {
          // Enable SW in dev mode so you can test offline locally
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
