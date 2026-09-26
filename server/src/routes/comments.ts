import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, authorize, requireCap, resolveOptionalUser, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { siteScopeForFilter, userMayAccessSite } from '../utils/userSites';
import { applyFilters, doAction } from '../utils/hooks';
import { renderTemplate, sendEmail } from '../utils/mailer';
import { postUrl } from '../utils/slug';
import { scoreSpam } from '../utils/spam';
import { logger } from '../utils/logger';

const router = Router();
// Every user-supplied value entering an email body must go through this. Kept at
// module scope so a new notification cannot quietly omit it.
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Length caps prevent storage abuse / oversized notifications. Content is
// stored raw (rendered as React text nodes on the frontend — never innerHTML)
// and emails escape it; length bounds keep everything bounded.
const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  author: z.string().max(50).optional(),
  email: z.string().email().max(254).optional().or(z.literal('')),
  website: z.string().max(500).optional().or(z.literal('')),
  parentId: z.string().nullable().optional(),
  postId: z.string(),
  subscribe: z.boolean().optional(),
});

// Public: latest approved comments across posts (for the Recent Comments widget)
// Which site a comment belongs to. Comments inherit their post's site (nothing
// sets Comment.siteId on submission); the per-site content screen can override it
// for a comment that belongs somewhere else.
const COMMENT_SITE = 'COALESCE(c.siteId, p.siteId)';

// May this user moderate/delete this comment? Shared (site-less) comments stay
// open to anyone who can moderate, like site-less posts.
// 'missing' = a stale id (the comment was already deleted): the caller skips it
// rather than refusing the whole request.
function commentScope(req: AuthRequest, commentId: string): 'ok' | 'denied' | 'missing' {
  try {
    const row = db.prepare(
      'SELECT ' + COMMENT_SITE + ' AS siteId FROM Comment c LEFT JOIN Post p ON p.id = c.postId WHERE c.id = ?'
    ).get(commentId) as any;
    if (!row) return 'missing';
    return userMayAccessSite(req.user!.userId, req.user!.role, row.siteId || undefined) ? 'ok' : 'denied';
  } catch { return 'denied'; }
}

function mayModerateComment(req: AuthRequest, commentId: string): boolean {
  return commentScope(req, commentId) === 'ok';
}

router.get('/recent', (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    // Site-scoped like every other public list: the resolved site's comments plus
    // the shared ones (a multi-site install must not show another site's).
    const rows = db.prepare(
      "SELECT c.id, c.author, c.content, c.createdAt, p.title as postTitle, p.slug as postSlug FROM Comment c JOIN Post p ON p.id = c.postId WHERE c.status = 'approved' AND (" + COMMENT_SITE + " IS NULL OR " + COMMENT_SITE + " = ?) ORDER BY c.createdAt DESC LIMIT ?"
    ).all((req as AuthRequest & SiteRequest).siteId || '', limit) as any[];
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/post/:postId', (req: AuthRequest, res: Response) => {
  try {
    // One query for the whole thread, assembled into a tree: the previous
    // version fetched roots plus exactly one level of children, so a reply to a
    // reply existed in the database but was never shown to anyone.
    const rows = db.prepare('SELECT id, content, author, website, status, postId, parentId, userId, likes, createdAt FROM Comment WHERE postId = ? AND status = ? ORDER BY createdAt ASC').all(req.params.postId, 'approved') as any[];
    const byId = new Map<string, any>();
    for (const r of rows) byId.set(r.id, { ...r, children: [] });
    const roots: any[] = [];
    for (const c of byId.values()) {
      // A child whose parent is not approved (or was deleted) is promoted to the
      // top level rather than vanishing.
      const parent = c.parentId ? byId.get(c.parentId) : null;
      if (parent) parent.children.push(c); else roots.push(c);
    }
    roots.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json(roots);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Threads nest up to this many levels (root + replies). A reply aimed deeper is
// attached to the deepest allowed ancestor instead of being refused — it stays
// visible in the thread, which is what WordPress does at its depth limit.
const MAX_COMMENT_DEPTH = 3;

// Depth of a comment within its thread (a root comment is depth 1). Returns -1
// when the id is not a comment of this post, so callers can reject it.
function commentDepth(id: string, postId: string): number {
  let depth = 1;
  let current: string | null = id;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current)) return depth;          // corrupt data: stop walking
    seen.add(current);
    const row = db.prepare('SELECT parentId, postId FROM Comment WHERE id = ?').get(current) as any;
    if (!row || row.postId !== postId) return -1;
    if (!row.parentId) return depth;
    current = row.parentId;
    depth++;
  }
  return depth;
}

