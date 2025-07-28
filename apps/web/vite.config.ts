import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    // Define global for Yjs
    global: 'globalThis',
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Manual polyfills for Yjs
  optimizeDeps: {
    include: ['yjs', 'y-indexeddb', 'y-prosemirror'],
  },
});
