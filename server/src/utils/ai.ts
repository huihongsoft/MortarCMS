import db from './db';
import { logger } from './logger';

// ---- Errors shown to users vs. errors kept in the log ----
//
// A provider's error body is written by the provider, not by us: it routinely
// quotes account and org ids, quota state, request ids, internal endpoints, and
// sometimes the offending key itself ("Incorrect API key provided: sk-abc…").
// None of that belongs in a task error, a chat bubble or a toast, so the raw
// body goes to the server log and the thrown error carries only the status.
// Same rule for anything else: a message we did not write is not user-facing.

// Strip credential-shaped substrings before they reach the log file. Exported
// so the test can pin the shapes that must not survive into a log line.
export function scrubSecrets(s: string): string {
  return String(s || '')
    // key-ish names with a separator (sk-live-…, api_key-…)
    .replace(/\b(?:sk|pk|rk|api|key|token|secret)[-_][A-Za-z0-9_-]{8,}/gi, '[redacted]')
    // Slack-style and other vendor prefixes
    .replace(/\b(?:xox[baprs]|ghp|gho|glpat|AKIA)[-_A-Za-z0-9]{8,}/gi, '[redacted]')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{8,}/gi, '$1[redacted]')
    .replace(/(Authorization:\s*\w+\s+)[A-Za-z0-9._-]{3,}/gi, '$1[redacted]')
    // Secret-ish headers (x-api-key: …) — same minimum length as the query rule,
    // so a short test key does not survive in the log on one path and not the other
    .replace(/\b((?:x-api-key|x-auth-token)\s*:\s*)[A-Za-z0-9._-]{3,}/gi, '$1[redacted]')
    // Secrets carried in a query string or form body (webhook URLs, OAuth). The
    // \b matters: without it "design=" and "assign=" match "sign=".
    .replace(/\b((?:access_token|refresh_token|api_?key|apikey|secret|sign|sig|signature|password|passwd|token|key)=)[^&\s"'<>]{3,}/gi, '$1[redacted]')
    // The same names as JSON pairs ({"access_token":"…"}) — where the separator
    // is a quote and colon rather than '='.
    .replace(/("(?:access_token|refresh_token|api_?key|apikey|secret|sign|sig|signature|password|passwd|token|key)"\s*:\s*")[^"]{3,}(")/gi, '$1[redacted]$2');
}

export function logAiDetail(kind: string, detail: string, extra: Record<string, any> = {}): void {
  try { logger.warn({ ...extra, detail: scrubSecrets(detail).slice(0, 1000) }, kind); } catch { /* logging must never throw */ }
}

// Errors we raise ourselves carry a message written for the user. Prefixes are
// matched explicitly so the list is a whitelist, not a guess: anything else
// (engine text, file paths, SQL, provider bodies) is replaced and logged.
const USER_FACING_PREFIXES = [
  'AI 请求失败', 'AI 请求超时', 'AI 工具调用异常', 'AI 服务商',
  '尚未配置', '未配置 AI', '未找到文章', '你的角色无权', '当前角色无',
  '请求太频繁', '请求过于频繁', '今日 AI 用量', '今日个人 AI 用量',
  '任务执行超时', '任务执行失败', '工具执行失败', '没有权限使用该工具',
  '无法连接 AI 服务商',
];

// The fallback is only ever reached by an *internal* failure: a provider that
// misbehaved already arrives as a whitelisted message ('AI 请求失败 (401)',
// 'AI 请求超时…') or as the network shape below. So the default stays neutral —
// these routes (sessions, bindings, memories, share, notifications, tasks) are
// not AI calls, and blaming the provider for a storage error misleads the person
// trying to fix it.
export function userFacingAiError(err: any, fallback = '操作失败，请稍后重试'): string {
  const msg = String((err && (err.message || err)) || '');
  if (msg && USER_FACING_PREFIXES.some(p => msg.startsWith(p))) return msg;
  // `cause` is where fetch hides the real story ("connect ECONNREFUSED host:port");
  // it belongs in the log even though the user must not see it.
  const cause = String((err && err.cause && (err.cause.message || err.cause)) || '');
  logAiDetail('ai error withheld from the client', cause ? msg + ' <- ' + cause : msg || String(err));
  // A failed connection reports the host and port it tried ("connect
  // ECONNREFUSED 127.0.0.1:11434"). The shape is worth keeping, the address is
  // not — so answer with a message we wrote instead of the engine's.
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|fetch failed|socket hang up|network/i.test(msg)) {
    return '无法连接 AI 服务商，请检查网络或服务商配置后重试';
  }
  return fallback;
}

// A failed provider call: the status is the user's business, the body is not.
export function providerError(status: number, detail: string): Error {
  logAiDetail('ai provider request failed', detail, { status });
  const e = new Error('AI 请求失败 (' + status + ')');
  // The status rides on the error so the fallback chain can tell "this provider
  // is in trouble" from "our request is wrong". The message is unchanged —
  // userFacingAiError matches on it.
  (e as any).status = status;
  return e;
}

// ---- AI provider configuration (persisted in the Setting table) ----

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  vision?: boolean;   // supports image input (e.g. gpt-4o)
  imageGen?: boolean; // supports /images/generations (e.g. dall-e-3, gpt-image-1)
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: any;
  tool_call_id?: string;
  tool_calls?: any[]; // OpenAI wire format, set on assistant messages that invoked tools
}

export interface AIToolFunction {
  type: 'function';
  function: { name: string; description: string; parameters: any };
}

export interface AIToolCall {
  id: string;
  name: string;
  args: any;
}

export interface ChatResult {
  content: string;
  toolCalls: AIToolCall[];
}

// Default provider templates so the UI can offer one-click presets
export const PROVIDER_PRESETS = [
  { id: 'openai', name: 'OpenAI (GPT)', type: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { id: 'anthropic', name: 'Anthropic (Claude)', type: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-5' },
  { id: 'deepseek', name: 'DeepSeek', type: 'openai', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { id: 'qwen', name: '通义千问 (Qwen)', type: 'openai', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { id: 'glm', name: '智谱 GLM', type: 'openai', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { id: 'kimi', name: 'Kimi (Moonshot)', type: 'openai', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { id: 'ollama', name: 'Ollama (本地)', type: 'openai', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
  { id: 'custom', name: '自定义 (OpenAI 兼容)', type: 'openai', baseUrl: '', model: '' },
];

// Provider API keys are encrypted at rest (AES-256-GCM) so a database backup
// or export leak does not expose credentials. The envelope lives in
// utils/secretBox, which has no database import — db.ts needs the same helpers
// for the migration that encrypts existing TOTP secrets, and importing them from
// here would make db.ts → ai.ts → db.ts a cycle. Re-exported because these names
// are this module's public API (routes/ai.ts imports them from here).
import { encryptSecretJson, decryptSecretJson, isEncryptedSecret } from './secretBox';
// Re-exported so existing importers (routes/ai.ts) keep working unchanged.
export { encryptSecretJson, decryptSecretJson, isEncryptedSecret };

function encryptProviders(providers: AIProvider[]): string {
  return encryptSecretJson(providers);
}

function decryptProviders(value: string): AIProvider[] | null {
  const list = decryptSecretJson<AIProvider[]>(value);
  return Array.isArray(list) ? list : null;
}

export function getProviders(): AIProvider[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_providers'").get() as any;
  if (!row?.value) return [];
  const raw = String(row.value);
  try {
    const list = isEncryptedSecret(raw)
      ? decryptProviders(raw)
      : JSON.parse(raw) as AIProvider[]; // legacy plaintext
    return Array.isArray(list) ? list : [];
  } catch (e: any) {
    // Returning [] silently turned "the ciphertext no longer decrypts" (a changed
    // JWT_SECRET, or a database restored onto another instance) into "no provider
    // is configured", so the only clue was a misleading error message.
    logAiDetail('ai provider config unreadable', String(e?.message || e), {});
    return [];
  }
}

export function saveProviders(providers: AIProvider[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_providers', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_providers', encryptProviders(providers));
}

export function getDefaultProvider(): AIProvider | null {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_default_provider'").get() as any;
  const providers = getProviders();
  if (row?.value) {
    const p = providers.find((x: any) => x.id === row.value && x.enabled);
    if (p) return p;
  }
  return providers.find((x: any) => x.enabled) || null;
}

export function setDefaultProvider(id: string): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_default_provider', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_default_provider', id);
}

// ---- Chat completion ----

function buildOpenAIUrl(provider: AIProvider): string {
  return provider.baseUrl.replace(/\/$/, '') + '/chat/completions';
}

// Parse SSE stream from an OpenAI-compatible endpoint.
// Accumulates both text deltas AND tool_call deltas (providers stream
// tool calls as deltas too when tools are enabled).
async function readOpenAIStream(res: Response, onDelta: (text: string) => void): Promise<{ content: string; toolCalls: AIToolCall[] }> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let full = '';
  const acc: Record<number, { id: string; name: string; args: string }> = {};
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const data = t.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const j: any = JSON.parse(data);
        const delta = j.choices?.[0]?.delta;
        if (delta?.content) { full += delta.content; onDelta(delta.content); }
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            acc[idx] = acc[idx] || { id: '', name: '', args: '' };
            if (tc.id) acc[idx].id = tc.id;
            // Streaming sends the full name in the first chunk (not incremental)
            if (tc.function?.name && !acc[idx].name) acc[idx].name = tc.function.name;
            if (tc.function?.arguments) acc[idx].args += tc.function.arguments;
          }
        }
      } catch { /* ignore partial JSON */ }
    }
  }
  const toolCalls: AIToolCall[] = Object.values(acc).map(t => {
    let args: any = {};
    try { args = JSON.parse(t.args || '{}'); } catch {}
    return { id: t.id, name: t.name, args };
  });
  return { content: full, toolCalls };
}

