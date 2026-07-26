import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Pa_mSikA frontend — talks to the FastAPI backend at app/api/v1.
// In production the backend serves this build's dist/ folder directly
// (same-origin), so the app defaults to a relative "/api/v1" base and no
// CORS is needed. In local dev (`npm run dev`, port 3000) we proxy
// /api and /uploads to the backend dev server so cookies + auth work
// identically without configuring CORS by hand.
const BACKEND_DEV_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: BACKEND_DEV_URL,
          changeOrigin: true,
        },
        '/uploads': {
          target: BACKEND_DEV_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
