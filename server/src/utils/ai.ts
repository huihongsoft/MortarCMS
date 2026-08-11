import db from './db';

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

export function getProviders(): AIProvider[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'ai_providers'").get() as any;
  if (!row?.value) return [];
  try {
    const list = JSON.parse(row.value) as AIProvider[];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export function saveProviders(providers: AIProvider[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'ai_providers', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('ai_providers', JSON.stringify(providers));
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
    const errText = await res.text().catch(() => '');
    throw new Error('AI 请求失败 (' + res.status + '): ' + errText.slice(0, 300));
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
    const errText = await res.text().catch(() => '');
    throw new Error('AI 请求失败 (' + res.status + '): ' + errText.slice(0, 300));
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
    if (e.name === 'AbortError') throw new Error('AI 请求超时（' + Math.round(timeoutMs / 1000) + 's）');
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
  try {
    await chatComplete(provider, [{ role: 'user', content: 'Reply with the single word: ok' }]);
    return { ok: true, message: '连接成功' };
  } catch (e: any) {
    return { ok: false, message: e.message || '连接失败' };
  }
}
