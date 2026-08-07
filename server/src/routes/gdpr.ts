import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GDPR: export all personal data for a user
router.get('/export', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = db.prepare('SELECT username, email, role, bio, createdAt FROM User WHERE id = ?').get(userId) as any;
    const comments = db.prepare('SELECT content, createdAt FROM Comment WHERE userId = ?').all(userId) as any[];
    const posts = db.prepare('SELECT title, createdAt FROM Post WHERE authorId = ?').all(userId) as any[];
    res.json({ exported_at: new Date().toISOString(), user, comments, posts });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GDPR: erase all personal data for a user
router.post('/erase', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    db.prepare('UPDATE Comment SET author = ?, email = ?, userId = NULL WHERE userId = ?').run('Anonymous', '', userId);
    // Anonymize authored posts (content stays, authorship removed)
    db.prepare('UPDATE Post SET authorId = NULL WHERE authorId = ?').run(userId);
    // Remove user's uploaded media files
    const media = db.prepare('SELECT id, url FROM Media WHERE userId = ?').all(userId) as any[];
    for (const m of media) {
      const filePath = require('path').join(__dirname, '../..', m.url);
      if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
      db.prepare('DELETE FROM Media WHERE id = ?').run(m.id);
    }
    db.prepare('DELETE FROM User WHERE id = ?').run(userId);
    res.json({ success: true, message: 'Personal data erased' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
