import { sharedStoreIfConfigured } from './sharedStore';

// In-memory TTL cache for public page/API responses with prefix-based purging.
// Content mutations call purgeContentCaches(); settings changes purge everything.
//
// Cross-instance invalidation uses a generation counter rather than moving the
// cache itself into shared storage: the hot path stays a synchronous Map lookup
// (a shared read per request would add a network round trip, or a database query,
// to every cached response), while each instance polls the counter and flushes
// its local map when another instance purged. Without a shared store configured
// nothing changes.
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
  '/api/links', '/api/comments', '/api/settings', '/api/feed', '/api/widgets',
];

// Called after any content mutation (post/page/comment/media/menu/widget/taxonomy)
export function purgeContentCaches(): number {
  let n = 0;
  for (const p of CONTENT_PREFIXES) n += cacheDelPrefix(p);
  // Content mutations change the sitemap too (a publish adds a URL, an unpublished
  // or renamed post removes one), and it has its own 5-minute cache. Leaving it to
  // purgeAllCaches meant a published post was missing from sitemap.xml until the
  // TTL expired.
  invalidateSitemap();
  bumpGeneration();
  return n;
}

// Full flush, also drops the sitemap cache
export function purgeAllCaches(): number {
  const n = cacheFlush();
  invalidateSitemap();
  bumpGeneration();
  return n;
}

// ---- Cross-instance invalidation ----
//
// `cache:generation` lives in the shared store. A process that purges bumps it;
// every process polls it and drops its local map when it changes. The poll is
// the only cross-process traffic, and only when a shared store is configured.
const GENERATION_KEY = 'cache:generation';
const GENERATION_TTL_MS = 7 * 86_400_000;
let localGeneration = -1;
let coherenceTimer: NodeJS.Timeout | null = null;

function bumpGeneration(): void {
  // Fire-and-forget: a purge must not block on (or fail because of) the store.
  void (async () => {
    try {
      const store = await sharedStoreIfConfigured();
      if (store) await store.incr(GENERATION_KEY, GENERATION_TTL_MS);
    } catch { /* best effort */ }
  })();
}

/** Start polling the shared generation. No-op without a shared store. */
export function startCacheCoherence(intervalMs = 2000): void {
  if (coherenceTimer) return;
  void (async () => {
    const store = await sharedStoreIfConfigured();
    if (!store) return; // single-instance install: nothing to keep in step
    coherenceTimer = setInterval(async () => {
      try {
        const gen = Number((await store.get(GENERATION_KEY)) || 0);
        if (localGeneration === -1) { localGeneration = gen; return; }
        if (gen !== localGeneration) {
          localGeneration = gen;
          store0Flush();
        }
      } catch { /* keep serving from the local cache */ }
    }, intervalMs);
    coherenceTimer.unref?.();
  })();
}

/** Stop the poller (tests, shutdown). */
export function stopCacheCoherence(): void {
  if (coherenceTimer) { clearInterval(coherenceTimer); coherenceTimer = null; }
  localGeneration = -1;
}

// Named so the poller does not read as clearing the shared store by mistake.
function store0Flush(): void { store.clear(); }


// Lazily imported to avoid a static cycle (sitemap.ts only imports db)
function invalidateSitemapCache(): void {

  const sitemap = require('../routes/sitemap') as { invalidateSitemapCache?: () => void };
  sitemap.invalidateSitemapCache?.();
}

// The require above can throw before the route module is loadable; a cache purge
// must never take the mutation down with it.
function invalidateSitemap(): void {
  try { invalidateSitemapCache(); } catch { /* best effort */ }
}
