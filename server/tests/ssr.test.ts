import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';
import { injectSeoMeta, injectSsrRoot, buildSeoMeta, stampInlineScripts, applyNonce, NONCE_PLACEHOLDER } from '../src/utils/seoMeta';
import { cacheSet, cacheGet, purgeContentCaches } from '../src/utils/cache';

// Server-side rendering.
//
// The two halves are verified separately: the document surgery (which is pure and
// always testable) and the renderer bundle itself (which only exists after
// `vite build --config vite.ssr.config.ts`, so that part is skipped when it has
// not been built — CI runs it as its own step after the frontend build).

const SSR_BUNDLE = path.join(__dirname, '../../frontend/dist-ssr/entry-server.js');
const shell = '<!doctype html><html><head><title id="site-title">Mortar CMS</title>'
  + '<meta name="description" content="Mortar CMS" /></head>'
  + '<body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';

describe('putting the rendered app into the shell', () => {
  it('places the markup in #root and hands the client its payload', () => {
    const html = injectSsrRoot(shell, '<h1>Hello</h1>', { rendered: true, settings: { site_title: 'T' } });
    expect(html).toContain('<div id="root"><h1>Hello</h1>');
    expect(html).toContain('window.__MORTAR_SSR__=');
    expect(html).toContain('"rendered":true');
    // The rest of the document survives (the script tag that boots the app above all)
    expect(html).toContain('/assets/index.js');
    expect(html.trim().endsWith('</html>')).toBe(true);
  });

  it('cannot be broken out of by content that contains </script>', () => {
    // The payload is JSON inside a <script> element: an unescaped `<` would end
    // the element early and turn the rest of the document into markup — the
    // classic JSON-in-HTML breakout, and an XSS vector.
    const html = injectSsrRoot(shell, '<p>x</p>', { data: { post: { content: '</script><img src=x onerror=alert(1)>' } } });
    // No raw `</script>` other than the two the document legitimately has: the
    // boot tag in the shell and the closing tag of the payload script itself.
    const scriptEnds = html.match(/<\/script>/gi) || [];
    expect(scriptEnds.length).toBe(2);
    expect(html).toContain('\\u003c/script>');
    expect(html).not.toContain('<img src=x');
  });

  it('keeps the shell empty when there is nothing to render', () => {
    // What the crawler fallback path relies on: injectSeoMeta with no fallback
    // leaves #root empty, and the SSR markup goes in afterwards.
    const out = injectSeoMeta(shell, buildSeoMeta('/', { origin: 'https://example.com' }), null);
    expect(out).toContain('<div id="root"></div>');
  });
});

describe('the prerender cache', () => {
  it('is dropped when content changes', () => {
    // The key carries ' /ssr' precisely so that the content purge set covers it —
    // otherwise a published post would keep serving the previous page.
    const key = 'SSR example.com /ssr/post/hello';
    cacheSet(key, '<html>stale</html>');
    expect(cacheGet(key)).toBeTruthy();
    purgeContentCaches();
    expect(cacheGet(key)).toBeUndefined();
  });
});

