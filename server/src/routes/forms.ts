import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { slugify, uniqueSlug } from '../utils/slug';
import { renderTemplate, sendEmail } from '../utils/mailer';
import { doAction } from '../utils/hooks';

const router = Router();

// ---- Public: form submission (rendered by the [form] shortcode) ----

function escCsv(v: string): string {
  return '"' + String(v).replace(/"/g, '""') + '"';
}

router.post('/forms/:slug/submit', async (req: AuthRequest, res: Response) => {
  try {
    const form = db.prepare('SELECT * FROM Form WHERE slug = ? AND enabled = 1').get(req.params.slug) as any;
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    let fields: any[] = [];
    try { fields = JSON.parse(form.fields || '[]'); } catch {}
    if (!Array.isArray(fields)) fields = [];
    const body = (req.body || {}) as Record<string, any>;
    const isSpam = typeof body._hp === 'string' && body._hp.trim() !== '';
    // Build the stored payload from declared fields only (ignores injected keys)
    const data: Record<string, string> = {};
    for (const f of fields) {
      const name = String(f.name || '');
      if (!name) continue;
      const raw = body[name];
      const value = raw === undefined || raw === null ? '' : String(raw).trim();
      if (f.required && value === '') {
        res.status(400).json({ error: 'Missing required field: ' + (f.label || name) }); return;
      }
      if (f.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        res.status(400).json({ error: 'Invalid email address: ' + (f.label || name) }); return;
      }
      if (f.type === 'number' && value !== '' && isNaN(Number(value))) {
        res.status(400).json({ error: 'Invalid number: ' + (f.label || name) }); return;
      }
      data[name] = value;
    }
    const id = cuid();
    const ip = (req.ip || req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    db.prepare('INSERT INTO FormSubmission (id, formId, data, ip, userId, spam) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, form.id, JSON.stringify(data), ip, (req as any).user?.userId || null, isSpam ? 1 : 0);
    // Email the owner (skipped for honeypot spam and when SMTP is unconfigured)
    if (!isSpam) {
      try {
        const to = String(form.emailTo || '').trim() || (db.prepare("SELECT value FROM Setting WHERE key = 'admin_email'").get() as any)?.value || '';
        if (to) {
          const rows = fields.filter((f: any) => f.name && data[f.name] !== undefined && data[f.name] !== '')
            .map((f: any) => '<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">' + String(f.label || f.name).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">' + String(data[f.name]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</td></tr>');
          const tpl = renderTemplate('form_notification', {
            form_name: form.name,
            fields_html: '<table style="border-collapse:collapse;width:100%;font-size:13px;"><tr><th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Field</th><th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Value</th></tr>' + rows.join('') + '</table>',
            sent_at: new Date().toLocaleString(),
          });
          if (tpl) await sendEmail(to, tpl.subject, tpl.html);
        }
      } catch {}
    }
    try { doAction('form_submitted', id, form.slug); } catch {}
    const lang = (db.prepare("SELECT value FROM Setting WHERE key = 'site_lang'").get() as any)?.value;
    const defaultMsg = lang === 'zh' ? '提交成功，感谢您的来信！' : 'Thank you! Your message has been sent.';
    res.json({ success: true, message: form.successMessage || defaultMsg });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Admin: forms CRUD ----

const adminGuard = [authenticate, requireCap('manage_forms')];

function parseFormBody(req: AuthRequest): { name: string; fields: any[]; successMessage: string; emailTo: string; emailSubject: string; enabled: boolean } | { error: string } {
  const name = String(req.body?.name || '').trim();
  if (!name) return { error: 'A form name is required' };
  const rawFields = req.body?.fields;
  if (!Array.isArray(rawFields) || rawFields.length === 0) return { error: 'At least one field is required' };
  const fields = rawFields.map((f: any) => ({
    name: String(f?.name || '').trim().replace(/\s+/g, '_').slice(0, 50),
    label: String(f?.label || '').trim().slice(0, 100),
    type: ['text', 'email', 'number', 'tel', 'url', 'textarea', 'select'].includes(f?.type) ? f.type : 'text',
    required: !!f?.required,
    placeholder: String(f?.placeholder || '').slice(0, 200),
    options: String(f?.options || ''),
  }));
  if (fields.some(f => !f.name)) return { error: 'Every field needs a name' };
  return {
    name,
    fields,
    successMessage: String(req.body?.successMessage || '').slice(0, 500),
    emailTo: String(req.body?.emailTo || '').trim().slice(0, 200),
    emailSubject: String(req.body?.emailSubject || '').trim().slice(0, 200),
    enabled: req.body?.enabled !== false,
  };
}

// List forms with unread submission counts
router.get('/admin/forms', ...adminGuard, (_req: AuthRequest, res: Response) => {
  try {
    const forms = db.prepare('SELECT * FROM Form ORDER BY createdAt DESC').all() as any[];
    const counts = db.prepare("SELECT formId, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as unread, COUNT(*) as total FROM FormSubmission GROUP BY formId").all() as any[];
    const byForm = new Map(counts.map((c: any) => [c.formId, c]));
    res.json({
      forms: forms.map((f: any) => ({
        id: f.id, name: f.name, slug: f.slug, enabled: f.enabled,
        fieldCount: (() => { try { return (JSON.parse(f.fields || '[]') as any[]).length; } catch { return 0; } })(),
        unread: byForm.get(f.id)?.unread || 0, total: byForm.get(f.id)?.total || 0,
        createdAt: f.createdAt,
      })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/admin/forms', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const parsed = parseFormBody(req);
    if ('error' in parsed) { res.status(400).json({ error: parsed.error }); return; }
    const existing = (db.prepare('SELECT slug FROM Form').all() as any[]).map((r: any) => r.slug);
    const slug = uniqueSlug(slugify(parsed.name) || 'form', existing);
    const id = cuid();
    db.prepare('INSERT INTO Form (id, name, slug, fields, successMessage, emailTo, emailSubject, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, parsed.name, slug, JSON.stringify(parsed.fields), parsed.successMessage, parsed.emailTo, parsed.emailSubject, parsed.enabled ? 1 : 0);
    res.status(201).json({ id, slug });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/admin/forms/:id', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const form = db.prepare('SELECT * FROM Form WHERE id = ?').get(req.params.id) as any;
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    form.fields = JSON.parse(form.fields || '[]');
    res.json(form);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/admin/forms/:id', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Form WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Form not found' }); return; }
    const parsed = parseFormBody(req);
    if ('error' in parsed) { res.status(400).json({ error: parsed.error }); return; }
    db.prepare('UPDATE Form SET name = ?, fields = ?, successMessage = ?, emailTo = ?, emailSubject = ?, enabled = ?, updatedAt = ? WHERE id = ?')
      .run(parsed.name, JSON.stringify(parsed.fields), parsed.successMessage, parsed.emailTo, parsed.emailSubject, parsed.enabled ? 1 : 0, new Date().toISOString(), req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/admin/forms/:id', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM Form WHERE id = ?').run(req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Admin: submissions ----

router.get('/admin/forms/:id/submissions', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const form = db.prepare('SELECT * FROM Form WHERE id = ?').get(req.params.id) as any;
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '15')) || 15));
    const status = String(req.query.status || '');
    const where = status ? ' AND status = ?' : '';
    const params: any[] = [req.params.id];
    if (status) params.push(status);
    const total = (db.prepare('SELECT COUNT(*) as c FROM FormSubmission WHERE formId = ?' + where).get(...params) as any).c;
    const rows = db.prepare('SELECT id, data, ip, spam, status, userId, createdAt FROM FormSubmission WHERE formId = ?' + where + ' ORDER BY createdAt DESC LIMIT ? OFFSET ?')
      .all(...params, limit, (page - 1) * limit) as any[];
    const fields: any[] = (() => { try { return JSON.parse(form.fields || '[]'); } catch { return []; } })();
    res.json({
      total,
      fields,
      submissions: rows.map((r: any) => {
        let data: Record<string, string> = {};
        try { data = JSON.parse(r.data); } catch {}
        return { ...r, data };
      }),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark all submissions (optionally one) as read
router.post('/admin/forms/:id/submissions/read', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const sid = req.body?.submissionId;
    if (sid) {
      db.prepare("UPDATE FormSubmission SET status = 'read' WHERE id = ? AND formId = ?").run(sid, req.params.id);
    } else {
      db.prepare("UPDATE FormSubmission SET status = 'read' WHERE formId = ? AND status = 'new'").run(req.params.id);
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/admin/forms/:id/submissions/:sid', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM FormSubmission WHERE id = ? AND formId = ?').run(req.params.sid, req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Submission not found' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// CSV export of submissions (columns = current field labels, values quoted)
router.get('/admin/forms/:id/submissions/export', ...adminGuard, (req: AuthRequest, res: Response) => {
  try {
    const form = db.prepare('SELECT * FROM Form WHERE id = ?').get(req.params.id) as any;
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const fields: any[] = (() => { try { return JSON.parse(form.fields || '[]'); } catch { return []; } })();
    const rows = db.prepare('SELECT data, ip, spam, status, createdAt FROM FormSubmission WHERE formId = ? ORDER BY createdAt DESC').all(req.params.id) as any[];
    const header = ['Submitted At', 'IP', 'Status', ...fields.map((f: any) => f.label || f.name)];
    const lines = rows.map((r: any) => {
      let data: Record<string, string> = {};
      try { data = JSON.parse(r.data); } catch {}
      return escCsv(r.createdAt) + ',' + escCsv(r.ip || '') + ',' + escCsv(r.spam ? 'spam' : r.status) + ',' +
        fields.map((f: any) => escCsv(data[f.name] || '')).join(',');
    });
    const csv = '\uFEFF' + header.map(escCsv).join(',') + '\n' + lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // Filename must be ASCII — non-ASCII slugs (e.g. Chinese) would throw
    // "Invalid character in header content" on the Content-Disposition header.
    const asciiSlug = String(form.slug).replace(/[^\x20-\x7E]/g, '_').slice(0, 40) || 'form';
    res.setHeader('Content-Disposition', 'attachment; filename="' + asciiSlug + '-submissions.csv"');
    res.send(csv);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
