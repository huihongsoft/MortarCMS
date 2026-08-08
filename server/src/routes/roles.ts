import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest, invalidateRoleCache, getAllRoles } from '../middleware/auth';

const router = Router();

// Full capability catalog covering every operation area of the CMS,
// including AI assistant permissions.
export const CAPABILITY_CATALOG = [
  {
    group: '内容',
    caps: [
      { id: 'edit_posts', label: '编辑文章' },
      { id: 'publish_posts', label: '发布文章' },
      { id: 'delete_posts', label: '删除文章' },
      { id: 'edit_others_posts', label: '编辑他人的文章' },
      { id: 'edit_pages', label: '编辑页面' },
      { id: 'publish_pages', label: '发布页面' },
      { id: 'delete_pages', label: '删除页面' },
      { id: 'moderate_comments', label: '审核评论' },
      { id: 'manage_categories', label: '管理分类' },
      { id: 'manage_tags', label: '管理标签' },
      { id: 'manage_links', label: '管理链接' },
    ],
  },
  {
    group: '媒体',
    caps: [
      { id: 'upload_files', label: '上传文件' },
      { id: 'edit_media', label: '编辑媒体信息' },
      { id: 'delete_media', label: '删除媒体' },
    ],
  },
  {
    group: '外观',
    caps: [
      { id: 'edit_theme_options', label: '修改外观设置' },
      { id: 'manage_menus', label: '管理菜单' },
      { id: 'manage_widgets', label: '管理小工具' },
      { id: 'manage_themes', label: '管理主题' },
      { id: 'install_themes', label: '安装主题' },
      { id: 'delete_themes', label: '删除主题' },
      { id: 'rebuild_themes', label: '重建主题 Bundle' },
    ],
  },
  {
    group: '系统',
    caps: [
      { id: 'manage_options', label: '站点设置' },
      { id: 'manage_users', label: '管理用户' },
      { id: 'manage_roles', label: '管理角色权限' },
      { id: 'manage_plugins', label: '管理插件' },
      { id: 'import', label: '数据导入' },
      { id: 'export', label: '数据导出' },
      { id: 'manage_sites', label: '多站点管理' },
      { id: 'manage_security', label: '安全审计' },
      { id: 'view_system_info', label: '系统信息' },
    ],
  },
  {
    group: 'AI 助理',
    caps: [
      { id: 'ai_use', label: '使用 AI 对话 / 任务 / 写作' },
      { id: 'ai_manage', label: 'AI 服务商与权限设置' },
      { id: 'ai_bindings', label: '微信 / 钉钉绑定管理' },
      { id: 'ai_tasks', label: '查看全部 AI 任务' },
      { id: 'ai_review', label: 'AI 评论审核' },
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

// Create a custom role
router.post('/', authenticate, requireCap('manage_roles'), (req: AuthRequest, res: Response) => {
  try {
    const { name, capabilities } = req.body || {};
    if (!name || !String(name).trim()) { res.status(400).json({ error: '角色名称必填' }); return; }
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
