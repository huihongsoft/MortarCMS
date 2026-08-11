import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Collect every personal-data record for a user (GDPR export)
function collectUserData(userId: string): any {
  const user = db.prepare('SELECT username, email, role, bio, avatar, createdAt FROM User WHERE id = ?').get(userId) as any;
  return {
    user,
    comments: db.prepare('SELECT content, createdAt FROM Comment WHERE userId = ?').all(userId),
    posts: db.prepare('SELECT title, slug, createdAt FROM Post WHERE authorId = ?').all(userId),
    media: db.prepare('SELECT original, url, createdAt FROM Media WHERE userId = ?').all(userId),
    appPasswords: db.prepare('SELECT name, created_at FROM AppPassword WHERE userId = ?').all(userId),
    aiUsage: db.prepare('SELECT kind, model, tokens, createdAt FROM AiUsage WHERE userId = ?').all(userId),
    aiNotifications: db.prepare('SELECT message, createdAt FROM AiNotification WHERE userId = ?').all(userId),
    activity: db.prepare('SELECT action, detail, createdAt FROM Activity WHERE userId = ?').all(userId),
  };
}

// Erase every personal-data record for a user (GDPR "right to be forgotten").
// Content they authored stays but is anonymized; media files are deleted.
function eraseUserData(userId: string): { mediaDeleted: number } {
  db.prepare('UPDATE Comment SET author = ?, email = ?, userId = NULL WHERE userId = ?').run('Anonymous', '', userId);
  db.prepare('UPDATE Post SET authorId = NULL WHERE authorId = ?').run(userId);
  const media = db.prepare('SELECT id, url FROM Media WHERE userId = ?').all(userId) as any[];
  let deleted = 0;
  for (const m of media) {
    try {
      const filePath = require('path').join(__dirname, '../..', m.url);
      if (require('fs').existsSync(filePath)) { require('fs').unlinkSync(filePath); deleted++; }
    } catch {}
    db.prepare('DELETE FROM Media WHERE id = ?').run(m.id);
  }
  db.prepare('DELETE FROM AppPassword WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM AiMemory WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM AiUsage WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM AiNotification WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM Activity WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM User WHERE id = ?').run(userId);
  return { mediaDeleted: deleted };
}

// GDPR: export all personal data for the current user
router.get('/export', authenticate, (req: AuthRequest, res: Response) => {
  try {
    res.json({ exported_at: new Date().toISOString(), ...collectUserData(req.user!.userId) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GDPR: erase all personal data for the current user
router.post('/erase', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const result = eraseUserData(req.user!.userId);
    res.json({ success: true, message: 'Personal data erased', ...result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: export any user's personal data
router.get('/admin/export/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    res.json({ exported_at: new Date().toISOString(), ...collectUserData(req.params.id) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: erase any user's personal data
router.post('/admin/erase/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user!.userId) { res.status(400).json({ error: 'Use the self-service erase for your own account' }); return; }
    const result = eraseUserData(req.params.id);
    res.json({ success: true, message: 'User data erased', ...result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
