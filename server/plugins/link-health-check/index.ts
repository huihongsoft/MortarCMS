import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { sendEmail } from '../../src/utils/mailer';

// Friend-link health check: probe every Link URL (HEAD, fallback GET) and
// store the results in Setting `link_health_report`. When enabled, a summary
// email with any broken links is sent to the admin.
//
// Config (Settings API):
//   link_health_enabled = '1' (default) | '0'
//   link_health_notify  = '1' to email on broken links (default '0')
//   link_health_email   = recipient (defaults to admin_email)

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function save(key: string, value: string): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('link-health-' + key, key, value);
}

async function probe(url: string): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    return { ok: res.ok, status: res.status };
  } catch (e: any) {
    // Some servers reject HEAD — fall back to a GET with a small range
    try {
      const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(10000) });
      return { ok: res.ok, status: res.status };
    } catch (e2: any) {
      return { ok: false, status: 0, error: e2.message || 'unreachable' };
    }
  }
}

export async function runCheck(): Promise<{ checked: number; broken: number }> {
  const links = db.prepare('SELECT id, name, url FROM Link').all() as any[];
  const results: any[] = [];
  let broken = 0;
  for (const l of links) {
    const url = String(l.url || '');
    if (!/^https?:\/\//i.test(url)) { results.push({ name: l.name, url, ok: false, status: 'invalid' }); broken++; continue; }
    const r = await probe(url);
    if (!r.ok) broken++;
    results.push({ name: l.name, url, ok: r.ok, status: r.status || (r.error || 'unreachable') });
    await new Promise(res => setTimeout(res, 500)); // polite pacing
  }
  save('link_health_report', JSON.stringify({ at: new Date().toISOString(), checked: links.length, broken, items: results }));
  if (broken && setting('link_health_notify') === '1') {
    const recipient = setting('link_health_email') || setting('admin_email');
    if (recipient) {
      const site = setting('site_title') || 'Mortar';
      const rows = results.filter(r => !r.ok).map(r => '<li>' + escapeHtml(r.name) + ' — <a href="' + escapeHtml(r.url) + '">' + escapeHtml(r.url) + '</a>（' + escapeHtml(String(r.status)) + '）</li>').join('');
      void sendEmail(recipient, site + ' 友情链接健康检查：' + broken + ' 个失效', '<p>以下友链无法访问：</p><ul>' + rows + '</ul>');
    }
  }
  return { checked: links.length, broken };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function register() {
  addAction('init', () => {
    try { if (setting('link_health_enabled') !== '0') void runCheck(); } catch {}
    if (!timer) timer = setInterval(() => { try { if (setting('link_health_enabled') !== '0') void runCheck(); } catch {} }, CHECK_INTERVAL_MS);
    timer.unref?.();
  }, 10, 'link-health-check');
}
