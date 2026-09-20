import db from './db';

// Read one setting with the per-site override applied: a SiteSetting row wins
// over the global Setting row, which is what GET /api/settings serves the
// frontend (routes/settings.ts merges the override over the global map).
//
// The server-side generators (sitemap, RSS, robots.txt, SEO meta) need the same
// rule — without it a multi-site install advertises the primary site's URL in a
// secondary site's sitemap/feed/canonical, and its feed title/description come
// from the wrong site.
export function effectiveSetting(siteId: string | undefined, key: string): string {
  try {
    if (siteId) {
      const over = db.prepare('SELECT value FROM SiteSetting WHERE siteId = ? AND key = ?').get(siteId, key) as any;
      if (over && String(over.value) !== '') return String(over.value);
    }
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any;
    return row ? String(row.value) : '';
  } catch {
    return '';
  }
}
