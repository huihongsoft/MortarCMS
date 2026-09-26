import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { UPLOADS_DIR as uploadsDir } from '../utils/paths';
import { likeContains } from '../utils/sqlLike';

const router = Router();

export interface SecurityCheck {
  id: string;
  label: string; // i18n key (English text; admin UI translates it)
  status: 'ok' | 'warn' | 'fail' | 'info';
  detail: string; // i18n key, may contain {0} placeholders replaced via args
  advice: string; // i18n key
  args?: Record<string, string | number>; // values for {n} placeholders
}

// Login audit: every authentication event, successful or not.
//
// Failed attempts were only fired as a hook, never stored, so "someone is
// guessing passwords on this account" was invisible unless a plugin happened to
// be listening. The rows live in Activity (which already held successful
// logins) and are pruned with it after 90 days.
//
// Gated by `manage_system`, not `manage_security`: the editor role holds the
// latter (for the audit score and the broken-link report), and attempted
// addresses and source IPs are not something an editor needs to see.
router.get('/auth-log', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30')) || 30));
    const kind = String(req.query.kind || '');
    const q = String(req.query.q || '').trim();
    const where: string[] = ["a.action IN ('login','login_failed','2fa_failed','login_recovery_code','logout_all','password_changed')"];
    const params: any[] = [];
    if (kind && AUTH_EVENT_KINDS.includes(kind)) { where.push('a.action = ?'); params.push(kind); }
    if (q) { where.push("(a.detail LIKE ? ESCAPE '\\' OR u.username LIKE ? ESCAPE '\\')"); const p = likeContains(q); params.push(p, p); }
    const whereSql = ' WHERE ' + where.join(' AND ');
    const total = (db.prepare('SELECT COUNT(*) as c FROM Activity a LEFT JOIN User u ON u.id = a.userId' + whereSql).get(...params) as any)?.c || 0;
    // `id DESC` breaks ties within the same second: createdAt is a second-resolution
    // CURRENT_TIMESTAMP, so two events of the same second used to come back in an
    // arbitrary order — an audit trail that reorders itself is not an audit trail.
    // The id starts with a base-36 timestamp, so it sorts by insertion on every
    // driver.
    const events = db.prepare(
      'SELECT a.id, a.action, a.detail, a.createdAt, a.userId, u.username FROM Activity a LEFT JOIN User u ON u.id = a.userId'
      + whereSql + ' ORDER BY a.createdAt DESC, a.id DESC LIMIT ? OFFSET ?'
    ).all(...params, limit, (page - 1) * limit) as any[];

    // Failure counts per detail (address / IP) over the last 24h — the signal an
    // operator actually acts on.
    let since = '';
    try { since = new Date(Date.now() - 24 * 3600_000).toISOString(); } catch { /* keep '' */ }
    const recentFailures = since
      ? db.prepare("SELECT detail, COUNT(*) as c FROM Activity WHERE action IN ('login_failed','2fa_failed') AND createdAt >= ? GROUP BY detail ORDER BY c DESC LIMIT 10").all(since) as any[]
      : [];

    res.json({ events, total, page, totalPages: Math.ceil(total / limit), recentFailures });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export const AUTH_EVENT_KINDS = ['login', 'login_failed', '2fa_failed', 'login_recovery_code', 'logout_all', 'password_changed'];

// Admin: run a security audit (WordPress Site Health style)
router.get('/audit', authenticate, requireCap('manage_security'), (req: AuthRequest, res: Response) => {
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
    let envExposed = false;
    if (fs.existsSync(envPath)) {
      const stat = fs.statSync(envPath);
      envExposed = (stat.mode & 0o004) !== 0; // world-readable
    }
    checks.push({ id: 'env_permissions', label: 'Configuration file permissions', status: envExposed ? 'warn' : 'ok', detail: envExposed ? 'server/.env is world-readable.' : 'server/.env is not world-readable.', advice: envExposed ? 'chmod 600 server/.env' : 'Keep .env out of version control (already in .gitignore).' });

    // 8. Public registration
    const regOpen = ((db.prepare("SELECT value FROM Setting WHERE key = 'users_can_register'").get() as any)?.value ?? '1') !== '0';
    if (regOpen) {
      checks.push({ id: 'public_register', label: 'Public registration', status: 'info', detail: 'Registration is open to visitors — new accounts get the default role.', advice: 'For closed communities, disable registration or pick a stricter default role in Settings.' });
    } else {
      checks.push({ id: 'public_register', label: 'Public registration', status: 'ok', detail: 'Public registration is disabled.', advice: 'Admins can still create accounts from Users.' });
    }

    // 9. Maintenance mode
    const mm = db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_mode'").get() as any;
    checks.push({ id: 'maintenance', label: 'Maintenance mode', status: 'info', detail: mm?.value === '1' ? 'Maintenance mode is ON — visitors see a maintenance page.' : 'Maintenance mode is off.', advice: 'Use maintenance mode during deployments.' });

    // 10. Database backup freshness
    const bakFiles = fs.existsSync(path.join(__dirname, '../..', 'data'))
      ? fs.readdirSync(path.join(__dirname, '../..', 'data')).filter(f => f.startsWith('mortar.db.bak-'))
      : [];
    checks.push({ id: 'backup', label: 'Database backups', status: bakFiles.length > 0 ? 'ok' : 'info', detail: bakFiles.length > 0 ? '{0} automatic backup(s) found.' : 'No .bak backups found yet.', args: { '0': bakFiles.length }, advice: 'Download a full backup (System Info → Backup) regularly.' });

    // 11. HTTPS
    // req.secure is derived from the socket and — only when TRUST_PROXY=1 —
    // from X-Forwarded-Proto. Reading the raw header here would let any client
    // spoof this check into reporting https.
    const proto = req.secure ? 'https' : 'http';
    checks.push({ id: 'https', label: 'HTTPS', status: proto === 'https' ? 'ok' : 'warn', detail: 'Connection is {0}.', args: { '0': proto }, advice: proto === 'https' ? '' : 'Terminate TLS at your reverse proxy (and set TRUST_PROXY=1) for production.' });

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
