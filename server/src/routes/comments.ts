import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, requireCap, AuthRequest } from '../middleware/auth';
import { doAction } from '../utils/hooks';
import { renderTemplate, sendEmail } from '../utils/mailer';

const router = Router();
const commentSchema = z.object({ content: z.string().min(1), author: z.string().optional(), email: z.string().optional().or(z.literal('')), website: z.string().optional().or(z.literal('')), parentId: z.string().optional(), postId: z.string(), subscribe: z.boolean().optional() });

router.get('/post/:postId', (req: AuthRequest, res: Response) => {
  try {
    const comments = db.prepare('SELECT id, content, author, website, status, postId, parentId, userId, createdAt FROM Comment WHERE postId = ? AND status = ? AND parentId IS NULL ORDER BY createdAt DESC').all(req.params.postId, 'approved') as any[];
    for (const c of comments) {
      c.children = db.prepare('SELECT id, content, author, website, status, postId, parentId, userId, createdAt FROM Comment WHERE parentId = ? AND status = ? ORDER BY createdAt ASC').all(c.id, 'approved');
    }
    res.json(comments);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const data = commentSchema.parse(req.body);
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(data.postId) as any;
    if (!post || post.status !== 'published') { res.status(404).json({ error: 'Post not found' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO Comment (id, content, author, email, website, postId, parentId, status, subscribe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.content, data.author || 'Anonymous', data.email || '', data.website || '', data.postId, data.parentId || null, 'pending', data.subscribe ? 1 : 0);
    
    // Notify the parent comment author by email when a reply arrives
    if (data.parentId) {
      const parent = db.prepare('SELECT author, email, content FROM Comment WHERE id = ?').get(data.parentId) as any;
      if (parent?.email) {
        try {
          const siteTitle = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar';
          const siteUrl = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '';
          const replyHtml = '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">' +
            '<h2 style="color:#2563eb;">' + siteTitle + ' · 评论回复通知</h2>' +
            '<p style="color:#374151;">你在《' + post.title + '》的评论收到了新回复：</p>' +
            '<div style="border-left:3px solid #e5e7eb;padding:8px 16px;margin:12px 0;color:#6b7280;">' +
            '<strong style="color:#111827;">' + (parent.author || '') + '</strong>：' + String(parent.content || '').slice(0, 200) + '</div>' +
            '<div style="border-left:3px solid #2563eb;padding:8px 16px;margin:12px 0;color:#111827;">' +
            '<strong>' + (data.author || 'Anonymous') + '</strong>：' + String(data.content || '').slice(0, 200) + '</div>' +
            '<p style="color:#9ca3af;font-size:12px;">前往 <a href="' + siteUrl + '/post/' + post.slug + '#comments">' + siteTitle + '</a> 查看完整讨论</p></div>';
          void sendEmail(parent.email, '有人在《' + post.title + '》回复了你的评论', replyHtml);
        } catch {}
      }
    }

    doAction('comment_added', id);
    // Email the admin about the new comment (best-effort; needs SMTP configured)
    try {
      const adminEmail = (db.prepare("SELECT value FROM Setting WHERE key = 'admin_email'").get() as any)?.value;
      if (adminEmail) {
        const tpl = renderTemplate('comment_notification', { post_title: post.title, comment: data.content });
        if (tpl) void sendEmail(adminEmail, tpl.subject, tpl.html);
      }
    } catch {}
    res.status(201).json(db.prepare('SELECT * FROM Comment WHERE id = ?').get(id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.get('/admin', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    let where = ''; const params: any[] = [];
    if (status) { where = ' WHERE c.status = ?'; params.push(status); }
    const comments = db.prepare('SELECT c.*, p.title as postTitle FROM Comment c LEFT JOIN Post p ON p.id = c.postId' + where + ' ORDER BY c.createdAt DESC LIMIT ? OFFSET ?').all(...params, limit, (page - 1) * limit) as any[];
    for (const c of comments) { c.post = { id: c.postId, title: c.postTitle }; }
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Comment c' + where).get(...params) as any)?.cnt || 0;
    res.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Comment WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Comment not found' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    // WordPress-style: moderators can edit the content and the author name
    if (req.body.content !== undefined) { sets.push('content = ?'); vals.push(String(req.body.content).slice(0, 2000)); }
    if (req.body.author !== undefined) { sets.push('author = ?'); vals.push(String(req.body.author).slice(0, 100)); }
    if (req.body.status !== undefined) { sets.push('status = ?'); vals.push(req.body.status); }
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
      '<h2 style="color:#2563eb;">' + siteTitle + ' · 新评论通知</h2>' +
      '<p style="color:#374151;">你订阅的《' + post.title + '》有了新评论：</p>' +
      '<div style="border-left:3px solid #2563eb;padding:8px 16px;margin:12px 0;color:#111827;">' +
      '<strong>' + (comment.author || 'Anonymous') + '</strong>：' + String(comment.content || '').slice(0, 300) + '</div>' +
      '<p style="color:#9ca3af;font-size:12px;">前往 <a href="' + siteUrl + '/post/' + post.slug + '#comments">' + siteTitle + '</a> 查看讨论</p></div>';
    for (const s of subs) void sendEmail(s.email, '《' + post.title + '》有新评论', html);
  } catch {}
}

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try { doAction('delete_comment', req.params.id); db.prepare('DELETE FROM Comment WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk action on comments
router.post('/bulk-action', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || !action) { res.status(400).json({ error: 'ids and action required' }); return; }
    const validActions = ['approved', 'pending', 'spam', 'trash', 'delete'];
    if (!validActions.includes(action)) { res.status(400).json({ error: 'Invalid action' }); return; }
    if (action === 'trash' || action === 'delete') {
      for (const id of ids) db.prepare('DELETE FROM Comment WHERE id = ?').run(id);
    } else {
      for (const id of ids) {
        db.prepare('UPDATE Comment SET status = ? WHERE id = ?').run(action, id);
        if (action === 'approved') doAction('comment_approved', id);
        if (action === 'spam') doAction('comment_spam', id);
      }
    }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
