// Server-side rendering build.
//
// Produces a single self-contained file (frontend/dist-ssr/entry-server.js) that
// the server loads at runtime. React, react-dom and react-router are bundled in
// rather than left external: the server has no React of its own, and bundling
// the very same copies the browser gets from /esm-react.js is what keeps the two
// renders identical — a version skew between them would show up as a hydration
// mismatch on every page.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'dist-ssr',
    emptyOutDir: true,
    target: 'node18',
    // jsdom is large; minifying keeps the artifact (and the startup parse) down.
    minify: 'esbuild',
    ssr: resolve(__dirname, 'src/entry-server.tsx'),
    rollupOptions: {
      // One file, no chunks: the dynamic imports are the app's route split, and
      // the renderer needs them resolved synchronously-ish inside one module.
      output: { entryFileNames: 'entry-server.js', format: 'es', inlineDynamicImports: true },
    },
    ssrEmitAssets: false,
    // index.css belongs to the browser entry; the server render inlines no CSS.
    cssCodeSplit: false,
  },
  ssr: {
    // Bundle everything (including react-dom/server) so dist-ssr needs no
    // node_modules resolution at runtime.
    noExternal: true,
    target: 'node',
  },
});
