// Build one theme at a time as a standalone ESM bundle (no shared chunks)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const themeName = process.env.THEME_NAME || 'default';

export default defineConfig({
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [react()],
  build: {
    outDir: 'dist/themes',
    emptyOutDir: false,
    lib: { entry: resolve(__dirname, 'src/themes/' + themeName + '/index.ts'), formats: ['es'], name: 'x' },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
      output: { entryFileNames: themeName + '.js', inlineDynamicImports: true },
    },
  },
});
