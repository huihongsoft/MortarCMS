import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

// Archive stale content: posts published but not updated for more than
// archive_after_days are moved back to draft. Skips sticky posts and posts
// that carry an expiry_at (post-expiry plugin owns those).
//
// Config (Settings API):
//   content_archive_enabled = '1' (default) | '0'
//   archive_after_days      = days of inactivity before archiving (default 365)

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function archiveOnce(): void {
  try {
    const days = Math.max(7, parseInt(setting('archive_after_days') || '365') || 365);
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const rows = db.prepare(
      "SELECT p.id FROM Post p WHERE p.type = 'post' AND p.status = 'published' AND p.sticky = 0 AND p.updatedAt < ? " +
      "AND NOT EXISTS (SELECT 1 FROM PostMeta pm WHERE pm.postId = p.id AND pm.key = 'expiry_at')"
    ).all(cutoff) as any[];
    const now = new Date().toISOString();
    for (const r of rows) {
      db.prepare("UPDATE Post SET status = 'draft', updatedAt = ? WHERE id = ?").run(now, r.id);
    }
    if (rows.length) console.log('[Plugin] content-archive: archived ' + rows.length + ' stale post(s)');
  } catch { /* never break the loop */ }
}

export function register() {
  addAction('init', () => {
    try { archiveOnce(); } catch {}
    if (!timer) timer = setInterval(archiveOnce, CHECK_INTERVAL_MS);
    timer.unref?.();
  }, 10, 'content-archive');
}
