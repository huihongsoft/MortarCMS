import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, requireCap, AuthRequest } from '../middleware/auth';
import {
  AIProvider, PROVIDER_PRESETS, getProviders, saveProviders, getDefaultProvider,
  setDefaultProvider, chatComplete, pushAssistantWithTools, pushToolResults, testProvider,
} from '../utils/ai';
import {
  getAiAllowedRoles, getToolPermissions, isRoleAllowed, listToolSchemas, toolCallToResult,
} from '../utils/aiTools';

const router = Router();

// Compact snapshot of the site injected into the system prompt so the
// assistant can answer site-specific questions without extra tool calls
function buildSiteContext(): string {
  try {
    const settings = db.prepare("SELECT key, value FROM Setting WHERE key IN ('site_title','site_description','site_url')").all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    const recent = db.prepare("SELECT title, slug, status, publishedAt FROM Post WHERE type = 'post' ORDER BY createdAt DESC LIMIT 5").all() as any[];
    const pages = db.prepare("SELECT title, slug, status FROM Post WHERE type = 'page' AND status = 'published' ORDER BY menuOrder LIMIT 3").all() as any[];
    const catCnt = (db.prepare('SELECT COUNT(*) as c FROM Category').get() as any)?.c || 0;
    const tagCnt = (db.prepare('SELECT COUNT(*) as c FROM Tag').get() as any)?.c || 0;
    const postCnt = (db.prepare("SELECT COUNT(*) as c FROM Post WHERE type = 'post'").get() as any)?.c || 0;
    let ctx = '【站点上下文】\n';
    ctx += '站点名称: ' + (cfg.site_title || 'Mortar') + '\n';
    ctx += '站点描述: ' + (cfg.site_description || '') + '\n';
    ctx += '文章总数: ' + postCnt + '，分类: ' + catCnt + '，标签: ' + tagCnt + '\n';
    if (recent.length) ctx += '最近文章:\n' + recent.map((p: any, i: number) => (i + 1) + '. 《' + p.title + '》 /post/' + p.slug + ' (' + p.status + ')').join('\n') + '\n';
    if (pages.length) ctx += '页面: ' + pages.map((p: any) => p.title).join('、') + '\n';
    ctx += '【上下文结束】用户问及站内内容时优先参考以上信息。';
    return ctx;
  } catch { return ''; }
}

const SYSTEM_PROMPT =
  '你是 Mortar CMS 的 AI 助理，一个熟悉内容管理系统的助手。' +
  '你可以查询站点数据、撰写/更新文章、管理评论等。' +
  '回答用简体中文，简洁专业。需要操作时调用对应工具；工具返回结果后，' +
  '用自然语言向用户总结结果。撰写文章时请输出结构良好的 HTML（<h2>/<p>/<ul> 等）。';

// ---- Provider settings (admin only) ----

