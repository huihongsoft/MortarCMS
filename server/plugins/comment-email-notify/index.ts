import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { sendEmail } from '../../src/utils/mailer';

// Email the admin when a comment is submitted (best-effort; requires SMTP).
// Config (Settings API, PUT /api/settings):
//   comment_notify_enabled = '1' (default) | '0'
//   comment_notify_email   = recipient (defaults to admin_email)

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

export function register() {
  addAction('comment_added', (commentId: string) => {
    try {
      const recipient = setting('comment_notify_email') || setting('admin_email');
      if (!recipient) return;
      const c = db.prepare('SELECT * FROM Comment WHERE id = ?').get(commentId) as any;
      if (!c) return;
      const post = c.postId ? db.prepare('SELECT id, title, slug FROM Post WHERE id = ?').get(c.postId) as any : null;
      const base = setting('site_url').replace(/\/$/, '');
      const subject = '新评论：' + (c.author || '匿名') + (post ? ' — ' + post.title.slice(0, 40) : '');
      const adminLink = base + '/admin/comments';
      const html =
        '<p>站点收到一条新评论：</p>' +
        '<ul>' +
        '<li>作者：<strong>' + escapeHtml(c.author || '匿名') + '</strong></li>' +
        '<li>状态：' + (c.status === 'pending' ? '待审核' : c.status) + '</li>' +
        (post ? '<li>文章：<a href="' + base + '/post/' + post.slug + '">' + escapeHtml(post.title) + '</a></li>' : '') +
        '<li>内容：<br>' + escapeHtml(String(c.content || '').slice(0, 500)) + '</li>' +
        '</ul>' +
        '<p><a href="' + adminLink + '">前往后台管理评论</a></p>';
      void sendEmail(recipient, subject, html);
    } catch { /* notification must never break comment submission */ }
  }, 10, 'comment-email-notify');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
