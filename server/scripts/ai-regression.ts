// AI assistant regression suite — verifies the core agent loop, tool round-trips
// and message assembly without touching the live AI provider.
// Run: npm run test:ai
import http from 'http';
import { chatComplete, pushAssistantWithTools, pushToolResults, AIMessage } from '../src/utils/ai';
import { executeTool } from '../src/utils/aiTools';
import { parseFrontmatter, mdToHtml } from '../src/utils/markdown';
import { cacheSet, cacheGet } from '../src/utils/cache';
import db from '../src/utils/db';

const results: string[] = [];
const check = (n: string, ok: boolean, d = '') => results.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + (d ? ' | ' + d : ''));

async function main() {
  // ---- 1. Mock provider: two-round tool-call loop ----
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const j = JSON.parse(body);
      const msgs = j.messages || [];
      if (!msgs.some((m: any) => m.role === 'tool')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ choices: [{ message: {
          role: 'assistant', content: '我来查。',
          tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'list_posts', arguments: '{"limit":3}' } }],
        } }] }));
      } else {
        const asst = msgs.filter((m: any) => m.role === 'assistant').pop();
        const toolMsg = msgs.find((m: any) => m.role === 'tool');
        check('R2 assistant carries tool_calls', Array.isArray(asst?.tool_calls));
        check('R2 tool_call_id matches', toolMsg?.tool_call_id === 'call_1');
        check('R2 tool content is string', typeof toolMsg?.content === 'string');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: '查询完成。' } }] }));
      }
    });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as any).port;
  const provider: any = { id: 'mock', name: 'Mock', type: 'openai', baseUrl: 'http://127.0.0.1:' + port, model: 'm', apiKey: 'k' };
  const tools = [{ type: 'function', function: { name: 'list_posts', description: 'x', parameters: { type: 'object', properties: {} } } }] as any;
  const msgs: AIMessage[] = [{ role: 'system', content: 's' }, { role: 'user', content: '查' }];
  const r1 = await chatComplete(provider, msgs, { tools });
  check('R1 tool call parsed', r1.toolCalls.length === 1 && r1.toolCalls[0].name === 'list_posts');
  pushAssistantWithTools(msgs, r1.content, r1.toolCalls, 'openai');
  pushToolResults(msgs, r1.toolCalls.map(tc => ({ id: tc.id, output: '{"posts":3}' })), 'openai');
  check('R1 message sequence', msgs.map(m => m.role).join(',') === 'system,user,assistant,tool');
  const r2 = await chatComplete(provider, msgs, { tools });
  check('R2 completes', r2.content.length > 0);
  server.close();

  // ---- 2. Anthropic branch message assembly ----
  const msgs2: AIMessage[] = [{ role: 'user', content: 'hi' }];
  pushAssistantWithTools(msgs2, 'ok', [{ id: 'toolu_1', name: 'list_posts', args: {} }], 'anthropic');
  pushToolResults(msgs2, [{ id: 'toolu_1', output: '{}' }], 'anthropic');
  const a2 = msgs2[1] as any;
  check('anthropic tool_use blocks', Array.isArray(a2.content) && a2.content[1]?.type === 'tool_use');
  check('anthropic tool_result', msgs2[2].role === 'user' && (msgs2[2] as any).content[0]?.type === 'tool_result');

  // ---- 3. Read-only tool smoke tests (real DB, no external calls) ----
  const adminId = (db.prepare("SELECT id FROM User WHERE username='admin'").get() as any)?.id;
  const ctx = { userId: adminId || 'none', role: 'admin' };
  for (const [name, args] of [
    ['get_site_stats', {}], ['list_posts', { limit: 3 }], ['get_categories', {}],
    ['list_tags', {}], ['get_site_settings', {}], ['recall', {}],
  ] as [string, any][]) {
    try {
      const r = await executeTool(name, args, ctx);
      check('tool ' + name, !(r && typeof r === 'object' && (r as any).error) || Array.isArray(r), JSON.stringify(r).slice(0, 60));
    } catch (e: any) { check('tool ' + name, false, e.message); }
  }

  // ---- 4. write_post content normalization (markdown -> clean HTML) ----
  try {
    const r = await executeTool('write_post', { title: '回归测试-内容转换', content: '# 标题\n\n- a\n- b\n\n**粗** 与 `code`', status: 'draft', featured: '/uploads/ai-cover-test.png' }, ctx);
    const stored = r?.id ? (db.prepare('SELECT content, excerpt, featured FROM Post WHERE id = ?').get(r.id) as any) : null;
    const mdLeaked = stored && /(^|\n)#|^\- |\*\*|```/.test(stored.content);
    const hasHtml = stored && /<h1>标题<\/h1>[\s\S]*<ul><li>a<\/li><li>b<\/li><\/ul>[\s\S]*<strong>粗<\/strong>[\s\S]*<code>code<\/code>/.test(stored.content);
    check('write_post markdown -> html', !mdLeaked && hasHtml, stored?.content?.slice(0, 80));
    check('write_post excerpt fallback', !!(stored?.excerpt && stored.excerpt.length > 10), stored?.excerpt);
    check('write_post featured stored', stored?.featured === '/uploads/ai-cover-test.png', stored?.featured);
    if (r?.id) db.prepare('DELETE FROM Post WHERE id = ?').run(r.id);
  } catch (e: any) { check('write_post markdown -> html', false, e.message); }

  // ---- 4b. Theme tools: style extraction + apply/restore ----
  try {
    const css = 'body{background:#faf9f6;color:#1c1917;font-family:"Georgia",serif}a{color:#dc2626}.btn{background:#dc2626;border-radius:8px}h1{font-family:"Georgia",serif;color:#dc2626}';
    const { extractStyleSummary } = await import('../src/utils/aiTools');
    const sum = extractStyleSummary(css, '<body style="background:#ffffff">');
    check('theme style extraction', sum.colors.includes('#dc2626') && sum.colors.includes('#1c1917') && sum.background === '#faf9f6' && sum.fonts.includes('Georgia'), JSON.stringify(sum).slice(0, 100));
    // apply + restore around the active theme's overrides
    const tname = (db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any)?.value || 'default';
    const prefix = 'theme_' + tname + '_';
    const oldVals = new Map<string, string>();
    for (const k of ['primary_color', 'background']) {
      const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get(prefix + k) as any;
      if (row) oldVals.set(prefix + k, row.value);
      else db.prepare('DELETE FROM Setting WHERE key = ?').run(prefix + k);
    }
    const r = await executeTool('apply_theme_style', { primary_color: '#0ea5e9', background: '#f0fdf4' }, ctx);
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get(prefix + 'primary_color') as any;
    check('apply_theme_style', r && !(r as any).error && row?.value === '#0ea5e9', JSON.stringify(r).slice(0, 80));
    // Restore: keys that existed before get their old value back, keys that
    // did not exist are deleted so the test never leaks into the live theme.
    for (const k of ['primary_color', 'background']) {
      const full = prefix + k;
      if (oldVals.has(full)) db.prepare('INSERT OR REPLACE INTO Setting (id, key, value) VALUES (?, ?, ?)').run(full, full, oldVals.get(full));
      else db.prepare('DELETE FROM Setting WHERE key = ?').run(full);
    }
    // fetchUrlGuarded: a redirect into a private host must be refused (SSRF)
    const { fetchUrlGuarded } = await import('../src/utils/aiTools');
    const realFetch = global.fetch;
    try {
      let calls = 0;
      global.fetch = (async () => {
        calls++;
        return calls === 1
          ? { status: 302, ok: false, headers: { get: (k: string) => (k.toLowerCase() === 'location' ? 'http://127.0.0.1:9999/internal' : null) }, text: async () => '' }
          : { status: 200, ok: true, headers: { get: () => null }, text: async () => 'ok' };
      }) as any;
      const guarded = await fetchUrlGuarded('https://example.com/page', { timeoutMs: 3000 });
      check('fetchUrlGuarded redirect to private refused', guarded === null && calls === 1, 'hops=' + calls);
    } finally { global.fetch = realFetch; }
  } catch (e: any) { check('theme style extraction', false, e.message); }

  // ---- 4c. Task error friendly-message mapping (R5) ----
  const { friendlyTaskError } = await import('../src/utils/aiTools');
  check('friendly error: network', friendlyTaskError(new Error('fetch failed: ECONNREFUSED')).includes('无法连接'), friendlyTaskError(new Error('x')));
  check('friendly error: provider status', friendlyTaskError(new Error('Request failed with status code 401')).includes('401'), '');
  check('friendly error: passthrough', friendlyTaskError(new Error('任务执行超时（10 分钟上限）')).includes('超时'), '');

  // ---- 5. Regression on adjacent modules ----
  const { meta } = parseFrontmatter('---\ntitle: T\ntags: [a]\n---\n# H\n');
  check('markdown frontmatter', meta.title === 'T' && meta.tags.length === 1);
  check('markdown to html', mdToHtml('# H\n\n**b**').includes('<h1>H</h1>'));
  check('markdown table', mdToHtml('| A | B |\n| - | - |\n| 1 | 2 |').includes('<table><thead><tr><th>A</th>'));
  cacheSet('r1', 1);
  check('cache', cacheGet('r1') === 1);

  console.log(results.join('\n'));
  const fails = results.filter(r => r.startsWith('FAIL'));
  if (fails.length) { console.log('\n' + fails.length + ' FAILURES'); process.exit(1); }
  console.log('\nAll AI regression checks passed.');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
