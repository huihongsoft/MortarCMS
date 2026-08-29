import { Router, Response } from 'express';
import crypto from 'crypto';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { renderTemplate, sendEmail, getMailSettings } from '../utils/mailer';

const router = Router();

function genToken(): string { return crypto.randomBytes(24).toString('hex'); }

function siteInfo(): { title: string; url: string } {
  const title = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar';
  const url = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '';
  return { title, url };
}

function smtpConfigured(): boolean { return !!getMailSettings().host; }

// ---- Public: subscribe / confirm / unsubscribe ----

// Subscribe (double opt-in when SMTP is configured; direct confirm otherwise
// so the feature still works on sites without a mail server)
router.post('/newsletter/subscribe', (req: AuthRequest, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { res.status(400).json({ error: 'A valid email address is required' }); return; }
    const name = String(req.body?.name || '').trim().slice(0, 100);
    const existing = db.prepare('SELECT * FROM Subscriber WHERE email = ?').get(email) as any;
    const token = genToken();
    const now = new Date().toISOString();
    if (existing) {
      if (existing.status === 'unsubscribed') {
        db.prepare("UPDATE Subscriber SET status = 'subscribed', confirmed = 0, confirmToken = ? WHERE id = ?").run(token, existing.id);
      } else {
        db.prepare('UPDATE Subscriber SET confirmToken = ? WHERE id = ?').run(token, existing.id);
      }
    } else {
      db.prepare('INSERT INTO Subscriber (id, email, name, status, confirmed, confirmToken, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(cuid(), email, name, 'subscribed', 0, token, now);
    }
    if (!smtpConfigured()) {
      // No mail server: confirm immediately (single opt-in mode)
      const row = db.prepare('SELECT id FROM Subscriber WHERE email = ?').get(email) as any;
      db.prepare('UPDATE Subscriber SET confirmed = 1 WHERE id = ?').run(row.id);
      res.json({ success: true, message: 'subscribed' });
      return;
    }
    const info = siteInfo();
    const base = info.url || 'http://localhost:3001';
    const tpl = renderTemplate('newsletter_confirm', {
      site_title: info.title,
      confirm_link: base + '/newsletter/confirm?token=' + token,
      unsubscribe_link: base + '/newsletter/unsubscribe?token=' + token,
    });
    if (tpl) sendEmail(email, tpl.subject, tpl.html).catch(() => {});
    res.json({ success: true, message: 'confirmation_sent' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Confirm a subscription (called from the frontend confirm page)
router.post('/newsletter/confirm', (req: AuthRequest, res: Response) => {
  try {
    const token = String(req.body?.token || '').trim();
    if (!token) { res.status(400).json({ error: 'Missing token' }); return; }
    const r = db.prepare("UPDATE Subscriber SET confirmed = 1 WHERE confirmToken = ? AND status = 'subscribed'").run(token);
    if (r.changes === 0) { res.status(400).json({ error: 'Invalid or expired token' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Unsubscribe (token from the digest email footer)
router.post('/newsletter/unsubscribe', (req: AuthRequest, res: Response) => {
  try {
    const token = String(req.body?.token || '').trim();
    if (!token) { res.status(400).json({ error: 'Missing token' }); return; }
    const r = db.prepare("UPDATE Subscriber SET status = 'unsubscribed' WHERE confirmToken = ?").run(token);
    if (r.changes === 0) { res.status(400).json({ error: 'Invalid or expired token' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Admin ----

const adminGuard = [authenticate, requireCap('manage_options')];

// List subscribers with totals (search + status filter + pagination)
router.get('/admin/subscribers', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '15')) || 15));
    const q = String(req.query.q || '').trim();
    const status = String(req.query.status || '');
    const where: string[] = [];
    const params: any[] = [];
    if (q) { where.push('(email LIKE ? OR name LIKE ?)'); params.push('%' + q + '%', '%' + q + '%'); }
    if (status) { where.push('status = ?'); params.push(status); }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';
    const total = (db.prepare('SELECT COUNT(*) as c FROM Subscriber' + whereSql).get(...params) as any).c;
    const rows = db.prepare('SELECT id, email, name, status, confirmed, createdAt FROM Subscriber' + whereSql + ' ORDER BY createdAt DESC LIMIT ? OFFSET ?')
      .all(...params, limit, (page - 1) * limit) as any[];
    const stats = (db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'subscribed' AND confirmed = 1 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed FROM Subscriber").get() as any);
    res.json({ total, subscribers: rows, stats: { total: stats.total || 0, active: stats.active || 0, unsubscribed: stats.unsubscribed || 0 } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/admin/subscribers/:id', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM Subscriber WHERE id = ?').run(req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Subscriber not found' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// CSV export of all subscribers
router.get('/admin/subscribers/export', ...adminGuard, (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT email, name, status, confirmed, createdAt FROM Subscriber ORDER BY createdAt DESC').all() as any[];
    const esc = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = '\uFEFF' + ['Email', 'Name', 'Status', 'Confirmed', 'Subscribed At'].map(esc).join(',') + '\n' +
      rows.map(r => [r.email, r.name || '', r.status, r.confirmed ? 'yes' : 'no', r.createdAt].map(esc).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send(csv);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Send a newsletter: {to} = test send to one address; otherwise broadcast to
// every confirmed + subscribed subscriber (one email each with a unique
// unsubscribe link). Returns how many emails were sent.
router.post('/admin/newsletter/send', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const to = String(req.body?.to || '').trim();
    const info = siteInfo();
    const base = info.url || 'http://localhost:3001';
    const recent = db.prepare("SELECT id, title, slug, excerpt, publishedAt FROM Post WHERE type = 'post' AND status = 'published' AND (publishedAt IS NULL OR publishedAt <= ?) ORDER BY publishedAt DESC LIMIT 10").all(new Date().toISOString()) as any[];
    if (recent.length === 0 && !to) { res.status(400).json({ error: 'No published posts to send' }); return; }
    const items = recent.map(p =>
      '<div style="margin-bottom:16px;"><a href="' + base + '/post/' + p.slug + '" style="font-size:16px;font-weight:600;color:#2563eb;text-decoration:none;">' + String(p.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>' +
      (p.excerpt ? '<p style="margin:4px 0 0;font-size:13px;color:#4b5563;">' + String(p.excerpt).substring(0, 200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>' : '') + '</div>').join('');
    const buildTpl = (unsubLink: string) => renderTemplate('newsletter_digest', {
      site_title: info.title,
      posts_html: items || '<p style="color:#9ca3af;">No new posts.</p>',
      unsubscribe_link: unsubLink,
      site_url: base,
    });
    if (to) {
      const tpl = buildTpl(base + '/newsletter/unsubscribe?token=test');
      if (!tpl) { res.status(404).json({ error: 'Template missing' }); return; }
      const result = await sendEmail(to, tpl.subject, tpl.html);
      if (!result.ok) { res.status(502).json({ error: result.error }); return; }
      res.json({ success: true, sent: 1, test: true, to });
      return;
    }
    const subs = db.prepare("SELECT id, email, confirmToken FROM Subscriber WHERE status = 'subscribed' AND confirmed = 1 AND email != ''").all() as any[];
    let sent = 0;
    for (const s of subs) {
      try {
        const tpl = buildTpl(base + '/newsletter/unsubscribe?token=' + s.confirmToken);
        if (tpl) {
          const result = await sendEmail(s.email, tpl.subject, tpl.html);
          if (result.ok) sent++;
        }
      } catch {}
    }
    res.json({ success: true, sent });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
