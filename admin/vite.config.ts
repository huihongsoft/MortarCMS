import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  build: {
    // The grapesjs chunk is ~1.1MB minified (the page builder lib itself is
    // that large); it loads on demand only when the visual editor opens.
    // The limit stays meaningful for every other chunk, so a future regression
    // anywhere else still gets flagged.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-image'],
          'markdown': ['markdown-it', 'turndown', 'dompurify'],
          // GrapesJS is ~1MB minified; keep it as its own chunk so it loads
          // on demand (visual editor only) and caches independently of app code
          'grapesjs': ['grapesjs'],
        },
      },
    },
  },
});
