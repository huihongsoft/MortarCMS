import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

// Scheduled visibility windows + expiry handling for posts.
//
// Meta keys (set via the post API meta field or the admin editor):
//   available_from : ISO date — post auto-publishes at this time (from draft)
//   expiry_at      : ISO date — post auto-unpublishes at this time
//   _members_only  : '1' — post is hidden from anonymous visitors; visible
//                    to any logged-in user (server-side filtering in posts.ts)
//
// What happens at expiry depends on the setting `post_expiry_action`:
//   'draft'   (default) — post moves back to draft (needs manual republish)
//   'members'           — post stays published but becomes members-only
//
// Config (Settings API): post_expiry_enabled = '1' | '0',
//                        post_expiry_action  = 'draft' | 'members'

const CHECK_INTERVAL_MS = 60 * 1000;
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function checkWindows(): void {
  try {
    const now = new Date().toISOString();

    // 1) Expired → draft or members-only (once; expiry marker cleared)
    const expired = db.prepare(
      "SELECT pm.postId FROM PostMeta pm JOIN Post p ON p.id = pm.postId WHERE pm.key = 'expiry_at' AND pm.value <> '' AND pm.value <= ? AND p.status = 'published'"
    ).all(now) as any[];
    const toMembers = setting('post_expiry_action') === 'members';
    for (const r of expired) {
      if (toMembers) {
        db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, '_members_only', '1') ON CONFLICT(postId, key) DO UPDATE SET value = '1'").run(require('crypto').randomBytes(8).toString('hex'), r.postId);
      } else {
        db.prepare("UPDATE Post SET status = 'draft', updatedAt = ? WHERE id = ?").run(now, r.postId);
      }
      db.prepare("DELETE FROM PostMeta WHERE postId = ? AND key = 'expiry_at'").run(r.postId);
    }

    // 2) Scheduled window opens → auto-publish (draft with available_from)
    const opening = db.prepare(
      "SELECT pm.postId FROM PostMeta pm JOIN Post p ON p.id = pm.postId WHERE pm.key = 'available_from' AND pm.value <> '' AND pm.value <= ? AND p.status = 'draft'"
    ).all(now) as any[];
    for (const r of opening) {
      db.prepare("UPDATE Post SET status = 'published', publishedAt = COALESCE(publishedAt, ?), updatedAt = ? WHERE id = ?").run(now, now, r.postId);
      db.prepare("DELETE FROM PostMeta WHERE postId = ? AND key = 'available_from'").run(r.postId);
    }
  } catch { /* never break the loop */ }
}

export function register() {
  // Check on boot (windows may have passed while the server was down) and
  // then periodically.
  addAction('init', () => {
    try { checkWindows(); } catch {}
    if (!timer) timer = setInterval(checkWindows, CHECK_INTERVAL_MS);
    timer.unref?.();
  }, 10, 'post-expiry');
}
