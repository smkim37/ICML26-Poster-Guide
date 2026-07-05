import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA: precache-only, autoUpdate — runtimeCaching 추가 금지 (docs/02 §6)
export default defineConfig({
  base: '/ICML26-Poster-Guide/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icml-logo.svg', 'icml-navbar-logo.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: '/ICML26-Poster-Guide/index.html',
      },
      manifest: {
        name: 'ICML 2026 Poster Guide',
        short_name: 'ICML26',
        start_url: '/ICML26-Poster-Guide/',
        scope: '/ICML26-Poster-Guide/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#18181b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
