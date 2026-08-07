import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' } },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
      output: { chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' },
    },
  },
});
