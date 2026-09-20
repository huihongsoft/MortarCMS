import db from './db';

// Batch page-view counting: views are incremented in memory and flushed to
// the DB periodically, so a single page view never triggers a synchronous
// write (SQLite serializes writers; a busy site would bottleneck on it).
// Worst-case loss on a crash is one flush interval (~30s) of view counts.
const pending = new Map<string, number>();
const FLUSH_INTERVAL_MS = 30_000;
let timer: NodeJS.Timeout | null = null;

// One count per visitor per post per window. Reload loops and crawlers were
// inflating `views`, which is not just a vanity number: it orders the public
// "popular" list and feeds the AI analytics tool. The window lives in this
// process, so a multi-instance install over-counts slightly — fine for a counter.
const seen = new Map<string, number>();
const DEDUPE_MS = 30 * 60 * 1000;
const MAX_SEEN = 20_000;

export function trackView(postId: string, visitorKey?: string): void {
  const now = Date.now();
  if (visitorKey) {
    const key = postId + '|' + visitorKey;
    const last = seen.get(key);
    if (last !== undefined && now - last < DEDUPE_MS) return;
    seen.set(key, now);
    // Opportunistic prune keeps the map bounded without a scheduled job.
    if (seen.size > MAX_SEEN) for (const [k, t] of seen) if (now - t > DEDUPE_MS) seen.delete(k);
  }
  pending.set(postId, (pending.get(postId) || 0) + 1);
  if (!timer) timer = setTimeout(flushViews, FLUSH_INTERVAL_MS);
  timer.unref?.();
}

export function flushViews(): void {
  if (timer) { clearTimeout(timer); timer = null; }
  if (pending.size === 0) return;
  const upsert = db.prepare('UPDATE Post SET views = views + ? WHERE id = ?');
  for (const [id, n] of pending) {
    try { upsert.run(n, id); } catch { /* never break on a view-count write */ }
  }
  pending.clear();
}
