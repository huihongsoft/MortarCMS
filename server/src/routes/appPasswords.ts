import { Router, Response } from 'express';
import crypto from 'crypto';
import db, { cuid } from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const passwords = db.prepare(`SELECT id, name, scope, expires_at as expiresAt, revoked,
      last_used_at as lastUsedAt, created_at as createdAt FROM AppPassword WHERE userId = ? ORDER BY created_at DESC`).all(req.user!.userId) as any[];
    res.json(passwords);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, scope, expiresInDays } = req.body || {};
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const safeScope = scope === 'read' ? 'read' : 'full';
    let expiresAt = '';
    const days = Number(expiresInDays);
    if (Number.isFinite(days) && days > 0) {
      expiresAt = new Date(Date.now() + Math.min(days, 3650) * 86400000).toISOString();
    }
    const token = crypto.randomBytes(24).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const id = cuid();
    // Tie the credential to the user's current session version so a
    // "log out everywhere" invalidates it along with JWT sessions.
    const u = db.prepare('SELECT tokenVersion FROM User WHERE id = ?').get(req.user!.userId) as any;
    db.prepare('INSERT INTO AppPassword (id, userId, name, hash, scope, expires_at, token_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user!.userId, name, hash, safeScope, expiresAt, Number(u?.tokenVersion || 0), new Date().toISOString());
    res.status(201).json({ id, name, scope: safeScope, expiresAt, token, message: 'Save this token - it will not be shown again' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Explicit revocation keeps the row for the audit trail (GET shows revoked).
router.post('/:id/revoke', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('UPDATE AppPassword SET revoked = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true, revoked: r.changes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM AppPassword WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
