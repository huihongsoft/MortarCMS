// Server-side rendering, wired to the built frontend renderer.
//
// frontend/dist-ssr/entry-server.js is a self-contained bundle (built by
// frontend/vite.ssr.config.ts) exporting `render(options)`. This module decides
// *whether* to render a given request, gathers what the render needs, and hands
// back the HTML plus the payload the client hydrates with.
//
// Everything here is best-effort: any failure — no bundle (a checkout that never
// ran the SSR build), an unknown theme, a content fetch that errors — returns null
// and the caller serves the plain client-rendered shell it served before. A
// prerender must never be able to take the site down.
import { isKnownRoute } from './seoMeta';
import { logger } from './logger';

export interface SsrRenderInput {
  path: string;
  /** Public origin (scheme://host), used for the absolute URLs in the markup. */
  origin: string;
  /**
   * Where to fetch this server's own API from. Defaults to `origin`, but the
   * caller should pass a loopback URL (127.0.0.1:port): behind a proxy the public
   * host resolves to the internet, so fetching it would leave the machine.
   */
  fetchBase?: string;
  /** Host header, so the content fetch resolves the same site. */
  host?: string;
  settings: Record<string, string>;
  themeName?: string;
  contentLangs?: string;
  siteId?: string | null;
}

export interface SsrResult {
  html: string;
  /** JSON to ship in window.__MORTAR_SSR__. */
  payload: unknown;
}

interface RendererModule {
  render: (options: Record<string, unknown>) => { html: string | null; payload: unknown };
}

let renderer: RendererModule | null | undefined;
let loading: Promise<RendererModule | null> | null = null;

// One DOM for the process: the renderer builds its DOMPurify instance once per
// window. Created on first use rather than at import: jsdom costs ~0.5s to load
// plus a window to build, and this module is on the server's boot path — an
// install that never prerenders (no bundle, or a theme the renderer does not
// have) should not pay for it before serving its first request.
let domWindow: any = null;
let domFailed = false;
function purifierWindow(): any {
  if (domWindow || domFailed) return domWindow;
  try {
    const { JSDOM } = require('jsdom');
    domWindow = new JSDOM('<!doctype html><html><body></body></html>').window;
  } catch (err: any) {
    // A dependency that is missing at runtime means no sanitizer, and a render
    // without one must not happen. Remembered, so this logs once, not per request.
    domFailed = true;
    logger.warn({ err: err?.message }, 'jsdom unavailable; server rendering disabled');
  }
  return domWindow;
}

/**
 * Is the renderer older than the client bundle it is supposed to match?
 *
 * Both are produced by the same `npm run build`, in that order — so a renderer
 * that predates `frontend/dist/index.html` means someone rebuilt only the client
 * (`npx vite build`), and the two now disagree about the markup. Rendering with
 * it produces a page that hydrates into React errors (#418/#422) rather than a
 * visibly broken page, which is a bad thing to debug. Refusing to render is the
 * honest answer: the client-rendered shell always works.
 */
function rendererIsStale(rendererFile: string): boolean {
  try {
    const fs = require('fs');
    const shell = require('path').join(__dirname, '../../../frontend/dist/index.html');
    return fs.statSync(rendererFile).mtimeMs < fs.statSync(shell).mtimeMs;
  } catch {
    return false; // no shell to compare against: not a staleness signal
  }
}

/** Load the renderer bundle. Cached; a failure is remembered as "unavailable". */
async function loadRenderer(): Promise<RendererModule | null> {
  if (renderer !== undefined) return renderer;
  if (!loading) {
    const file = require('path').join(__dirname, '../../../frontend/dist-ssr/entry-server.js');
    if (rendererIsStale(file)) {
      logger.warn({ file }, 'SSR renderer is older than the frontend build; rebuild with `npm run build`. Serving the client-rendered shell');
      renderer = null;
      return null;
    }
    loading = import(require('url').pathToFileURL(file).href)
      .then((mod: any) => {
        const fn = mod?.render || mod?.default?.render;
        renderer = typeof fn === 'function' ? (mod as RendererModule) : null;
        if (!renderer) logger.warn({ file }, 'SSR bundle loaded but exports no render()');
        return renderer;
      })
      .catch((err: any) => {
        // Not an error worth alerting on: an install that did not build the SSR
        // entry is expected to fall back to the client-rendered shell.
        logger.info({ err: err?.message }, 'SSR renderer unavailable; serving the client-rendered shell');
        renderer = null;
        return null;
      });
  }
  return loading;
}

/** Is the renderer built and loadable? Used by /api/health and the tests. */
export async function ssrAvailable(): Promise<boolean> {
  return (await loadRenderer()) !== null;
}

/**
 * What content this path needs, in the shape the frontend pages read.
 * Returns null when the path is not a content page (the layout still renders).
 */
