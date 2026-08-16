import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

// Auto-excerpt: when a post is created (or updated) without an excerpt, take
// the first paragraph of the content as plain text (HTML stripped). Existing
// excerpts are never overwritten.
//
// Config (Settings API):
//   auto_excerpt_enabled = '1' (default) | '0'
//   auto_excerpt_length  = max characters (default 200)

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function makeExcerpt(content: string, max: number): string {
  const text = String(content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

function fillExcerpt(postId: string): void {
  try {
    const p = db.prepare('SELECT id, content, excerpt FROM Post WHERE id = ?').get(postId) as any;
    if (!p || (p.excerpt && p.excerpt.trim())) return;
    const max = Math.max(20, parseInt(setting('auto_excerpt_length') || '200') || 200);
    const excerpt = makeExcerpt(p.content, max);
    if (excerpt) db.prepare('UPDATE Post SET excerpt = ?, updatedAt = updatedAt WHERE id = ?').run(excerpt, postId);
  } catch { /* never break post saving */ }
}

export function register() {
  addAction('post_created', (postId: string) => {
    try { if (setting('auto_excerpt_enabled') !== '0') fillExcerpt(postId); } catch {}
  }, 10, 'auto-excerpt');
  addAction('post_updated', (postId: string) => {
    try { if (setting('auto_excerpt_enabled') !== '0') fillExcerpt(postId); } catch {}
  }, 10, 'auto-excerpt');
}
