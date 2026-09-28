// Server-side rendering entry.
//
// Built by vite.ssr.config.ts into frontend/dist-ssr/entry-server.js, which the
// server loads and calls per request (server/src/utils/ssr.ts). It renders the
// same <App> the browser does, at the requested URL, with the settings, theme and
// content the server resolved — and returns both the markup and the payload the
// client needs to hydrate it.
//
// Nothing here may read the browser: no window, no document, no localStorage.
// What a render needs comes in through `options` or from lib/ssr.ts, and the
// client receives the same values in window.__MORTAR_SSR__ (see main.tsx).

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import createDOMPurify from 'dompurify';
import App, { registerEagerRoutes } from './App';
import { seedTheme } from './themes';
import { serverTheme } from './themes/registry';
import { setPermalinkPrefix } from './lib/permalink';
import { setPurifyInstance } from './lib/purify';
import { setSsrPayload, type SsrPayload } from './lib/ssr';
import { themeVarsCss } from './lib/themeColor';

// DOMPurify needs a DOM. Without one it exports the createDOMPurify *factory*, and
// calling `.sanitize()` on that throws — inside the route's Suspense boundary,
// which React answers by client-rendering the boundary, so every article came out
// as a spinner.
//
// The DOM comes from the caller (server/src/utils/ssr.ts, which owns jsdom) rather
// than being bundled here: jsdom loads its own data files at runtime, so bundling
// it produces an artifact that cannot start. It also must be jsdom and not a
// lighter DOM — DOMPurify's `isSupported` check fails on those and it then returns
// the input *unchanged*, silently emitting the very `<script>` it was meant to
// remove. A render without a usable purifier is refused (no markup at all) rather
// than served unsanitized.
let purifierFor: any = null;
let purifier: any = null;

function purifierForWindow(domWindow: any): any {
  if (purifier && purifierFor === domWindow) return purifier;
  const candidate = createDOMPurify(domWindow);
  if (!candidate?.isSupported) return null;
  purifierFor = domWindow;
  purifier = candidate;
  return candidate;
}

// The routes are code-split for the browser (App.tsx), and React.lazy suspends —
// which renderToString cannot wait for. Handing the real components over before
// the first render is what makes the content land in the HTML instead of a
// spinner. Registered once, at module load.
import Home from './pages/Home';
import PostPage from './pages/Post';
import PageView from './pages/Page';
import SearchPage from './pages/Search';
import ArchivePage from './pages/Archive';
import LinksPage from './pages/Links';
import AuthorPage from './pages/Author';
import NotFound from './pages/NotFound';
import ShareView from './pages/ShareView';
import Register from './pages/Register';
import Login from './pages/Login';
import Install from './pages/Install';
import SubmitPost from './pages/SubmitPost';
import MyPosts from './pages/MyPosts';
import Profile from './pages/Profile';
import NewsletterConfirm from './pages/NewsletterConfirm';

registerEagerRoutes({
  Home, PostPage, PageView, SearchPage, ArchivePage, LinksPage, AuthorPage, NotFound,
  ShareView, Register, Login, Install, SubmitPost, MyPosts, Profile, NewsletterConfirm,
});

export interface RenderOptions {
  /** The request path, including any language prefix and query string. */
  url: string;
  settings: Record<string, string>;
  /** Active theme name; the renderer refuses one it does not have. */
  themeName?: string;
  /** Comma-separated content languages, default first. */
  contentLangs?: string;
  /** Request origin (scheme://host), for absolute SEO URLs. */
  origin: string;
  /** Content the caller already fetched, keyed the way the pages expect. */
  data?: Record<string, any>;
  /**
   * A DOM window for DOMPurify (jsdom's, created by the caller). Without one the
   * renderer refuses to render rather than emit unsanitized content.
   */
  domWindow?: any;
}

export interface RenderResult {
  /** Markup for #root, or null when this theme cannot be rendered here. */
  html: string | null;
  /** The payload to ship to the client (also what the render itself used). */
  payload: SsrPayload;
}

// The renderer is a pure function of its options, but the modules it drives keep
// a little render-time state (lib/ssr.ts, lib/permalink.ts). Re-seeding it on
// every call is what keeps the second request from inheriting the first one's
// theme, path or content.
export function render(options: RenderOptions): RenderResult {
  const theme = serverTheme(options.themeName);
  const payload: SsrPayload = {
    settings: options.settings,
    themeName: theme ? theme.name : undefined,
    path: options.url.split('?')[0],
    permalink: options.settings.permalink_structure,
    origin: options.origin,
    now: Date.now(),
    data: options.data || {},
    contentLangs: options.contentLangs,
    // The theme's palette, for the shell's <head>: App.tsx would otherwise apply
    // it in an effect, which is a visible flash of the default blue on the first
    // paint of every page.
    themeCss: themeVarsCss(options.settings) || undefined,
    rendered: true,
  };

  // A theme the renderer does not have is not rendered at all: emitting the
  // default theme's markup for a site running another one would show the wrong
  // design until the client took over, which is worse than today's empty shell.
  if (!theme) return { html: null, payload: { ...payload, rendered: false } };

  // Same for a missing DOM: without it DOMPurify cannot sanitize, and rendering
  // anyway would put post content into the page unescaped.
  const active = purifierForWindow(options.domWindow);
  if (!active) return { html: null, payload: { ...payload, rendered: false } };

  setPurifyInstance(active);
  setSsrPayload(payload);
  setPermalinkPrefix(options.settings.permalink_structure);

  // The app builds its own ThemeProvider from `loadedTheme()`, so the resolved
  // theme is seeded into that cache rather than handed to a second provider around
  // the app — which the inner one silently overrode.
  seedTheme(theme.name, theme);
  const html = renderToString(
    React.createElement(StaticRouter, { location: options.url }, React.createElement(App))
  );
  return { html, payload };
}

export default { render };
