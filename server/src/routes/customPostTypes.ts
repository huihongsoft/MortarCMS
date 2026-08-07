import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all custom post types (from settings or default)
router.get('/', (_req: AuthRequest, res: Response) => {
  try {
    const types = [
      { slug: 'post', label: 'Posts', supports: ['title','editor','thumbnail','categories','tags','comments'] },
      { slug: 'page', label: 'Pages', supports: ['title','editor'] },
    ];
    res.json(types);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
