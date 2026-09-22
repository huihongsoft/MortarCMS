import { Router, Response } from 'express';
import db from '../utils/db';
import { AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { effectiveSetting } from '../utils/siteSettings';
import { PUBLIC_POST_CONDITIONS } from '../utils/publicPosts';
import { postUrl, getPermalinkPrefix } from '../utils/slug';

const router = Router();

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simple in-memory cache — sitemaps are crawled frequently and rarely change.
// Keyed by site: the sitemap is site-filtered, so a global cache would leak
// one site's URLs to another.
let cache: { siteId: string | null; xml: string; at: number } | null = null;

// Called by the cache purge system when content changes
export function invalidateSitemapCache(): void { cache = null; }

router.get('/sitemap.xml', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const siteId = req.siteId || null;
    if (cache && cache.siteId === siteId && Date.now() - cache.at < 5 * 60 * 1000) { res.type('application/xml'); res.send(cache.xml); return; }
    // Per-site override first: a secondary site's sitemap must not advertise the
    // primary site's domain.
    const siteUrl = (effectiveSetting(siteId || undefined, 'site_url') || 'http://localhost:3001').replace(/\/$/, '');

    const now = new Date().toISOString();
    const posts = (req.siteId
      ? db.prepare("SELECT p.slug, strftime('%Y-%m-%d', COALESCE(p.publishedAt, p.createdAt)) as date FROM Post p WHERE p.type = 'post' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?) AND (p.siteId IS NULL OR p.siteId = ?)" + PUBLIC_POST_CONDITIONS + ' ORDER BY p.publishedAt DESC').all(now, req.siteId)
      : db.prepare("SELECT p.slug, strftime('%Y-%m-%d', COALESCE(p.publishedAt, p.createdAt)) as date FROM Post p WHERE p.type = 'post' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)" + PUBLIC_POST_CONDITIONS + ' ORDER BY p.publishedAt DESC').all(now)) as any[];
    const pages = (req.siteId
      ? db.prepare("SELECT p.slug, strftime('%Y-%m-%d', COALESCE(p.publishedAt, p.createdAt)) as date FROM Post p WHERE p.type = 'page' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?) AND (p.siteId IS NULL OR p.siteId = ?)" + PUBLIC_POST_CONDITIONS).all(now, req.siteId)
      : db.prepare("SELECT p.slug, strftime('%Y-%m-%d', COALESCE(p.publishedAt, p.createdAt)) as date FROM Post p WHERE p.type = 'page' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)" + PUBLIC_POST_CONDITIONS).all(now)) as any[];
    // Only listing pages that actually have content on THIS site: a global list
    // advertises URLs that render empty for the crawler (and, on a multi-site
    // install, URLs that belong to another site).
    const siteScope = req.siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
    const siteArgs = req.siteId ? [now, req.siteId] : [now];
    const live = "p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)" + siteScope;
    const categories = (req.siteId
      ? db.prepare('SELECT DISTINCT c.slug FROM Category c JOIN PostCategory pc ON pc.categoryId = c.id JOIN Post p ON p.id = pc.postId WHERE ' + live).all(...siteArgs)
      : db.prepare('SELECT slug FROM Category').all()) as any[];
    const tags = (req.siteId
      ? db.prepare('SELECT DISTINCT t.slug FROM Tag t JOIN PostTag pt ON pt.tagId = t.id JOIN Post p ON p.id = pt.postId WHERE ' + live).all(...siteArgs)
      : db.prepare('SELECT slug FROM Tag').all()) as any[];
    const authors = (req.siteId
      ? db.prepare('SELECT DISTINCT u.username FROM User u JOIN Post p ON p.authorId = u.id WHERE ' + live).all(...siteArgs)
      : db.prepare('SELECT username FROM User WHERE role != ?').all('subscriber')) as any[];

    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    xml += '<url><loc>' + siteUrl + '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';
    // One prefix read for the whole loop: this walks every post, and postUrl
    // would otherwise re-read the Setting row per post.
    const prefix = getPermalinkPrefix();
    for (const p of posts) xml += '<url><loc>' + esc(siteUrl + postUrl(p.slug, prefix)) + '</loc><lastmod>' + p.date + '</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>';
    for (const p of pages) xml += '<url><loc>' + siteUrl + '/page/' + esc(p.slug) + '</loc><lastmod>' + p.date + '</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>';
    for (const c of categories) xml += '<url><loc>' + siteUrl + '/category/' + esc(c.slug) + '</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>';
    for (const t of tags) xml += '<url><loc>' + siteUrl + '/tag/' + esc(t.slug) + '</loc><changefreq>weekly</changefreq><priority>0.4</priority></url>';
    for (const a of authors) xml += '<url><loc>' + siteUrl + '/author/' + esc(a.username) + '</loc><changefreq>weekly</changefreq><priority>0.3</priority></url>';
    xml += '</urlset>';

    cache = { siteId, xml, at: Date.now() };
    res.type('application/xml');
    res.send(xml);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
