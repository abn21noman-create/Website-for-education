import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Every module is a lazy route, so the data files must stay in their own
    // view chunk. Grouping all of `/src/data` into a single `academic-data`
    // chunk forced phones to download the entire 1,700-question MCQ bank
    // before the dashboard could render.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/react')) return 'react-core';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
