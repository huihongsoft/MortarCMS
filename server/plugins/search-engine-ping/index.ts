import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import { postUrl } from '../../src/utils/slug';
import { isPrivateIp } from '../../src/utils/ssrf';

// Notify search engines about newly published posts:
//  - Google & Bing sitemap ping (no configuration required)
//  - Baidu active push when seo_baidu_token (+ seo_baidu_site) is set
//
// Config (Settings API, PUT /api/settings):
//   seo_ping_enabled   = '1' (default) | '0'
//   seo_baidu_token    = Baidu push token (data.zz.baidu.com)
//   seo_baidu_site     = your site domain as registered with Baidu

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function siteUrl(): string {
  const url = setting('site_url');
  return url ? url.replace(/\/$/, '') : '';
}

// The installer fills site_url in from the address the wizard was reached at, so
// a local install has a localhost/private value. Announcing that to search
// engines is wrong (and noisy), so treat a non-public site URL as unconfigured.
export function isPublicSiteUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return false;
    // Only an IP literal can be judged here — a hostname would need a DNS lookup.
    const bare = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
    const isIpLiteral = bare.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(bare);
    return !(isIpLiteral && isPrivateIp(bare));
  } catch { return false; }
}

async function pingGoogleBing(sitemapUrl: string): Promise<void> {
  const endpoints = [
    'https://www.google.com/ping?sitemap=' + encodeURIComponent(sitemapUrl),
    'https://www.bing.com/ping?sitemap=' + encodeURIComponent(sitemapUrl),
  ];
  await Promise.allSettled(endpoints.map(u => fetch(u, { method: 'GET', signal: AbortSignal.timeout(15000) })));
}

async function pingBaidu(postUrl: string): Promise<void> {
  const token = setting('seo_baidu_token');
  const site = setting('seo_baidu_site');
  if (!token || !site) return;
  try {
    await fetch('https://data.zz.baidu.com/urls?site=' + encodeURIComponent(site) + '&token=' + encodeURIComponent(token), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: postUrl,
      signal: AbortSignal.timeout(15000),
    });
  } catch { /* push is best-effort */ }
}

// One sitemap ping per window, however many posts were published in it (a bulk
// publish fires post_published per row).
const SITEMAP_COALESCE_MS = 30_000;
let sitemapTimer: ReturnType<typeof setTimeout> | null = null;
let sitemapBase = '';

function scheduleSitemapPing(base: string): void {
  sitemapBase = base;
  if (sitemapTimer) return;
  sitemapTimer = setTimeout(() => {
    sitemapTimer = null;
    const b = sitemapBase;
    if (!b) return;
    void pingGoogleBing(b + '/api/sitemap.xml').catch(() => {});
  }, SITEMAP_COALESCE_MS);
  sitemapTimer.unref?.();
}

export function register() {
  addAction('post_published', async (postId: string, contentType?: string) => {
    try {
      // Documented in the header but previously never read, so the flag had no
      // effect; honour it now that pings fire by default on a fresh install.
      if (setting('seo_ping_enabled') === '0') return;
      // Pages live at /page/<slug>, so postUrl() would push the wrong URL for
      // them; they get the sitemap ping only.
      const isPage = contentType === 'page';
      const base = siteUrl();
      if (!base || !isPublicSiteUrl(base)) return;
      const post = db.prepare('SELECT slug, status FROM Post WHERE id = ?').get(postId) as any;
      if (!post || post.status !== 'published' || !post.slug) return;
      // Global ping endpoints don't accept a per-URL payload, so we ping the
      // sitemap and Baidu push the exact URL. The sitemap route lives under
      // /api (see index.ts), not at the root.
      scheduleSitemapPing(base);
      if (!isPage) await pingBaidu(base + postUrl(post.slug));
    } catch { /* never break publishing on ping failures */ }
  }, 10, 'search-engine-ping');
}
