import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { cacheStats, cacheConfigure, purgeAllCaches } from '../utils/cache';

const router = Router();

// Cache status for the admin tools panel
router.get('/system/cache', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    res.json(cacheStats());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Purge every cached response immediately
router.post('/system/cache/purge', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const purged = purgeAllCaches();
    res.json({ success: true, purged });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update cache configuration (persisted to settings)
router.put('/system/cache', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const enabled = req.body?.enabled !== undefined ? !!req.body.enabled : true;
    const ttl = Math.max(5, Math.min(parseInt(req.body?.ttl) || 60, 3600));
    cacheConfigure(enabled, ttl);
    const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    upsert.run('cache_enabled', 'cache_enabled', enabled ? '1' : '0');
    upsert.run('cache_ttl', 'cache_ttl', String(ttl));
    res.json(cacheStats());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
