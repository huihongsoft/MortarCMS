import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { sendEmail } from '../../src/utils/mailer';

// Daily content digest email. Fires once per day at daily_digest_time
// (HH:MM, server time) — the last-sent date is tracked in a Setting so a
// restart can never double-send. Requires SMTP; skips silently otherwise.
//
// Config (Settings API):
//   daily_digest_enabled = '1' (default) | '0'
//   daily_digest_time    = 'HH:MM' (default '09:00')
//   daily_digest_email   = recipient (defaults to admin_email)

const CHECK_INTERVAL_MS = 60 * 1000;
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function save(key: string, value: string): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('daily-digest-' + key, key, value);
}

function count(sql: string, ...args: any[]): number {
  try { return (db.prepare(sql).get(...args) as any)?.c || 0; } catch { return 0; }
}

function sendDigest(): void {
  try {
    const recipient = setting('daily_digest_email') || setting('admin_email');
    if (!recipient) return;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dayStart = (d: string) => d + 'T00:00:00.000Z';
    const dayEnd = (d: string) => d + 'T23:59:59.999Z';

    const newPosts = count("SELECT COUNT(*) c FROM Post WHERE type = 'post' AND createdAt >= ? AND createdAt <= ?", dayStart(today), dayEnd(today));
    const newComments = count("SELECT COUNT(*) c FROM Comment WHERE createdAt >= ? AND createdAt <= ?", dayStart(today), dayEnd(today));
    const newUsers = count("SELECT COUNT(*) c FROM User WHERE createdAt >= ? AND createdAt <= ?", dayStart(today), dayEnd(today));
    const totalPosts = count("SELECT COUNT(*) c FROM Post WHERE type = 'post' AND status = 'published'");
    const pendingComments = count("SELECT COUNT(*) c FROM Comment WHERE status = 'pending'");

    const site = setting('site_title') || 'Mortar';
    const html =
      '<h2>' + escapeHtml(site) + ' 内容日报</h2>' +
      '<table style="border-collapse:collapse;font-size:14px;">' +
      '<tr><td style="padding:6px 16px 6px 0;">今日新文章</td><td style="padding:6px 0;"><strong>' + newPosts + '</strong></td></tr>' +
      '<tr><td style="padding:6px 16px 6px 0;">今日新评论</td><td style="padding:6px 0;"><strong>' + newComments + '</strong></td></tr>' +
      '<tr><td style="padding:6px 16px 6px 0;">今日新用户</td><td style="padding:6px 0;"><strong>' + newUsers + '</strong></td></tr>' +
      '<tr><td style="padding:6px 16px 6px 0;">累计发布文章</td><td style="padding:6px 0;"><strong>' + totalPosts + '</strong></td></tr>' +
      '<tr><td style="padding:6px 16px 6px 0;">待审核评论</td><td style="padding:6px 0;"><strong>' + pendingComments + '</strong></td></tr>' +
      '</table>';
    void sendEmail(recipient, site + ' 内容日报（' + today + '）', html);
    save('daily_digest_last', today);
  } catch { /* digest must never crash the loop */ }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function register() {
  addAction('init', () => {
    try {
      const t = setting('daily_digest_time') || '09:00';
      const m = t.match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return;
      const hour = parseInt(m[1], 10);
      const minute = parseInt(m[2], 10);
      const check = () => {
        const now = new Date();
        if (now.getHours() !== hour || now.getMinutes() !== minute) return;
        const today = now.toISOString().slice(0, 10);
        if (setting('daily_digest_last') === today) return; // already sent today
        sendDigest();
      };
      check();
      if (!timer) timer = setInterval(check, CHECK_INTERVAL_MS);
      timer.unref?.();
    } catch {}
  }, 10, 'daily-digest');
}