async function openaiChat(provider: AIProvider, messages: AIMessage[], tools: AIToolFunction[] | undefined, onDelta?: (t: string) => void, temperature?: number, maxTokens?: number): Promise<ChatResult> {
  const body: any = {
    model: provider.model,
    messages: messages.map(m => {
      const msg: any = { role: m.role, content: m.content };
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      return msg;
    }),
    stream: !!onDelta,
  };
  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (tools && tools.length) body.tools = tools;

  const res = await fetchWithRetry(buildOpenAIUrl(provider), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw providerError(res.status, await res.text().catch(() => ''));
  }

  if (onDelta) {
    return readOpenAIStream(res, onDelta);
  }
  const j: any = await res.json();
  const msg = j.choices?.[0]?.message || {};
  const toolCalls: AIToolCall[] = (msg.tool_calls || []).map((tc: any) => {
    let args: any = {};
    try { args = JSON.parse(tc.function.arguments || '{}'); } catch {}
    return { id: tc.id, name: tc.function.name, args };
  });
  return { content: msg.content || '', toolCalls };
}

async function anthropicChat(provider: AIProvider, messages: AIMessage[], tools: AIToolFunction[] | undefined, onDelta?: (t: string) => void, temperature?: number, maxTokens?: number): Promise<ChatResult> {
  // Split system message (Anthropic uses a top-level system param)
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const rest = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content,
  }));

  const body: any = {
    model: provider.model,
    max_tokens: maxTokens || 4096,
    messages: rest,
  };
  if (system) body.system = system;
  if (temperature !== undefined) body.temperature = temperature;
  if (tools && tools.length) body.tools = tools.map(t => t.function);
  body.stream = !!onDelta;

  const res = await fetchWithRetry(provider.baseUrl.replace(/\/$/, '') + '/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw providerError(res.status, await res.text().catch(() => ''));
  }

  if (onDelta) {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let full = '';
    // Streaming tool use: content_block_start(tool_use) + input_json_delta
    const toolBlocks: { id: string; name: string; input: string }[] = [];
    let cur: { id: string; name: string; input: string } | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        try {
          const j: any = JSON.parse(t.slice(5).trim());
          if (j.type === 'content_block_start' && j.content_block?.type === 'tool_use') {
            cur = { id: j.content_block.id, name: j.content_block.name, input: '' };
            toolBlocks.push(cur);
          } else if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta') {
            full += j.delta.text;
            onDelta(j.delta.text);
          } else if (j.type === 'content_block_delta' && j.delta?.type === 'input_json_delta' && cur) {
            cur.input += j.delta.partial_json || '';
          } else if (j.type === 'content_block_stop') {
            cur = null;
          }
        } catch {}
      }
    }
    const toolCalls: AIToolCall[] = toolBlocks.map(tb => {
      let args: any = {};
      try { args = JSON.parse(tb.input || '{}'); } catch {}
      return { id: tb.id, name: tb.name, args };
    });
    return { content: full, toolCalls };
  }
  const j: any = await res.json();
  const content = (j.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
  const toolCalls: AIToolCall[] = (j.content || [])
    .filter((b: any) => b.type === 'tool_use')
    .map((b: any) => ({ id: b.id, name: b.name, args: b.input || {} }));
  return { content, toolCalls };
}

