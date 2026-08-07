import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(() => {
  const entry = process.env.ESM_ENTRY || 'react';
  return {
    define: { 'process.env.NODE_ENV': '"production"' },
    build: {
      outDir: 'dist-esm',
      emptyOutDir: true,
      lib: { entry: resolve(__dirname, 'esm/' + entry + '.js'), formats: ['es'], name: 'x' },
      rollupOptions: {
        external: entry === 'react-dom' ? ['react'] : [],
        output: { entryFileNames: 'esm-' + entry + '.js', inlineDynamicImports: true },
      },
    },
  };
});
