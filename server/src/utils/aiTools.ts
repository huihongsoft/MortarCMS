import db, { cuid } from './db';
import { slugify, uniqueSlug } from './slug';
import type { AIToolFunction, AIToolCall } from './ai';

export interface ToolContext {
  userId: string;
  role: string;
}

// ---- Permission configuration (persisted in the Setting table) ----

export function getAiAllowedRoles(): string[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_allowed_roles'").get() as any;
  if (!row?.value) return ['admin', 'editor']; // default: admins + editors
  try { return JSON.parse(row.value); } catch { return ['admin', 'editor']; }
}

export function isRoleAllowed(role: string): boolean {
  if (role === 'admin') return true; // admin always allowed
  return getAiAllowedRoles().includes(role);
}

export function getToolPermissions(): Record<string, string[]> {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_tool_permissions'").get() as any;
  if (!row?.value) return {};
  try { return JSON.parse(row.value); } catch { return {}; }
}

// Roles that can use each tool. Admin can use everything.
const ADMIN_ONLY = new Set(['update_site_settings', 'delete_posts', 'update_user_roles']);

export function canUseTool(role: string, toolName: string): boolean {
  if (role === 'admin') return true;
  if (ADMIN_ONLY.has(toolName)) return false;
  const perms = getToolPermissions();
  const allowed = perms[role];
  if (!allowed) return false;
  return allowed.includes(toolName);
}

// ---- Tool registry ----

type ToolFn = (args: any, ctx: ToolContext) => Promise<any>;

const tools: Record<string, { description: string; parameters: any; run: ToolFn }> = {};

function register(name: string, description: string, parameters: any, run: ToolFn) {
  tools[name] = { description, parameters, run };
}

// --- Site stats ---
register('get_site_stats', '获取站点统计信息：文章数、页面数、评论数、用户数、媒体数、标签数', {
  type: 'object', properties: {},
}, async () => {
  const one = (sql: string) => (db.prepare(sql).get() as any)?.cnt || 0;
  return {
    posts: one("SELECT COUNT(*) as cnt FROM Post WHERE type = 'post'"),
    publishedPosts: one("SELECT COUNT(*) as cnt FROM Post WHERE type = 'post' AND status = 'published'"),
    pages: one("SELECT COUNT(*) as cnt FROM Post WHERE type = 'page'"),
    comments: one('SELECT COUNT(*) as cnt FROM Comment'),
    users: one('SELECT COUNT(*) as cnt FROM User'),
    media: one('SELECT COUNT(*) as cnt FROM Media'),
    tags: one('SELECT COUNT(*) as cnt FROM Tag'),
    categories: one('SELECT COUNT(*) as cnt FROM Category'),
  };
});

// --- List/search posts ---
register('list_posts', '列出文章，可按状态/关键词过滤，返回标题、slug、状态、发布日期', {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['all', 'published', 'draft', 'trash'], description: '文章状态，默认 all' },
    search: { type: 'string', description: '标题关键词' },
    limit: { type: 'number', description: '数量，默认 10，最大 30' },
  },
}, async (args) => {
  const limit = Math.min(parseInt(args.limit) || 10, 30);
  let sql = "SELECT id, title, slug, status, excerpt, publishedAt, createdAt FROM Post WHERE type = 'post'";
  const params: any[] = [];
  if (args.status && args.status !== 'all') { sql += ' AND status = ?'; params.push(args.status); }
  if (args.search) { sql += ' AND title LIKE ?'; params.push('%' + args.search + '%'); }
  sql += ' ORDER BY createdAt DESC LIMIT ?';
  params.push(limit);
  return db.prepare(sql).all(...params);
});

// --- Get single post ---
register('get_post', '获取单篇文章的完整内容，通过 id 或 slug', {
  type: 'object',
  properties: {
    id: { type: 'string', description: '文章 id' },
    slug: { type: 'string', description: '文章 slug' },
  },
}, async (args) => {
  const row = args.id
    ? db.prepare("SELECT * FROM Post WHERE id = ?").get(args.id)
    : db.prepare("SELECT * FROM Post WHERE slug = ?").get(args.slug);
  return row || { error: '文章未找到' };
});

// --- Write post (the flagship tool) ---
register('write_post', '撰写并创建一篇新文章。可以给定标题和内容（支持 HTML 或 Markdown），可指定状态、分类、标签。这是 AI 写作的核心工具。', {
  type: 'object',
  properties: {
    title: { type: 'string', description: '文章标题（必填）' },
    content: { type: 'string', description: '文章正文，支持 HTML（如 <h2>、<p>、<ul>）' },
    excerpt: { type: 'string', description: '文章摘要' },
    status: { type: 'string', enum: ['draft', 'published'], description: '默认 draft' },
    categoryNames: { type: 'array', items: { type: 'string' }, description: '分类名称数组' },
    tagNames: { type: 'array', items: { type: 'string' }, description: '标签名称数组' },
  },
  required: ['title'],
}, async (args, ctx) => {
  const title = String(args.title || '').trim();
  if (!title) return { error: '标题不能为空' };
  const allSlugs = (db.prepare("SELECT slug FROM Post WHERE type = 'post'").all() as any[]).map((s: any) => s.slug);
  const slug = uniqueSlug(title, allSlugs);
  const id = cuid();
  const status = args.status === 'published' ? 'published' : 'draft';
  const now = new Date().toISOString();
  db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, title, slug, args.content || '', args.excerpt || '', status, 'post', ctx.userId, status === 'published' ? now : null);

  // Categories by name
  for (const name of (args.categoryNames || [])) {
    const n = String(name).trim();
    if (!n) continue;
    const catSlug = slugify(n);
    let cat: any = db.prepare('SELECT id FROM Category WHERE slug = ?').get(catSlug);
    if (!cat) {
      const cid = cuid();
      db.prepare('INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)').run(cid, n, catSlug);
      cat = { id: cid };
    }
    db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, cat.id);
  }
  // Tags by name
  for (const name of (args.tagNames || [])) {
    const n = String(name).trim();
    if (!n) continue;
    const tagSlug = slugify(n);
    let tag: any = db.prepare('SELECT id FROM Tag WHERE slug = ?').get(tagSlug);
    if (!tag) {
      const tid = cuid();
      db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(tid, n, tagSlug);
      tag = { id: tid };
    }
    db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, tag.id);
  }

  return { id, title, slug, status, message: status === 'published' ? '文章已发布' : '文章已保存为草稿' };
});

