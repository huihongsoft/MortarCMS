// Content languages on the client. Mirrors server/src/utils/contentLang.ts.
//
// One rule drives this: **the site's default language is served without a URL
// prefix**, and every other language gets `/<lang>/…`. A single-language site
// therefore sees no prefix anywhere and nothing about it changes.
//
// The list of languages is read from `<meta name="mortar-langs">`, which the
// server bakes into the shell for this very request (see utils/seoMeta.ts) —
// the same trick lib/permalink uses for the post URL shape. Reading it at module
// load is what makes a direct visit to /en/post/<slug> resolve on the first
// render, and what makes the API calls that page fires carry ?lang=en.

import { ssrPayload } from './ssr';

// Same list as the server: first segments that are the app's own routes, so
// '/author/ann' is never mistaken for a language prefix.
const RESERVED = new Set([
  'api', 'admin', 'uploads', 'themes', 'metrics', 'assets', 'post', 'page', 'category',
  'tag', 'archive', 'author', 'search', 'links', 'login', 'register', 'profile',
  'my-posts', 'submit-post', 'newsletter', 'share', 'install', 'type', 'review',
]);

function normalizeLang(raw: unknown): string | null {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return null;
  return /^[a-z]{2}(-[a-z0-9]{2,8})?$/.test(value) ? value : null;
}

function fromShell(): string[] | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector('meta[name="mortar-langs"]');
  const value = el && el.getAttribute('content');
  if (!value) return null;
  const list = value.split(',').map(normalizeLang).filter(Boolean) as string[];
  return list.length ? list : null;
}

// Resolved lazily, not at module load: the server renderer seeds the languages
// through lib/ssr.ts *after* this module has been imported (static imports run
// first), so a module-level read would always see nothing on the server and
// disagree with the browser.
let langs: string[] | null = null;

function resolve(): string[] {
  if (langs) return langs;
  const shell = fromShell();
  if (shell) { langs = shell; return langs; }
  const seeded = String(ssrPayload().contentLangs || '')
    .split(/[,\s]+/).map(normalizeLang).filter(Boolean) as string[];
  if (seeded.length) { langs = seeded; return langs; }
  return [];
}

/** The languages this site publishes, default first. Empty until resolved. */
export function contentLangs(): string[] {
  return resolve();
}

/** The site's own language — the one served unprefixed. */
export function defaultLang(): string {
  return resolve()[0] || 'zh';
}

/**
 * Feed the languages in from the settings response, the fallback when neither the
 * shell nor the render payload carried them. A no-op once they are known: the
 * shell describes the very response being rendered, whereas this one may come
 * from the public page cache.
 */
export function setContentLangs(siteLang: unknown, list: unknown): void {
  if (resolve().length) return;
  const def = normalizeLang(siteLang) || 'zh';
  const parsed = String(list ?? '').split(/[,\s]+/).map(normalizeLang).filter(Boolean) as string[];
  langs = [def, ...parsed.filter((l) => l !== def)];
}

/** True when this site actually publishes that language with a prefix. */
export function isEnabledLang(lang: unknown): boolean {
  const l = normalizeLang(lang);
  const list = resolve();
  return !!l && l !== defaultLang() && (list.length === 0 || list.includes(l));
}

/**
 * Split a leading language prefix off a path.
 *
 * Only a segment shaped like a language tag *and* one this site publishes counts.
 * '/author/x' and '/links' are two letters away from being mistaken for one, and
 * a site with no translations must not treat /en/… as a real page.
 */
export function parseLangFromPath(rawPath: string): { lang: string; rest: string } {
  const path = '/' + String(rawPath || '').replace(/^\/+/, '');
  const m = path.match(/^\/([^/]+)(\/.*)?$/);
  if (!m) return { lang: '', rest: '/' };
  const first = m[1].toLowerCase();
  if (RESERVED.has(first)) return { lang: '', rest: path };
  return isEnabledLang(first) ? { lang: first, rest: m[2] || '/' } : { lang: '', rest: path };
}

/** The language the address bar is currently asking for ('' = default). */
export function currentLang(): string {
  return parseLangFromPath(locationPath()).lang;
}

// The path being rendered. On the client that is the address bar; on the server
// there is none, so the renderer seeds the request's path (lib/ssr.ts) — and
// since it is the same path the browser is hydrating, both sides agree.
function locationPath(): string {
  if (typeof window !== 'undefined') return window.location.pathname;
  const seeded = String(ssrPayload().path || '');
  return seeded || '/';
}

/** `/<lang>` for the current page's language, '' for the default one. */
export function currentLangPrefix(): string {
  const lang = currentLang();
  return lang ? '/' + lang : '';
}

/** Prefix a path for a *specific* language (a page's own, not the URL's). */
export function langPathFor(lang: unknown, path: string): string {
  const l = normalizeLang(lang);
  return (l && l !== defaultLang() ? '/' + l : '') + path;
}

// The content endpoints the server filters by ?lang=. Everything else either has
// no language dimension (categories, menus, settings) or is an admin call.
const LANG_SCOPED = ['/posts', '/pages'];

/** True when a request to this API path should carry the current language. */
export function isLangScoped(url: unknown): boolean {
  const path = String(url || '').split('?')[0];
  return LANG_SCOPED.some((p) => path === p || path.startsWith(p + '/'));
}
