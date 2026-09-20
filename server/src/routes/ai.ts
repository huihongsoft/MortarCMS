import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import db, { cuid, withTransaction } from '../utils/db';
import { uniqueSlug } from '../utils/slug';
import { authenticate, authorize, requireCap, userCan, AuthRequest } from '../middleware/auth';
import {
  AIProvider, PROVIDER_PRESETS, getProviders, saveProviders, getDefaultProvider,
  setDefaultProvider, chatComplete, pushAssistantWithTools, pushToolResults, testProvider,
  encryptSecretJson, decryptSecretJson, isEncryptedSecret, userFacingAiError,
} from '../utils/ai';
import {
  getAiAllowedRoles, getToolPermissions, isRoleAllowed, listToolSchemas, toolCallToResult, executeTool, guardUserMessage, memoryPrompt, prepareAiContent, friendlyTaskError,
  executeToolUnattended,
} from '../utils/aiTools';
import { riskyReason, describeCall, signApproval, verifyApproval, claimApproval, oneLine, MAX_APPROVAL_CALLS } from '../utils/aiApproval';
import { userMayAccessSite } from '../utils/userSites';
import { effectiveSetting } from '../utils/siteSettings';
import { mdToHtml } from '../utils/markdown';
import { purgeContentCaches } from '../utils/cache';
import { fetchUrlGuarded } from '../utils/ssrf';
import { SiteRequest } from '../middleware/site';

const router = Router();