// Fetch with timeout (AbortController) so a hung provider can't block requests
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 90000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('AI 请求超时（' + Math.round(timeoutMs / 1000) + 's）', { cause: e });
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// Retry once on transient failures (network / 5xx), not on 4xx
async function fetchWithRetry(url: string, init: RequestInit, timeoutMs = 90000): Promise<Response> {
  try {
    return await fetchWithTimeout(url, init, timeoutMs);
  } catch (e: any) {
    // retry only on network-level errors
    const res = await fetchWithTimeout(url, init, timeoutMs).catch(() => null);
    if (!res) throw e;
    return res;
  }
}

// ---- Provider fallback ----
//
// A second configured provider is a spare tyre: when the first fails for a
// reason ABOUT THE PROVIDER (unreachable, 5xx, quota, rejected key) the same
// request goes to the next one instead of failing outright. A 4xx that is not
// 401/403/429 is NOT retried — the payload is wrong, and every provider would
// reject it the same way.

export function getProviderChain(): AIProvider[] {
  const enabled = getProviders().filter(p => p.enabled);
  const def = getDefaultProvider();
  if (!def) return enabled;
  return [def, ...enabled.filter(p => p.id !== def.id)];
}

export function isProviderFailure(err: any): boolean {
  const status = err?.status;
  if (typeof status === 'number') return status >= 500 || status === 401 || status === 403 || status === 429;
  return true; // the fetch itself threw — no response at all
}

