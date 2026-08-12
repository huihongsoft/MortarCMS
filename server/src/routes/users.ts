import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { passwordOk } from './auth';

const router = Router();
const updateUserSchema = z.object({ username: z.string().min(3).optional(), email: z.string().email().optional(), role: z.string().optional(), password: z.string().min(6).optional(), bio: z.string().optional(), avatar: z.string().optional() });

router.get('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, avatar, bio, createdAt FROM User ORDER BY createdAt DESC').all() as any[];
    users.forEach((u: any) => { u._count = { posts: (db.prepare('SELECT COUNT(*) as cnt FROM Post WHERE authorId = ?').get(u.id) as any)?.cnt || 0 }; });
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
  try { db.prepare('DELETE FROM User WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
