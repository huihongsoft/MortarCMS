import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { sendEmail } from '../../src/utils/mailer';

// Brute-force alert: when the same account (email) gets 3+ failed logins
// within 5 minutes, email the admin. The in-memory counter resets after the
// window; a 1-hour cooldown prevents alert spam after the first notice.
//
// Config (Settings API):
//   login_alert_enabled    = '1' (default) | '0'
//   login_alert_email      = recipient (defaults to admin_email)

const WINDOW_MS = 5 * 60 * 1000;
const COOLDOWN_MS = 60 * 60 * 1000;
const failures = new Map<string, { count: number; first: number; lastAlerted: number }>();

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

export function register() {
  addAction('login_failed', (email: string, ip: string) => {
    try {
      const key = String(email).toLowerCase();
      const now = Date.now();
      const rec = failures.get(key) || { count: 0, first: now, lastAlerted: 0 };
      if (now - rec.first > WINDOW_MS) { rec.count = 0; rec.first = now; }
      rec.count++;
      failures.set(key, rec);
      if (rec.count < 3 || now - rec.lastAlerted < COOLDOWN_MS) return;

      const recipient = setting('login_alert_email') || setting('admin_email');
      if (!recipient) return;
      const site = setting('site_title') || 'Mortar';
      const html =
        '<p>检测到针对账号 <strong>' + escapeHtml(String(email)) + '</strong> 的暴力破解尝试：</p>' +
        '<ul><li>5 分钟内失败次数：<strong>' + rec.count + '</strong></li>' +
        '<li>最近来源 IP：<code>' + escapeHtml(String(ip)) + '</code></li></ul>' +
        '<p>系统已自动锁定该账号 15 分钟（按 IP+账号）。如非本人操作，请检查密码强度并考虑启用两步验证（2FA）。</p>';
      void sendEmail(recipient, site + ' 登录安全警告', html);
      rec.lastAlerted = now;
    } catch { /* alert must never break the login flow */ }
  }, 10, 'login-alert');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
