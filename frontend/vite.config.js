/* ─────────────────────────────────────────
   vite.config.js
───────────────────────────────────────── */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      /* '@/components/ui' instead of '../../components/ui' */
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 5173,
    /* Proxy API calls to local Node backend during development */
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // set true locally for debugging
    rollupOptions: {
      output: {
        /* Split vendor chunks for better caching */
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