// --- Update post ---
register('update_post', '更新文章的部分字段（标题、内容、摘要、状态）', {
  type: 'object',
  properties: {
    id: { type: 'string', description: '文章 id（必填）' },
    title: { type: 'string' },
    content: { type: 'string' },
    excerpt: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'published', 'trash'] },
  },
  required: ['id'],
}, async (args) => {
  const existing = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(args.id, 'post') as any;
  if (!existing) return { error: '文章未找到' };
  const sets: string[] = []; const vals: any[] = [];
  if (args.title !== undefined) { sets.push('title = ?'); vals.push(args.title); }
  if (args.content !== undefined) { sets.push('content = ?'); vals.push(args.content); }
  if (args.excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(args.excerpt); }
  if (args.status !== undefined) {
    sets.push('status = ?'); vals.push(args.status);
    if (args.status === 'published' && !existing.publishedAt) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); }
  }
  if (sets.length === 0) return { message: '没有需要更新的字段' };
  sets.push('updatedAt = ?'); vals.push(new Date().toISOString());
  vals.push(args.id);
  db.prepare('UPDATE Post SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
  return { id: args.id, message: '文章已更新' };
});

// --- Comments ---
register('list_comments', '列出评论，可按状态过滤（pending/approved/spam）', {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['all', 'pending', 'approved', 'spam'], description: '默认 pending' },
    limit: { type: 'number', description: '默认 10' },
  },
}, async (args) => {
  const limit = Math.min(parseInt(args.limit) || 10, 30);
  const status = args.status && args.status !== 'all' ? args.status : 'pending';
  return db.prepare('SELECT id, author, content, status, createdAt, postId FROM Comment WHERE status = ? ORDER BY createdAt DESC LIMIT ?').all(status, limit);
});

// --- Categories & tags ---
register('get_categories', '获取全部分类列表', { type: 'object', properties: {} }, async () => {
  return db.prepare('SELECT id, name, slug FROM Category ORDER BY name').all();
});

register('list_tags', '获取全部标签列表', { type: 'object', properties: {} }, async () => {
  return db.prepare('SELECT id, name, slug FROM Tag ORDER BY name').all();
});

// --- Site settings (admin only) ---
register('get_site_settings', '获取站点配置（标题、描述、URL、每页文章数等）', { type: 'object', properties: {} }, async () => {
  const rows = db.prepare('SELECT key, value FROM Setting').all() as any[];
  const map: Record<string, string> = {};
  rows.forEach((r: any) => {
    if (['smtp_', 'jwt_', 'market_', 'active_plugins', 'custom_templates', 'maintenance_', 'ai_'].some(p => r.key.startsWith(p))) return;
    map[r.key] = r.value;
  });
  return map;
});

register('update_site_settings', '更新站点配置（如 site_title、site_description 等）', {
  type: 'object',
  properties: {
    settings: { type: 'object', description: '要更新的键值对，例如 {"site_title": "新标题"}' },
  },
  required: ['settings'],
}, async (args) => {
  const upsert = db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const entries = args.settings || {};
  for (const [k, v] of Object.entries(entries)) {
    if (typeof k !== 'string' || typeof v !== 'string') continue;
    upsert.run(cuid(), k, v);
  }
  return { message: '配置已更新', updated: Object.keys(entries) };
});

// ---- Exports ----

export function listToolSchemas(role: string): AIToolFunction[] {
  const result: AIToolFunction[] = [];
  for (const [name, def] of Object.entries(tools)) {
    if (!canUseTool(role, name)) continue;
    result.push({ type: 'function', function: { name, description: def.description, parameters: def.parameters } });
  }
  return result;
}

export async function executeTool(name: string, args: any, ctx: ToolContext): Promise<any> {
  const def = tools[name];
  if (!def) return { error: '未知工具: ' + name };
  if (!canUseTool(ctx.role, name)) return { error: '没有权限使用该工具: ' + name };
  try {
    return await def.run(args || {}, ctx);
  } catch (e: any) {
    return { error: '工具执行失败: ' + (e.message || e) };
  }
}

// Re-export for the agent loop
export function toolCallToResult(tc: AIToolCall, ctx: ToolContext): Promise<{ id: string; output: string }> {
  return executeTool(tc.name, tc.args, ctx).then(r => ({ id: tc.id, output: JSON.stringify(r) }));
}
