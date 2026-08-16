import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

// Auto-unpublish posts with an expiry date:
//   post meta key: expiry_at  (ISO 8601, e.g. "2026-12-31T23:59:59.000Z")
// Set it via the post API (PUT /api/posts/:id with meta.expiry_at), the admin
// editor's meta fields, or an AI tool. When the date passes, the post is
// moved back to draft (once — expiry_at is cleared to avoid re-triggering).
//
// Config (Settings API): post_expiry_enabled = '1' (default) | '0'

const CHECK_INTERVAL_MS = 60 * 1000;
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function checkExpired(): void {
  try {
    if (setting('post_expiry_enabled') === '0') return;
    const now = new Date().toISOString();
    const rows = db.prepare(
      "SELECT pm.postId FROM PostMeta pm JOIN Post p ON p.id = pm.postId WHERE pm.key = 'expiry_at' AND pm.value <> '' AND pm.value <= ? AND p.status = 'published'"
    ).all(now) as any[];
    for (const r of rows) {
      db.prepare("UPDATE Post SET status = 'draft', updatedAt = ? WHERE id = ?").run(now, r.postId);
      db.prepare("DELETE FROM PostMeta WHERE postId = ? AND key = 'expiry_at'").run(r.postId);
    }
  } catch { /* never break the loop */ }
}

export function register() {
  // Check on boot (expired posts may have been published while the server
  // was down) and then periodically.
  addAction('init', () => {
    try { checkExpired(); } catch {}
    if (!timer) timer = setInterval(checkExpired, CHECK_INTERVAL_MS);
    timer.unref?.();
  }, 10, 'post-expiry');
}