// Get providers (mask API keys) + permission config
router.get('/settings', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const providers = getProviders().map((p: AIProvider) => ({
      ...p,
      apiKey: p.apiKey ? '••••' + p.apiKey.slice(-4) : '',
      hasKey: !!p.apiKey,
    }));
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_default_provider'").get() as any;
    res.json({
      providers,
      presets: PROVIDER_PRESETS,
      defaultProvider: row?.value || '',
      allowedRoles: getAiAllowedRoles(),
      toolPermissions: getToolPermissions(),
      roles: (db.prepare('SELECT DISTINCT role FROM User').all() as any[]).map((r: any) => r.role),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Save providers (apiKey kept if masked)
router.put('/settings', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const incoming = req.body?.providers as AIProvider[];
    if (!Array.isArray(incoming)) { res.status(400).json({ error: 'providers array required' }); return; }
    const existing = getProviders();
    const merged = incoming.map((p: any) => {
      const old = existing.find((e: any) => e.id === p.id);
      let apiKey = p.apiKey || '';
      if (old && (!apiKey || apiKey.startsWith('••••'))) apiKey = old.apiKey;
      return { ...p, apiKey };
    });
    saveProviders(merged);
    if (req.body?.defaultProvider) setDefaultProvider(String(req.body.defaultProvider));
    if (req.body?.allowedRoles !== undefined) {
      const roles = Array.isArray(req.body.allowedRoles) ? req.body.allowedRoles.map(String) : [];
      db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_allowed_roles', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .run('ai_allowed_roles', JSON.stringify(roles));
    }
    if (req.body?.toolPermissions !== undefined) {
      db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_tool_permissions', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .run('ai_tool_permissions', JSON.stringify(req.body.toolPermissions || {}));
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Test a provider connection
router.post('/test', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const p = req.body?.provider as AIProvider;
    if (!p?.apiKey || !p?.model) { res.status(400).json({ error: 'provider, apiKey and model required' }); return; }
    const result = await testProvider(p);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Chat (no tools; permission checked against allowed roles) ----

router.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) { res.status(400).json({ error: 'messages required' }); return; }
    const result = await chatComplete(provider, [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ]);
    res.json({ content: result.content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Assistant (tools + permissions) — SSE streaming ----

router.post('/assistant', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { message } = req.body;
    if (!message) { res.status(400).json({ error: 'message required' }); return; }

    const tools = listToolSchemas(req.user!.role);
    const msgs: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + buildSiteContext() + (tools.length ? '\n\n可用的工具: ' + tools.map(t => t.function.name).join(', ') + '。需要操作时调用工具。' : '') },
      { role: 'user', content: String(message) },
    ];
    const ctx = { userId: req.user!.userId, role: req.user!.role };

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    const send = (obj: any) => res.write('data: ' + JSON.stringify(obj) + '\n\n');

    const onDelta = (text: string) => send({ type: 'delta', text });
    let finalText = '';

    const MAX_ITER = 6;
    for (let i = 0; i < MAX_ITER; i++) {
      const result = await chatComplete(provider, msgs, { tools, onDelta: i === 0 ? onDelta : undefined });
      finalText = result.content;
      if (!result.toolCalls.length) break;
      send({ type: 'tools', tools: result.toolCalls.map(t => t.name) });
      pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
      const results = await Promise.all(result.toolCalls.map(tc => toolCallToResult(tc, ctx)));
      pushToolResults(msgs, results, provider.type);
      if (i === MAX_ITER - 1) finalText = '已达到工具调用次数上限，请简化问题重试。';
    }

    send({ type: 'done', content: finalText });
    res.end();
  } catch (err: any) {
    if (!res.headersSent) { res.status(500).json({ error: err.message }); return; }
    res.write('data: ' + JSON.stringify({ type: 'error', error: err.message }) + '\n\n');
    res.end();
  }
});

// ---- Editor assistant: generate / polish / continue / translate / summarize / seo ----

function inlineMd(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}

// Minimal Markdown → HTML converter (headings, lists, paragraphs, emphasis)
export function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h1 = line.match(/^# (.*)/);
    const h2 = line.match(/^## (.*)/);
    const h3 = line.match(/^### (.*)/);
    const li = line.match(/^[-*] (.*)/);
    if (h1) { if (inList) { out.push('</ul>'); inList = false; } out.push('<h1>' + inlineMd(h1[1]) + '</h1>'); }
    else if (h2) { if (inList) { out.push('</ul>'); inList = false; } out.push('<h2>' + inlineMd(h2[1]) + '</h2>'); }
    else if (h3) { if (inList) { out.push('</ul>'); inList = false; } out.push('<h3>' + inlineMd(h3[1]) + '</h3>'); }
    else if (li) { if (!inList) { out.push('<ul>'); inList = true; } out.push('<li>' + inlineMd(li[1]) + '</li>'); }
    else if (!line.trim()) { if (inList) { out.push('</ul>'); inList = false; } }
    else { if (inList) { out.push('</ul>'); inList = false; } out.push('<p>' + inlineMd(line) + '</p>'); }
  }
  if (inList) out.push('</ul>');
  return out.join('');
}

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { action, title, content } = req.body || {};
    if (!['generate', 'polish', 'continue', 'translate', 'summarize', 'seo'].includes(action)) {
      res.status(400).json({ error: '未知操作' }); return;
    }

    const WRITER = '你是专业的文章写作助手。只输出要求的内容本身，不要任何解释、前言或 Markdown 代码块标记。';
    let prompt = '';
    if (action === 'generate') {
      prompt = '请撰写一篇关于「' + String(title || '') + '」的文章，使用 Markdown 格式（## 分节、- 列表、**加粗**），不少于 600 字，结构清晰有深度。';
    } else if (action === 'polish') {
      prompt = '请润色以下文章：提升语言流畅度与文采，保持原有结构和信息，输出 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'continue') {
      prompt = '请续写以下文章，接着末尾继续写，不要重复已有内容，输出 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'translate') {
      prompt = '请将以下文章翻译成简体中文，保留 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'summarize') {
      prompt = '请为以下文章写一段摘要，150 字以内，一句话概括核心观点。\n\n' + String(content || '');
    } else if (action === 'seo') {
      prompt = '请为文章「' + String(title || '') + '」生成 SEO 元数据，严格按此格式输出两行：\nSEO标题：xxx\nSEO描述：xxx';
    }

    const result = await chatComplete(provider, [
      { role: 'system', content: WRITER },
      { role: 'user', content: prompt },
    ]);

    if (action === 'generate' || action === 'polish' || action === 'continue' || action === 'translate') {
      res.json({ content: mdToHtml(result.content) });
    } else {
      res.json({ content: result.content });
    }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Bindings (WeChat / DingTalk) ----

interface Binding {
  id: string;
  platform: string;   // wechat | dingtalk
  label: string;
  token: string;      // secret webhook token
  userId: string;
  username: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function getBindings(): Binding[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_bindings'").get() as any;
  if (!row?.value) return [];
  try { return JSON.parse(row.value); } catch { return []; }
}

function saveBindings(bindings: Binding[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_bindings', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_bindings', JSON.stringify(bindings));
}

// List bindings (admin) or own (regular users)
router.get('/bindings', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const all = getBindings();
    const list = req.user!.role === 'admin' ? all : all.filter(b => b.userId === req.user!.userId);
    res.json({ bindings: list.map((b: Binding) => ({ ...b, token: '••••' + b.token.slice(-4) })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Create a binding (admin picks the target user; users can bind themselves)
router.post('/bindings', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { platform, userId, label } = req.body || {};
    if (!['wechat', 'dingtalk'].includes(platform)) { res.status(400).json({ error: 'platform must be wechat or dingtalk' }); return; }
    let targetUserId = userId;
    if (req.user!.role !== 'admin') targetUserId = req.user!.userId;
    const user = db.prepare('SELECT id, username FROM User WHERE id = ?').get(targetUserId) as any;
    if (!user) { res.status(400).json({ error: '用户不存在' }); return; }
    const b: Binding = {
      id: cuid(),
      platform,
      label: label || (platform === 'wechat' ? '微信' : '钉钉'),
      token: require('crypto').randomBytes(12).toString('hex'),
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    const all = getBindings();
    all.push(b);
    saveBindings(all);
    res.status(201).json({ binding: b });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/bindings/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    let all = getBindings();
    if (req.user!.role !== 'admin') all = all.filter(b => !(b.id === req.params.id && b.userId === req.user!.userId));
    else all = all.filter(b => b.id !== req.params.id);
    saveBindings(all);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Webhook entry: WeChat/DingTalk bots post here ----
// Accepts { message } (simplified) or WeChat-style { Content } / DingTalk-style { text: { content } }
router.post('/webhook/:token', async (req: AuthRequest, res: Response) => {
  try {
    const binding = getBindings().find(b => b.token === req.params.token);
    if (!binding) { res.status(404).json({ error: '无效的绑定令牌' }); return; }
    const body = req.body || {};
    const message = String(body.message || body.Content || body.text?.content || body.content || '').trim();
    if (!message) { res.status(400).json({ error: '消息为空' }); return; }

    const user = db.prepare('SELECT id, role FROM User WHERE id = ?').get(binding.userId) as any;
    if (!user) { res.status(404).json({ error: '绑定的用户不存在' }); return; }

    // Update last used
    const all = getBindings().map((b: Binding) => b.id === binding.id ? { ...b, lastUsedAt: new Date().toISOString() } : b);
    saveBindings(all);

    const provider = getDefaultProvider();
    if (!provider) { res.json({ reply: 'AI 服务商尚未配置，请联系管理员。' }); return; }
    if (!isRoleAllowed(user.role)) { res.json({ reply: '你的角色无权使用 AI 功能。' }); return; }

    const tools = listToolSchemas(user.role);
    const msgs: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + ' 当前用户: ' + binding.username + '。\n' + buildSiteContext() + (tools.length ? '\n可用的工具: ' + tools.map(t => t.function.name).join(', ') : '') },
      { role: 'user', content: message },
    ];
    const ctx = { userId: user.id, role: user.role };

    let reply = '';
    const MAX_ITER = 6;
    for (let i = 0; i < MAX_ITER; i++) {
      const result = await chatComplete(provider, msgs, { tools });
      reply = result.content;
      if (!result.toolCalls.length) break;
      pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
      const results = await Promise.all(result.toolCalls.map(tc => toolCallToResult(tc, ctx)));
      pushToolResults(msgs, results, provider.type);
      if (i === MAX_ITER - 1) reply = '已达到工具调用次数上限，请简化问题重试。';
    }

    res.json({ reply });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
