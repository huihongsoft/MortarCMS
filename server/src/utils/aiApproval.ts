// Human approval for high-risk AI tool calls.
//
// The assistant can be steered by content it reads (a search result, a crawled
// page, a comment body), so "the model asked for it" is not authority to delete
// a post or repaint the theme. Risky calls therefore stop and wait for the human
// who is actually present in the chat.
//
// Two rules make that real rather than decorative:
//   1. A call is risky based on what it DOES (args included), not the tool name —
//      editing a draft is routine, trashing a post is not.
//   2. Unattended runs (scheduled jobs, bot webhooks) have nobody to ask, so they
//      REFUSE risky calls instead of executing them silently. See
//      executeToolUnattended in ./aiTools.
import crypto from 'crypto';
import db from './db';
import { loadSecret } from './jwt';
import { logAiDetail } from './ai';

export interface PendingCall {
  id?: string;      // the model's tool_call id, echoed back for the UI
  name: string;
  args: any;
}

// Why this call needs a human, or null when it can run unattended. The returned
// text is Chinese because it is shown to the operator and fed back to the model.
//
// `ctx` is needed because "is this risky" depends on the TARGET, not only on the
// arguments: editing a draft is private and reversible, but rewriting the body of
// a post that is already live changes what visitors see right now. Judging by
// arguments alone let a prompt-injected instruction quietly rewrite published
// content with no confirmation at all.
export function riskyReason(name: string, args: any, ctx?: { siteId?: string }): string | null {
  const arg = args || {};
  if (name === 'write_post') {
    if (arg.status === 'trash') return '删除文章（移入回收站）';
    if (arg.status === 'published') return '发布文章（对访客立即可见）';
    if (arg.status === 'scheduled') return '定时发布文章';
    return null; // a new draft: private until someone publishes it
  }
  if (name === 'update_post' || name === 'complete_post') {
    if (arg.status === 'trash') return '删除文章（移入回收站）';
    if (arg.status === 'published') return '发布文章（对访客立即可见）';
    if (arg.status === 'scheduled') return '定时发布文章';
    // A body edit on a live post is a public change (complete_post rewrites
    // content too). Unknown targets are treated as live: failing towards asking
    // is the safe direction here.
    const touchesBody = name === 'complete_post' || arg.title != null || arg.content != null || arg.excerpt != null;
    if (!touchesBody) return null;
    const status = targetStatus(arg.id, ctx?.siteId);
    if (status === null || status === 'published' || status === 'scheduled') {
      return status === 'published' ? '修改已发布文章的正文（对访客立即可见）' : '修改文章正文';
    }
    return null; // a draft edit: reversible, and a revision is snapshotted
  }
  if (name === 'apply_theme_style') {
    // The card is what the admin approves on, so it has to match the write: a
    // site-scoped run only touches that site (the tool writes SiteSetting).
    return ctx?.siteId ? '修改本站点（' + ctx.siteId + '）的主题样式（会覆盖其现有自定义 CSS）' : '修改全站主题样式（会覆盖现有自定义 CSS）';
  }
  if (name === 'update_site_settings') return '修改站点配置';
  // Tools contributed by plugins (registerTool) may declare their own risk; the
  // assistant cannot guess what a third-party tool does, so without a declaration
  // it is treated as low-risk. aiTools installs the resolver at load time.
  return pluginRiskResolver ? pluginRiskResolver(name, args) : null;
}

// Set once by aiTools (the registry lives there; importing it here would be a
// cycle). Returns a reason when the named plugin tool asks for confirmation.
let pluginRiskResolver: ((name: string, args: any) => string | null) | null = null;
export function setPluginRiskResolver(fn: (name: string, args: any) => string | null): void {
  pluginRiskResolver = fn;
}

// The current status of the post a call targets, or null when it cannot be
// resolved (unknown id, DB error) — callers treat null as "assume live".
function targetStatus(id: any, siteId?: string): string | null {
  if (!id) return null;
  try {
    const scope = siteId ? ' AND (siteId IS NULL OR siteId = ?)' : '';
    const row = (siteId
      ? db.prepare('SELECT status FROM Post WHERE id = ?' + scope).get(id, siteId)
      : db.prepare('SELECT status FROM Post WHERE id = ?').get(id)) as any;
    return row?.status ?? null;
  } catch { return null; }
}

