import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { clampResolvedSite } from '../utils/userSites';
import { isRoleAllowed, listToolSchemas, isReadOnlyTool, executeToolUnattended } from '../utils/aiTools';

// Model Context Protocol endpoint (JSON-RPC 2.0 over HTTP).
//
// This is a TRANSPORT, not a second implementation: an external agent (Claude
// Desktop, an IDE, another agent framework) reaches the same tool registry the
// built-in assistant uses, through the same per-tool permissions
// (`listToolSchemas` filters by `canUseTool`) and the same safety rule for
// side effects (see `executeToolUnattended` — a risky call is refused unless the
// operator opted in with `ai_allow_unattended_risky`).
//
// Auth is an App password, which the `appPasswordAuth` middleware resolves
// before this router runs. A `read`-scoped password may only call tools that
// cannot change anything (`isReadOnlyTool`, default-deny).
const router = Router();

// Echoed when the client does not pin one; also our newest.
const MCP_PROTOCOL_VERSION = '2025-06-18';
const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-06-18', '2025-03-26', '2024-11-05']);
const SERVER_INFO = { name: 'mortar-cms', version: '1.0.0' };

const ok = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id: id === undefined ? null : id, result });
const err = (id: unknown, code: number, message: string) => ({ jsonrpc: '2.0', id: id === undefined ? null : id, error: { code, message } });

// Tool results travel as text; the client decides how to render them.
const toolText = (value: unknown) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });

async function callTool(user: any, req: AuthRequest & SiteRequest, name: string, args: unknown) {
  if (!isRoleAllowed(user.role)) return { ...toolText('你的角色无权使用 AI 功能'), isError: true };
  if (!name) return { ...toolText('缺少工具名'), isError: true };
  // A read-only credential must not be able to write, and `tools/call` is a POST
  // whatever the tool does — which is why the scope is decided here rather than
  // by the HTTP method (see appScopeAllows).
  if (user.scope === 'read' && !isReadOnlyTool(name)) {
    return { ...toolText('只读凭据不能调用会修改内容的工具: ' + name), isError: true };
  }
  const ctx = { userId: user.userId, role: user.role, siteId: clampResolvedSite(req, user.userId, user.role) };
  const out = await executeToolUnattended(name, args || {}, ctx);
  const isError = !!out && typeof out === 'object' && 'error' in (out as any);
  return { ...toolText(out), ...(isError ? { isError: true } : {}) };
}

router.post('/', async (req: AuthRequest & SiteRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json(err(null, -32001, 'Unauthorized — send an App password (Authorization: App <token>)'));
    return;
  }
  const body = req.body || {};
  // Batching was removed from the spec for requests; answering a single message
  // is the supported shape.
  if (Array.isArray(body)) { res.status(400).json(err(null, -32600, 'Batch requests are not supported')); return; }
  const { id, method, params } = body as { id?: unknown; method?: string; params?: any };

  try {
    // Notifications carry no id and expect no response body.
    if (typeof method === 'string' && method.startsWith('notifications/')) { res.status(202).end(); return; }

    if (method === 'initialize') {
      const asked = String(params?.protocolVersion || '');
      res.json(ok(id, {
        // Answer with the client's version when we know it, so a newer client is
        // not forced down to ours for no reason.
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.has(asked) ? asked : MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      }));
      return;
    }

    if (method === 'ping') { res.json(ok(id, {})); return; }

    if (method === 'tools/list') {
      const tools = isRoleAllowed(user.role)
        ? listToolSchemas(user.role).map((t: any) => ({
            name: t.function.name,
            description: t.function.description,
            inputSchema: t.function.parameters,
          }))
        : [];
      res.json(ok(id, { tools }));
      return;
    }

    if (method === 'tools/call') {
      const result = await callTool(user, req, String(params?.name || ''), params?.arguments);
      res.json(ok(id, result));
      return;
    }

    res.json(err(id, -32601, 'Method not found: ' + String(method)));
  } catch (e: any) {
    // The MCP client renders this, so it gets a plain description; the detail
    // stays in the log.
    res.json(err(id, -32603, 'Internal error'));
  }
});

// Some clients probe with GET before POSTing; answering tells them the endpoint
// is alive without exposing anything.
router.get('/', (_req: AuthRequest, res: Response) => {
  res.json({ ok: true, protocolVersion: MCP_PROTOCOL_VERSION, server: SERVER_INFO });
});

export default router;
