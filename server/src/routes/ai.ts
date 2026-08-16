import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import db, { cuid } from '../utils/db';
import { uniqueSlug } from '../utils/slug';
import { authenticate, authorize, requireCap, AuthRequest } from '../middleware/auth';
import {
  AIProvider, PROVIDER_PRESETS, getProviders, saveProviders, getDefaultProvider,
  setDefaultProvider, chatComplete, pushAssistantWithTools, pushToolResults, testProvider,
} from '../utils/ai';
import {
  getAiAllowedRoles, getToolPermissions, isRoleAllowed, listToolSchemas, toolCallToResult, executeTool, guardUserMessage, memoryPrompt, prepareAiContent, friendlyTaskError,
} from '../utils/aiTools';
import { mdToHtml } from '../utils/markdown';
import { purgeContentCaches } from '../utils/cache';

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
router.get('/settings', authenticate, requireCap('ai_manage', 'manage_options'), (req: AuthRequest, res: Response) => {
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
      usageLimit: (db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_limit_daily'").get() as any)?.value || '',
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Save providers (apiKey kept if masked)
router.put('/settings', authenticate, requireCap('ai_manage', 'manage_options'), (req: AuthRequest, res: Response) => {
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
router.post('/test', authenticate, requireCap('ai_manage', 'manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const p = req.body?.provider as AIProvider;
    if (!p?.apiKey || !p?.model) { res.status(400).json({ error: 'provider, apiKey and model required' }); return; }
    const result = await testProvider(p);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Chat (no tools; permission checked against allowed roles) ----

router.post('/chat', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) { res.status(400).json({ error: 'messages required' }); return; }
    const result = await chatComplete(provider, [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => m.role === 'user' ? { ...m, content: guardUserMessage(m.content) } : m),
    ]);
    recordUsage(req.user!.userId, 'chat', result.content, provider.model);
    res.json({ content: result.content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Summarize a long conversation excerpt (used to compress chat history)
router.post('/summarize', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    const now = Date.now();
    const last = lastAiRequest.get(req.user!.userId);
    if (last && now - last < AI_MIN_INTERVAL_MS) { res.status(429).json({ error: '请求太频繁，请稍等几秒再试' }); return; }
    lastAiRequest.set(req.user!.userId, now);
    const text = String(req.body?.text || '').trim();
    if (!text) { res.status(400).json({ error: 'text required' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '未配置 AI 服务商' }); return; }
    const result = await chatComplete(provider, [
      { role: 'system', content: '你是对话压缩器。把给定的聊天记录压缩成简洁的要点摘要，保留关键信息、结论、用户偏好和已执行的操作。使用中文，150 字以内，只输出摘要本身。' },
      { role: 'user', content: String(text).slice(0, 12000) },
    ], { maxTokens: 400 });
    recordUsage(req.user!.userId, 'summarize', result.content, provider.model);
    res.json({ summary: result.content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Assistant (tools + permissions) — SSE streaming ----

// Per-user request throttle (prevents runaway token spend from misfires)
const lastAiRequest = new Map<string, number>();
const AI_MIN_INTERVAL_MS = 2000;

// Build multi-turn history from the client (validated, trimmed, role-checked)
function buildHistoryMessages(raw: any): { role: 'user' | 'assistant'; content: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { role: 'user' | 'assistant'; content: string }[] = [];
  let total = 0;
  for (const m of raw.slice(-20)) {
    if (m?.role !== 'user' && m?.role !== 'assistant') continue;
    let content = String(m.content || '');
    if (!content.trim()) continue;
    content = content.slice(0, 1500);
    total += content.length;
    if (total > 12000) break;
    out.push(m.role === 'user' ? { role: 'user', content: guardUserMessage(content) } : { role: 'assistant', content });
  }
  return out;
}

router.post('/assistant', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const now = Date.now();
    const last = lastAiRequest.get(req.user!.userId);
    if (last && now - last < AI_MIN_INTERVAL_MS) {
      res.status(429).json({ error: '请求太频繁，请稍等几秒再试' });
      return;
    }
    lastAiRequest.set(req.user!.userId, now);
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { message, temperature, maxTokens, includeContext, history } = req.body;
    if (!message) { res.status(400).json({ error: 'message required' }); return; }

    const tools = listToolSchemas(req.user!.role);
    const msgs: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + (includeContext === false ? '' : '\n\n' + buildSiteContext() + memoryPrompt(req.user!.userId)) + (tools.length ? '\n\n可用的工具: ' + tools.map(t => t.function.name).join(', ') + '。需要操作时调用工具。' : '') },
      ...buildHistoryMessages(history),
      { role: 'user', content: guardUserMessage(String(message)) },
    ];
    const ctx = { userId: req.user!.userId, role: req.user!.role };
    const opts: any = { tools };
    if (temperature !== undefined) opts.temperature = Math.min(2, Math.max(0, Number(temperature)));
    if (maxTokens !== undefined) opts.maxTokens = Math.min(16384, Math.max(64, Number(maxTokens)));

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
      const result = await chatComplete(provider, msgs, { ...opts, onDelta: i === 0 ? onDelta : undefined });
      finalText = result.content;
      if (!result.toolCalls.length) break;
      send({ type: 'tools', tools: result.toolCalls.map(t => t.name) });
      pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
      const results = await Promise.all(result.toolCalls.map(tc => toolCallToResult(tc, ctx)));
      // Stream tool results to the UI so users can see what was queried
      for (const r of results) {
        const tc = result.toolCalls.find((x: any) => x.id === r.id);
        send({ type: 'tool_result', name: tc?.name || 'tool', output: String(r.output || '').slice(0, 800) });
      }
      pushToolResults(msgs, results, provider.type);
      if (i === MAX_ITER - 1) finalText = '已达到工具调用次数上限，请简化问题重试。';
    }

    recordUsage(req.user!.userId, 'assistant', finalText, provider.model);
    send({ type: 'done', content: finalText });
    res.end();
  } catch (err: any) {
    if (!res.headersSent) { res.status(500).json({ error: err.message }); return; }
    res.write('data: ' + JSON.stringify({ type: 'error', error: err.message }) + '\n\n');
    res.end();
  }
});

router.post('/generate', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { action, title, content, style, language } = req.body || {};
    const styleHint = style === 'formal' ? '使用正式、书面化的语言。'
      : style === 'casual' ? '使用轻松、口语化的语言。'
      : style === 'marketing' ? '使用有感染力、营销风格的语言，突出价值。'
      : style === 'concise' ? '使用简洁精炼的语言，去掉废话。'
      : '';
    if (!['generate', 'polish', 'continue', 'translate', 'summarize', 'seo', 'tags', 'topics'].includes(action)) {
      res.status(400).json({ error: '未知操作' }); return;
    }

    const WRITER = '你是专业的文章写作助手。只输出要求的内容本身，不要任何解释、前言或 Markdown 代码块标记。';
    let prompt = '';
    if (action === 'generate') {
      prompt = styleHint + '请撰写一篇关于「' + String(title || '') + '」的文章，使用 Markdown 格式（## 分节、- 列表、**加粗**），不少于 600 字，结构清晰有深度。';
    } else if (action === 'polish') {
      prompt = styleHint + '请润色以下文章：提升语言流畅度与文采，保持原有结构和信息，输出 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'continue') {
      prompt = styleHint + '请续写以下文章，接着末尾继续写，不要重复已有内容，输出 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'translate') {
      const target = String(language || '简体中文');
      prompt = '请将以下文章翻译成' + target + '，保留 Markdown 格式。\n\n' + String(content || '');
    } else if (action === 'summarize') {
      prompt = '请为以下文章写一段摘要，150 字以内，一句话概括核心观点。\n\n' + String(content || '');
    } else if (action === 'seo') {
      prompt = '请为文章「' + String(title || '') + '」生成 SEO 元数据，严格按此格式输出两行：\nSEO标题：xxx\nSEO描述：xxx';
    } else if (action === 'tags') {
      prompt = '请为文章「' + String(title || '') + '」（内容节选如下）推荐 3-6 个标签，只输出标签名，用逗号分隔，不要序号。\n\n' + String(content || '').replace(/<[^>]*>/g, '').slice(0, 1500);
    } else if (action === 'topics') {
      const recent = (db.prepare("SELECT title FROM Post WHERE type = 'post' AND status = 'published' ORDER BY publishedAt DESC LIMIT 10").all() as any[]).map((p: any) => p.title).join('、');
      const cats = (db.prepare('SELECT name FROM Category ORDER BY name').all() as any[]).map((c: any) => c.name).join('、');
      prompt = '结合站点已有内容（最近文章: ' + recent + '；分类: ' + cats + '），推荐 5 个适合本博客的新选题。每个选题输出格式：\n## 选题标题\n- 切入角度：...\n- 目标读者：...\n- 建议分类：...';
    }

    const result = await chatComplete(provider, [
      { role: 'system', content: WRITER },
      { role: 'user', content: guardUserMessage(prompt) },
    ]);

    recordUsage(req.user!.userId, 'generate', result.content, provider.model);
    if (action === 'generate' || action === 'polish' || action === 'continue' || action === 'translate') {
      res.json({ content: mdToHtml(result.content) });
    } else {
      res.json({ content: result.content });
    }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Usage tracking ----

// Hard daily budget: refuse further AI calls once the day's tokens exceed the
// configured limit (default 500k) — independent of the alert-only check below,
// which merely notifies admins. Result is cached briefly to avoid a SUM query
// on every request.
let usageCheckAt = 0;
let usageBlocked = false;
function usageLimitReached(): boolean {
  if (Date.now() - usageCheckAt > 10000) {
    usageCheckAt = Date.now();
    try {
      const limit = parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_limit_daily'").get() as any)?.value || '500000') || 500000;
      const used = (db.prepare("SELECT COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) = date('now')").get() as any)?.t || 0;
      usageBlocked = used >= limit;
    } catch { usageBlocked = false; }
  }
  return usageBlocked;
}
// Middleware applying the hard cap to every token-consuming endpoint
function enforceUsageLimit(req: AuthRequest, res: Response, next: any): void {
  if (usageLimitReached()) { res.status(429).json({ error: '今日 AI 用量已达上限，请明天再试或联系管理员提高限额' }); return; }
  next();
}

function recordUsage(userId: string, kind: string, text: string, model?: string): void {
  try {
    const tokens = Math.ceil((text || '').length / 3) + 20;
    db.prepare('INSERT INTO AiUsage (id, userId, kind, model, tokens, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
      .run(cuid(), userId, kind, model || '', tokens, new Date().toISOString());
  } catch {}
  checkUsageAlert();
}

// Daily usage alert: notify admins once per day when the token budget is exceeded
function checkUsageAlert(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const warned = (db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_warned_date'").get() as any)?.value;
    if (warned === today) return; // already notified today
    const limit = parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_limit_daily'").get() as any)?.value || '500000') || 500000;
    const used = (db.prepare("SELECT COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) = date('now')").get() as any)?.t || 0;
    if (used < limit) return;
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('ai_usage_warned_date', 'ai_usage_warned_date', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(today);
    const admins = db.prepare("SELECT id FROM User WHERE role = 'admin'").all() as any[];
    for (const a of admins) {
      db.prepare('INSERT INTO AiNotification (id, userId, message, read, createdAt) VALUES (?, ?, ?, 0, ?)')
        .run(cuid(), a.id, '⚠️ 今日 AI 用量已达 ' + Math.round(used / 1000) + 'K tokens（限额 ' + Math.round(limit / 1000) + 'K）', new Date().toISOString());
    }
  } catch {}
}

router.get('/usage', authenticate, requireCap('ai_manage'), (req: AuthRequest, res: Response) => {
  try {
    const total = (db.prepare('SELECT COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage').get() as any);
    const today = (db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) = date('now')").get() as any);
    const byKind = db.prepare('SELECT kind, COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage GROUP BY kind').all();
    const byDay = db.prepare("SELECT date(createdAt) as day, COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE createdAt >= datetime('now', '-30 days') GROUP BY day ORDER BY day").all();
    const recent = db.prepare('SELECT u.*, us.username FROM AiUsage u LEFT JOIN User us ON us.id = u.userId ORDER BY u.createdAt DESC LIMIT 20').all();
    res.json({ total, today, byKind, byDay, recent });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Async task mode: long-running agent operations with step tracking ----

interface TaskStep {
  type: 'think' | 'tool';
  content?: string;
  name?: string;
  args?: any;
  output?: any;
  ts: number;
}

function createTask(userId: string, username: string, prompt: string): string {
  const id = cuid();
  db.prepare("INSERT INTO AiTask (id, userId, username, prompt, status, createdAt) VALUES (?, ?, ?, ?, 'running', ?)")
    .run(id, userId, username, prompt, new Date().toISOString());
  return id;
}

function updateTask(id: string, patch: Record<string, any>): void {
  const sets = Object.keys(patch).map(k => k + ' = ?').join(', ');
  db.prepare('UPDATE AiTask SET ' + sets + ' WHERE id = ?').run(...Object.values(patch), id);
}

function getTask(id: string): any {
  const t = db.prepare('SELECT * FROM AiTask WHERE id = ?').get(id) as any;
  if (t) { try { t.steps = JSON.parse(t.steps); } catch { t.steps = []; } }
  return t;
}

async function runTask(taskId: string, userId: string, role: string, username: string, message: string): Promise<void> {
  // Tool-call budget per task: complex workflows (search + write + cover +
  // SEO) need headroom, and the model is told to batch calls in one round.
  const MAX_ITER = 16;
  let timeout: any = null;
  const steps: TaskStep[] = [];
  try {
    const provider = getDefaultProvider();
    if (!provider) { updateTask(taskId, { status: 'failed', error: '尚未配置 AI 服务商', finishedAt: new Date().toISOString() }); return; }
    const tools = listToolSchemas(role);
    const msgs: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + buildSiteContext() + memoryPrompt(userId) + (tools.length ? '\n\n可用的工具: ' + tools.map(t => t.function.name).join(', ') + '。需要操作时调用工具。' : '') + '\n\n注意：一次任务最多可进行 ' + MAX_ITER + ' 轮工具调用。请尽量在一轮中并行调用多个工具（一次返回多个工具调用），避免多余的确认性调用，把轮次留给真正需要的操作。' },
      { role: 'user', content: guardUserMessage(message) },
    ];
    const ctx = { userId, role };
    let finalText = '';
    let finished = false;
    const finish = (status: string, patch: Record<string, any>) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      updateTask(taskId, { status, ...patch, steps: JSON.stringify(steps), finishedAt: new Date().toISOString() });
      // R1: notification carries a summary of what the task produced so the
      // user sees the outcome without opening the task detail
      const summary = (status === 'done' ? finalText : patch.error) || '';
      notifyTaskFinished(taskId, userId, status, summary);
      recordUsage(userId, 'task', finalText || taskId, provider.model);
    };

    // Hard timeout so a hung tool call can never block a task forever
    timeout = setTimeout(() => {
      finish('failed', { error: '任务执行超时（10 分钟上限）' });
    }, 600000);

    for (let i = 0; i < MAX_ITER; i++) {
      // Cancellation check
      const cur = db.prepare('SELECT status FROM AiTask WHERE id = ?').get(taskId) as any;
      if (cur?.status === 'cancelled') return;

      const result = await chatComplete(provider, msgs, { tools });
      finalText = result.content;
      if (result.content) steps.push({ type: 'think', content: result.content.slice(0, 160), ts: Date.now() });
      updateTask(taskId, { steps: JSON.stringify(steps) });

      if (!result.toolCalls.length) break;

      pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
      const outputs = await Promise.all(result.toolCalls.map(async (tc) => {
        const output = await executeTool(tc.name, tc.args, ctx);
        steps.push({ type: 'tool', name: tc.name, args: tc.args, output, ts: Date.now() });
        updateTask(taskId, { steps: JSON.stringify(steps) });
        return { id: tc.id, output: JSON.stringify(output) };
      }));
      pushToolResults(msgs, outputs, provider.type);
      if (i === MAX_ITER - 1) {
        // Cap reached with tools still pending: give the model one final
        // chance to summarize what was done instead of leaving the user with
        // a bare "limit reached" message.
        try {
          msgs.push({ role: 'system', content: '工具调用次数已达上限。请立即用自然语言总结：已完成的工作、产出（如文章标题/链接/ID）、以及未能完成的部分。不要再调用任何工具。' });
          const wrap = await chatComplete(provider, msgs, {});
          finalText = wrap.content || '已达到工具调用次数上限，部分工作可能已完成，请拆分任务后重试。';
        } catch { finalText = '已达到工具调用次数上限，部分工作可能已完成，请拆分任务后重试。'; }
        break;
      }
    }

    finish('done', { result: finalText });
  } catch (e: any) {
    try { clearTimeout(timeout); } catch {}
    const friendly = friendlyTaskError(e);
    updateTask(taskId, { status: 'failed', error: friendly, steps: JSON.stringify(steps), finishedAt: new Date().toISOString() });
    notifyTaskFinished(taskId, userId, 'failed', friendly);
  }
}

function notifyTaskFinished(taskId: string, userId: string, status: string, summary?: string): void {
  try {
    const task = getTask(taskId);
    const head = status === 'done'
      ? '✅ AI 任务完成: ' + (task?.prompt || '').slice(0, 40)
      : '❌ AI 任务失败: ' + (task?.prompt || '').slice(0, 40);
    const msg = summary ? head + '\n' + String(summary).replace(/\s+/g, ' ').slice(0, 80) : head;
    db.prepare('INSERT INTO AiNotification (id, userId, message, taskId, read, createdAt) VALUES (?, ?, ?, ?, 0, ?)')
      .run(cuid(), userId, msg, taskId, new Date().toISOString());
  } catch {}
}

// Notifications
router.get('/notifications', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const list = db.prepare('SELECT * FROM AiNotification WHERE userId = ? ORDER BY createdAt DESC LIMIT 20').all(req.user!.userId);
    const unread = (db.prepare('SELECT COUNT(*) as c FROM AiNotification WHERE userId = ? AND read = 0').get(req.user!.userId) as any)?.c || 0;
    res.json({ notifications: list, unread });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark a single notification as read
router.post('/notifications/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE AiNotification SET read = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/notifications/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE AiNotification SET read = 1 WHERE userId = ?').run(req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/task', authenticate, enforceUsageLimit, (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const message = String((req.body || {}).message || '').trim();
    if (!message) { res.status(400).json({ error: 'message required' }); return; }
    // R4: cap prompt length so a huge description cannot blow up the token budget
    const prompt = message.slice(0, 2000);
    // R8: rate-limit task creation (per user)
    const recent = (db.prepare("SELECT COUNT(*) as c FROM AiTask WHERE userId = ? AND createdAt > ?").get(req.user!.userId, new Date(Date.now() - 60_000).toISOString()) as any)?.c || 0;
    if (recent >= 5) { res.status(429).json({ error: '任务创建过于频繁，请稍候再试' }); return; }
    // R9: cap concurrent running tasks (per user)
    const running = (db.prepare("SELECT COUNT(*) as c FROM AiTask WHERE userId = ? AND status = 'running'").get(req.user!.userId) as any)?.c || 0;
    if (running >= 3) { res.status(429).json({ error: '同时最多运行 3 个任务，请等待当前任务完成后再试' }); return; }
    const user = db.prepare('SELECT id, username FROM User WHERE id = ?').get(req.user!.userId) as any;
    const taskId = createTask(req.user!.userId, user?.username || 'user', prompt);
    // Run in background without blocking the response
    setImmediate(() => { runTask(taskId, req.user!.userId, req.user!.role, user?.username || 'user', prompt); });
    res.status(201).json({ id: taskId });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/tasks', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = req.user!.role === 'admin'
      ? db.prepare('SELECT id, username, prompt, status, error, steps, createdAt, finishedAt FROM AiTask ORDER BY createdAt DESC LIMIT 50').all()
      : db.prepare('SELECT id, username, prompt, status, error, steps, createdAt, finishedAt FROM AiTask WHERE userId = ? ORDER BY createdAt DESC LIMIT 50').all(req.user!.userId);
    const tasks = (rows as any[]).map((t: any) => {
      let steps: any[] = [];
      try { steps = JSON.parse(t.steps || '[]'); } catch {}
      const last = steps[steps.length - 1];
      return {
        id: t.id, username: t.username, prompt: t.prompt, status: t.status, error: t.error,
        createdAt: t.createdAt, finishedAt: t.finishedAt,
        stepCount: steps.length,
        lastStep: last ? (last.type === 'think' ? String(last.content || '').slice(0, 60) : last.name) : null,
      };
    });
    res.json({ tasks });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/tasks/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权查看该任务' }); return; }
    res.json(task);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Scheduled AI tasks (auto-run agent jobs) ----

interface AiSchedule {
  id: string;
  name: string;
  prompt: string;
  type: 'interval' | 'daily' | 'weekly';
  intervalMinutes?: number;
  time?: string;         // HH:MM for daily/weekly
  weekday?: number;      // 0-6 for weekly
  enabled: boolean;
  userId: string;
  username: string;
  lastRun: string | null;
  createdAt: string;
}

function getSchedules(): AiSchedule[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_schedules'").get() as any;
  if (!row?.value) return [];
  try { return JSON.parse(row.value); } catch { return []; }
}

function saveSchedules(list: AiSchedule[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_schedules', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_schedules', JSON.stringify(list));
}

function scheduleShouldRun(s: AiSchedule, now: Date): boolean {
  if (!s.enabled) return false;
  const last = s.lastRun ? new Date(s.lastRun) : null;
  if (s.type === 'interval') {
    const mins = s.intervalMinutes || 60;
    return !last || (now.getTime() - last.getTime() >= mins * 60000);
  }
  const [h, m] = (s.time || '09:00').split(':').map(Number);
  if (now.getHours() !== h || now.getMinutes() !== m) return false;
  if (s.type === 'weekly' && now.getDay() !== (s.weekday ?? 1)) return false;
  if (last && last.toDateString() === now.toDateString()) return false;
  return true;
}

// Scheduler tick: check every minute
setInterval(() => {
  try {
    const now = new Date();
    for (const s of getSchedules()) {
      if (!scheduleShouldRun(s, now)) continue;
      const updated = getSchedules().map(x => x.id === s.id ? { ...x, lastRun: now.toISOString() } : x);
      saveSchedules(updated); // claim the run to avoid double execution
      const user = db.prepare('SELECT id, role, username FROM User WHERE id = ?').get(s.userId) as any;
      if (!user || !isRoleAllowed(user.role)) continue;
      const taskId = createTask(user.id, user.username, '[定时] ' + s.name + ': ' + s.prompt);
      setImmediate(() => { runTask(taskId, user.id, user.role, user.username, s.prompt); });
    }
  } catch { /* scheduler must never crash */ }
}, 60000);

router.get('/schedules', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const list = req.user!.role === 'admin' ? getSchedules() : getSchedules().filter(x => x.userId === req.user!.userId);
    res.json({ schedules: list });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/schedules', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, prompt, type, intervalMinutes, time, weekday } = req.body || {};
    if (!name || !prompt || !['interval', 'daily', 'weekly'].includes(type)) { res.status(400).json({ error: 'name, prompt and type required' }); return; }
    const user = db.prepare('SELECT id, username FROM User WHERE id = ?').get(req.user!.userId) as any;
    const s: AiSchedule = {
      id: cuid(), name: String(name).slice(0, 50), prompt: String(prompt), type,
      intervalMinutes: type === 'interval' ? Math.max(5, parseInt(intervalMinutes) || 60) : undefined,
      time: type !== 'interval' ? (time || '09:00') : undefined,
      weekday: type === 'weekly' ? (parseInt(weekday) || 1) : undefined,
      enabled: true, userId: req.user!.userId, username: user?.username || 'user',
      lastRun: null, createdAt: new Date().toISOString(),
    };
    const list = getSchedules();
    list.push(s);
    saveSchedules(list);
    res.status(201).json(s);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/schedules/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    let list = getSchedules();
    if (req.user!.role !== 'admin') list = list.filter(x => !(x.id === req.params.id && x.userId === req.user!.userId));
    else list = list.filter(x => x.id !== req.params.id);
    saveSchedules(list);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// AI review of pending comments (spam detection suggestion)
router.post('/review-comments', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商' }); return; }
    const comments = db.prepare("SELECT id, author, content FROM Comment WHERE status = 'pending' ORDER BY createdAt DESC LIMIT 10").all() as any[];
    if (!comments.length) { res.json({ verdicts: [] }); return; }

    const list = comments.map((c: any) => c.id + '|' + c.author + '|' + c.content.slice(0, 200)).join('\n');
    const result = await chatComplete(provider, [
      { role: 'system', content: '你是评论审核员。对每条评论判断 spam（垃圾/广告/恶意）或 approved（正常）。严格按格式逐行输出：评论ID|spam或approved|一句话理由。' },
      { role: 'user', content: guardUserMessage(list) },
    ]);
    // Parse verdicts
    const verdicts: any[] = [];
    for (const line of result.content.split('\n')) {
      const m = line.match(/^([\w-]+)\|(spam|approved)(\|.*)?$/);
      if (m && comments.some((c: any) => c.id === m[1])) {
        verdicts.push({ id: m[1], verdict: m[2], reason: (m[3] || '').replace(/^\|/, '') });
      }
    }
    res.json({ verdicts, raw: result.content });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Compare two providers with the same prompt (model evaluation)
router.post('/compare', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    const { prompt, providerAId, providerBId } = req.body || {};
    if (!prompt) { res.status(400).json({ error: 'prompt required' }); return; }
    const providers = getProviders();
    const a = providers.find((p: any) => p.id === providerAId && p.enabled);
    const b = providers.find((p: any) => p.id === providerBId && p.enabled);
    if (!a || !b) { res.status(400).json({ error: '请选择两个已启用的服务商' }); return; }
    const [ra, rb] = await Promise.all([
      chatComplete(a, [{ role: 'user', content: guardUserMessage(String(prompt)) }]).then(r => r.content).catch((e: any) => '❌ ' + e.message),
      chatComplete(b, [{ role: 'user', content: guardUserMessage(String(prompt)) }]).then(r => r.content).catch((e: any) => '❌ ' + e.message),
    ]);
    res.json({ a: { name: a.name, model: a.model, content: ra }, b: { name: b.name, model: b.model, content: rb } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Batch translate posts into a target language (creates drafts)
router.post('/batch-translate', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商' }); return; }
    const { ids, language } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 10) { res.status(400).json({ error: 'ids array (1-10) required' }); return; }
    const lang = String(language || 'English');
    const posts = ids.map((id: string) => db.prepare("SELECT * FROM Post WHERE id = ? AND type = 'post'").get(id) as any).filter(Boolean);
    if (posts.length === 0) { res.status(404).json({ error: '未找到文章' }); return; }

    const results: any[] = [];
    for (const post of posts) {
      try {
        const plain = (post.content || '').replace(/<[^>]*>/g, '').slice(0, 6000);
        const r = await chatComplete(provider, [
          { role: 'system', content: '你是专业译者。把文章翻译成 ' + lang + '，输出 Markdown，标题用 # 开头。' },
          { role: 'user', content: guardUserMessage('标题: ' + post.title + '\n\n' + plain) },
        ]);
        const lines = r.content.split('\n');
        const newTitle = (lines.find((l: string) => l.startsWith('# ')) || '').replace(/^#\s*/, '').trim() || post.title + ' (' + lang + ')';
        const body = lines.filter((l: string) => !l.startsWith('# ')).join('\n');
        const allSlugs = (db.prepare("SELECT slug FROM Post WHERE type = 'post'").all() as any[]).map((x: any) => x.slug);
        const id = cuid();
        db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, newTitle, uniqueSlug(newTitle, allSlugs), prepareAiContent(body), (post.excerpt || '').slice(0, 300), 'draft', 'post', req.user!.userId, post.featured || null);
        purgeContentCaches();
        results.push({ source: post.title, id, title: newTitle, status: 'ok' });
      } catch (e: any) {
        results.push({ source: post.title, error: e.message || '翻译失败' });
      }
    }
    res.json({ results, total: results.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Share a chat session via public link
router.post('/share', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) { res.status(400).json({ error: 'messages required' }); return; }
    const token = require('crypto').randomBytes(9).toString('hex');
    const value = JSON.stringify({ userId: req.user!.userId, username: (db.prepare('SELECT username FROM User WHERE id = ?').get(req.user!.userId) as any)?.username, messages: messages.slice(-50), createdAt: new Date().toISOString() });
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_share_' || ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run('ai_share_' + token, token, value);
    res.json({ url: '/share/ai/' + token });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/share/:token', (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_share_' || ?").get(req.params.token) as any;
    if (!row) { res.status(404).json({ error: '分享不存在或已失效' }); return; }
    res.json(JSON.parse(row.value));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Long-term memory management
router.get('/memories', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = req.user!.role === 'admin'
      ? db.prepare('SELECT m.*, u.username FROM AiMemory m LEFT JOIN User u ON u.id = m.userId ORDER BY m.updatedAt DESC').all()
      : db.prepare('SELECT key, value, updatedAt FROM AiMemory WHERE userId = ? ORDER BY updatedAt DESC').all(req.user!.userId);
    res.json({ memories: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/memories/:key', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const key = req.params.key;
    if (req.user!.role === 'admin') db.prepare('DELETE FROM AiMemory WHERE key = ?').run(key);
    else db.prepare('DELETE FROM AiMemory WHERE userId = ? AND key = ?').run(req.user!.userId, key);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Chat sessions (server-side persistence, cross-device) ----

function parseSessionMessages(raw: any): string {
  if (!Array.isArray(raw)) return '[]';
  const cleaned = raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m: any) => ({ role: m.role, content: String(m.content || '').slice(0, 20000), ts: m.ts || Date.now() }))
    .slice(-100);
  return JSON.stringify(cleaned);
}

// List current user's sessions (summaries only)
router.get('/sessions', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, title, createdAt, updatedAt, LENGTH(messages) as size FROM AiSession WHERE userId = ? ORDER BY updatedAt DESC LIMIT 50').all(req.user!.userId) as any[];
    res.json({ sessions: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Full session (messages)
router.get('/sessions/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM AiSession WHERE id = ? AND userId = ?').get(req.params.id, req.user!.userId) as any;
    if (!row) { res.status(404).json({ error: '会话不存在' }); return; }
    let messages: any[] = [];
    try { messages = JSON.parse(row.messages || '[]'); } catch {}
    res.json({ id: row.id, title: row.title, messages });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Create a session
router.post('/sessions', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const id = req.body?.id || cuid();
    const title = String(req.body?.title || 'New chat').slice(0, 60);
    const messages = parseSessionMessages(req.body?.messages);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO AiSession (id, userId, title, messages, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, req.user!.userId, title, messages, now, now);
    res.status(201).json({ id, title });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update a session (title and/or messages)
router.put('/sessions/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM AiSession WHERE id = ? AND userId = ?').get(req.params.id, req.user!.userId) as any;
    if (!existing) { res.status(404).json({ error: '会话不存在' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (req.body?.title !== undefined) { sets.push('title = ?'); vals.push(String(req.body.title).slice(0, 60)); }
    if (req.body?.messages !== undefined) { sets.push('messages = ?'); vals.push(parseSessionMessages(req.body.messages)); }
    sets.push('updatedAt = ?'); vals.push(new Date().toISOString());
    vals.push(req.params.id);
    db.prepare('UPDATE AiSession SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete all sessions for the current user
router.delete('/sessions', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM AiSession WHERE userId = ?').run(req.user!.userId);
    res.json({ success: true, deleted: r.changes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete a session
router.delete('/sessions/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM AiSession WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Direct vision/image-gen helpers (UI-facing wrappers around the tools)
router.post('/vision', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    const { url, question } = req.body || {};
    if (!url) { res.status(400).json({ error: 'url required' }); return; }
    const out = await executeTool('analyze_image', { url, question: question || '' }, { userId: req.user!.userId, role: req.user!.role });
    res.json(out);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/image-gen', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    const { prompt, size } = req.body || {};
    if (!prompt) { res.status(400).json({ error: 'prompt required' }); return; }
    const out = await executeTool('generate_image', { prompt, size }, { userId: req.user!.userId, role: req.user!.role });
    res.json(out);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: AI operation audit log (sandbox traceability)
router.get('/audit', authenticate, requireCap('ai_manage'), (req: AuthRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM AiAudit ORDER BY createdAt DESC LIMIT 100').all();
    res.json({ logs });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks/:id/retry', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权操作该任务' }); return; }
    const user = db.prepare('SELECT id, username FROM User WHERE id = ?').get(task.userId) as any;
    const newId = createTask(task.userId, user?.username || task.username || 'user', task.prompt);
    setImmediate(() => { runTask(newId, task.userId, req.user!.role, user?.username || task.username || 'user', task.prompt); });
    res.status(201).json({ id: newId });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/tasks/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    db.prepare('DELETE FROM AiNotification WHERE taskId = ?').run(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权删除该任务' }); return; }
    db.prepare('DELETE FROM AiTask WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks/:id/cancel', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权操作该任务' }); return; }
    if (task.status === 'running') {
      updateTask(req.params.id, { status: 'cancelled', finishedAt: new Date().toISOString() });
    }
    res.json({ success: true });
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
// Webhook endpoints consume AI tokens on every call — bound them per IP
const webhookLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, message: { error: 'Too many webhook calls, slow down' } });
// GET: informational, so the endpoint can be verified in a browser (WeChat/
// DingTalk bots call it with POST, which browsers cannot send). Never echoes
// binding details — the token is a secret.
router.get('/webhook/:token', (_req: AuthRequest, res: Response) => {
  res.json({ ok: true, message: 'Webhook endpoint ready — send POST requests here (e.g. WeChat/DingTalk callback).' });
});
router.post('/webhook/:token', webhookLimiter, async (req: AuthRequest, res: Response) => {
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
      { role: 'system', content: SYSTEM_PROMPT + ' 当前用户: ' + binding.username + '。\n' + buildSiteContext() + memoryPrompt(user.id) + (tools.length ? '\n可用的工具: ' + tools.map(t => t.function.name).join(', ') : '') },
      { role: 'user', content: guardUserMessage(message) },
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

    recordUsage(user.id, 'webhook', reply, provider.model);
    res.json({ reply });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