// A title is attacker-influenced text (a product of fetched pages, search hits
// or an injected instruction) that ends up in a line the human reads and the
// model reads back, so it is flattened: no newlines to forge extra "✓ …" lines,
// no control characters.
export function oneLine(s: any, max = 60): string {
  // NEL (U+0085) and the line/paragraph separators (U+2028/9) are line breaks to
  // some renderers and to the model, but none of them are in [\u0000-\u001f].
  return String(s ?? '')
    .replace(/[\u0000-\u001f\u007f\u0085\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// One line for the confirmation card, naming the target so the human knows what
// they are approving. Falls back to the tool name when there is nothing to say.
export function describeCall(name: string, args: any, siteId?: string): string {
  const arg = args || {};
  const reason = riskyReason(name, arg, { siteId }) || name;
  if (name === 'write_post') return reason + '《' + oneLine(arg.title) + '》';
  if (name === 'update_post') {
    let title = oneLine(arg.id);
    try {
      const scope = siteId ? ' AND (siteId IS NULL OR siteId = ?)' : '';
      const row = (siteId
        ? db.prepare('SELECT title FROM Post WHERE id = ?' + scope).get(arg.id, siteId)
        : db.prepare('SELECT title FROM Post WHERE id = ?').get(arg.id)) as any;
      if (row?.title) title = oneLine(row.title);
    } catch { /* display only — the id is an acceptable fallback */ }
    return reason + '《' + title + '》';
  }
  if (name === 'update_site_settings') {
    const keys = Object.keys(arg.settings || {}).slice(0, 8).map(k => oneLine(k, 40));
    return reason + (keys.length ? '：' + keys.join('、') : '');
  }
  return reason;
}

// ---- Approval tokens ----
//
// The pending calls travel to the client and come back on approval, so they are
// signed rather than stored: nothing to lose on restart, nothing to keep in sync
// across instances, and a client cannot swap in different arguments. The
// signature also binds the plan to one user, so an approval cannot be replayed
// by anyone else.
const APPROVAL_TTL_MS = 10 * 60 * 1000;
// Shared with the caller so a signed plan and a verifiable plan are the same
// thing: signing 11 calls and refusing to verify 11 produced a card that could
// never be approved.
export const MAX_APPROVAL_CALLS = 10;

export function signApproval(userId: string, calls: PendingCall[], siteId?: string): string {
  const body = Buffer.from(JSON.stringify({
    u: userId,
    exp: Date.now() + APPROVAL_TTL_MS,
    // The site the plan was PREPARED for travels with it: approving from a
    // different site context must not silently retarget the work.
    s: siteId || undefined,
    c: calls.map(c => ({ name: c.name, args: c.args || {} })),
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', loadSecret()).update(body).digest('base64url');
  return body + '.' + sig;
}

// Claim a plan so it can only be executed once. The token is signed rather than
// stored, so this table is the one piece of state that makes an approval
// single-use: without it a lost response (or a double submit) replays the plan
// and, for a write_post, creates a duplicate. Returns false when it was already
// claimed.
export function claimApproval(token: string): boolean {
  try {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const r = db.prepare('INSERT OR IGNORE INTO AiApprovalUse (hash, expiresAt) VALUES (?, ?)')
      .run(hash, new Date(Date.now() + APPROVAL_TTL_MS).toISOString());
    // Opportunistic purge keeps the table bounded without a scheduled job.
    db.prepare('DELETE FROM AiApprovalUse WHERE expiresAt < ?').run(new Date().toISOString());
    if (r.changes > 0) return true;
    logAiDetail('ai approval replay refused', 'duplicate token claimed', {});
    return false;
  } catch (e: any) {
    // Fail CLOSED: an unusable store is exactly the state in which a replay
    // (double submit, lost response) would silently run the plan twice, and a
    // missing table is a broken deployment, not a reason to skip the check.
    logAiDetail('ai approval store unavailable', String(e?.message || e), {});
    return false;
  }
}

// Returns the signed calls plus the site they were prepared for, or null when the
// token is malformed, tampered with, expired, or was issued to a different user.
export function verifyApproval(token: string, userId: string): { calls: PendingCall[]; siteId?: string } | null {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', loadSecret()).update(body).digest('base64url');
  const got = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload?.u !== userId) return null;
    if (!Number.isFinite(payload?.exp) || payload.exp < Date.now()) return null;
    if (!Array.isArray(payload.c) || payload.c.length === 0 || payload.c.length > MAX_APPROVAL_CALLS) return null;
    return {
      calls: payload.c.map((c: any) => ({ name: String(c?.name || ''), args: c?.args || {} })),
      siteId: typeof payload.s === 'string' && payload.s ? payload.s : undefined,
    };
  } catch { return null; }
}
