import { Router, Response } from 'express';
import db from '../utils/db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

router.get('/rss', (_req: AuthRequest, res: Response) => {
  try {
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    const siteUrl = cfg.site_url || 'http://localhost:3001';

    const posts = db.prepare(
      'SELECT p.*, u.username as authorName FROM Post p JOIN User u ON u.id = p.authorId WHERE p.type = ? AND p.status = ? ORDER BY p.publishedAt DESC LIMIT 20'
    ).all('post', 'published') as any[];

    const items = posts.map((p: any) => {
      const link = siteUrl + '/post/' + esc(p.slug);
      const desc = esc(p.excerpt || p.content.substring(0, 200));
      const date = new Date(p.publishedAt || p.createdAt).toUTCString();
      const author = esc(p.authorName || '');
      return '<item><title>' + esc(p.title) + '</title><link>' + link + '</link><guid>' + link + '</guid><description>' + desc + '</description><pubDate>' + date + '</pubDate><author>' + author + '</author></item>';
    }).join('');

    const xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>' + esc(cfg.site_title || 'Mortar CMS') + '</title><link>' + siteUrl + '</link><description>' + esc(cfg.site_description || '') + '</description><atom:link href="' + siteUrl + '/api/feed/rss" rel="self" type="application/rss+xml"/>' + items + '</channel></rss>';

    res.type('application/rss+xml');
    res.send(xml);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
