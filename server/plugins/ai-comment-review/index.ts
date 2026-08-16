import { addAction, doAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { chatComplete, getDefaultProvider } from '../../src/utils/ai';

// AI comment review: when a comment arrives, ask the model whether it looks
// like spam. Obvious spam → status 'spam'; everything else stays 'pending'
// for a human. Runs off the hot path (fire-and-forget) and never blocks
// comment submission. No provider configured → no-op.
//
// Config (Settings API):
//   ai_review_comments_enabled = '1' (default) | '0'

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

export function register() {
  addAction('comment_added', (commentId: string) => {
    void (async () => {
      try {
        const provider = getDefaultProvider();
        if (!provider) return; // no AI configured — leave comments pending
        const c = db.prepare('SELECT * FROM Comment WHERE id = ?').get(commentId) as any;
        if (!c || c.status !== 'pending') return;
        const post = c.postId ? db.prepare('SELECT title FROM Post WHERE id = ?').get(c.postId) as any : null;

        const result = await chatComplete(provider, [
          { role: 'system', content: '你是评论审核助手。判断评论是否为垃圾评论（广告、刷屏、恶意链接、无关内容）。只回复 SPAM 或 OK。' },
          { role: 'user', content: '文章标题：' + (post?.title || '（未知）') + '\n评论作者：' + String(c.author || '') + '\n评论内容：' + String(c.content || '').slice(0, 1000) },
        ], {});
        const verdict = String(result.content || '').trim().toUpperCase();

        if (verdict.includes('SPAM')) {
          db.prepare("UPDATE Comment SET status = 'spam' WHERE id = ?").run(commentId);
          doAction('comment_spam', commentId);
        }
        // OK → leave pending; a human makes the final call
      } catch { /* review must never break the flow */ }
    })();
  }, 20, 'ai-comment-review'); // priority 20: runs after other comment handlers
}