// Which comment a reply should hang off: the one it targets, unless that would
// push the reply past MAX_COMMENT_DEPTH — then the deepest ancestor that still
// has room, so the reply stays visible in the thread instead of being refused
// (WordPress behaves the same way at its depth limit).
function clampReplyParent(parentId: string, postId: string): string | null {
  let depth = commentDepth(parentId, postId);
  if (depth === -1) return null;
  let current = parentId;
  while (depth >= MAX_COMMENT_DEPTH) {
    const row = db.prepare('SELECT parentId FROM Comment WHERE id = ?').get(current) as any;
    if (!row?.parentId) break;
    current = row.parentId;
    depth--;
  }
  return current;
}

// Public: like a comment (global /api rate limit guards abuse)
router.post('/:id/like', (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('UPDATE Comment SET likes = COALESCE(likes, 0) + 1 WHERE id = ?').run(req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Comment not found' }); return; }
    const likes = (db.prepare('SELECT likes FROM Comment WHERE id = ?').get(req.params.id) as any)?.likes || 0;
    res.json({ success: true, likes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    // Optional auth: a Bearer token links the comment to the account (for the
    // profile page's "my comments") without blocking anonymous commenters.
    // resolveOptionalUser applies every check authenticate does — blacklist,
    // partial (2FA) tokens, session version — so a revoked or half-authenticated
    // token can never claim an identity here.
    const optionalUser = resolveOptionalUser(req);
    if (optionalUser) req.user = optionalUser;
    const data = commentSchema.parse(req.body);
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(data.postId) as any;
    if (!post || post.status !== 'published') { res.status(404).json({ error: 'Post not found' }); return; }
    // Plugins may reject a comment before it is stored (e.g. IP/email
    // blacklists) by returning a non-empty error string from the filter
    const validationError = applyFilters('comment_validate', '', { ...data, ip: req.ip || '' });
    if (validationError) { res.status(400).json({ error: validationError }); return; }
    // A reply must target a comment on the same post; otherwise parentId could
    // be used to trigger reply notifications across unrelated threads. The
    // target is then clamped to the deepest allowed level.
    let parentId: string | null = null;
    if (data.parentId) {
      parentId = clampReplyParent(data.parentId, data.postId);
      if (parentId === null) { res.status(400).json({ error: 'Invalid parent comment' }); return; }
    }
    const id = cuid();
    // Logged-in commenters are linked to their account so the profile page
    // can show "my comments"; author/email fall back to the account identity
    const userId = (req as any).user?.userId || null;
    let authorName = data.author?.trim() || '';
    if (!authorName && userId) {
      authorName = (db.prepare('SELECT username FROM User WHERE id = ?').get(userId) as any)?.username || '';
    }
    if (!authorName) authorName = 'Anonymous';
    // Local spam scoring decides which side of moderation this lands on. The
    // response never says which: telling a bot it was caught only teaches it to
    // adjust, and a false positive must look identical to a normal submission.
    const verdict = scoreSpam({
      content: String(data.content || ''),
      author: authorName,
      email: data.email,
      website: data.website,
      honeypot: (req.body || {})._hp || (req.body || {}).website_url,
      startedAt: Number((req.body || {})._t) || undefined,
    });
    const status = verdict.spam ? 'spam' : 'pending';
    if (verdict.spam) logger.info({ reasons: verdict.reasons, score: verdict.score }, 'comment filed as spam');
    db.prepare('INSERT INTO Comment (id, content, author, email, website, postId, parentId, status, subscribe, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, data.content, authorName, data.email || '', data.website || '', data.postId, parentId, status, data.subscribe ? 1 : 0, userId);
    
    // Notify the parent comment author by email when a reply arrives
    if (parentId) {
      const parent = db.prepare('SELECT author, email, content FROM Comment WHERE id = ?').get(parentId) as any;
      if (parent?.email) {
        try {
          // All user-supplied values are HTML-escaped before entering the email
          const siteTitle = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar';
          const siteUrl = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '';
          const replyHtml = '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">' +
            '<h2 style="color:#2563eb;">' + esc(siteTitle) + ' · 评论回复通知</h2>' +
            '<p style="color:#374151;">你在《' + esc(post.title) + '》的评论收到了新回复：</p>' +
            '<div style="border-left:3px solid #e5e7eb;padding:8px 16px;margin:12px 0;color:#6b7280;">' +
            '<strong style="color:#111827;">' + esc(parent.author || '') + '</strong>：' + esc(String(parent.content || '').slice(0, 200)) + '</div>' +
            '<div style="border-left:3px solid #2563eb;padding:8px 16px;margin:12px 0;color:#111827;">' +
            '<strong>' + esc(data.author || 'Anonymous') + '</strong>：' + esc(String(data.content || '').slice(0, 200)) + '</div>' +
            '<p style="color:#9ca3af;font-size:12px;">前往 <a href="' + esc(siteUrl + postUrl(post.slug)) + '#comments">' + esc(siteTitle) + '</a> 查看完整讨论</p></div>';
          void sendEmail(parent.email, '有人在《' + post.title + '》回复了你的评论', replyHtml);
        } catch {}
      }
    }

    doAction('comment_added', id);
    // Email the admin about the new comment (best-effort; needs SMTP configured)
    try {
      const adminEmail = (db.prepare("SELECT value FROM Setting WHERE key = 'admin_email'").get() as any)?.value;
      if (adminEmail) {
        const tpl = renderTemplate('comment_notification', { post_title: esc(post.title), comment: esc(data.content) });
        if (tpl) void sendEmail(adminEmail, tpl.subject, tpl.html);
      }
    } catch {}
    res.status(201).json(db.prepare('SELECT * FROM Comment WHERE id = ?').get(id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.get('/admin', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    // Same site rule as the post/page lists: an assigned moderator only sees their
    // own sites' comments (plus the shared ones), and naming someone else's site
    // is refused instead of quietly returning everything.
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, COMMENT_SITE);
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    let where = ' WHERE 1=1'; const params: any[] = [];
    if (status) { where += ' AND c.status = ?'; params.push(status); }
    where += sf.clause; params.push(...sf.params);
    const comments = db.prepare('SELECT c.*, p.title as postTitle FROM Comment c LEFT JOIN Post p ON p.id = c.postId' + where + ' ORDER BY c.createdAt DESC LIMIT ? OFFSET ?').all(...params, limit, (page - 1) * limit) as any[];
    for (const c of comments) { c.post = { id: c.postId, title: c.postTitle }; }
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Comment c LEFT JOIN Post p ON p.id = c.postId' + where).get(...params) as any)?.cnt || 0;
    res.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Comment WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Comment not found' }); return; }
    // Capability says "may moderate"; site membership says "may moderate *here*".
    if (!mayModerateComment(req, req.params.id)) { res.status(403).json({ error: '无权操作该站点的评论' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    // WordPress-style: moderators can edit the content and the author name
    if (req.body.content !== undefined) { sets.push('content = ?'); vals.push(String(req.body.content).slice(0, 2000)); }
    if (req.body.author !== undefined) { sets.push('author = ?'); vals.push(String(req.body.author).slice(0, 100)); }
    if (req.body.status !== undefined) {
      const status = String(req.body.status);
      if (!['pending', 'approved', 'spam', 'trash'].includes(status)) { res.status(400).json({ error: 'Invalid comment status' }); return; }
      sets.push('status = ?'); vals.push(status);
    }
    if (sets.length) { vals.push(req.params.id); db.prepare('UPDATE Comment SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    if (req.body.status === 'approved') {
      doAction('comment_approved', req.params.id);
      // Notify everyone who subscribed to this post's comment thread (email)
      notifyThreadSubscribers(existing.postId, existing);
    }
    if (req.body.status === 'spam') doAction('comment_spam', req.params.id);
    res.json(db.prepare('SELECT * FROM Comment WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Email subscribers of a post's comment thread when a new comment is approved
function notifyThreadSubscribers(postId: string, comment: any): void {
  try {
    const post = db.prepare('SELECT title, slug FROM Post WHERE id = ?').get(postId) as any;
    if (!post) return;
    const subs = db.prepare("SELECT DISTINCT email, author FROM Comment WHERE postId = ? AND subscribe = 1 AND email != '' AND email != ?").all(postId, comment.email || '') as any[];
    if (!subs.length) return;
    const siteTitle = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar';
    const siteUrl = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '';
    const html = '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">' +
      '<h2 style="color:#2563eb;">' + esc(siteTitle) + ' · 新评论通知</h2>' +
      '<p style="color:#374151;">你订阅的《' + esc(post.title) + '》有了新评论：</p>' +
      '<div style="border-left:3px solid #2563eb;padding:8px 16px;margin:12px 0;color:#111827;">' +
      '<strong>' + esc(comment.author || 'Anonymous') + '</strong>：' + esc(String(comment.content || '').slice(0, 300)) + '</div>' +
      '<p style="color:#9ca3af;font-size:12px;">前往 <a href="' + esc(siteUrl + postUrl(post.slug)) + '#comments">' + esc(siteTitle) + '</a> 查看讨论</p></div>';
    for (const s of subs) void sendEmail(s.email, '《' + post.title + '》有新评论', html);
  } catch {}
}

router.delete('/:id', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    if (!mayModerateComment(req, req.params.id)) { res.status(403).json({ error: '无权操作该站点的评论' }); return; }
    doAction('delete_comment', req.params.id); db.prepare('DELETE FROM Comment WHERE id = ?').run(req.params.id); res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk action on comments
router.post('/bulk-action', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || !action) { res.status(400).json({ error: 'ids and action required' }); return; }
    // 'trash' moves to the recycle bin (status=trash, restorable), matching
    // single-comment PUT; 'delete' is the only permanent removal
    const validActions = ['approved', 'pending', 'spam', 'trash', 'delete'];
    if (!validActions.includes(action)) { res.status(400).json({ error: 'Invalid action' }); return; }
    // Cap the batch so a single request can't hold the write lock for minutes.
    const batch = ids.slice(0, 1000);
    // All-or-nothing: a batch that reaches outside this user's sites is refused
    // rather than applied to the part it can reach.
    for (const id of batch) {
      if (commentScope(req, String(id)) === 'denied') { res.status(403).json({ error: '无权操作该站点的评论' }); return; }
    }
    const notify: string[] = [];
    withTransaction(() => {
      for (const id of batch) {
        if (action === 'delete') {
          db.prepare('DELETE FROM Comment WHERE id = ?').run(id);
        } else {
          db.prepare('UPDATE Comment SET status = ? WHERE id = ?').run(action, id);
          if (action === 'approved') notify.push(id);
        }
      }
    });
    // Hooks fire after the batch is committed.
    for (const id of notify) doAction('comment_approved', id);
    if (action === 'spam') for (const id of batch) doAction('comment_spam', id);
    res.json({ success: true, count: batch.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
