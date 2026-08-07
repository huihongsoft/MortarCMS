import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    let sql = 'SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId';
    const params: any[] = [];
    if (search) { sql += ' WHERE m.original LIKE ? OR m.filename LIKE ?'; params.push('%' + search + '%', '%' + search + '%'); }
    sql += ' ORDER BY m.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    const media = db.prepare(sql).all(...params) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media' + (search ? ' WHERE original LIKE ? OR filename LIKE ?' : '')).get(...(search ? ['%' + search + '%', '%' + search + '%'] : [])) as any)?.cnt || 0;
    res.json({ media, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId ORDER BY m.createdAt DESC LIMIT ? OFFSET ?').all(limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media').get() as any)?.cnt || 0;
    res.json({ media, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/upload', authenticate, authorize('admin', 'editor', 'author'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const id = cuid();
    const isImage = (req.file.mimetype || '').startsWith('image/');
    let width: number | null = null;
    let height: number | null = null;
    let srcsetField: string | null = null;
    // Generate a 300px thumbnail for images (for the media grid / pickers)
    let thumbnail: string | null = null;
    if (isImage) {
      const srcPath = path.join(__dirname, '../..', 'uploads', req.file.filename);
      let meta;
      try {
        meta = await sharp(srcPath).metadata();
      } catch {
        // Not a decodable image — reject instead of storing arbitrary content
        fs.unlinkSync(srcPath);
        res.status(400).json({ error: 'Invalid or corrupted image file' });
        return;
      }
      try {
        width = meta.width || null;
        height = meta.height || null;
        const thumbsDir = path.join(__dirname, '../..', 'uploads', 'thumbs');
        if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
        const thumbName = id + '-thumb.jpg';
        await sharp(srcPath).resize({ width: 300, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(thumbsDir, thumbName));
        thumbnail = '/uploads/thumbs/' + thumbName;
        // Responsive srcset sizes (webp, disk-cached)
        const srcset: Record<string, string> = {};
        for (const size of [480, 960]) {
          const fn = id + '-w' + size + '.webp';
          await sharp(srcPath).resize({ width: size, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(thumbsDir, fn));
          srcset[size] = '/uploads/thumbs/' + fn;
        }
        srcsetField = JSON.stringify(srcset);
      } catch (e: any) { console.log('[Media] thumbnail gen failed:', e.message); }
    }
    db.prepare('INSERT INTO Media (id, filename, original, mimeType, size, url, alt, title, userId, width, height, thumbnail, srcset) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, '/uploads/' + req.file.filename, req.body.alt || '', req.body.title || '', req.user!.userId, width, height, thumbnail, srcsetField);
    res.status(201).json(db.prepare('SELECT * FROM Media WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: single media item detail (for attachment pages / preview)
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId WHERE m.id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    // Parse srcset JSON for the client
    if (media.srcset) {
      try { media.srcset = JSON.parse(media.srcset); } catch { media.srcset = null; }
    }
    res.json(media);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Responsive image endpoint: GET /api/media/:id/img?w=640&fmt=webp -> resized (disk-cached)
router.get('/:id/img', async (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media || !media.mimeType?.startsWith('image/')) { res.status(404).json({ error: 'Image not found' }); return; }
    const w = Math.min(parseInt(req.query.w as string) || 640, 2560);
    const fmt = (req.query.fmt as string || 'jpeg').toLowerCase();
    if (!['jpeg', 'webp', 'avif'].includes(fmt)) { res.status(400).json({ error: 'fmt must be jpeg, webp or avif' }); return; }
    const srcPath = path.join(__dirname, '../..', 'uploads', media.filename);
    if (!fs.existsSync(srcPath)) { res.status(404).json({ error: 'File missing' }); return; }
    const thumbsDir = path.join(__dirname, '../..', 'uploads', 'thumbs');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
    const outPath = path.join(thumbsDir, media.id + '-w' + w + '.' + fmt);
    const mime = fmt === 'webp' ? 'image/webp' : fmt === 'avif' ? 'image/avif' : 'image/jpeg';
    if (fs.existsSync(outPath)) {
      res.type(mime).sendFile(outPath);
      return;
    }
    const pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
    const task = fmt === 'webp' ? pipeline.webp({ quality: 82 }) : fmt === 'avif' ? pipeline.avif({ quality: 75 }) : pipeline.jpeg({ quality: 82 });
    try {
      await task.toFile(outPath);
      res.type(mime).sendFile(outPath);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    const filePath = path.join(__dirname, '../..', media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM Media WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk delete media
router.post('/bulk-delete', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    for (const id of ids) {
      const m = db.prepare('SELECT * FROM Media WHERE id = ?').get(id) as any;
      if (m) {
        const filePath = require('path').join(__dirname, '../..', m.url);
        if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
        db.prepare('DELETE FROM Media WHERE id = ?').run(id);
      }
    }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
