import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

// Saved views: a named filter set for the content list ("my drafts", "site B
// pending review"). Storing them server-side rather than in the browser is what
// makes them survive a cleared cache and — for a shared view — reach the rest of
// a role.
//
// A view is only a memory of the caller's own filter choices. Applying one runs
// the list endpoint's normal validation again (siteScopeForFilter re-checks the
// caller's site assignments), so a view naming a site the caller cannot see is
// refused there rather than widening anything here.
const router = Router();

const FILTER_KEYS = ['status', 'type', 'siteId', 'search', 'sortBy', 'sortDir'] as const;

const viewSchema = z.object({
  name: z.string().min(1).max(60),
  shared: z.boolean().optional(),
  siteId: z.string().nullable().optional(),
  filters: z.record(z.string(), z.string()).optional(),
});

// Keep only the keys the list endpoint understands, and only as strings: a view
// must not become a way to smuggle arbitrary query parameters into that query.
function cleanFilters(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const src = (input || {}) as Record<string, unknown>;
  for (const key of FILTER_KEYS) {
    const v = src[key];
    if (v === undefined || v === null || v === '') continue;
    out[key] = String(v).slice(0, 200);
  }
  return out;
}

function shape(r: any, userId: string) {
  let filters: Record<string, string> = {};
  try { filters = JSON.parse(r.filters || '{}'); } catch { filters = {}; }
  return {
    id: r.id, name: r.name, shared: !!r.shared, role: r.role,
    siteId: r.siteId, filters, createdAt: r.createdAt, updatedAt: r.updatedAt,
    mine: r.userId === userId,
  };
}

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM SavedView WHERE userId = ? OR (shared = 1 AND role = ?) ORDER BY name ASC')
      .all(req.user!.userId, req.user!.role) as any[];
    res.json({ views: rows.map(r => shape(r, req.user!.userId)) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const data = viewSchema.parse(req.body);
    const now = new Date().toISOString();
    const id = cuid();
    db.prepare('INSERT INTO SavedView (id, userId, role, name, siteId, filters, shared, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user!.userId, req.user!.role, data.name, data.siteId || null, JSON.stringify(cleanFilters(data.filters)), data.shared ? 1 : 0, now, now);
    const row = db.prepare('SELECT * FROM SavedView WHERE id = ?').get(id);
    res.status(201).json({ view: shape(row, req.user!.userId) });
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    res.status(500).json({ error: err.message });
  }
});

// Renaming or re-scoping a view. Only its owner may change it — including
// turning sharing off, which a role-mate must not be able to do to someone
// else's view.
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM SavedView WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: '视图不存在' }); return; }
    if (existing.userId !== req.user!.userId && req.user!.role !== 'admin') { res.status(403).json({ error: '无权修改该视图' }); return; }
    const data = viewSchema.partial().parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
    if (data.shared !== undefined) { sets.push('shared = ?'); vals.push(data.shared ? 1 : 0); }
    if (data.siteId !== undefined) { sets.push('siteId = ?'); vals.push(data.siteId || null); }
    if (data.filters !== undefined) { sets.push('filters = ?'); vals.push(JSON.stringify(cleanFilters(data.filters))); }
    if (!sets.length) { res.json({ view: shape(existing, req.user!.userId) }); return; }
    sets.push('updatedAt = ?'); vals.push(new Date().toISOString()); vals.push(req.params.id);
    db.prepare('UPDATE SavedView SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
    res.json({ view: shape(db.prepare('SELECT * FROM SavedView WHERE id = ?').get(req.params.id), req.user!.userId) });
  } catch (err: any) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT userId FROM SavedView WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: '视图不存在' }); return; }
    if (existing.userId !== req.user!.userId && req.user!.role !== 'admin') { res.status(403).json({ error: '无权删除该视图' }); return; }
    db.prepare('DELETE FROM SavedView WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
