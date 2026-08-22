import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { passwordOk } from './auth';

const router = Router();
const updateUserSchema = z.object({ username: z.string().min(3).max(30).optional(), email: z.string().email().max(254).optional(), role: z.string().max(20).optional(), password: z.string().min(6).max(128).optional(), bio: z.string().max(500).optional(), avatar: z.string().max(500).optional() });

router.get('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, avatar, bio, createdAt, two_factor_enabled FROM User ORDER BY createdAt DESC').all() as any[];
    if (users.length > 0) {
      // One count query for all users instead of one per user
      const counts = new Map<string, number>();
      (db.prepare('SELECT authorId, COUNT(*) as cnt FROM Post WHERE authorId IN (' + users.map(() => '?').join(',') + ') GROUP BY authorId').all(...users.map((u: any) => u.id)) as any[])
        .forEach((r: any) => counts.set(r.authorId, r.cnt));
      users.forEach((u: any) => { u._count = { posts: counts.get(u.id) || 0 }; });
    }
    res.json(users);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.username !== undefined) { sets.push('username = ?'); vals.push(data.username); }
    if (data.email !== undefined) { sets.push('email = ?'); vals.push(data.email); }
    if (data.role !== undefined) { sets.push('role = ?'); vals.push(data.role); }
    if (data.bio !== undefined) { sets.push('bio = ?'); vals.push(data.bio); }
    if (data.avatar !== undefined) { sets.push('avatar = ?'); vals.push(data.avatar); }
    if (data.password) {
      if (!passwordOk(data.password)) { res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers' }); return; }
      sets.push('password = ?'); vals.push(await bcrypt.hash(data.password, 12));
    }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE User SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    const user = db.prepare('SELECT id, username, email, role, avatar, bio, createdAt FROM User WHERE id = ?').get(req.params.id) as any;
    res.json(user);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    // Post.authorId cascades on delete — refuse so a user's posts are never
    // silently destroyed. Transfer or delete the content first.
    const posts = (db.prepare('SELECT COUNT(*) as c FROM Post WHERE authorId = ?').get(req.params.id) as any)?.c || 0;
    if (posts > 0) {
      res.status(400).json({ error: '该用户仍有 ' + posts + ' 篇文章，请先转移或删除其内容' });
      return;
    }
    db.prepare('DELETE FROM User WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
