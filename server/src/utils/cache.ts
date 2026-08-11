// In-memory TTL cache for public page/API responses with prefix-based purging.
// Content mutations call purgeContentCaches(); settings changes purge everything.
interface Entry { value: any; at: number }

const store = new Map<string, Entry>();
let hits = 0;
let misses = 0;
let enabled = true;
let ttlMs = 60_000;
const MAX_ENTRIES = 500;

export function cacheConfigure(enable: boolean, ttlSeconds: number): void {
  enabled = !!enable;
  ttlMs = Math.max(5, Math.min(Number(ttlSeconds) || 60, 3600)) * 1000;
  if (!enabled) store.clear();
}

export function cacheGet(key: string): any | undefined {
  if (!enabled) return undefined;
  const e = store.get(key);
  if (!e) { misses++; return undefined; }
  if (Date.now() - e.at > ttlMs) { store.delete(key); misses++; return undefined; }
  hits++;
  return e.value;
}

export function cacheSet(key: string, value: any): void {
  if (!enabled) return;
  if (store.size >= MAX_ENTRIES) {
    // Drop oldest entries to bound memory
    const oldest = [...store.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 20);
    oldest.forEach(([k]) => store.delete(k));
  }
  store.set(key, { value, at: Date.now() });
}

export function cacheDelete(key: string): void { store.delete(key); }

// Purge every key whose path contains the prefix (e.g. '/api/posts').
// Keys are 'GET <host><path>', so matching is substring-based.
export function cacheDelPrefix(prefix: string): number {
  let n = 0;
  for (const k of [...store.keys()]) { if (k.includes(prefix)) { store.delete(k); n++; } }
  return n;
}

export function cacheFlush(): number {
  const n = store.size;
  store.clear();
  return n;
}

export function cacheStats(): { enabled: boolean; ttlSeconds: number; entries: number; hits: number; misses: number } {
  return { enabled, ttlSeconds: ttlMs / 1000, entries: store.size, hits, misses };
}

// Prefixes of public content endpoints the frontend renders from
const CONTENT_PREFIXES = [
  '/api/posts', '/api/pages', '/api/menus', '/api/categories', '/api/tags',
  '/api/links', '/api/comments/post', '/api/settings', '/api/feed', '/api/widgets',
];

// Called after any content mutation (post/page/comment/media/menu/widget/taxonomy)
export function purgeContentCaches(): number {
  let n = 0;
  for (const p of CONTENT_PREFIXES) n += cacheDelPrefix(p);
  return n;
}

// Full flush, also drops the sitemap cache
export function purgeAllCaches(): number {
  let n = cacheFlush();
  try { invalidateSitemapCache(); } catch {}
  return n;
}

// Lazily imported to avoid a static cycle (sitemap.ts only imports db)
function invalidateSitemapCache(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sitemap = require('../routes/sitemap') as { invalidateSitemapCache?: () => void };
  sitemap.invalidateSitemapCache?.();
}
