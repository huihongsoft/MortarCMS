import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest, invalidateRoleCache, getAllRoles, getRoleCapabilities } from '../middleware/auth';

const router = Router();

// Full capability catalog covering every operation area of the CMS,
// including AI assistant permissions.
//
// Ids only: the admin UI translates them (`cap <id>` / `cap group <key>`), so the
// labels live in admin/src/lib/i18n.ts and follow the selected language.
// Every id here is enforced by at least one `requireCap` on the server — a
// checkbox that no route reads would be a lie, so don't add one without wiring it.
export const CAPABILITY_CATALOG = [
  {
    group: 'content',
    caps: [
      { id: 'edit_posts' },
      { id: 'publish_posts' },
      { id: 'delete_posts' },
      { id: 'edit_others_posts' },
      { id: 'delete_others_posts' },
      { id: 'edit_pages' },
      { id: 'publish_pages' },
      { id: 'delete_pages' },
      { id: 'moderate_comments' },
      { id: 'submit_posts' },
      { id: 'review_posts' },
      { id: 'manage_forms' },
      { id: 'manage_categories' },
      { id: 'manage_tags' },
      { id: 'manage_links' },
    ],
  },
  {
    group: 'media',
    caps: [
      { id: 'upload_files' },
      { id: 'edit_media' },
      { id: 'delete_media' },
    ],
  },
  {
    group: 'appearance',
    caps: [
      { id: 'manage_menus' },
      { id: 'manage_themes' },
      { id: 'install_themes' },
      { id: 'delete_themes' },
      { id: 'rebuild_themes' },
    ],
  },
  {
    group: 'system',
    caps: [
      { id: 'manage_options' },
      { id: 'manage_users' },
      { id: 'manage_roles' },
      { id: 'manage_plugins' },
      { id: 'import' },
      { id: 'export' },
      { id: 'manage_sites' },
      { id: 'view_sites' },
      { id: 'manage_security' },
      { id: 'view_system_info' },
      { id: 'manage_system' },
    ],
  },
  {
    group: 'ai',
    caps: [
      { id: 'ai_use' },
      { id: 'ai_manage' },
      { id: 'ai_bindings' },
      { id: 'ai_tasks' },
      { id: 'ai_review' },
    ],
  },
];

// List roles with user counts
router.get('/', authenticate, requireCap('manage_roles'), (req: AuthRequest, res: Response) => {
  try {
    const roles = getAllRoles();
    const counts = db.prepare('SELECT role, COUNT(*) as c FROM User GROUP BY role').all() as any[];
    const countMap: Record<string, number> = {};
    counts.forEach((r: any) => { countMap[r.role] = r.c; });
    res.json({ roles: roles.map(r => ({ ...r, userCount: countMap[r.slug] || 0 })), catalog: CAPABILITY_CATALOG });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Capability editing is a privilege boundary: a manager must not be able to grant
// more than they hold. Without this, any role carrying `manage_roles` could write
// capabilities: ['*'] onto the role it already has and become a full admin.
function grantsWithinCaller(callerRole: string, requested: string[]): boolean {
  const own = getRoleCapabilities(callerRole);
  if (own.includes('*')) return true;
  return requested.every(c => own.includes(c));
}

// Create a custom role
router.post('/', authenticate, requireCap('manage_roles'), (req: AuthRequest, res: Response) => {
  try {
    const { name, capabilities } = req.body || {};
    if (!name || !String(name).trim()) { res.status(400).json({ error: '角色名称必填' }); return; }
    if (Array.isArray(capabilities) && !grantsWithinCaller(req.user!.role, capabilities.map(String))) {
      res.status(403).json({ error: '不能授予超出你自身权限范围的能力' }); return;
    }
    const slug = String(name).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'role-' + Date.now();
    if (db.prepare('SELECT id FROM Role WHERE slug = ?').get(slug)) { res.status(400).json({ error: '角色标识已存在: ' + slug }); return; }
    const caps = Array.isArray(capabilities) ? capabilities.map(String) : [];
    db.prepare('INSERT INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES (?, ?, ?, ?, 0, ?)')
      .run(cuid(), slug, String(name).trim().slice(0, 30), JSON.stringify(caps), new Date().toISOString());
    invalidateRoleCache();
    res.status(201).json({ slug, name: String(name).trim(), capabilities: caps, isSystem: false });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update a role (name + capabilities); system roles can only change capabilities
router.put('/:slug', authenticate, requireCap('manage_roles'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Role WHERE slug = ?').get(req.params.slug) as any;
    if (!existing) { res.status(404).json({ error: '角色不存在' }); return; }
    const { name, capabilities } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name && String(name).trim()) { sets.push('name = ?'); vals.push(String(name).trim().slice(0, 30)); }
    if (Array.isArray(capabilities)) {
      // admin always keeps full access
      const caps = existing.slug === 'admin' ? ['*'] : capabilities.map(String);
      if (!grantsWithinCaller(req.user!.role, caps)) { res.status(403).json({ error: '不能授予超出你自身权限范围的能力' }); return; }
      sets.push('capabilities = ?'); vals.push(JSON.stringify(caps));
    }
    if (sets.length) { vals.push(existing.id); db.prepare('UPDATE Role SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    invalidateRoleCache();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete a custom role (system roles and roles in use are protected)
router.delete('/:slug', authenticate, requireCap('manage_roles'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Role WHERE slug = ?').get(req.params.slug) as any;
    if (!existing) { res.status(404).json({ error: '角色不存在' }); return; }
    if (existing.isSystem) { res.status(400).json({ error: '系统内置角色不可删除' }); return; }
    const inUse = (db.prepare('SELECT COUNT(*) as c FROM User WHERE role = ?').get(req.params.slug) as any)?.c || 0;
    if (inUse > 0) { res.status(400).json({ error: '该角色仍有 ' + inUse + ' 个用户，请先调整用户角色' }); return; }
    db.prepare('DELETE FROM Role WHERE slug = ?').run(req.params.slug);
    invalidateRoleCache();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
