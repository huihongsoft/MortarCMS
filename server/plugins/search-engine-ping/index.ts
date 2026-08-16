import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';

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

export function register() {
  addAction('post_published', async (postId: string) => {
    try {
      const base = siteUrl();
      if (!base) return;
      const post = db.prepare('SELECT slug, status FROM Post WHERE id = ?').get(postId) as any;
      if (!post || post.status !== 'published' || !post.slug) return;
      // Global ping endpoints don't accept a per-URL payload, so we ping the
      // sitemap and Baidu push the exact URL.
      await pingGoogleBing(base + '/sitemap.xml');
      await pingBaidu(base + '/post/' + post.slug);
    } catch { /* never break publishing on ping failures */ }
  }, 10, 'search-engine-ping');
}
