import { Router, Response } from 'express';
import db from '../utils/db';
import { AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';

const router = Router();

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

router.get('/rss', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    const siteUrl = cfg.site_url || 'http://localhost:3001';

    const now = new Date().toISOString();
    const posts = (req.siteId
      ? db.prepare('SELECT p.*, u.username as authorName FROM Post p JOIN User u ON u.id = p.authorId WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?) AND (p.siteId IS NULL OR p.siteId = ?) ORDER BY p.publishedAt DESC LIMIT 20').all('post', 'published', now, req.siteId)
      : db.prepare('SELECT p.*, u.username as authorName FROM Post p JOIN User u ON u.id = p.authorId WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?) ORDER BY p.publishedAt DESC LIMIT 20').all('post', 'published', now)) as any[];

    const items = posts.map((p: any) => {
      const link = siteUrl + '/post/' + esc(p.slug);
      const desc = esc(p.excerpt || p.content.substring(0, 200));
      const date = new Date(p.publishedAt || p.createdAt).toUTCString();
      const author = esc(p.authorName || '');
      return '<item><title>' + esc(p.title) + '</title><link>' + link + '</link><guid>' + link + '</guid><description>' + desc + '</description><pubDate>' + date + '</pubDate><author>' + author + '</author></item>';
    }).join('');

    const latest = (req.siteId
      ? db.prepare("SELECT COALESCE(publishedAt, createdAt) as d FROM Post WHERE type = 'post' AND status = 'published' AND (publishedAt IS NULL OR publishedAt <= ?) AND (siteId IS NULL OR siteId = ?) ORDER BY publishedAt DESC LIMIT 1").get(now, req.siteId)
      : db.prepare("SELECT COALESCE(publishedAt, createdAt) as d FROM Post WHERE type = 'post' AND status = 'published' AND (publishedAt IS NULL OR publishedAt <= ?) ORDER BY publishedAt DESC LIMIT 1").get(now)) as any;
    const lastBuild = latest ? new Date(latest.d).toUTCString() : new Date().toUTCString();
    const xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>' + esc(cfg.site_title || 'Mortar CMS') + '</title><link>' + siteUrl + '</link><description>' + esc(cfg.site_description || '') + '</description><lastBuildDate>' + lastBuild + '</lastBuildDate><atom:link href="' + siteUrl + '/api/feed/rss" rel="self" type="application/rss+xml"/>' + items + '</channel></rss>';

    res.type('application/rss+xml');
    res.send(xml);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Comments feed: the latest approved comments across the site (WP-style)
router.get('/comments', (_req: AuthRequest, res: Response) => {
  try {
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    const siteUrl = cfg.site_url || 'http://localhost:3001';

    const comments = db.prepare(
      "SELECT c.*, p.title as postTitle, p.slug as postSlug FROM Comment c JOIN Post p ON p.id = c.postId WHERE c.status = 'approved' ORDER BY c.createdAt DESC LIMIT 20"
    ).all() as any[];

    const items = comments.map((c: any) => {
      const link = siteUrl + '/post/' + esc(c.postSlug) + '#comment-' + c.id;
      // Escape ]]> so a comment can never terminate the CDATA block and inject XML
      const cdata = (s: string) => esc(s).replace(/\]\]>/g, ']]&gt;');
      const desc = '<![CDATA[' + cdata(c.author || 'Anonymous') + ' 评论于 《' + cdata(c.postTitle) + '》：<br>' + cdata(c.content || '') + ']]>';
      const date = new Date(c.createdAt).toUTCString();
      return '<item><title>评论于《' + esc(c.postTitle) + '》</title><link>' + link + '</link><guid>' + link + '</guid><description>' + desc + '</description><pubDate>' + date + '</pubDate></item>';
    }).join('');

    const xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>' + esc(cfg.site_title || 'Mortar CMS') + ' · 评论</title><link>' + siteUrl + '</link><description>最新评论</description><atom:link href="' + siteUrl + '/api/feed/comments" rel="self" type="application/rss+xml"/>' + items + '</channel></rss>';

    res.type('application/rss+xml');
    res.send(xml);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
