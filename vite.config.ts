import { defineConfig } from 'vite';
// import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    //   manifest: {
    //     name: 'QuickChat',
    //     short_name: 'QuickChat',
    //     description: 'Современный мессенджер',
    //     id: '/',
    //     start_url: '/',
    //     scope: '/',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#000000',
    //     orientation: 'portrait-primary',
    //     icons: [
    //       { src: 'appicon-16x16.png', sizes: '16x16', type: 'image/png' },
    //       { src: 'appicon-32x32.png', sizes: '32x32', type: 'image/png' },
    //       { src: 'appicon-48x48.png', sizes: '48x48', type: 'image/png' },
    //       { src: 'appicon-64x64.png', sizes: '64x64', type: 'image/png' },
    //       { src: 'appicon-128x128.png', sizes: '128x128', type: 'image/png' },
    //       { src: 'appicon-144x144.png', sizes: '144x144', type: 'image/png' },
    //       { src: 'appicon-192x192.png', sizes: '192x192', type: 'image/png' },
    //       { src: 'appicon-256x256.png', sizes: '256x256', type: 'image/png' },
    //     ],
    //     screenshots: [
    //       {
    //         src: 'screenshots/mobile.png',
    //         sizes: '713x1551',
    //         type: 'image/png',
    //         form_factor: 'narrow',
    //         label: 'Главный экран чата на мобильном устройстве',
    //       },
    //       {
    //         src: 'screenshots/desktop.png',
    //         sizes: '3054x1776',
    //         type: 'image/png',
    //         form_factor: 'wide',
    //         label: 'Интерфейс чата на компьютере',
    //       },
    //     ],
    //   },
    // }),
  ],
});
