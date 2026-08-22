import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';
import { purgeContentCaches } from '../utils/cache';

const router = Router();

export interface CustomPostType {
  slug: string;
  label: string;
  supports: string[];
}

// Built-in types (always present, cannot be deleted)
const BUILTIN_TYPES: CustomPostType[] = [
  { slug: 'post', label: 'Posts', supports: ['title', 'editor', 'thumbnail', 'categories', 'tags', 'comments', 'excerpt', 'featured'] },
  { slug: 'page', label: 'Pages', supports: ['title', 'editor', 'excerpt', 'featured'] },
];

function loadCustomTypes(): CustomPostType[] {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'custom_post_types'").get() as any;
    const list = row ? JSON.parse(row.value) : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

function saveCustomTypes(list: CustomPostType[]): void {
  db.prepare('INSERT OR REPLACE INTO Setting (id, key, value) VALUES (?, ?, ?)').run('custom_post_types', 'custom_post_types', JSON.stringify(list));
}

// Public: the full type list (built-ins + registered custom types)
router.get('/', (_req: AuthRequest, res: Response) => {
  try {
    res.json([...BUILTIN_TYPES, ...loadCustomTypes()]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: register a new custom post type
router.post('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const slug = String((req.body || {}).slug || '').trim().toLowerCase();
    const label = String((req.body || {}).label || '').trim();
    if (!slug || !label) { res.status(400).json({ error: 'slug 和 label 必填' }); return; }
    if (!/^[a-z][a-z0-9_-]{1,30}$/.test(slug)) { res.status(400).json({ error: 'slug 只能包含小写字母、数字、- 和 _，且以字母开头' }); return; }
    if (BUILTIN_TYPES.some(t => t.slug === slug) || loadCustomTypes().some(t => t.slug === slug)) { res.status(400).json({ error: '该类型已存在: ' + slug }); return; }
    const supports = Array.isArray((req.body || {}).supports) ? (req.body as any).supports.map(String) : [];
    saveCustomTypes([...loadCustomTypes(), { slug, label, supports }]);
    purgeContentCaches();
    res.status(201).json({ success: true, slug });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: unregister a custom post type (its content is kept but no longer listed)
router.delete('/:slug', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug;
    if (BUILTIN_TYPES.some(t => t.slug === slug)) { res.status(400).json({ error: '内置类型不能删除' }); return; }
    const remaining = loadCustomTypes().filter(t => t.slug !== slug);
    if (remaining.length === loadCustomTypes().length) { res.status(404).json({ error: '类型不存在' }); return; }
    saveCustomTypes(remaining);
    purgeContentCaches();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export { BUILTIN_TYPES, loadCustomTypes };
export default router;
