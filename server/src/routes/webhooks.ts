import { Router, Response } from 'express';
import crypto from 'crypto';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { WEBHOOK_EVENTS, deliverTestWebhook } from '../utils/webhooks';

const router = Router();

function genSecret(): string { return crypto.randomBytes(32).toString('hex'); }

function sanitizeEvents(raw: any): string[] | null {
  if (!Array.isArray(raw)) return null;
  const ev = raw.filter((e: any) => typeof e === 'string' && WEBHOOK_EVENTS.includes(e));
  return ev.length === raw.length ? ev : null;
}

// Admin: list webhooks (secret is never returned — only whether one is set)
router.get('/admin/webhooks', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, name, url, events, active, lastStatus, lastError, lastSentAt, createdAt FROM Webhook ORDER BY createdAt DESC').all() as any[];
    res.json({ webhooks: rows.map((w: any) => ({ ...w, events: JSON.parse(w.events || '[]'), secretSet: !!w.secret })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create webhook — generates the signing secret, returned exactly once
router.post('/admin/webhooks', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const name = String(req.body?.name || '').trim();
    const url = String(req.body?.url || '').trim();
    const events = sanitizeEvents(req.body?.events);
    if (!name) { res.status(400).json({ error: 'A webhook name is required' }); return; }
    if (!/^https?:\/\//i.test(url)) { res.status(400).json({ error: 'Webhook URL must be http(s)' }); return; }
    if (!events || events.length === 0) { res.status(400).json({ error: 'Select at least one event' }); return; }
    const secret = genSecret();
    const id = cuid();
    db.prepare('INSERT INTO Webhook (id, name, url, events, secret, active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(id, name, url, JSON.stringify(events), secret);
    res.status(201).json({ id, name, url, events, secret, secretSet: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update webhook (name/url/events/active — secret is only reset via /reset-secret)
router.put('/admin/webhooks/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Webhook WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Webhook not found' }); return; }
    const name = String(req.body?.name ?? existing.name).trim();
    const url = String(req.body?.url ?? existing.url).trim();
    if (!name) { res.status(400).json({ error: 'A webhook name is required' }); return; }
    if (!/^https?:\/\//i.test(url)) { res.status(400).json({ error: 'Webhook URL must be http(s)' }); return; }
    let events = existing.events;
    if (req.body?.events !== undefined) {
      const clean = sanitizeEvents(req.body.events);
      if (!clean || clean.length === 0) { res.status(400).json({ error: 'Select at least one event' }); return; }
      events = JSON.stringify(clean);
    }
    const active = req.body?.active === undefined ? existing.active : (req.body.active ? 1 : 0);
    db.prepare('UPDATE Webhook SET name = ?, url = ?, events = ?, active = ? WHERE id = ?').run(name, url, events, active, req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete webhook
router.delete('/admin/webhooks/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM Webhook WHERE id = ?').run(req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Webhook not found' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: rotate the signing secret (returns the new one exactly once)
router.post('/admin/webhooks/:id/reset-secret', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Webhook WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Webhook not found' }); return; }
    const secret = genSecret();
    db.prepare('UPDATE Webhook SET secret = ? WHERE id = ?').run(secret, req.params.id);
    res.json({ success: true, secret });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: send a test event to verify endpoint + signature
router.post('/admin/webhooks/:id/test', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await deliverTestWebhook(req.params.id);
    if (result.error === 'Unknown webhook') { res.status(404).json({ error: 'Webhook not found' }); return; }
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
