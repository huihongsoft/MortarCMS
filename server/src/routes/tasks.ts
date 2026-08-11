import { Router, Response } from 'express';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { listTasks, runTaskNow, setTaskEnabled } from '../utils/scheduler';

const router = Router();

// Admin: list scheduled tasks with run stats
router.get('/system/tasks', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ tasks: listTasks() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: run a task immediately
router.post('/system/tasks/:id/run', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await runTaskNow(req.params.id);
    if (!result.ok && result.error === 'Unknown task') { res.status(404).json({ error: result.error }); return; }
    res.json({ success: result.ok, ...result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: enable / disable a task
router.put('/system/tasks/:id/enabled', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    setTaskEnabled(req.params.id, req.body?.enabled !== false);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
