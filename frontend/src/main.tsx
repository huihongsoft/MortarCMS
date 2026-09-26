import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { loadTheme, loadedTheme } from './themes';
import { markClientLive, setSsrPayload, ssrRendered } from './lib/ssr';
import { detectScriptNonce } from './lib/nonce';
import './index.css';

// Bootstrap.
//
// When the server rendered this page it reads the render payload, resolves the
// theme the HTML was built with, and hydrates — so the first client render
// produces the same markup, which is the whole point. Anything else (a theme the
// server could not render, a shell with no payload) falls back to the previous
// behaviour: an ordinary client render.
async function start(): Promise<void> {
  const root = document.getElementById('root')!;
  // The document's nonce, for the scripts the app re-creates (header/footer code).
  detectScriptNonce();
  const payload = (window as any).__MORTAR_SSR__;
  if (payload && typeof payload === 'object') setSsrPayload(payload);

  const tree = React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null, React.createElement(App))
  );

  if (ssrRendered()) {
    try {
      // Resolve the theme *before* the first render: ThemeProvider starts from
      // loadedTheme(name), so the theme the server used is what it renders.
      if (payload.themeName) await loadTheme(payload.themeName);
      if (loadedTheme(payload.themeName)?.name === payload.themeName) {
        // A hydration that throws (rather than merely mismatching, which React
        // recovers from) must not leave the visitor with a dead page: fall through
        // to a plain client render.
        try {
          hydrateRoot(root, tree);
          markClientLive();
          return;
        } catch { /* fall through to a client render */ }
      }
      // The theme resolved to something else (rebuilt or removed since the HTML
      // was written): that markup is not this app's, so start over.
    } catch { /* fall through to a client render */ }
  }

  root.replaceChildren();
  createRoot(root).render(tree);
  markClientLive();
}

void start();
