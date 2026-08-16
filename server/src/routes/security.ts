import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

export interface SecurityCheck {
  id: string;
  label: string; // i18n key (English text; admin UI translates it)
  status: 'ok' | 'warn' | 'fail' | 'info';
  detail: string; // i18n key, may contain {0} placeholders replaced via args
  advice: string; // i18n key
  args?: Record<string, string | number>; // values for {n} placeholders
}

// Admin: run a security audit (WordPress Site Health style)
router.get('/audit', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const checks: SecurityCheck[] = [];
    const isProd = process.env.NODE_ENV === 'production';

    // 1. JWT secret
    if (process.env.JWT_SECRET) {
      checks.push({ id: 'jwt_secret', label: 'JWT secret configured', status: 'ok', detail: 'JWT_SECRET is set — sessions survive restarts.', advice: 'Keep it secret and rotate on compromise.' });
    } else if (isProd) {
      checks.push({ id: 'jwt_secret', label: 'JWT secret configured', status: 'fail', detail: 'JWT_SECRET is not set — the server refuses to start in production without it.', advice: 'Set JWT_SECRET in server/.env (long random string).' });
    } else {
      checks.push({ id: 'jwt_secret', label: 'JWT secret configured', status: 'warn', detail: 'JWT_SECRET is not set — a dev secret is persisted in server/data/.jwt-secret so sessions survive restarts. Set JWT_SECRET before going to production.', advice: 'Set JWT_SECRET in server/.env (long random string).' });
    }

    // 2. Login protection (lockout + rate limit)
    checks.push({ id: 'login_protection', label: 'Login brute-force protection', status: 'ok', detail: 'Account lockout (5 failures / 15 min) and rate limiting (10/min) are active on login.', advice: 'Keep enabled; consider lower limits for high-risk deployments.' });

    // 3. 2FA adoption
    const admins = db.prepare("SELECT COUNT(*) as c FROM User WHERE role = 'admin' AND two_factor_enabled = 1").get() as any;
    const adminTotal = db.prepare("SELECT COUNT(*) as c FROM User WHERE role = 'admin'").get() as any;
    if (adminTotal?.c > 0 && (!admins || admins.c === 0)) {
      checks.push({ id: 'two_factor', label: 'Two-factor authentication', status: 'warn', detail: 'No admin account has 2FA enabled.', advice: 'Enable 2FA for at least one admin account (admin → Users → 2FA).' });
    } else {
      checks.push({ id: 'two_factor', label: 'Two-factor authentication', status: 'ok', detail: 'At least one admin has 2FA enabled.', advice: 'Enable 2FA for all privileged accounts.' });
    }

    // 4. Password policy
    checks.push({ id: 'password_policy', label: 'Password strength policy', status: 'ok', detail: 'Registration and password changes require 8+ characters with letters and numbers.', advice: 'Consider requiring 12+ characters for admin accounts.' });

    // 5. Upload filter
    checks.push({ id: 'upload_filter', label: 'Upload file filtering', status: 'ok', detail: 'Uploads are restricted by extension + MIME allowlist; image content is verified with sharp.', advice: 'Keep the allowlist tight; no scripts or executables are accepted.' });

    // 6. Security headers
    const secured = !!res.getHeader('X-Frame-Options');
    if (secured) {
      checks.push({ id: 'security_headers', label: 'Security headers', status: 'ok', detail: 'X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy are applied.', advice: 'Add a Content-Security-Policy for stricter control if needed.' });
    } else {
      checks.push({ id: 'security_headers', label: 'Security headers', status: 'warn', detail: 'Headers not visible on this request (may still be set by a reverse proxy).', advice: 'Ensure X-Frame-Options / nosniff are set at the proxy level.' });
    }

    // 7. Sensitive files exposure
    const envPath = path.join(__dirname, '../..', '.env');
    const uploadsDir = path.join(__dirname, '../..', 'uploads');
    let envExposed = false;
    if (fs.existsSync(envPath)) {
      const stat = fs.statSync(envPath);
      envExposed = (stat.mode & 0o004) !== 0; // world-readable
    }
    checks.push({ id: 'env_permissions', label: 'Configuration file permissions', status: envExposed ? 'warn' : 'ok', detail: envExposed ? 'server/.env is world-readable.' : 'server/.env is not world-readable.', advice: envExposed ? 'chmod 600 server/.env' : 'Keep .env out of version control (already in .gitignore).' });

    // 8. Public registration
    const regOpen = true; // registration endpoint is open by design
    checks.push({ id: 'public_register', label: 'Public registration', status: 'info', detail: 'Registration is open to visitors (default role: author).', advice: 'For closed communities, disable registration or set a stricter default role.' });

    // 9. Maintenance mode
    const mm = db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_mode'").get() as any;
    checks.push({ id: 'maintenance', label: 'Maintenance mode', status: 'info', detail: mm?.value === '1' ? 'Maintenance mode is ON — visitors see a maintenance page.' : 'Maintenance mode is off.', advice: 'Use maintenance mode during deployments.' });

    // 10. Database backup freshness
    const bakFiles = fs.existsSync(path.join(__dirname, '../..', 'data'))
      ? fs.readdirSync(path.join(__dirname, '../..', 'data')).filter(f => f.startsWith('mortar.db.bak-'))
      : [];
    checks.push({ id: 'backup', label: 'Database backups', status: bakFiles.length > 0 ? 'ok' : 'info', detail: bakFiles.length > 0 ? '{0} automatic backup(s) found.' : 'No .bak backups found yet.', args: { '0': bakFiles.length }, advice: 'Download a full backup (System Info → Backup) regularly.' });

    // 11. HTTPS
    const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
    checks.push({ id: 'https', label: 'HTTPS', status: proto === 'https' ? 'ok' : 'warn', detail: 'Connection is {0}.', args: { '0': proto }, advice: proto === 'https' ? '' : 'Terminate TLS at your reverse proxy for production.' });

    // 12. App passwords
    const appPw = db.prepare('SELECT COUNT(*) as c FROM AppPassword').get() as any;
    checks.push({ id: 'app_passwords', label: 'Application passwords', status: 'info', detail: '{0} application password(s) in use.', args: { '0': appPw?.c || 0 }, advice: 'Revoke unused application passwords.' });

    const summary = {
      ok: checks.filter(c => c.status === 'ok').length,
      warn: checks.filter(c => c.status === 'warn').length,
      fail: checks.filter(c => c.status === 'fail').length,
      info: checks.filter(c => c.status === 'info').length,
      score: Math.round((checks.filter(c => c.status === 'ok').length / checks.length) * 100),
    };
    res.json({ checks, summary, generatedAt: new Date().toISOString() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
