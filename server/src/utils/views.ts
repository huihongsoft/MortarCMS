import db from './db';

// Batch page-view counting: views are incremented in memory and flushed to
// the DB periodically, so a single page view never triggers a synchronous
// write (SQLite serializes writers; a busy site would bottleneck on it).
// Worst-case loss on a crash is one flush interval (~30s) of view counts.
const pending = new Map<string, number>();
const FLUSH_INTERVAL_MS = 30_000;
let timer: NodeJS.Timeout | null = null;

export function trackView(postId: string): void {
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
