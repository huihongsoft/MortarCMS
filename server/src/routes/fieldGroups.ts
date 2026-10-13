import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { logger } from '../utils/logger';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { loadFieldGroups, normalizeFieldDefs, fieldsForType, FieldDef } from '../utils/fieldSchema';
import { allPostTypeSlugs } from './customPostTypes';

// Field groups: the custom fields attached to a content type. The definition
// lives here; the values live in PostMeta, keyed by the field's key.

// Anything unexpected is logged, never echoed: the response is text we wrote.
const GENERIC_ERROR = '操作失败，请稍后重试';

const router = Router();

// Field keys share one namespace per type (they are PostMeta keys), so two groups
// on the same type must not both define `price`.
function keyTakenByAnotherGroup(typeSlug: string, key: string, exceptId: string | null): boolean {
  return loadFieldGroups().some(g => g.typeSlug === typeSlug && g.id !== exceptId && g.fields.some(f => f.key === key));
}

function parseGroup(body: any, existingId: string | null): { ok: true; value: { typeSlug: string; name: string; fields: FieldDef[]; menuOrder: number } } | { ok: false; error: string } {
  const typeSlug = String(body?.typeSlug || '').trim();
  if (!allPostTypeSlugs().includes(typeSlug)) return { ok: false, error: '未知的内容类型: ' + typeSlug };
  const name = String(body?.name || '').trim().slice(0, 60);
  if (!name) return { ok: false, error: '分组名称必填' };
  const parsed = normalizeFieldDefs(body?.fields || []);
  if (!parsed.ok) return parsed;
  for (const f of parsed.fields) {
    if (keyTakenByAnotherGroup(typeSlug, f.key, existingId)) return { ok: false, error: '该类型下已有同名字段: ' + f.key };
  }
  return {
    ok: true,
    value: {
      typeSlug,
      name,
      fields: parsed.fields,
      menuOrder: Number.isFinite(Number(body?.menuOrder)) ? Number(body.menuOrder) : 0,
    },
  };
}

// Read access is for anyone who edits content (the post editor needs the
// definitions to render the fields). Writing definitions is an admin action.
router.get('/', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ groups: loadFieldGroups() });
  } catch (err: any) { logger.warn({ err }, 'field group request failed'); res.status(500).json({ error: GENERIC_ERROR }); }
});

// The flat field list for one type, in display order — what the editor renders.
router.get('/for/:type', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    res.json({ typeSlug: req.params.type, fields: fieldsForType(req.params.type) });
  } catch (err: any) { logger.warn({ err }, 'field group request failed'); res.status(500).json({ error: GENERIC_ERROR }); }
});

router.post('/', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = parseGroup(req.body, null);
    if (!parsed.ok) { res.status(400).json({ error: parsed.error }); return; }
    const now = new Date().toISOString();
    const id = cuid();
    db.prepare('INSERT INTO FieldGroup (id, typeSlug, name, fields, menuOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, parsed.value.typeSlug, parsed.value.name, JSON.stringify(parsed.value.fields), parsed.value.menuOrder, now, now);
    // Answered from what was just written, not re-read: a read that failed here
    // used to report 500 for a group that had already been created.
    res.status(201).json({ group: { id, ...parsed.value, createdAt: now, updatedAt: now } });
  } catch (err: any) { logger.warn({ err }, 'field group request failed'); res.status(500).json({ error: GENERIC_ERROR }); }
});

router.put('/:id', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM FieldGroup WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: '字段分组不存在' }); return; }
    const parsed = parseGroup(req.body, req.params.id);
    if (!parsed.ok) { res.status(400).json({ error: parsed.error }); return; }
    const now = new Date().toISOString();
    db.prepare('UPDATE FieldGroup SET typeSlug = ?, name = ?, fields = ?, menuOrder = ?, updatedAt = ? WHERE id = ?')
      .run(parsed.value.typeSlug, parsed.value.name, JSON.stringify(parsed.value.fields), parsed.value.menuOrder, now, req.params.id);
    // Same reason as create: the write is committed, so the response must not
    // depend on a second read succeeding.
    res.json({ group: { id: req.params.id, ...parsed.value, updatedAt: now } });
  } catch (err: any) { logger.warn({ err }, 'field group request failed'); res.status(500).json({ error: GENERIC_ERROR }); }
});

// Deleting a group removes the definitions, never the values: the PostMeta rows
// stay put, so re-creating a field with the same key brings the content back.
// (Phase 3 can decide whether an orphaned value should still be rendered.)
router.delete('/:id', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM FieldGroup WHERE id = ?').run(req.params.id);
    if (!r.changes) { res.status(404).json({ error: '字段分组不存在' }); return; }
    res.json({ success: true });
  } catch (err: any) { logger.warn({ err }, 'field group request failed'); res.status(500).json({ error: GENERIC_ERROR }); }
});

export default router;
