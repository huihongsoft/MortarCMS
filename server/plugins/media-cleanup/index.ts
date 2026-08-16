import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import fs from 'fs';
import path from 'path';

// Orphaned media cleanup: media rows whose url is neither used as a post
// featured image nor referenced inside any post content are reported (and
// optionally deleted). Recent uploads are always skipped so a freshly
// uploaded image that is not yet attached cannot be removed.
//
// Config (Settings API):
//   media_cleanup_enabled = '1' (default) | '0'
//   media_cleanup_days    = minimum age in days before a file is considered
//                           (default 7)
//   media_cleanup_delete  = '1' to delete files + rows, '0' to only report
// The latest report is stored in Setting key `media_cleanup_report` (JSON).

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily
let timer: NodeJS.Timeout | null = null;

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function save(key: string, value: string): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('media-cleanup-' + key, key, value);
}

export function runCleanup(): { orphaned: number; deleted: number } {
  const cutoff = new Date(Date.now() - Math.max(1, parseInt(setting('media_cleanup_days') || '7') || 7) * 86400000).toISOString();
  const media = db.prepare('SELECT id, url, original FROM Media WHERE createdAt < ?').all(cutoff) as any[];
  let orphaned = 0;
  let deleted = 0;
  const report: any[] = [];
  for (const m of media) {
    const url = String(m.url || '');
    if (!url) continue;
    const featured = db.prepare('SELECT 1 FROM Post WHERE featured = ? LIMIT 1').get(url);
    const inContent = db.prepare("SELECT 1 FROM Post WHERE content LIKE ? LIMIT 1").get('%' + url + '%');
    if (featured || inContent) continue;
    orphaned++;
    const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(url));
    if (setting('media_cleanup_delete') === '1') {
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
      try { db.prepare('DELETE FROM Media WHERE id = ?').run(m.id); } catch {}
      deleted++;
    }
    report.push({ url, original: m.original, deleted: setting('media_cleanup_delete') === '1' });
  }
  save('media_cleanup_report', JSON.stringify({ at: new Date().toISOString(), orphaned, deleted, items: report.slice(0, 200) }));
  if (orphaned) console.log('[Plugin] media-cleanup: ' + orphaned + ' orphaned, ' + deleted + ' deleted');
  return { orphaned, deleted };
}

export function register() {
  addAction('init', () => {
    try { runCleanup(); } catch {}
    if (!timer) timer = setInterval(() => { try { runCleanup(); } catch {} }, CHECK_INTERVAL_MS);
    timer.unref?.();
  }, 10, 'media-cleanup');
}
