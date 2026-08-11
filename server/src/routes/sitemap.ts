import { Router, Response } from 'express';
import db from '../utils/db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simple in-memory cache — sitemaps are crawled frequently and rarely change.
let cache: { xml: string; at: number } | null = null;

// Called by the cache purge system when content changes
export function invalidateSitemapCache(): void { cache = null; }

router.get('/sitemap.xml', (_req: AuthRequest, res: Response) => {
  try {
    if (cache && Date.now() - cache.at < 5 * 60 * 1000) { res.type('application/xml'); res.send(cache.xml); return; }
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    const siteUrl = (cfg.site_url || 'http://localhost:3001').replace(/\/$/, '');

    const posts = db.prepare("SELECT slug, strftime('%Y-%m-%d', COALESCE(publishedAt, createdAt)) as date FROM Post WHERE type = 'post' AND status = 'published' ORDER BY publishedAt DESC").all() as any[];
    const pages = db.prepare("SELECT slug, strftime('%Y-%m-%d', COALESCE(publishedAt, createdAt)) as date FROM Post WHERE type = 'page' AND status = 'published'").all() as any[];
    const categories = db.prepare('SELECT slug FROM Category').all() as any[];
    const tags = db.prepare('SELECT slug FROM Tag').all() as any[];
    const authors = db.prepare('SELECT username FROM User WHERE role != ?').all('subscriber') as any[];

    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    xml += '<url><loc>' + siteUrl + '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';
    for (const p of posts) xml += '<url><loc>' + siteUrl + '/post/' + esc(p.slug) + '</loc><lastmod>' + p.date + '</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>';
    for (const p of pages) xml += '<url><loc>' + siteUrl + '/page/' + esc(p.slug) + '</loc><lastmod>' + p.date + '</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>';
    for (const c of categories) xml += '<url><loc>' + siteUrl + '/category/' + esc(c.slug) + '</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>';
    for (const t of tags) xml += '<url><loc>' + siteUrl + '/tag/' + esc(t.slug) + '</loc><changefreq>weekly</changefreq><priority>0.4</priority></url>';
    for (const a of authors) xml += '<url><loc>' + siteUrl + '/author/' + esc(a.username) + '</loc><changefreq>weekly</changefreq><priority>0.3</priority></url>';
    xml += '</urlset>';

    cache = { xml, at: Date.now() };
    res.type('application/xml');
    res.send(xml);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
