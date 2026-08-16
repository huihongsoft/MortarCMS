import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import fs from 'fs';
import { sendEmail } from '../../src/utils/mailer';

// Notify the admin after every scheduled database backup (the built-in
// backup_database scheduler task fires backup_completed).
//
// Config (Settings API):
//   backup_notify_enabled = '1' (default) | '0'
//   backup_notify_email   = recipient (defaults to admin_email)

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

export function register() {
  addAction('backup_completed', (backupFile: string) => {
    try {
      const recipient = setting('backup_notify_email') || setting('admin_email');
      if (!recipient) return;
      let sizeKb = 0;
      try { sizeKb = Math.round(fs.statSync(String(backupFile)).size / 1024); } catch {}
      const site = setting('site_title') || 'Mortar';
      const html =
        '<p>数据库自动备份已完成：</p>' +
        '<ul><li>文件：<code>' + String(backupFile) + '</code></li>' +
        '<li>大小：' + sizeKb + ' KB</li>' +
        '<li>时间：' + new Date().toLocaleString() + '</li></ul>' +
        '<p>建议定期下载完整备份（后台 → 系统信息 → 备份）并保存到异地。</p>';
      void sendEmail(recipient, site + ' 数据库备份完成', html);
    } catch { /* notification is best-effort */ }
  }, 10, 'backup-notify');
}