export async function chatCompleteWithFallback(
  messages: AIMessage[],
  opts: { tools?: AIToolFunction[]; temperature?: number; maxTokens?: number; onDelta?: (text: string) => void } = {},
): Promise<{ result: ChatResult; provider: AIProvider }> {
  const chain = getProviderChain();
  if (chain.length === 0) throw new Error('尚未配置 AI 服务商');
  let last: any;
  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    // Once a stream has emitted text the answer is already on the user's screen;
    // restarting it on another provider would duplicate what they can see.
    let started = false;
    const onDelta = opts.onDelta ? (text: string) => { started = true; opts.onDelta!(text); } : undefined;
    try {
      const result = await chatComplete(provider, messages, { ...opts, onDelta });
      if (i > 0) logAiDetail('ai provider fell back', provider.name, { failed: chain[i - 1].name });
      return { result, provider };
    } catch (err: any) {
      last = err;
      if (started || !isProviderFailure(err) || i === chain.length - 1) throw err;
      logAiDetail('ai provider failed; trying the next', String(err?.message || err), { provider: provider.name });
    }
  }
  throw last;
}

// Unified chat completion across providers
export async function chatComplete(
  provider: AIProvider,
  messages: AIMessage[],
  opts: { tools?: AIToolFunction[]; temperature?: number; maxTokens?: number; onDelta?: (text: string) => void } = {}
): Promise<ChatResult> {
  if (provider.type === 'anthropic') {
    return anthropicChat(provider, messages, opts.tools, opts.onDelta, opts.temperature, opts.maxTokens);
  }
  return openaiChat(provider, messages, opts.tools, opts.onDelta, opts.temperature, opts.maxTokens);
}

// Append a tool-call round-trip to the message list (provider-agnostic)
export function pushAssistantWithTools(msgs: AIMessage[], content: string, toolCalls: AIToolCall[], providerType: string): void {
  if (providerType === 'anthropic') {
    msgs.push({
      role: 'assistant',
      content: [
        ...(content ? [{ type: 'text', text: content }] : []),
        ...toolCalls.map(tc => ({ type: 'tool_use', id: tc.id, name: tc.name, input: tc.args })),
      ],
    });
    return;
  }
  msgs.push({
    role: 'assistant',
    content: content || '',
    tool_calls: toolCalls.map(tc => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.args) } })),
  });
}

export function pushToolResults(msgs: AIMessage[], results: { id: string; output: string }[], providerType: string): void {
  if (providerType === 'anthropic') {
    msgs.push({
      role: 'user',
      content: results.map(r => ({ type: 'tool_result', tool_use_id: r.id, content: r.output })),
    });
    return;
  }
  for (const r of results) {
    msgs.push({ role: 'tool', tool_call_id: r.id, content: r.output });
  }
}

// Test a provider connection
export async function testProvider(provider: AIProvider): Promise<{ ok: boolean; message: string }> {
  // HTTP header values must be Latin-1; a key saved as the masked placeholder
  // ('••••…') otherwise fails deep inside fetch with a ByteString error.
  if (!provider.apiKey || /[^\x20-\x7e]/.test(provider.apiKey)) {
    return { ok: false, message: 'API key is missing or contains invalid characters — please re-enter it.' };
  }
  try {
    await chatComplete(provider, [{ role: 'user', content: 'Reply with the single word: ok' }]);
    return { ok: true, message: '连接成功' };
  } catch (e: any) {
    // Shown in the AI settings panel: keep it to messages we wrote.
    return { ok: false, message: userFacingAiError(e, '连接失败') };
  }
}
