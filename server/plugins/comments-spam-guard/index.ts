import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

const SPAM_WORDS = ['viagra', 'casino', 'buy now', 'free money', 'seo backlinks'];

// Load extra words configured by the admin ("spam words" setting) so the filter
// can learn from previously flagged comments without code changes.
function effectiveSpamWords(): string[] {
  try {
    const extra = (db.prepare("SELECT value FROM Setting WHERE key = 'spam_words'").get() as any)?.value || '';
    const extraList = extra.split(/[,\n]+/).map((w: string) => w.trim().toLowerCase()).filter(Boolean);
    return [...new Set([...SPAM_WORDS, ...extraList])];
  } catch { return SPAM_WORDS; }
}

export function register() {
  addAction('comment_added', (commentId: string) => {
    const comment = db.prepare('SELECT content FROM Comment WHERE id = ?').get(commentId) as any;
    if (!comment) return;
    const lower = (comment.content || '').toLowerCase();
    if (effectiveSpamWords().some(w => lower.includes(w))) {
      db.prepare("UPDATE Comment SET status = 'spam' WHERE id = ?").run(commentId);
      console.log('[SpamGuard] Comment ' + commentId + ' flagged as spam');
    }
  }, 10, 'comments-spam-guard');
}