describe.skipIf(!fs.existsSync(SSR_BUNDLE))('the renderer bundle', () => {
  let render: (options: Record<string, unknown>) => { html: string | null; payload: any };
  let domWindow: any;

  beforeAll(async () => {
    const mod: any = await import(pathToFileURL(SSR_BUNDLE).href);
    render = mod.render || mod.default?.render;
    domWindow = new JSDOM('<!doctype html><html><body></body></html>').window;
  });

  const options = (over: Record<string, unknown> = {}) => ({
    url: '/post/hello',
    settings: { site_title: 'SSR Site', site_url: 'https://example.com', permalink_structure: '/post/%slug%', site_lang: 'en' },
    themeName: 'default',
    origin: 'https://example.com',
    contentLangs: 'zh,en',
    domWindow,
    data: {
      post: {
        id: 'p1', title: 'Rendered Title', slug: 'hello', content: '<p>Rendered body</p><script>alert(1)</script>',
        excerpt: 'ex', status: 'published', type: 'post', lang: '',
        createdAt: '2026-09-01T00:00:00.000Z', publishedAt: '2026-09-01T00:00:00.000Z',
        author: { username: 'ann' }, categories: [], tags: [], translations: [],
      },
    },
    ...over,
  });

  it('renders the article instead of a loading spinner', () => {
    const out = render(options());
    expect(out.html).toBeTruthy();
    expect(out.html).toContain('Rendered Title');
    expect(out.html).toContain('Rendered body');
    // The route components are code-split; a lazy one would suspend and
    // renderToString would emit the Suspense fallback instead of the content.
    expect(out.html).not.toContain('animate-spin');
    expect(out.payload.rendered).toBe(true);
    expect(out.payload.themeName).toBe('default');
  });

  it('sanitizes the body before it reaches the markup', () => {
    // DOMPurify has no DOM on the server; if the injected purifier were missing or
    // unsupported it would hand the input back unchanged, which is how the script
    // tag would end up in the page.
    const out = render(options());
    expect(out.html).not.toContain('alert(1)');
    expect(out.html).toContain('Rendered body');
  });

  it('refuses a theme it cannot render', () => {
    // Emitting the default theme's markup for a site running another one would
    // show the wrong design until the client took over — the caller falls back to
    // the client-rendered shell instead.
    const out = render(options({ themeName: 'a-theme-that-does-not-exist' }));
    expect(out.html).toBeNull();
    expect(out.payload.rendered).toBe(false);
  });

  it('refuses a render with no DOM to sanitize with', () => {
    const out = render(options({ domWindow: undefined }));
    expect(out.html).toBeNull();
  });

  it('renders a language-prefixed URL rather than the 404 screen', () => {
    // The prefixed routes are registered separately (App.tsx's langRoute), and a
    // first segment that is not a language this site publishes falls through to
    // NotFound — so this pins that 'en' really does route to the post.
    const en = render(options({
      url: '/en/post/hello',
      contentLangs: 'zh,en',
      data: { post: { ...(options().data as any).post, lang: 'en' } },
    }));
    expect(en.html).toBeTruthy();
    expect(en.html).toContain('Rendered body');
    // The payload carries the request path: lib/contentLang derives the language
    // from it, and the client has to derive the same one while hydrating.
    expect(en.payload.path).toBe('/en/post/hello');
  });
});

describe('the CSP nonce on inline scripts', () => {
  const withScripts = '<!doctype html><html><head><script type="importmap">{}</script>'
    + '<script nonce="already">1</script></head><body><div id="root"></div>'
    + '<script src="/assets/index.js"></script></body></html>';

  it('stamps inline scripts and leaves external ones alone', () => {
    const out = stampInlineScripts(withScripts, 'PLACEHOLDER');
    // The importmap is the one that matters: without the nonce an enforcing CSP
    // blocks it, and a blocked importmap means no module resolution.
    expect(out).toContain('<script nonce="PLACEHOLDER" type="importmap">');
    // An external script is covered by 'self'; stamping it would let a nonce
    // bypass the host allowlist.
    expect(out).toContain('<script src="/assets/index.js">');
    // An existing nonce is not duplicated (two nonce attributes would be ignored).
    expect(out.match(/nonce="/g)?.length).toBe(2);
  });

  it('substitutes the response nonce into a cached document', () => {
    const cached = stampInlineScripts(withScripts, NONCE_PLACEHOLDER);
    const out = applyNonce(cached, 'abc123');
    expect(out).toContain('nonce="abc123"');
    expect(out).not.toContain(NONCE_PLACEHOLDER);
  });

  it('gives the render payload the response nonce when the server builds the page', () => {
    // The two are applied in this order by index.ts.
    const doc = injectSsrRoot(withScripts, '<h1>x</h1>', { rendered: true });
    const out = applyNonce(stampInlineScripts(doc, NONCE_PLACEHOLDER), 'n-1');
    expect(out).toContain('nonce="n-1"');
    expect(out).not.toContain('nonce="' + NONCE_PLACEHOLDER + '"');
  });
});

describe('the renderer staleness guard', () => {
  it('treats a renderer older than the client build as unavailable', async () => {
    // Simulated by mtime, which is exactly how the guard decides: rather than
    // render markup the client bundle disagrees with (React #418/#422 — a page
    // that looks fine until you open the console), the server serves the
    // client-rendered shell.
    const bundle = path.join(__dirname, '../../frontend/dist-ssr/entry-server.js');
    const shell = path.join(__dirname, '../../frontend/dist/index.html');
    if (!fs.existsSync(bundle) || !fs.existsSync(shell)) return; // not built here

    const shellMtime = fs.statSync(shell).mtimeMs;
    try {
      const future = new Date(Date.now() + 60_000);
      fs.utimesSync(shell, future, future);
      // A fresh module instance: the renderer is cached after the first load, so
      // a stale verdict has to be asked for before anything has loaded it.
      vi.resetModules();
      const mod = await import('../src/utils/ssr');
      expect(await mod.ssrAvailable()).toBe(false);
    } finally {
      fs.utimesSync(shell, new Date(shellMtime), new Date(shellMtime));
      vi.resetModules();
    }
  });
});
