import { Router, Response } from 'express';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';
import { listHooks, addAction, addFilter, removeAction, removeFilter, removeAllHooks, KNOWN_ACTIONS, KNOWN_FILTERS } from '../utils/hooks';

const router = Router();

// Visual hooks browser: list every registered/canonical hook with its listeners
router.get('/system/hooks', authenticate, requireCap('view_system_info'), (_req: AuthRequest, res: Response) => {
  try {
    res.json(listHooks());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Hooks are registered in code (plugins/themes/core) — no runtime persistence needed.
// The following admin endpoints only manage the in-process registrations, useful for
// plugins that expose dynamic hooks or for debugging/tests.
router.post('/system/hooks/actions/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { priority = 10, source = 'admin' } = req.body || {};
    addAction(req.params.name, () => {}, Number(priority) || 10, String(source).slice(0, 50));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/system/hooks/filters/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { priority = 10, source = 'admin' } = req.body || {};
    addFilter(req.params.name, (v: any) => v, Number(priority) || 10, String(source).slice(0, 50));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/system/hooks/:kind/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { kind, name } = req.params;
    if (kind === 'action') removeAction(name);
    else if (kind === 'filter') removeFilter(name);
    else { res.status(400).json({ error: 'kind must be action or filter' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Reset a hook to its canonical state (remove all dynamic listeners)
router.delete('/system/hooks/:kind/:name/reset', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { kind, name } = req.params;
    if ((kind === 'action' && !KNOWN_ACTIONS.includes(name)) || (kind === 'filter' && !KNOWN_FILTERS.includes(name))) {
      res.status(400).json({ error: 'Cannot reset a non-canonical hook' });
      return;
    }
    removeAllHooks(name);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