// How long the renderer waits for its own API before giving up and letting the
// client render the page instead.
const RENDER_FETCH_TIMEOUT_MS = 3000;

const LANG_PREFIX = /^\/([a-z]{2}(?:-[a-z0-9]{2,8})?)(\/.*)$/i;

/**
 * Split a leading language prefix off a request path: `/en/post/x` renders the
 * English row, so every lookup below has to be language-aware. The server's own
 * rule for whether a prefix is real (content_langs) is applied by contentLang; here
 * a prefix is taken at face value because the path was already checked against the
 * route table, and an unknown language simply finds no content.
 */
function splitLang(pathname: string): { lang: string; rest: string } {
  const m = LANG_PREFIX.exec(pathname);
  if (!m) return { lang: '', rest: pathname };
  // A path like /en/ has an empty rest; the page it names is the homepage.
  return { lang: m[1].toLowerCase(), rest: m[2] || '/' };
}

function contentRequestFor(rest: string): { key: string; api: string } | null {
  const post = rest.match(/^\/post\/([^/]+)\/?$/);
  if (post) return { key: 'post', api: '/api/posts/slug/' + encodeURIComponent(decodeURIComponent(post[1])) };
  const page = rest.match(/^\/page\/([^/]+)\/?$/);
  if (page) return { key: 'page', api: '/api/pages/slug/' + encodeURIComponent(decodeURIComponent(page[1])) };
  return null;
}

// The renderer is synchronous, so content has to be fetched before it runs. Going
// back through this very server's HTTP API (rather than re-implementing the
// queries) is what guarantees the prerendered markup matches what the client's own
// fetch will return — same visibility rules, same members-only gating, same
// rendered shortcodes. No cookies and no Authorization header travel with these
// requests, so the answer is the anonymous one and the result is cacheable.
export async function fetchOwnJson(origin: string, host: string | undefined, path: string): Promise<any> {
  try {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (host) headers.host = host;
    // A timeout, because this fetch is on the *visitor's* request path: without
    // one, a loopback request that never answers (a stalled pool, a blocked
    // worker) would hold the HTML response open rather than falling back to the
    // client-rendered shell. The renderer is an optimisation; it must not be able
    // to hang a page.
    const res = await fetch(origin.replace(/\/$/, '') + path, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(RENDER_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function renderPath(input: SsrRenderInput): Promise<SsrResult | null> {
  const mod = await loadRenderer();
  if (!mod) return null;

  const url = input.path || '/';
  const pathname = url.split('?')[0];
  // Unknown paths are 404s (see isKnownRoute); prerendering them would put a
  // "page not found" body into the HTML of a URL we are about to answer 404 for —
  // and, worse, could hide a real route the server's table has not learned yet.
  if (!isKnownRoute(pathname)) return null;

  const { lang, rest } = splitLang(pathname);
  const apiBase = (input.fetchBase || input.origin).replace(/\/$/, '');
  const data: Record<string, any> = {};

  try {
    const want = contentRequestFor(rest);
    if (want) {
      const suffix = lang ? '?lang=' + encodeURIComponent(lang) : '';
      const body = await fetchOwnJson(apiBase, input.host, want.api + suffix);
      if (!body) return null; // 404 / private / gated: let the client render it
      data[want.key] = body;
    } else if (rest === '/' || rest === '' || /^\/(category|tag|type)\//.test(rest)) {
      // Listing pages (the homepage and the taxonomy archives): the first page of
      // the list plus the taxonomy names. Same query the client makes, so the
      // prerendered list and the hydrated one agree.
      const params = new URLSearchParams({ page: '1', limit: input.settings.posts_per_page || '10' });
      if (lang) params.set('lang', lang);
      const m = /^\/(category|tag|type)\/([^/]+)$/.exec(rest);
      if (m) params.set(m[1], decodeURIComponent(m[2]));
      const [list, categories] = await Promise.all([
        fetchOwnJson(apiBase, input.host, '/api/posts?' + params.toString()),
        fetchOwnJson(apiBase, input.host, '/api/categories'),
      ]);
      if (!list) return null;
      data.home = { posts: list.posts || [], total: list.total || 0, categories: categories || [] };
    }

    // jsdom loads here, on the first render that actually needs a sanitizer.
    const window = purifierWindow();
    if (!window) return null;

    const out = mod.render({
      url,
      settings: input.settings,
      themeName: input.themeName,
      contentLangs: input.contentLangs,
      origin: input.origin,
      data,
      domWindow: window,
    });
    if (!out?.html) return null;
    return { html: out.html, payload: out.payload };
  } catch (err: any) {
    logger.warn({ err: err?.message, path: url }, 'SSR render failed; serving the client-rendered shell');
    return null;
  }
}
