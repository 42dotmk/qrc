import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  base: '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      manifest: {
        name: 'QR Canvas',
        short_name: 'QR Canvas',
        description: 'Beautiful, fully client-side QR code generator with advanced design customization.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6366f1',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
});
