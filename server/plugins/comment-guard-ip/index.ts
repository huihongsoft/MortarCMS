import { addFilter } from '../../src/utils/hooks';
import db from '../../src/utils/db';

// Reject comments from blacklisted IPs / emails before they are stored.
// Config (Settings API):
//   comment_ip_blacklist     = comma/newline separated IPs (exact match)
//   comment_email_blacklist  = comma/newline separated emails (case-insensitive)
//   comment_guard_enabled    = '1' (default) | '0'

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function list(key: string): string[] {
  return setting(key).split(/[,\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
}

export function register() {
  addFilter('comment_validate', (error: string, ctx: any) => {
    try {
      if (setting('comment_guard_enabled') === '0') return error;
      const ip = String(ctx?.ip || '').trim();
      const email = String(ctx?.email || '').trim().toLowerCase();
      if (ip && list('comment_ip_blacklist').includes(ip)) return 'comment rejected';
      if (email && list('comment_email_blacklist').includes(email)) return 'comment rejected';
    } catch {}
    return error;
  }, 10, 'comment-guard-ip');
}
