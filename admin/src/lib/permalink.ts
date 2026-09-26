import React from 'react';
import api from './api';

// Post URL shape for the admin previews.
//
// The structure is a site setting (server/src/utils/slug.ts owns the rules); the
// editor pages read it so the permalink they show — and the "view post" link they
// open — matches where the post actually lives. Without this the editor
// advertised /post/<slug> while the site served /blog/<slug>.
const DEFAULT_PREFIX = '/post/';
const SLUG_TOKEN = '%slug%';

const RESERVED = new Set([
  'category', 'tag', 'archive', 'author', 'search', 'links', 'login', 'register',
  'profile', 'my-posts', 'submit-post', 'newsletter', 'admin', 'api', 'uploads',
  'share', 'install', 'assets', 'page', 'type',
]);

// Same normalization as the server, so the preview and the router agree.
function normalizeStructure(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s || s.length > 120 || !s.startsWith('/') || s.includes('//') || s.includes('..')) return null;
  if (s.split(SLUG_TOKEN).length - 1 !== 1 || !s.endsWith(SLUG_TOKEN)) return null;
  const p = s.slice(0, -SLUG_TOKEN.length);
  if (!p.endsWith('/') || !/^\/[a-z0-9_\-/]*$/.test(p)) return null;
  const segments = p.split('/').filter(Boolean);
  if (segments.length === 0 || RESERVED.has(segments[0])) return null;
  return '/' + segments.join('/') + '/';
}

export function permalinkPrefix(structure: unknown): string {
  return normalizeStructure(structure) ?? DEFAULT_PREFIX;
}

// One-shot cached structure, for list rows that render a "view" link and cannot
// wait for a prop. The first caller starts the fetch; once it resolves every
// later render (and component) sees the real prefix.
let cached: string | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<(v: string) => void>();

// One shared read. Several pages mount a hook at once (a list, the editor), and
// without this each of them fired its own /settings request while the cache was
// still empty.
function load(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = api.get('/settings')
    .then(r => {
      const v = r.data?.permalink_structure || '';
      // The default content language rides on the same response, so a post's
      // preview URL can tell a translation (/en/post/x) from the default
      // (/post/x) without a second request.
      setDefaultContentLang(r.data?.site_lang);
      cached = v;
      listeners.forEach(fn => fn(v));
    })
    // Deliberately not cached on failure: caching the failure pinned every later
    // render in the session to the default prefix, so "view" links pointed at
    // /post/<slug> (404) until the admin was reloaded. Leaving it null means the
    // next mount retries; an empty value already falls back to the default inside
    // postPath().
    .catch(() => {})
    .then(() => { inFlight = null; });
  return inFlight;
}

// Dropped when the settings page saves a new structure: without this the cached
// value outlived the change, so every "view" link kept pointing at the old
// prefix until the admin was reloaded. Mounted hooks are notified too — the ones
// already on screen (a list with "view" links) would otherwise keep the old
// prefix until they happened to remount.
export function invalidatePermalinkCache(): void {
  cached = null;
  void load();
}

export function usePermalinkPrefix(): string {
  const [value, setValue] = React.useState<string>(cached ?? '');
  React.useEffect(() => {
    listeners.add(setValue);
    return () => { listeners.delete(setValue); };
  }, []);
  React.useEffect(() => {
    if (cached !== null) { setValue(cached); return; }
    void load();
  }, []);
  return value;
}

// Path for a post slug, optionally as a full URL (for the "view" links).
//
// `lang` is the post's own content language: the default language is served
// unprefixed, a translation lives under /<lang>/…. Passing nothing (or the
// default) gives exactly the path this built before.
export function postPath(structure: unknown, slug: unknown, absolute = false, lang = ''): string {
  const l = String(lang || '').trim().toLowerCase();
  const path = (l && l !== defaultContentLang() ? '/' + l : '') + permalinkPrefix(structure) + String(slug ?? '');
  return absolute ? window.location.origin + path : path;
}

// The site's default content language, from the settings the panel already
// loads; 'zh' matches the server's fallback when the setting is empty.
let defaultLangCache = 'zh';
export function setDefaultContentLang(lang: unknown): void {
  defaultLangCache = String(lang || '').trim().toLowerCase() || 'zh';
}
export function defaultContentLang(): string {
  return defaultLangCache;
}
