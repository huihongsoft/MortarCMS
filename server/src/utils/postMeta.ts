import db, { cuid } from './db';
import { sanitizeCssText } from './sanitize';
import { normalizeSeoField } from './seoFields';

// Apply a `meta` payload to a post or page.
//
// Only the keys the payload NAMES are touched. The admin editor sends just the
// fields its own panels manage (SEO fields, per-post CSS, its custom key/value
// rows), so replacing the whole set deleted every other key — notably
// `_members_only`, the post-expiry plugin's gate from anonymous visitors, which
// the editor never sends: opening such a post in the admin and saving published
// it again. Keys written by plugins or the AI survive a save for the same
// reason.
//
// An empty string removes the key, which is how the editor clears a field it
// owns.
export function writePostMeta(postId: string, meta: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(meta)) {
    const value = String(raw ?? '');
    if (value === '') { db.prepare('DELETE FROM PostMeta WHERE postId = ? AND key = ?').run(postId, key); continue; }
    const stored = key === '_visual_css' ? sanitizeCssText(value) : normalizeSeoField(key, value);
    db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?) ON CONFLICT(postId, key) DO UPDATE SET value = excluded.value')
      .run(cuid(), postId, key, stored);
  }
}
