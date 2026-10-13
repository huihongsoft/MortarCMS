import db from './db';
import { effectiveSetting } from './siteSettings';

// Absolute URL for a path this server hands out to be copied (a share link, a
// preview link).
//
// Order: the site this request resolved to, else the primary site; then that
// site's configured `site_url` (per-site override first — the same resolution the
// sitemap and feeds use), then its registered domain, and only then the request's
// own Host header. The Host is client-controlled, so it is the last resort: a
// link built from it would point whatever capability it carries at the host the
// caller claimed. Without this a link copied during local setup was published as
// localhost, and on a multi-site install it followed whichever host the admin
// happened to be browsing.
export function absoluteSiteUrl(
  req: { siteId?: string; protocol?: string; headers: { host?: string } },
  path: string,
  // Callers that link to a specific record pass ITS site: the request may have
  // resolved to a different one (an admin browsing site A while minting a link
  // for a site-B post), and the link would then point at the wrong domain — or
  // fail the site check at redemption.
  siteIdOverride?: string,
): string {
  let siteId = siteIdOverride || req.siteId || undefined;
  try {
    if (!siteId) siteId = (db.prepare('SELECT id FROM Site WHERE isPrimary = 1 AND active = 1 LIMIT 1').get() as any)?.id;
  } catch { /* no Site table: fall through to the request origin */ }
  let base = '';
  try { base = effectiveSetting(siteId, 'site_url') || ''; } catch { /* ignore */ }
  if (!base && siteId) {
    try {
      const domain = (db.prepare('SELECT domain FROM Site WHERE id = ?').get(siteId) as any)?.domain;
      if (domain) base = (req.protocol || 'http') + '://' + domain;
    } catch { /* ignore */ }
  }
  if (!base) base = (req.protocol || 'http') + '://' + (req.headers.host || 'localhost');
  return base.replace(/\/+$/, '') + path;
}