// Compact snapshot of the site injected into the system prompt so the
// assistant can answer site-specific questions without extra tool calls
function buildSiteContext(siteId?: string): string {
  try {
    const settings = db.prepare("SELECT key, value FROM Setting WHERE key IN ('site_title','site_description','site_url')").all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    // Only what the caller could read anyway: this goes into the system prompt of
    // every request, and an unfiltered query leaked other authors' draft titles
    // (get_post refuses those) and other sites' posts on a multi-site install.
    // Published-and-due only, scoped to the resolved site.
    const scope = siteId ? ' AND (siteId IS NULL OR siteId = ?)' : '';
    const scopeArgs = siteId ? [siteId] : [];
    const pub = "type = 'post' AND status = 'published' AND (publishedAt IS NULL OR publishedAt <= ?)";
    const now = new Date().toISOString();
    const recent = db.prepare('SELECT title, slug, status, publishedAt FROM Post WHERE ' + pub + scope + ' ORDER BY createdAt DESC LIMIT 5').all(now, ...scopeArgs) as any[];
    const pages = db.prepare('SELECT title, slug, status FROM Post WHERE type = \'page\' AND status = \'published\'' + scope + ' ORDER BY menuOrder LIMIT 3').all(...scopeArgs) as any[];
    const catCnt = (db.prepare('SELECT COUNT(*) as c FROM Category').get() as any)?.c || 0;
    const tagCnt = (db.prepare('SELECT COUNT(*) as c FROM Tag').get() as any)?.c || 0;
    // same filter as `recent` above, so the number matches the list under it
    const postCnt = (db.prepare('SELECT COUNT(*) as c FROM Post WHERE ' + pub + scope).get(now, ...scopeArgs) as any)?.c || 0;
    let ctx = '【站点上下文】\n';
    ctx += '站点名称: ' + (cfg.site_title || 'Mortar') + '\n';
    ctx += '站点描述: ' + (cfg.site_description || '') + '\n';
    // Labelled as published-only because that is what it counts now — an
    // unfiltered total would contradict both this line and the prompt's rule of
    // showing only what the caller can read.
    ctx += '已发布文章数: ' + postCnt + '，分类: ' + catCnt + '，标签: ' + tagCnt + '\n';
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
router.get('/settings', authenticate, requireCap('ai_manage'), (req: AuthRequest, res: Response) => {
  try {
    const providers = getProviders().map((p: AIProvider) => ({
      ...p,
      // Never hand the (masked) key back as a value — the client would treat it
      // as editable and post it straight into an auth header ("Bearer ••••…",
      // which is not valid Latin-1). Expose only a hint + hasKey.
      apiKey: '',
      hasKey: !!p.apiKey,
      keyHint: p.apiKey ? '••••' + p.apiKey.slice(-4) : '',
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
      // The per-user cap was enforced but never exposed, so the only way to set
      // it was a manual database write.
      usageLimitPerUser: (db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_limit_daily_per_user'").get() as any)?.value || '',
      allowUnattendedRisky: (db.prepare("SELECT value FROM Setting WHERE key = 'ai_allow_unattended_risky'").get() as any)?.value === '1',
    });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Save providers (apiKey kept if masked). Admin only: this decides where the
// server sends requests AND which credentials it uses. A local endpoint is a
// supported configuration (the Ollama preset points at localhost), so an
// internal baseUrl is a feature, not a bug — which is exactly why configuring
// it must not be delegable. Falling back to manage_options would let editors
// point the provider at an internal host, overwrite API keys, and grant
// themselves tool permissions (ai_allowed_roles / ai_tool_permissions).
router.put('/settings', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    // Providers are validated only when present: this endpoint also carries the
    // standalone toggles, and demanding a providers array made a request like
    // { allowUnattendedRisky: true } fail with 400 — the setting existed but
    // nothing could turn it on.
    const incoming = req.body?.providers as AIProvider[] | undefined;
    if (incoming !== undefined) {
      if (!Array.isArray(incoming)) { res.status(400).json({ error: 'providers must be an array' }); return; }
      const existing = getProviders();
      const merged = incoming.map((p: any) => {
        const old = existing.find((e: any) => e.id === p.id);
        let apiKey = p.apiKey || '';
        if (old && (!apiKey || apiKey.startsWith('••••'))) apiKey = old.apiKey;
        return { ...p, apiKey };
      });
      saveProviders(merged);
    }
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
    // Unattended jobs cannot ask a human, so by default they refuse publishing or
    // trashing posts. Setting this is an explicit decision to let them.
    if (req.body?.allowUnattendedRisky !== undefined) {
      db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_allow_unattended_risky', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .run('ai_allow_unattended_risky', req.body.allowUnattendedRisky ? '1' : '0');
    }
    // Per-user daily cap; '' or 0 disables it (admins are exempt either way).
    if (req.body?.usageLimitPerUser !== undefined) {
      const v = String(req.body.usageLimitPerUser || '').replace(/[^\d]/g, '');
      db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_usage_limit_daily_per_user', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .run('ai_usage_limit_daily_per_user', v);
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Test a provider connection. Admin only: the baseUrl comes from the request
// body, so a caller-supplied value makes the server fetch an arbitrary URL
// (internal port scanning, cloud metadata). It must match who may persist a
// provider, otherwise "save an internal baseUrl, then test it" is the same hole.
router.post('/test', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    let p = req.body?.provider as AIProvider | undefined;
    // Testing an already-saved provider must not require re-typing the key:
    // fall back to the stored credential by id.
    if ((!p || !p.apiKey) && req.body?.providerId) {
      const stored = getProviders().find((x: any) => x.id === req.body.providerId);
      if (stored) p = { type: stored.type, baseUrl: stored.baseUrl, apiKey: stored.apiKey, model: stored.model } as AIProvider;
    }
    if (!p?.apiKey || !p?.model) { res.status(400).json({ error: 'provider, apiKey and model required' }); return; }
    const result = await testProvider(p);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Summarize a long conversation excerpt (used to compress chat history)
router.post('/summarize', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    // Per-operation throttle: compressing a long conversation and sending the next
    // message happen back to back, so sharing one slot would reject the message.
    if (throttledAiRequest(req.user!.userId, 'summarize')) { res.status(429).json({ error: '请求太频繁，请稍等几秒再试' }); return; }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// ---- Assistant (tools + permissions) — SSE streaming ----

// Ceiling on the signed approval plan (its args ride inside the token, which the
// client stores and posts back). Roughly 1/40th of the 10mb body limit, well
// above any realistic plan, low enough that a token cannot bloat the session.
const MAX_PLAN_BYTES = 256 * 1024;

// Per-user, per-operation request throttle (prevents runaway token spend from
// misfires). Keyed by operation too: the chat client compresses a long history
// and sends the next message back to back, and those must not block each other.
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

router.post('/assistant', authenticate, enforceUsageLimit, async (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    // Same per-operation slot as the other AI endpoints, and short enough that a
    // quick follow-up message is delivered rather than rejected.
    if (throttledAiRequest(req.user!.userId, 'assistant')) {
      res.status(429).json({ error: '请求太频繁，请稍等几秒再试' });
      return;
    }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商，请先在 AI 设置中配置' }); return; }
    const { message, temperature, maxTokens, includeContext, history } = req.body;
    if (!message) { res.status(400).json({ error: 'message required' }); return; }

    // siteId lets the tools — and the site snapshot injected below — scope to the
    // site this request came from (multi-site installs otherwise read/write
    // across all sites). Built first so the prompt can use it too.
    //
    // The resolved site comes from the Host header, which the caller controls, so
    // it is checked against the sites this user is assigned to: a user with
    // assignments acting outside them gets no site scope (global content only)
    // instead of another site's data.
    const ctx = { userId: req.user!.userId, role: req.user!.role, siteId: actingSiteId(req) };
    const tools = listToolSchemas(req.user!.role);
    const msgs: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + (includeContext === false ? '' : '\n\n' + buildSiteContext(ctx.siteId) + memoryPrompt(req.user!.userId)) + (tools.length ? '\n\n可用的工具: ' + tools.map(t => t.function.name).join(', ') + '。需要操作时调用工具。' : '') },
      ...buildHistoryMessages(history),
      { role: 'user', content: guardUserMessage(String(message)) },
    ];
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

      // Split before anything runs. A call that needs a human is not executed:
      // the turn ends with a signed plan so the user can approve it. Whatever is
      // safe in the same batch still lands, so "write the draft, then publish
      // it" gets as far as the draft.
      // Partitioned in one pass: the check reads the target post's status from the
      // database (a body edit to a live post is public even though the arguments
      // look routine), and running it twice per call doubled that work while
      // letting the two filters disagree if the row changed in between.
      const risky: typeof result.toolCalls = [];
      const safe: typeof result.toolCalls = [];
      for (const tc of result.toolCalls) (riskyReason(tc.name, tc.args, ctx) ? risky : safe).push(tc);
      const describe = (tc: any) => describeCall(tc.name, tc.args, ctx.siteId);

      let done: string[] = [];
      if (safe.length) {
        send({ type: 'tools', tools: safe.map(t => t.name) });
        pushAssistantWithTools(msgs, result.content, safe, provider.type);
        const results = await Promise.all(safe.map(tc => toolCallToResult(tc, ctx)));
        // Stream tool results to the UI so users can see what was queried
        for (const r of results) {
          const tc = safe.find((x: any) => x.id === r.id);
          send({ type: 'tool_result', name: tc?.name || 'tool', output: String(r.output || '').slice(0, 800) });
        }
        pushToolResults(msgs, results, provider.type);
        done = results.map((r: any) => String(r.output || ''));
      }

      if (risky.length) {
        // Capped to what an approval token can carry — signing more than
        // verifyApproval accepts would produce a card that can never be run.
        let asks = risky.slice(0, MAX_APPROVAL_CALLS);
        // The plan travels inside the token, so an oversized one is both a huge
        // localStorage entry and, past the body limit (measured: an 8MB plan →
        // 413), an approval nobody can submit. Drop the biggest calls instead.
        const size = (list: any[]) => JSON.stringify(list.map(tc => ({ n: tc.name, a: tc.args }))).length;
        let tooLarge = false;
        while (asks.length > 1 && size(asks) > MAX_PLAN_BYTES) { asks = asks.slice(0, -1); tooLarge = true; }
        if (asks.length === 1 && size(asks) > MAX_PLAN_BYTES) { asks = []; tooLarge = true; }
        const overflow = risky.length - asks.length;
        // An empty plan would sign a token that verifyApproval rejects, i.e. a
        // card nobody can ever approve — so no card at all in that case.
        if (asks.length) {
          send({
            type: 'pending',
            token: signApproval(req.user!.userId, asks.map(tc => ({ name: tc.name, args: tc.args })), ctx.siteId),
            calls: asks.map(tc => ({ id: tc.id, name: tc.name, summary: describe(tc) })),
          });
        }
        const list = asks.map(describe).join('；');
        const lead = String(result.content || '').trim();
        // Say what DID happen before saying what is waiting: the safe calls in
        // this same batch already landed (a draft may have been created), and
        // without this the reply only mentions the item being confirmed, so the
        // user never learns the rest of the turn succeeded.
        const landed = done.map(o => { try { return JSON.parse(o)?.message || ''; } catch { return ''; } })
          .filter(Boolean).slice(0, 3);
        finalText = (lead ? lead + '\n\n' : '')
          + (landed.length ? '✓ 已完成：' + landed.join('；') + '\n\n' : '')
          + (asks.length ? '⏸ 以下操作需要你确认后执行：' + list : '')
          + (tooLarge ? (asks.length ? '\n' : '') + '有 ' + overflow + ' 项待确认操作体积过大（含整篇正文），无法放入确认卡片，请拆分后再让我执行。' : '')
          + (overflow > 0 && !tooLarge ? '\n（另有 ' + overflow + ' 项高风险操作未纳入本次确认，确认后请再让我继续）' : '');
        break;
      }

      if (i === MAX_ITER - 1) finalText = '已达到工具调用次数上限，请简化问题重试。';
    }

    recordUsage(req.user!.userId, 'assistant', finalText, provider.model);
    send({ type: 'done', content: finalText });
    res.end();
  } catch (err: any) {
    // The stream is rendered straight into the chat, so it gets the same
    // user-facing filter as every other AI error.
    const msg = userFacingAiError(err);
    if (!res.headersSent) { res.status(500).json({ error: msg }); return; }
    res.write('data: ' + JSON.stringify({ type: 'error', error: msg }) + '\n\n');
    res.end();
  }
});

// ---- Approve (or cancel) the high-risk calls a turn stopped on ----
//
// The plan rides in the signed token rather than in server state: nothing to
// lose on restart, nothing to sync across instances, and a client cannot swap in
// different arguments. The calls are re-checked at execution time (capabilities,
// tool permissions and ownership all live inside executeTool), so a plan signed
// before a role change does not outlive the change.
router.post('/assistant/approve', authenticate, enforceUsageLimit, async (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '你的角色无权使用 AI 功能' }); return; }
    if (throttledAiRequest(req.user!.userId, 'approve')) { res.status(429).json({ error: '请求太频繁，请稍等几秒再试' }); return; }
    const verified = verifyApproval(String(req.body?.token || ''), req.user!.userId);
    if (!verified) { res.status(400).json({ error: '确认已失效，请重新发起该操作' }); return; }
    const { calls } = verified;
    if (req.body?.approved !== true) {
      // Cancelling also spends the plan: otherwise the same token stays valid for
      // the rest of its TTL and a cancel could be followed by a hidden approve.
      // If it was already spent the plan RAN (a lost response, then this cancel),
      // so saying "nothing was executed" would be a lie.
      const spent = !claimApproval(String(req.body?.token || ''));
      res.json({
        cancelled: true,
        alreadyUsed: spent,
        results: [],
        summary: spent ? '该确认此前的提交已执行过，本次未重复执行。' : '已取消，未执行任何操作。',
      });
      return;
    }
    // Single-use: a retry after a lost response (or a double submit) must not run
    // the plan twice.
    if (!claimApproval(String(req.body?.token || ''))) {
      res.status(409).json({ error: '该确认已执行过，请勿重复提交' });
      return;
    }
    // The site the plan was prepared for wins over the one this request resolved
    // to: approving a card from another site context must not retarget the work.
    const signedSite = verified.siteId;
    const ctx = {
      userId: req.user!.userId,
      role: req.user!.role,
      // The plan's own site wins, but it is still checked against the caller's
      // assignments — a token cannot be used to reach a site its holder may not act on.
      siteId: signedSite && userMayAccessSite(req.user!.userId, req.user!.role, signedSite) ? signedSite : actingSiteId(req),
    };
    const results: any[] = [];
    for (const c of calls) {
      const output = await executeTool(c.name, c.args, ctx);
      results.push({ name: c.name, summary: describeCall(c.name, c.args, ctx.siteId), output });
    }
    const summary = summarizeApproved(results);
    recordUsage(req.user!.userId, 'approve', summary);
    res.json({ results, summary });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// One line per executed call, kept plain because it is appended to the chat
// history verbatim (the model reads it back on the next turn). Everything that
// came from a tool is flattened to one line: a title with an embedded newline
// could otherwise forge an extra "✓ …" line that the model would believe.
function summarizeApproved(results: any[]): string {
  // oneLine, not a local \s+ collapse: the character set that counts as a line
  // break has to be the same one describeCall sanitises, or a title carrying
  // U+2028 slips a forged line past one of the two.
  return results.map(r => {
    const err = r.output?.error;
    if (err) return '✗ ' + oneLine(r.summary, 120) + '：' + oneLine(err, 200);
    return '✓ ' + oneLine(r.summary, 120) + '：' + (oneLine(r.output?.message, 200) || '已执行');
  }).join('\n');
}

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
    // Preconditions — same hints the editor shows before calling
    const needsTitle = ['generate', 'seo', 'tags', 'topics'].includes(action);
    const needsContent = ['polish', 'continue', 'translate', 'summarize'].includes(action);
    if (needsTitle && !String(title || '').trim()) { res.status(400).json({ error: '请先填写文章标题' }); return; }
    if (needsContent && !String(content || '').trim()) { res.status(400).json({ error: '请先填写文章正文' }); return; }

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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
// Optional per-user daily cap (Setting: ai_usage_limit_daily_per_user, unset or
// 0 = disabled). The global budget alone lets one account consume the whole
// day's allowance for everyone; admins are exempt so a site owner can still work.
function userUsageLimitReached(userId: string, role: string): boolean {
  if (role === 'admin') return false;
  try {
    const limit = parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'ai_usage_limit_daily_per_user'").get() as any)?.value || '') || 0;
    if (!limit) return false;
    const used = (db.prepare("SELECT COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE userId = ? AND date(createdAt) = date('now')").get(userId) as any)?.t || 0;
    return used >= limit;
  } catch { return false; }
}

// The verdict above is cached for 10s (one SUM query per request would be a real
// cost on a busy site). Tests that change the limit or the recorded usage call
// this so they observe their own change instead of a stale verdict.
export function resetUsageCache(): void { usageCheckAt = 0; }

// Middleware applying the hard cap to every token-consuming endpoint
function enforceUsageLimit(req: AuthRequest, res: Response, next: any): void {
  if (usageLimitReached()) { res.status(429).json({ error: '今日 AI 用量已达上限，请明天再试或联系管理员提高限额' }); return; }
  if (req.user && userUsageLimitReached(req.user.userId, req.user.role)) {
    res.status(429).json({ error: '今日个人 AI 用量已达上限，请明天再试' }); return;
  }
  next();
}

// `tokensOverride` is for calls that produce no text to estimate from (image
// generation), so they still count against the budget.
function recordUsage(userId: string, kind: string, text: string, model?: string, tokensOverride?: number): void {
  try {
    const tokens = tokensOverride ?? (Math.ceil((text || '').length / 3) + 20);
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
    // Bound parameter, not datetime('now','-30 days'): the dialect layer turns
    // that into invalid MySQL ("REPLACE" with four arguments) and PG (a row
    // constructor), so this report 500s on those drivers.
    const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const byDay = db.prepare('SELECT date(createdAt) as day, COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE createdAt >= ? GROUP BY day ORDER BY day').all(since30);
    const recent = db.prepare('SELECT u.*, us.username FROM AiUsage u LEFT JOIN User us ON us.id = u.userId ORDER BY u.createdAt DESC LIMIT 20').all();
    res.json({ total, today, byKind, byDay, recent });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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

function createTask(userId: string, username: string, prompt: string, siteId?: string): string {
  const id = cuid();
  db.prepare("INSERT INTO AiTask (id, userId, username, prompt, status, siteId, createdAt) VALUES (?, ?, ?, ?, 'running', ?, ?)")
    .run(id, userId, username, prompt, siteId || null, new Date().toISOString());
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

// `siteId` is the site the task was started from, when there is one: a task
// created through the API carries it, while a scheduled job or a bot callback
// has no site of its own yet (see the open item on AiSchedule/AiBinding).
async function runTask(taskId: string, userId: string, role: string, username: string, message: string, siteId?: string): Promise<void> {
  // Tool-call budget per task: complex workflows (search + write + cover +
  // SEO) need headroom, and the model is told to batch calls in one round.
  const MAX_ITER = 16;
  let timeout: any = null;
  // Set by the timeout below. Without this the loop kept going for up to 16 more
  // rounds after the task was declared failed (each round is a provider call with
  // its own retry), so a hung provider held a task — and one of the three
  // per-user concurrency slots — far past the advertised limit.
  let expired = false;
  const steps: TaskStep[] = [];
  try {
    const provider = getDefaultProvider();
    if (!provider) { updateTask(taskId, { status: 'failed', error: '尚未配置 AI 服务商', finishedAt: new Date().toISOString() }); return; }
    const tools = listToolSchemas(role);
    const msgs: any[] = [
      // siteId is whatever the job carries: a task started from a request
      // inherits that request's site, a scheduled job or a bot uses the site its
      // owner picked, and only a job with no site configured is unscoped.
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + buildSiteContext(siteId) + memoryPrompt(userId) + (tools.length ? '\n\n可用的工具: ' + tools.map(t => t.function.name).join(', ') + '。需要操作时调用工具。' : '') + '\n\n注意：一次任务最多可进行 ' + MAX_ITER + ' 轮工具调用。请尽量在一轮中并行调用多个工具（一次返回多个工具调用），避免多余的确认性调用，把轮次留给真正需要的操作。' },
      { role: 'user', content: guardUserMessage(message) },
    ];
    const ctx = { userId, role, siteId };
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
      expired = true;
      finish('failed', { error: '任务执行超时（10 分钟上限）' });
    }, 600000);

    // Budget guard: enforceUsageLimit only covers the routes that *create* a
    // task. Scheduled jobs (the ai_schedules tick) and /tasks/:id/retry reach
    // runTask directly, so without this check a job on a 5-minute interval keeps
    // spending money all day after the daily cap was reached.
    if (usageLimitReached() || userUsageLimitReached(userId, role)) {
      finish('failed', { error: '今日 AI 用量已达上限，任务已停止' });
      return;
    }

    for (let i = 0; i < MAX_ITER; i++) {
      // Cancellation check (and the timeout's flag — the task is already marked
      // failed, so continuing would only burn provider calls)
      if (expired) return;
      const cur = db.prepare('SELECT status FROM AiTask WHERE id = ?').get(taskId) as any;
      if (cur?.status === 'cancelled') return;
      // Re-checked every round: a task that starts inside the budget can still
      // run past it, and a scheduled job runs unattended.
      if (i > 0 && (usageLimitReached() || userUsageLimitReached(userId, role))) {
        finish('failed', { error: '今日 AI 用量已达上限，任务已停止' });
        return;
      }

      const result = await chatComplete(provider, msgs, { tools });
      finalText = result.content;
      if (result.content) steps.push({ type: 'think', content: result.content.slice(0, 160), ts: Date.now() });
      updateTask(taskId, { steps: JSON.stringify(steps) });

      if (!result.toolCalls.length) break;

      pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
      const outputs = await Promise.all(result.toolCalls.map(async (tc) => {
        // No human is present in a background task, so a risky call is refused
        // rather than run — see executeToolUnattended.
        const output = await executeToolUnattended(tc.name, tc.args, ctx);
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

    // A refusal from executeToolUnattended only lives in the steps, and the
    // completion notice is built from the model's own text. If the model does
    // not mention it, the user gets "✅ 任务完成" for work that was never done —
    // so say it in the result regardless.
    const blocked = steps.filter((s: any) => s.type === 'tool' && typeof s.output?.error === 'string' && s.output.error.includes('需要人工确认'));
    if (blocked.length) {
      // Prepended, not appended: the notification truncates the summary to 80
      // characters, so a warning at the tail would be invisible in exactly the
      // "✅ 任务完成" case it exists to prevent.
      finalText = '⚠ 有 ' + blocked.length + ' 个操作因需要人工确认而未执行（' +
        blocked.map((s: any) => s.name).join('、') + '），请在 AI 对话中发起并确认。\n\n' + (finalText || '');
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Mark a single notification as read
router.post('/notifications/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE AiNotification SET read = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.post('/notifications/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE AiNotification SET read = 1 WHERE userId = ?').run(req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.post('/task', authenticate, enforceUsageLimit, (req: AuthRequest & SiteRequest, res: Response) => {
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
    // The request resolved to a site, so the task inherits and persists its scope
    // (persisted so a later retry cannot silently widen it).
    const taskSite = actingSiteId(req);
    const taskId = createTask(req.user!.userId, user?.username || 'user', prompt, taskSite);
    // Run in background without blocking the response
    setImmediate(() => { runTask(taskId, req.user!.userId, req.user!.role, user?.username || 'user', prompt, taskSite); });
    res.status(201).json({ id: taskId });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.get('/tasks', authenticate, (req: AuthRequest, res: Response) => {
  try {
    // "See every task" is the ai_tasks capability (admins always have it) —
    // otherwise this endpoint only ever returned the caller's own tasks.
    const canSeeAll = userCan(req.user, 'ai_tasks');
    const rows = canSeeAll
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.get('/tasks/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权查看该任务' }); return; }
    res.json(task);
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
  // Site this job runs against. Absent/null = no site scope, which on a
  // multi-site install means the job can reach every site (the tool layer only
  // narrows when siteId is set).
  siteId?: string | null;
  enabled: boolean;
  userId: string;
  username: string;
  lastRun: string | null;
  createdAt: string;
}

// The site this request may ACT on. The Host header decides which site a request
// looks like it belongs to, but the caller controls that header, so it only
// counts when the user is allowed there (utils/userSites.ts: admins always,
// users with no assignments as before, assigned users only their own). Otherwise
// the request is treated as site-less — global content only.
function actingSiteId(req: AuthRequest & SiteRequest): string | undefined {
  const siteId = req.siteId || undefined;
  if (!siteId) return undefined;
  return userMayAccessSite(req.user!.userId, req.user!.role, siteId) ? siteId : undefined;
}

// Absolute URL for a path this server hands out to be copied (share links).
//
// Order: the site this request resolved to, else the primary site; then that
// site's configured `site_url` (per-site override first — the same resolution the
// sitemap and feeds use), then its registered domain, and only then the request's
// own origin. Without this a share link copied during local setup was published
// as localhost, and on a multi-site install it followed whichever host the admin
// happened to be browsing.
function absoluteSiteUrl(req: AuthRequest & SiteRequest, path: string): string {
  let siteId = req.siteId || undefined;
  try {
    if (!siteId) siteId = (db.prepare('SELECT id FROM Site WHERE isPrimary = 1 AND active = 1 LIMIT 1').get() as any)?.id;
  } catch { /* no Site table: fall through to the request origin */ }
  let base = '';
  try { base = effectiveSetting(siteId, 'site_url') || ''; } catch { /* ignore */ }
  if (!base && siteId) {
    try {
      const domain = (db.prepare('SELECT domain FROM Site WHERE id = ?').get(siteId) as any)?.domain;
      if (domain) base = (req.protocol || 'http') + '://' + domain;
    } catch { /* ignore */ }
  }
  if (!base) base = (req.protocol || 'http') + '://' + (req.headers.host || 'localhost');
  return base.replace(/\/+$/, '') + path;
}

// Which site a persisted AI job may be bound to. Naming a site is an
// admin/editor privilege: the tool layer trusts ctx.siteId for isolation, so if
// any user could set it, scoping a job to another site would hand them that
// site's content. The site must also be one the caller may act on, so an editor
// with assignments cannot point a job at another site.
function resolveJobSite(req: AuthRequest, requested: any): string | null {
  if (!['admin', 'editor'].includes(req.user!.role)) return null;
  const id = String(requested || '').trim();
  if (!id) return null;
  try {
    if (!userMayAccessSite(req.user!.userId, req.user!.role, id)) return null;
    return db.prepare('SELECT id FROM Site WHERE id = ?').get(id) ? id : null;
  } catch { return null; }
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

// Scheduler tick: check every minute. unref'd so it never keeps the process
// alive on its own (the HTTP server does that); shutdown stops it via exit.
const aiScheduleTimer = setInterval(() => {
  try {
    const now = new Date();
    for (const s of getSchedules()) {
      if (!scheduleShouldRun(s, now)) continue;
      const updated = getSchedules().map(x => x.id === s.id ? { ...x, lastRun: now.toISOString() } : x);
      saveSchedules(updated); // claim the run to avoid double execution
      const user = db.prepare('SELECT id, role, username FROM User WHERE id = ?').get(s.userId) as any;
      if (!user || !isRoleAllowed(user.role)) continue;
      // The job's own site scope travels with it (see AiSchedule.siteId).
      const taskId = createTask(user.id, user.username, '[定时] ' + s.name + ': ' + s.prompt, s.siteId || undefined);
      setImmediate(() => { runTask(taskId, user.id, user.role, user.username, s.prompt, s.siteId || undefined); });
    }
  } catch { /* scheduler must never crash */ }
}, 60000);
aiScheduleTimer.unref?.();

router.get('/schedules', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const list = req.user!.role === 'admin' ? getSchedules() : getSchedules().filter(x => x.userId === req.user!.userId);
    res.json({ schedules: list });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.post('/schedules', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: 'Insufficient permissions' }); return; }
    const { name, prompt, type, intervalMinutes, time, weekday } = req.body || {};
    if (!name || !prompt || !['interval', 'daily', 'weekly'].includes(type)) { res.status(400).json({ error: 'name, prompt and type required' }); return; }
    const user = db.prepare('SELECT id, username FROM User WHERE id = ?').get(req.user!.userId) as any;
    const s: AiSchedule = {
      id: cuid(), name: String(name).slice(0, 50), prompt: String(prompt), type,
      intervalMinutes: type === 'interval' ? Math.max(5, parseInt(intervalMinutes) || 60) : undefined,
      time: type !== 'interval' ? (time || '09:00') : undefined,
      weekday: type === 'weekly' ? (parseInt(weekday) || 1) : undefined,
      siteId: resolveJobSite(req, (req.body || {}).siteId),
      enabled: true, userId: req.user!.userId, username: user?.username || 'user',
      lastRun: null, createdAt: new Date().toISOString(),
    };
    const list = getSchedules();
    list.push(s);
    saveSchedules(list);
    res.status(201).json(s);
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.delete('/schedules/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    let list = getSchedules();
    if (req.user!.role !== 'admin') list = list.filter(x => !(x.id === req.params.id && x.userId === req.user!.userId));
    else list = list.filter(x => x.id !== req.params.id);
    saveSchedules(list);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// AI review of pending comments (spam detection suggestion)
router.post('/review-comments', authenticate, enforceUsageLimit, async (req: AuthRequest, res: Response) => {
  try {
    // Reviewing comments exposes their content. Gate on the dedicated ai_review
    // capability so it is not a dead switch: before this, the endpoint checked
    // moderate_comments and revoking ai_review restricted nothing.
    if (!userCan(req.user, 'ai_review')) { res.status(403).json({ error: 'Insufficient permissions' }); return; }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
    // A provider that answers 200 with a non-JSON body makes res.json() throw a
    // SyntaxError quoting that body, so the failure text goes through the same
    // filter as every other AI error.
    const [ra, rb] = await Promise.all([
      chatComplete(a, [{ role: 'user', content: guardUserMessage(String(prompt)) }]).then(r => r.content).catch((e: any) => '❌ ' + userFacingAiError(e, '对比失败')),
      chatComplete(b, [{ role: 'user', content: guardUserMessage(String(prompt)) }]).then(r => r.content).catch((e: any) => '❌ ' + userFacingAiError(e, '对比失败')),
    ]);
    res.json({ a: { name: a.name, model: a.model, content: ra }, b: { name: b.name, model: b.model, content: rb } });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Batch translate posts into a target language (creates drafts)
router.post('/batch-translate', authenticate, enforceUsageLimit, async (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    const provider = getDefaultProvider();
    if (!provider) { res.status(400).json({ error: '尚未配置 AI 服务商' }); return; }
    const { ids, language } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 10) { res.status(400).json({ error: 'ids array (1-10) required' }); return; }
    const lang = String(language || 'English');
    // Only translate posts the caller may edit: authors own their posts,
    // editors/admins may translate anyone's. Otherwise an author could read
    // another user's draft/private content through the generated translation.
    const canEditOthers = userCan(req.user, 'edit_others_posts');
    const siteId = req.siteId || null;
    const posts = ids
      .map((id: string) => db.prepare("SELECT * FROM Post WHERE id = ? AND type = 'post'" + (siteId ? ' AND (siteId IS NULL OR siteId = ?)' : '')).get(...(siteId ? [id, siteId] : [id])) as any)
      .filter((p: any) => p && p.status !== 'trash' && (canEditOthers || p.authorId === req.user!.userId));
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
        db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, featured, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, newTitle, uniqueSlug(newTitle, allSlugs), prepareAiContent(body), (post.excerpt || '').slice(0, 300), 'draft', 'post', req.user!.userId, post.featured || null, siteId);
        purgeContentCaches();
        results.push({ source: post.title, id, title: newTitle, status: 'ok' });
      } catch (e: any) {
        results.push({ source: post.title, error: userFacingAiError(e, '翻译失败') });
      }
    }
    res.json({ results, total: results.length });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Share a chat session via public link
// A share link is public the moment it exists (GET /share/:token has no auth), so
// the stored row is built from a whitelist instead of trusting the client's
// message objects: ChatMsg also carries tool results (raw data the assistant
// fetched — settings, comments, draft bodies) and a pending approval token, and
// neither belongs in a publicly readable row. Size is capped too: this is a
// Setting row, and generic settings reads load the whole table.
const SHARE_TTL_MS = 30 * 24 * 3600 * 1000;
const SHARE_MAX_MESSAGES = 50;
const SHARE_MAX_CHARS = 4000;

function normalizeShareMessages(raw: any): { role: 'user' | 'assistant'; content: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
    .slice(-SHARE_MAX_MESSAGES)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, SHARE_MAX_CHARS) }));
}

// Creating a share writes a public row, so it gets its own per-user limit rather
// than relying on the global per-IP one.
const shareTimes = new Map<string, number[]>();
function shareRateLimited(userId: string): boolean {
  const now = Date.now();
  const hits = (shareTimes.get(userId) || []).filter(t => now - t < 60_000);
  hits.push(now);
  shareTimes.set(userId, hits);
  if (shareTimes.size > 5000) for (const [k, v] of shareTimes) if (!v.some(t => now - t < 60_000)) shareTimes.delete(k);
  return hits.length > 10;
}

router.post('/share', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const messages = normalizeShareMessages((req.body || {}).messages);
    if (messages.length === 0) { res.status(400).json({ error: 'messages required' }); return; }
    if (shareRateLimited(req.user!.userId)) { res.status(429).json({ error: '分享过于频繁，请稍后再试' }); return; }
    const token = require('crypto').randomBytes(12).toString('hex');
    const expiresAt = new Date(Date.now() + SHARE_TTL_MS).toISOString();
    const value = JSON.stringify({
      userId: req.user!.userId,
      username: (db.prepare('SELECT username FROM User WHERE id = ?').get(req.user!.userId) as any)?.username,
      messages,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_share_' || ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run('ai_share_' + token, token, value);
    // Absolute, not relative: the client used to prefix window.location.origin,
    // so a link copied while working on localhost:3001 was published as
    // "http://localhost:3001/share/ai/…" even though the site has a domain.
    res.json({ url: absoluteSiteUrl(req, '/share/ai/' + token), token, expiresAt });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.get('/share/:token', (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_share_' || ?").get(req.params.token) as any;
    if (!row) { res.status(404).json({ error: '分享不存在或已失效' }); return; }
    let data: any = {};
    try { data = JSON.parse(row.value); } catch { res.status(404).json({ error: '分享不存在或已失效' }); return; }
    if (data?.expiresAt && String(data.expiresAt) < new Date().toISOString()) {
      res.status(404).json({ error: '分享链接已过期' }); return;
    }
    // Only what the page renders: the internal userId, and any extra fields a
    // row written before this hardening still carries, stay server-side.
    res.json({
      username: data.username || '',
      createdAt: data.createdAt || '',
      expiresAt: data.expiresAt || '',
      messages: normalizeShareMessages(data.messages),
    });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Revoke a share link: its author, or an admin.
router.delete('/share/:token', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const key = 'ai_share_' + req.params.token;
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any;
    if (!row) { res.status(404).json({ error: '分享不存在或已失效' }); return; }
    let owner = '';
    try { owner = JSON.parse(row.value)?.userId || ''; } catch { /* legacy row */ }
    if (req.user!.role !== 'admin' && owner !== req.user!.userId) { res.status(403).json({ error: '无权撤销该分享' }); return; }
    db.prepare('DELETE FROM Setting WHERE key = ?').run(key);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Long-term memory management
router.get('/memories', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = req.user!.role === 'admin'
      ? db.prepare('SELECT m.*, u.username FROM AiMemory m LEFT JOIN User u ON u.id = m.userId ORDER BY m.updatedAt DESC').all()
      : db.prepare('SELECT key, value, updatedAt FROM AiMemory WHERE userId = ? ORDER BY updatedAt DESC').all(req.user!.userId);
    res.json({ memories: rows });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.delete('/memories/:key', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const key = req.params.key;
    if (req.user!.role === 'admin') db.prepare('DELETE FROM AiMemory WHERE key = ?').run(key);
    else db.prepare('DELETE FROM AiMemory WHERE userId = ? AND key = ?').run(req.user!.userId, key);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// ---- Chat sessions (server-side persistence, cross-device) ----

function parseSessionMessages(raw: any): string {
  if (!Array.isArray(raw)) return '[]';
  const cleaned = raw
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m: any) => {
      const msg: any = { role: m.role, content: String(m.content || '').slice(0, 20000), ts: m.ts || Date.now() };
      // A pending plan is a signed, user-bound, single-use token with a 10 minute
      // TTL, so storing it with the session is safe — and it is what makes the
      // confirmation card survive a reload on another device. Without it the text
      // still said "需要你确认后执行" while the button was gone.
      if (m.pending && typeof m.pending.token === 'string' && m.pending.token) {
        msg.pending = {
          token: m.pending.token,
          calls: Array.isArray(m.pending.calls)
            ? m.pending.calls.slice(0, 10).map((c: any) => ({
                id: String(c?.id || ''), name: String(c?.name || ''), summary: String(c?.summary || '').slice(0, 300),
              }))
            : [],
        };
      }
      return msg;
    })
    .slice(-100);
  return JSON.stringify(cleaned);
}

// List current user's sessions (summaries only)
router.get('/sessions', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, title, createdAt, updatedAt, LENGTH(messages) as size FROM AiSession WHERE userId = ? ORDER BY updatedAt DESC LIMIT 50').all(req.user!.userId) as any[];
    res.json({ sessions: rows });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Full session (messages)
router.get('/sessions/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM AiSession WHERE id = ? AND userId = ?').get(req.params.id, req.user!.userId) as any;
    if (!row) { res.status(404).json({ error: '会话不存在' }); return; }
    let messages: any[] = [];
    try { messages = JSON.parse(row.messages || '[]'); } catch {}
    res.json({ id: row.id, title: row.title, messages });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Delete all sessions for the current user
router.delete('/sessions', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM AiSession WHERE userId = ?').run(req.user!.userId);
    res.json({ success: true, deleted: r.changes });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Delete a session
router.delete('/sessions/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM AiSession WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Direct vision/image-gen helpers (UI-facing wrappers around the tools).
// These consume paid provider calls, so they go through the same daily budget
// and per-user throttle as every other AI endpoint — they used to bypass both,
// which made them the cheapest way to burn the account's quota.
const imageLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, message: { error: 'Too many image requests, slow down' } });
// Rough cost of one image request, expressed in the token unit the budget uses.
const IMAGE_TOKEN_EQUIVALENT = 5000;

// Kept per user AND per operation: analysing an image and then generating one is
// a normal sequence (the Media page offers both), so they must not throttle each
// other — only rapid repeats of the same operation are suppressed.
function throttledAiRequest(userId: string, kind: string): boolean {
  const key = userId + ':' + kind;
  const now = Date.now();
  const last = lastAiRequest.get(key) || 0;
  if (now - last < AI_MIN_INTERVAL_MS) return true;
  lastAiRequest.set(key, now);
  return false;
}

router.post('/vision', authenticate, imageLimiter, enforceUsageLimit, async (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    if (throttledAiRequest(req.user!.userId, 'vision')) { res.status(429).json({ error: '请求过于频繁，请稍后再试' }); return; }
    const { url, question } = req.body || {};
    if (!url) { res.status(400).json({ error: 'url required' }); return; }
    const out = await executeTool('analyze_image', { url, question: question || '' }, { userId: req.user!.userId, role: req.user!.role, siteId: actingSiteId(req) });
    if (!out?.error) recordUsage(req.user!.userId, 'vision', String(out?.analysis || out?.text || ''), undefined, IMAGE_TOKEN_EQUIVALENT);
    res.json(out);
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.post('/image-gen', authenticate, imageLimiter, enforceUsageLimit, async (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: '无权限' }); return; }
    if (throttledAiRequest(req.user!.userId, 'image-gen')) { res.status(429).json({ error: '请求过于频繁，请稍后再试' }); return; }
    const { prompt, size } = req.body || {};
    if (!prompt) { res.status(400).json({ error: 'prompt required' }); return; }
    const out = await executeTool('generate_image', { prompt, size }, { userId: req.user!.userId, role: req.user!.role, siteId: actingSiteId(req) });
    if (!out?.error) recordUsage(req.user!.userId, 'image-gen', '', undefined, IMAGE_TOKEN_EQUIVALENT);
    res.json(out);
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Admin: AI operation audit log (sandbox traceability)
router.get('/audit', authenticate, requireCap('ai_manage'), (req: AuthRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM AiAudit ORDER BY createdAt DESC LIMIT 100').all();
    res.json({ logs });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.post('/tasks/:id/retry', authenticate, enforceUsageLimit, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    if (!task) { res.status(404).json({ error: '任务不存在' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: '无权操作该任务' }); return; }
    const user = db.prepare('SELECT id, role, username FROM User WHERE id = ?').get(task.userId) as any;
    // The retry inherits the original task's site, not the retrying admin's: a
    // retry used to carry no scope at all, which silently widened a site-scoped
    // task into one that could touch every site.
    const newId = createTask(task.userId, user?.username || task.username || 'user', task.prompt, task.siteId || undefined);
    // The run belongs to the task's owner, so it carries THEIR role — not the
    // retrying admin's. Passing the caller's role let an admin's retry of a
    // contributor's task execute with admin tool permissions, and skipped the
    // owner's per-user budget (userUsageLimitReached exempts admins).
    setImmediate(() => { runTask(newId, task.userId, user?.role || '', user?.username || task.username || 'user', task.prompt, task.siteId || undefined); });
    res.status(201).json({ id: newId });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.delete('/tasks/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const task = getTask(req.params.id);
    // Ownership check BEFORE any write — otherwise any logged-in user could
    // delete another user's notifications by guessing the task id.
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    if (req.user!.role !== 'admin' && task.userId !== req.user!.userId) { res.status(403).json({ error: 'Not allowed to delete this task' }); return; }
    withTransaction(() => {
      db.prepare('DELETE FROM AiNotification WHERE taskId = ?').run(req.params.id);
      db.prepare('DELETE FROM AiTask WHERE id = ?').run(req.params.id);
    });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// ---- Bindings (WeChat / DingTalk) ----

interface Binding {
  id: string;
  platform: string;   // wechat | dingtalk
  label: string;
  token: string;      // secret webhook token
  wechatToken?: string; // Token configured on WeChat MP — used for URL verification
  // DingTalk enterprise bot (callback protocol)
  ddToken?: string;      // callback verification token
  ddAesKey?: string;     // callback AES key (43 chars)
  ddAppKey?: string;     // app key for access_token + active reply
  ddAppSecret?: string;  // app secret
  // DingTalk group custom robot (outbound push)
  ddWebhook?: string;    // group robot webhook URL
  ddSecret?: string;     // group robot signing secret (optional)
  // Site the bot's AI replies are scoped to. Absent/null = no scope, i.e. the
  // bot can reach every site on a multi-site install.
  siteId?: string | null;
  userId: string;
  username: string;
  createdAt: string;
  lastUsedAt: string | null;
}

// Bindings hold third-party credentials (ddAppSecret, wechatToken, ddAesKey,
// webhook tokens), so they are encrypted at rest with the same cipher as the
// provider keys — a leaked database backup must not hand those out. Legacy
// plaintext rows are read as-is and re-encrypted on the next save.
function getBindings(): Binding[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_bindings'").get() as any;
  if (!row?.value) return [];
  const raw = String(row.value);
  try {
    const parsed = isEncryptedSecret(raw) ? decryptSecretJson<Binding[]>(raw) : JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveBindings(bindings: Binding[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_bindings', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_bindings', encryptSecretJson(bindings));
}

// List bindings (admin) or own (regular users). Tokens are returned in full:
// the webhook URL and WeChat token must be copyable for external configuration.
router.get('/bindings', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const all = getBindings();
    const list = req.user!.role === 'admin' ? all : all.filter(b => b.userId === req.user!.userId);
    res.json({ bindings: list });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Create a binding (admin picks the target user; users can bind themselves)
router.post('/bindings', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (!isRoleAllowed(req.user!.role)) { res.status(403).json({ error: 'Insufficient permissions' }); return; }
    const { platform, userId, label, ddToken, ddAesKey, ddAppKey, ddAppSecret, ddWebhook, ddSecret } = req.body || {};
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
      // WeChat MP asks for a developer Token — pre-generate one the user
      // pastes into the MP console (also used for URL-verification signing)
      wechatToken: platform === 'wechat' ? require('crypto').randomBytes(12).toString('hex') : undefined,
      // DingTalk enterprise-bot callback config + group robot (outbound)
      ...(platform === 'dingtalk' ? { ddToken: String(ddToken || ''), ddAesKey: String(ddAesKey || ''), ddAppKey: String(ddAppKey || ''), ddAppSecret: String(ddAppSecret || ''), ddWebhook: String(ddWebhook || ''), ddSecret: String(ddSecret || '') } : {}),
      siteId: resolveJobSite(req, (req.body || {}).siteId),
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    const all = getBindings();
    all.push(b);
    saveBindings(all);
    res.status(201).json({ binding: b });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Update a binding's config (labels / DingTalk credentials)
router.put('/bindings/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const all = getBindings();
    const idx = all.findIndex(b => b.id === req.params.id && (req.user!.role === 'admin' || b.userId === req.user!.userId));
    if (idx === -1) { res.status(404).json({ error: '绑定不存在' }); return; }
    const body = req.body || {};
    const upd: Partial<Binding> = {};
    if (typeof body.label === 'string') upd.label = body.label;
    for (const k of ['ddToken', 'ddAesKey', 'ddAppKey', 'ddAppSecret', 'ddWebhook', 'ddSecret'] as const) {
      if (typeof body[k] === 'string') upd[k] = body[k];
    }
    // Only a caller who may choose a site can change the scope, and for them an
    // explicit '' clears it. For anyone else the field is IGNORED, not resolved
    // to null: nulling it would let the owner of a scoped binding silently widen
    // it back to every site — a restriction the restricted party can lift.
    if (body.siteId !== undefined && ['admin', 'editor'].includes(req.user!.role)) {
      upd.siteId = resolveJobSite(req, body.siteId);
    }
    all[idx] = { ...all[idx], ...upd };
    saveBindings(all);
    res.json({ binding: all[idx] });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

router.delete('/bindings/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    let all = getBindings();
    if (req.user!.role !== 'admin') all = all.filter(b => !(b.id === req.params.id && b.userId === req.user!.userId));
    else all = all.filter(b => b.id !== req.params.id);
    saveBindings(all);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
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
    const reply = await runWebhookReply(binding, message);
    res.json({ reply });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// ---- WeChat Official Account (公众号) protocol ----
// 1) URL verification (GET): WeChat MP console sends
//    signature/timestamp/nonce/echostr; we sign (token+timestamp+nonce) and
//    echo echostr back. The "token" here is the developer Token the user
//    pastes from the MP console (binding.wechatToken).
// 2) Messages (POST): plain-text XML from WeChat; reply with text XML so the
//    reply is pushed to the user in the chat.

// sha1 of the lexicographically sorted concatenation — WeChat's algorithm
export function verifyWechatSignature(token: string, timestamp: string, nonce: string, signature: string): boolean {
  if (!token || !timestamp || !nonce || !signature) return false;
  const str = [token, timestamp, nonce].sort().join('');
  return require('crypto').createHash('sha1').update(str).digest('hex') === signature;
}

// Parse a WeChat plain-text message XML (fixed structure, CDATA or raw text)
export function parseWechatXml(xml: string): { toUser: string; fromUser: string; content: string } {
  const grab = (tag: string) => {
    const m = new RegExp('<' + tag + '>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))</' + tag + '>').exec(xml);
    return (m ? (m[1] !== undefined ? m[1] : m[2]) : '').trim();
  };
  return { toUser: grab('ToUserName'), fromUser: grab('FromUserName'), content: grab('Content') };
}

export function buildWechatReplyXml(toUser: string, fromUser: string, content: string): string {
  const cdata = (s: string) => '<![CDATA[' + String(s).replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
  return '<xml>' +
    '<ToUserName>' + cdata(toUser) + '</ToUserName>' +
    '<FromUserName>' + cdata(fromUser) + '</FromUserName>' +
    '<CreateTime>' + Math.floor(Date.now() / 1000) + '</CreateTime>' +
    '<MsgType>' + cdata('text') + '</MsgType>' +
    '<Content>' + cdata(content) + '</Content>' +
    '</xml>';
}

// Shared AI pipeline for webhook entries (JSON generic + WeChat XML)
async function runWebhookReply(binding: Binding, message: string): Promise<string> {
  const user = db.prepare('SELECT id, role FROM User WHERE id = ?').get(binding.userId) as any;
  if (!user) return '绑定的用户不存在';

  // Update last used
  const all = getBindings().map((b: Binding) => b.id === binding.id ? { ...b, lastUsedAt: new Date().toISOString() } : b);
  saveBindings(all);

  const provider = getDefaultProvider();
  if (!provider) return 'AI 服务商尚未配置，请联系管理员。';
  if (!isRoleAllowed(user.role)) return '你的角色无权使用 AI 功能。';
  // All three callback routes (generic / dingtalk / wechat) funnel through here,
  // and this path used to skip the daily budget entirely — a bound bot was a free
  // way around the cap. Reply with the reason rather than an HTTP error, since the
  // caller is a chat bot rendering the response as the message.
  if (usageLimitReached() || userUsageLimitReached(user.id, user.role)) {
    return '今日 AI 用量已达上限，请稍后再试或联系管理员。';
  }

  const tools = listToolSchemas(user.role);
  // The binding's site scope (if its owner set one) applies to the replies and to
  // the snapshot, exactly as it does for a scheduled job.
  const msgs: any[] = [
    { role: 'system', content: SYSTEM_PROMPT + ' 当前用户: ' + binding.username + '。\n' + buildSiteContext(binding.siteId || undefined) + memoryPrompt(user.id) + (tools.length ? '\n可用的工具: ' + tools.map(t => t.function.name).join(', ') : '') },
    { role: 'user', content: guardUserMessage(message) },
  ];
  const ctx = { userId: user.id, role: user.role, siteId: binding.siteId || undefined };

  let reply = '';
  const MAX_ITER = 6;
  for (let i = 0; i < MAX_ITER; i++) {
    const result = await chatComplete(provider, msgs, { tools });
    reply = result.content;
    if (!result.toolCalls.length) break;
    pushAssistantWithTools(msgs, result.content, result.toolCalls, provider.type);
    // Unattended: a bound bot has no way to ask a human, so risky calls are
    // refused rather than executed (see executeToolUnattended).
    const results = await Promise.all(result.toolCalls.map(async (tc) => ({
      id: tc.id, output: JSON.stringify(await executeToolUnattended(tc.name, tc.args, ctx)),
    })));
    pushToolResults(msgs, results, provider.type);
    if (i === MAX_ITER - 1) reply = '已达到工具调用次数上限，请简化问题重试。';
  }

  recordUsage(user.id, 'webhook', reply, provider.model);
  return reply;
}

// ---- DingTalk protocol ----
// Enterprise bot callback (HTTP mode): DingTalk POSTs { encrypt } with
// timestamp/sign headers; we verify, AES-CBC decrypt, check the inner
// msgSignature, then reply ACTIVELY via the robot API (the HTTP response is
// only an ack). Group custom robots are outbound: we POST to their webhook.

const crypto = require('crypto');

// 43-char AES key + '=' base64-decodes to the 32-byte AES key
function ddAesKeyBuf(aesKey: string): Buffer { return Buffer.from(String(aesKey) + '=', 'base64'); }

// AES-CBC decrypt with PKCS7 unpadding (DingTalk's fixed scheme: IV = key[0..16))
export function dingtalkDecrypt(aesKey: string, encrypt: string): string {
  const key = ddAesKeyBuf(aesKey);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, key.subarray(0, 16));
  decipher.setAutoPadding(false);
  let plain = Buffer.concat([decipher.update(Buffer.from(String(encrypt), 'base64')), decipher.final()]);
  const pad = plain.length ? plain[plain.length - 1] : 0;
  if (pad > 0 && pad <= 16) plain = plain.subarray(0, plain.length - pad);
  return plain.toString('utf8');
}

// Inner msgSignature: sha1 of lexicographically sorted [token, timeStamp, nonce, encrypt]
export function dingtalkVerifyMsgSignature(token: string, timeStamp: string, nonce: string, encrypt: string, msgSignature: string): boolean {
  const str = [token, timeStamp, nonce, encrypt].sort().join('');
  return crypto.createHash('sha1').update(str).digest('hex') === msgSignature;
}

// Callback request header sign (new API): HMAC-SHA256(appSecret, timestamp) hex
export function dingtalkCallbackSign(appSecret: string, timestamp: string): string {
  return crypto.createHmac('sha256', String(appSecret)).update(String(timestamp)).digest('hex');
}

// Group custom robot outbound push (optional signing secret)
export async function sendDingtalkGroup(webhook: string, secret: string, content: string): Promise<{ ok: boolean; error?: string }> {
  try {
    let url = webhook;
    if (secret) {
      const ts = Date.now().toString();
      const sign = crypto.createHmac('sha256', secret).update(ts + '\n' + secret).digest('base64');
      url += (url.includes('?') ? '&' : '?') + 'timestamp=' + ts + '&sign=' + encodeURIComponent(sign);
    }
    // The webhook URL is set by the binding's owner, so it is not ours to trust:
    // route it through the SSRF guard (which also applies a timeout and caps the
    // response) instead of a bare fetch that could POST into the internal network.
    const r = await fetchUrlGuarded(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msgtype: 'text', text: { content } }),
      timeoutMs: 15000,
    });
    if (!r) return { ok: false, error: '无法访问该 Webhook（地址被拒绝或超时）' };
    let d: any = {};
    try { d = JSON.parse(r.text || '{}'); } catch { /* non-JSON reply */ }
    return d?.errcode === 0 ? { ok: true } : { ok: false, error: d?.errmsg || 'HTTP ' + r.status };
  } catch (e: any) { return { ok: false, error: e.message }; }
}

// Active reply to a user (enterprise internal robot, oToMessages API)
async function ddAccessToken(appKey: string, appSecret: string): Promise<string> {
  try {
    const r = await fetch('https://oapi.dingtalk.com/gettoken?appkey=' + encodeURIComponent(appKey) + '&appsecret=' + encodeURIComponent(appSecret));
    const d: any = await r.json();
    return d?.access_token || '';
  } catch { return ''; }
}

async function sendDingtalkBotReply(binding: Binding, userIds: string[], content: string): Promise<{ ok: boolean; error?: string }> {
  if (!binding.ddAppKey || !binding.ddAppSecret) return { ok: false, error: 'AppKey/AppSecret 未配置' };
  const token = await ddAccessToken(binding.ddAppKey, binding.ddAppSecret);
  if (!token) return { ok: false, error: '获取钉钉 access_token 失败' };
  try {
    const r = await fetch('https://oapi.dingtalk.com/robot/oToMessages/batchSend?access_token=' + token, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ robotCode: binding.ddAppKey, userIds, msg: { msgtype: 'text', text: { content } } }),
    });
    const d: any = await r.json();
    return d?.errcode === 0 ? { ok: true } : { ok: false, error: d?.errmsg || 'HTTP ' + r.status };
  } catch (e: any) { return { ok: false, error: e.message }; }
}

// DingTalk enterprise-bot callback: /ai/webhook/dingtalk/:token
router.post('/webhook/dingtalk/:token', webhookLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const binding = getBindings().find(b => b.platform === 'dingtalk' && b.token === req.params.token);
    if (!binding?.ddAesKey || !binding.ddToken) { res.status(404).json({ error: 'invalid binding' }); return; }
    // 1) request header signature (timestamp + HMAC-SHA256(appSecret, timestamp))
    const ts = String(req.headers.timestamp || '');
    const sign = String(req.headers.sign || '');
    if (binding.ddAppSecret && (!ts || !sign || dingtalkCallbackSign(binding.ddAppSecret, ts) !== sign)) {
      res.status(403).json({ error: 'signature check failed' }); return;
    }
    // 2) decrypt + inner msgSignature check
    const encrypt = String((req.body || {}).encrypt || '');
    if (!encrypt) { res.status(400).json({ error: 'empty payload' }); return; }
    let event: any;
    try { event = JSON.parse(dingtalkDecrypt(binding.ddAesKey, encrypt)); } catch { res.status(400).json({ error: 'decrypt failed' }); return; }
    if (!dingtalkVerifyMsgSignature(binding.ddToken, String(event.timeStamp || ''), String(event.nonce || ''), encrypt, String(event.msgSignature || ''))) {
      res.status(403).json({ error: 'msgSignature check failed' }); return;
    }
    // 3) handle text messages from users
    const ev = typeof event.event === 'string' ? (() => { try { return JSON.parse(event.event); } catch { return {}; } })() : (event.event || {});
    const content = String(ev?.text?.content || ev?.content || '').trim();
    const senderId = String(ev?.senderStaffId || ev?.senderId || '');
    if (content && senderId) {
      const reply = await runWebhookReply(binding, content);
      await sendDingtalkBotReply(binding, [senderId], reply);
    }
    res.json({ msg: 'ok' });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// Admin: test-push to the group custom robot
router.post('/bindings/:id/test-group', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const binding = getBindings().find(b => b.id === req.params.id && (req.user!.role === 'admin' || b.userId === req.user!.userId));
    if (!binding?.ddWebhook) { res.status(400).json({ error: '钉钉群机器人 Webhook 未配置' }); return; }
    const content = String((req.body || {}).message || '').trim();
    if (!content) { res.status(400).json({ error: '消息为空' }); return; }
    const r = await sendDingtalkGroup(binding.ddWebhook, binding.ddSecret || '', content);
    res.json(r.ok ? { success: true } : { success: false, error: r.error });
  } catch (err: any) { res.status(500).json({ error: userFacingAiError(err) }); }
});

// WeChat endpoint: /ai/webhook/wechat/:token
router.get('/webhook/wechat/:token', (_req: AuthRequest, res: Response) => {
  try {
    const binding = getBindings().find(b => b.platform === 'wechat' && b.token === _req.params.token);
    if (!binding?.wechatToken) { res.status(404).send('invalid binding'); return; }
    const { signature, timestamp, nonce, echostr } = _req.query as Record<string, string>;
    if (!verifyWechatSignature(binding.wechatToken, timestamp || '', nonce || '', signature || '')) {
      res.status(403).send('signature check failed');
      return;
    }
    res.type('text/plain').send(echostr || '');
  } catch { res.status(500).send('error'); }
});

router.post('/webhook/wechat/:token', webhookLimiter, require('express').text({ type: ['text/xml', 'application/xml', 'text/plain'] }), async (req: AuthRequest, res: Response) => {
  try {
    const binding = getBindings().find(b => b.platform === 'wechat' && b.token === req.params.token);
    if (!binding?.wechatToken) { res.status(404).send('invalid binding'); return; }
    const xml = String(req.body || '');
    const msg = parseWechatXml(xml);
    if (!msg.content) { res.type('application/xml').send(buildWechatReplyXml(msg.toUser, msg.fromUser, '消息为空')); return; }
    const reply = await runWebhookReply(binding, msg.content);
    res.type('application/xml').send(buildWechatReplyXml(msg.toUser, msg.fromUser, reply));
  } catch (err: any) {
    res.status(500).type('application/xml').send(buildWechatReplyXml('', '', '服务暂时不可用'));
  }
});

export default router;
