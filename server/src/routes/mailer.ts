import { Router, Response } from 'express';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';
import { listTemplates, renderTemplate, sendEmail, getMailSettings } from '../utils/mailer';

const router = Router();

// Admin: list email templates with rendered previews
router.get('/mailer/templates', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ templates: listTemplates(), settings: { configured: !!getMailSettings().host, host: getMailSettings().host || null } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: send a test email to verify SMTP configuration
router.post('/mailer/test', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const to = String(req.body?.to || '').trim();
    if (!to || !to.includes('@')) { res.status(400).json({ error: 'A valid recipient email is required' }); return; }
    const tpl = renderTemplate('test', {});
    if (!tpl) { res.status(500).json({ error: 'Test template missing' }); return; }
    const result = await sendEmail(to, tpl.subject, tpl.html);
    if (!result.ok) { res.status(502).json({ error: result.error }); return; }
    res.json({ success: true, to });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: send any template to a recipient with optional variable overrides
router.post('/mailer/send', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { to, template, vars } = req.body || {};
    const address = String(to || '').trim();
    if (!address.includes('@')) { res.status(400).json({ error: 'A valid recipient email is required' }); return; }
    const tpl = renderTemplate(String(template || 'test'), (vars as Record<string, string>) || {});
    if (!tpl) { res.status(404).json({ error: 'Unknown template' }); return; }
    const result = await sendEmail(address, tpl.subject, tpl.html);
    if (!result.ok) { res.status(502).json({ error: result.error }); return; }
    res.json({ success: true, to: address, template });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
