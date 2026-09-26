import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { likeContains } from '../utils/sqlLike';
import { normalizePath, normalizeTarget, invalidateRedirectCache } from '../utils/redirects';

const router = Router();

// Redirect management. The list is what an operator reads after a link rots, and
// the writes are what fix it — including the ones the slug-change path adds by
// itself (createdBy = 'slug-change').
const redirectSchema = z.object({
  fromPath: z.string().min(1).max(500),
  toPath: z.string().min(1).max(1000),
  status: z.union([z.literal(301), z.literal(302)]).optional(),
  siteId: z.string().nullable().optional(),
});

// Admin: list with search + pagination
router.get('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30')) || 30));
    const q = String(req.query.q || '').trim();
    // Two spellings of the same filter: the count query has no join, the list
    // query needs the alias. Written out so they cannot drift apart.
    const filter = q ? " WHERE (fromPath LIKE ? ESCAPE '\\' OR toPath LIKE ? ESCAPE '\\')" : '';
    const joinedFilter = q ? " WHERE (r.fromPath LIKE ? ESCAPE '\\' OR r.toPath LIKE ? ESCAPE '\\')" : '';
    const params: any[] = q ? [likeContains(q), likeContains(q)] : [];
    const total = (db.prepare('SELECT COUNT(*) as c FROM Redirect' + filter).get(...params) as any)?.c || 0;
    const redirects = db.prepare(
      'SELECT r.*, s.name as siteName FROM Redirect r LEFT JOIN Site s ON s.id = r.siteId' + joinedFilter
      + ' ORDER BY r.createdAt DESC, r.id DESC LIMIT ? OFFSET ?'
    ).all(...params, limit, (page - 1) * limit) as any[];
    res.json({ redirects, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create
router.post('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const data = redirectSchema.parse(req.body);
    const from = normalizePath(data.fromPath);
    const to = normalizeTarget(data.toPath);
    if (!to) { res.status(400).json({ error: '目标必须是站内路径或以 http(s):// 开头的完整地址' }); return; }
    if (from === '/') { res.status(400).json({ error: '不能重定向首页' }); return; }
    if (from === to) { res.status(400).json({ error: '来源与目标相同' }); return; }
    const siteId = data.siteId || null;
    const existing = db.prepare('SELECT id FROM Redirect WHERE fromPath = ? AND ' + (siteId ? 'siteId = ?' : 'siteId IS NULL'))
      .get(...(siteId ? [from, siteId] : [from])) as any;
    if (existing) { res.status(400).json({ error: '该来源路径已有重定向' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
      .run(id, from, to, data.status === 302 ? 302 : 301, siteId, new Date().toISOString(), 'admin');
    invalidateRedirectCache();
    res.status(201).json(db.prepare('SELECT * FROM Redirect WHERE id = ?').get(id));
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    res.status(500).json({ error: err.message });
  }
});

// Admin: update (target and status only — changing the source would silently
// orphan whatever the old source was catching)
router.put('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Redirect WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: '重定向不存在' }); return; }
    const data = redirectSchema.partial().parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.toPath !== undefined) {
      const to = normalizeTarget(data.toPath);
      if (!to) { res.status(400).json({ error: '目标必须是站内路径或以 http(s):// 开头的完整地址' }); return; }
      sets.push('toPath = ?'); vals.push(to);
    }
    if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status === 302 ? 302 : 301); }
    if (sets.length) { vals.push(req.params.id); db.prepare('UPDATE Redirect SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    invalidateRedirectCache();
    res.json(db.prepare('SELECT * FROM Redirect WHERE id = ?').get(req.params.id));
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete
router.delete('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM Redirect WHERE id = ?').run(req.params.id);
    if (!r.changes) { res.status(404).json({ error: '重定向不存在' }); return; }
    invalidateRedirectCache();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: import a CSV of `from,to[,status]` (one per line, `#` comments allowed).
// Rows that are already there are skipped rather than duplicated, and the reply
// says which line was rejected and why: a silent partial import is worse than a
// refusal when the file came from a search console export.
router.post('/import', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const csv = String(req.body?.csv || '');
    if (!csv.trim()) { res.status(400).json({ error: 'csv required' }); return; }
    if (csv.length > 2_000_000) { res.status(400).json({ error: 'CSV 过大（上限 2MB）' }); return; }
    let created = 0, skipped = 0;
    const errors: string[] = [];
    const lines = csv.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      // Split on comma or tab, tolerating quotes around a field.
      const parts = line.split(/\t|,/).map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) { errors.push('第 ' + (i + 1) + ' 行：缺少目标地址'); continue; }
      const from = normalizePath(parts[0]);
      const to = normalizeTarget(parts[1]);
      if (!from || from === '/' || !to) { errors.push('第 ' + (i + 1) + ' 行：来源或目标无效'); continue; }
      if (from === to) { errors.push('第 ' + (i + 1) + ' 行：来源与目标相同'); continue; }
      const status = parts[2] === '302' ? 302 : 301;
      try {
        const existing = db.prepare('SELECT id, toPath FROM Redirect WHERE fromPath = ? AND siteId IS NULL').get(from) as any;
        if (existing) {
          if (existing.toPath !== to) { db.prepare('UPDATE Redirect SET toPath = ?, status = ? WHERE id = ?').run(to, status, existing.id); created++; }
          else skipped++;
          continue;
        }
        db.prepare('INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES (?, ?, ?, ?, NULL, 0, ?, ?)')
          .run(cuid(), from, to, status, new Date().toISOString(), 'import');
        created++;
      } catch (e: any) {
        errors.push('第 ' + (i + 1) + ' 行：' + (e?.message || '写入失败'));
      }
    }
    invalidateRedirectCache();
    // Errors are capped: a wrong file can produce one per line, and the response
    // is meant to be read by a person.
    res.json({ success: true, created, skipped, errors: errors.slice(0, 20), errorCount: errors.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
