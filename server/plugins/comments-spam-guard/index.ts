import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

const SPAM_WORDS = ['viagra', 'casino', 'buy now', 'free money', 'seo backlinks'];

export function register() {
  addAction('comment_added', (commentId: string) => {
    const comment = db.prepare('SELECT content FROM Comment WHERE id = ?').get(commentId) as any;
    if (!comment) return;
    const lower = (comment.content || '').toLowerCase();
    if (SPAM_WORDS.some(w => lower.includes(w))) {
      db.prepare("UPDATE Comment SET status = 'spam' WHERE id = ?").run(commentId);
      console.log('[SpamGuard] Comment ' + commentId + ' flagged as spam');
    }
  });
}
