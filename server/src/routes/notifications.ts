import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { listFor, unreadCount, markRead, markAllRead } from '../utils/notifications';

const router = Router();

// The signed-in user's own notifications: AI task reports and editorial workflow
// events in one list. No capability gate — each account reads its own, and every
// query is scoped by userId, so there is nothing here to escalate to.
//
// (These routes lived under /api/ai while the table was the AI assistant's. The
// bell shows review results too, so the path follows the data.)

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    res.json({ notifications: listFor(req.user!.userId), unread: unreadCount(req.user!.userId) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, marked: markAllRead(req.user!.userId) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    // markRead is scoped to the owner, so another account's id simply does nothing.
    markRead(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
