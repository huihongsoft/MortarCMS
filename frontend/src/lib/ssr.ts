// The server-render payload.
//
// The server renders the app once (entry-server.tsx) and ships the exact inputs
// it used in `window.__MORTAR_SSR__`. The client reads them before hydrating, so
// its first render produces the same markup the server sent.
//
// This is why every value a component reads *during render* has to come from
// here rather than from the browser: during the server render there is no
// `window`, and on the client the first render must not consult it either, or
// React finds a mismatch and re-renders the subtree (which is exactly the flash
// hydration is supposed to avoid). Effects are exempt — they never run on the
// server, so their result is not part of the comparison.

export interface SsrPayload {
  settings?: Record<string, string>;
  /** Active theme, when it is one the renderer can render (see the theme registry). */
  themeName?: string;
  /** The language the URL asks for: 'en' for /en/…, '' for the default. */
  lang?: string;
  /** The path being rendered. Seeded so a render never needs window.location. */
  path?: string;
  /** Comma-separated content languages, default first (see lib/contentLang.ts). */
  contentLangs?: string;
  /** Normalized permalink structure, e.g. '/post/%slug%'. */
  permalink?: string;
  /** Request origin, so a render never needs `window.location.origin`. */
  origin?: string;
  /** The server's clock at render time — a relative date must not differ on hydrate. */
  now?: number;
  /** Content for this route, already in the shape the API returns. */
  data?: Record<string, any>;
  /** True when the HTML came from the renderer, i.e. the client should hydrate. */
  rendered?: boolean;
  /** The client's own UI language, when the visitor overrode the site default. */
  uiLang?: string;
  /** `:root{…}` block for the theme palette, injected into the shell's head. */
  themeCss?: string;
}

let payload: SsrPayload = {};
let read = false;

/** Called by entry-server (before rendering) and by main.tsx (before hydrating). */
export function setSsrPayload(next: SsrPayload): void {
  payload = { ...payload, ...next };
  read = true;
}

function readFromWindow(): SsrPayload {
  if (read) return payload;
  read = true;
  if (typeof window === 'undefined') return payload;
  const injected = (window as any).__MORTAR_SSR__;
  if (injected && typeof injected === 'object') payload = injected;
  return payload;
}

export function ssrPayload(): SsrPayload {
  return readFromWindow();
}

/** Content seeded for this route, or an empty object. */
export function ssrData<T = any>(key?: string): T | Record<string, any> {
  const data = readFromWindow().data || {};
  return key ? (data[key] as T) : data;
}

/** True when the page was server-rendered and the client must hydrate it. */
export function ssrRendered(): boolean {
  return readFromWindow().rendered === true;
}

let live = false;

/**
 * Called once hydration has finished (main.tsx). Until then the seeded server
 * clock is what a render sees, so the two renders agree; afterwards the real
 * clock takes over, or a page left open would keep saying "3 minutes ago".
 */
export function markClientLive(): void {
  live = true;
}

/** A stable "now" for the first render: the server's clock on both sides. */
export function renderNow(): number {
  if (live) return Date.now();
  const seeded = readFromWindow().now;
  return typeof seeded === 'number' && seeded > 0 ? seeded : Date.now();
}

// Absolute-origin helper. Components build canonical/SEO URLs from
// `settings.site_url || window.location.origin`; during a server render there is
// no window, so the origin comes from the payload. Kept identical otherwise —
// notably it is NOT slash-stripped, because the existing call sites concatenate
// a path that already starts with '/'.
export function siteOrigin(settings?: Record<string, string> | null): string {
  const configured = String(settings?.site_url || '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return String(readFromWindow().origin || '');
}
