import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { signToken, verifyToken } from '../utils/jwt';
export { passwordOk };
import { logActivity } from './activity';
import { doAction } from '../utils/hooks';
import { renderTemplate, sendEmail } from '../utils/mailer';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
// Password policy: >= 8 chars, at least one letter and one digit
function passwordOk(pw: string): boolean {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
}
const registerSchema = z.object({ username: z.string().min(3).max(30), email: z.string().email(), password: z.string().min(8), role: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

// Login failure lockout: 5 failures -> 15 min lock per email
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();
// Memory cap: drop the oldest entries when the map grows unbounded (attacker
// can otherwise grow it indefinitely with random emails).
function pruneLoginFailures(): void {
  if (loginFailures.size <= 10000) return;
  const now = Date.now();
  for (const [k, rec] of loginFailures) {
    if (loginFailures.size <= 5000) break;
    if (rec.lockedUntil <= now) loginFailures.delete(k);
  }
  // Still over the cap: evict oldest-inserted entries
  let extra = loginFailures.size - 5000;
  for (const k of loginFailures.keys()) {
    if (extra <= 0) break;
    loginFailures.delete(k); extra--;
  }
}
function checkLock(email: string): boolean {
  pruneLoginFailures();
  const rec = loginFailures.get(email);
  if (!rec) return false;
  if (rec.lockedUntil > Date.now()) return true;
  // Only clean up expired *locks*; plain failure counters must persist
  if (rec.lockedUntil > 0 && rec.lockedUntil <= Date.now()) loginFailures.delete(email);
  return false;
}
function recordFailure(email: string): void {
  pruneLoginFailures();
  const before = loginFailures.get(email);
  const rec = before || { count: 0, lockedUntil: 0 };
  rec.count++;
  if (rec.count >= 5) { rec.lockedUntil = Date.now() + 15 * 60 * 1000; rec.count = 0; }
  loginFailures.set(email, rec);
}

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    if (!passwordOk(data.password)) { res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers' }); return; }
    // Role handling: only authenticated admins may assign a role. Public
    // registrations always get the site's default role (never elevated).
    let isAdminCreate = false;
    try {
      const header = req.headers.authorization || '';
      if (header.startsWith('Bearer ')) {
        const payload = verifyToken(header.slice(7));
        if (payload?.role === 'admin') isAdminCreate = true;
      }
    } catch {}
    if (!isAdminCreate) {
      const canRegister = (db.prepare("SELECT value FROM Setting WHERE key = 'users_can_register'").get() as any)?.value;
      if (canRegister === '0') { res.status(403).json({ error: 'Registration is closed on this site' }); return; }
    }
    const existing = db.prepare('SELECT id FROM User WHERE email = ? OR username = ?').get(data.email, data.username);
    if (existing) { res.status(409).json({ error: 'Username or email already taken' }); return; }
    const password = await bcrypt.hash(data.password, 12);
    const id = cuid();
    const role = isAdminCreate
      ? (data.role || 'author')
      : ((db.prepare("SELECT value FROM Setting WHERE key = 'default_role'").get() as any)?.value || 'author');
    const safeRole = ['admin', 'editor', 'author', 'contributor', 'subscriber'].includes(role) ? role : 'author';
    db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, data.username, data.email, password, safeRole);
    // Include the session version (v: 0) so "log out everywhere" also revokes
    // tokens issued at registration time.
    const token = signToken({ userId: id, role: safeRole, v: 0 });
    doAction('user_register', id, safeRole);
    res.status(201).json({ user: { id, username: data.username, email: data.email, role: safeRole }, token });
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    if (checkLock(data.email)) { res.status(429).json({ error: 'Too many failed attempts, try again in 15 minutes' }); return; }
    const user = db.prepare('SELECT * FROM User WHERE email = ?').get(data.email) as any;
    if (!user) { recordFailure(data.email); res.status(401).json({ error: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) { recordFailure(data.email); res.status(401).json({ error: 'Invalid credentials' }); return; }
    loginFailures.delete(data.email);
    // 2FA challenge: issue a short-lived temp token, final token comes after code verification
    if (user.two_factor_enabled) {
      const tempToken = signToken({ userId: user.id, role: user.role, type: '2fa' }, '5m');
      res.json({ twoFactorRequired: true, tempToken });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role, v: (user as any).tokenVersion || 0 });
    const { password, ...safe } = user;
    logActivity(user.id, 'login', 'User logged in');
    res.json({ user: safe, token });
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

// 2FA: verify challenge code and issue the real token
router.post('/2fa/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { tempToken, code } = req.body || {};
    if (!tempToken || !code) { res.status(400).json({ error: 'tempToken and code required' }); return; }
    const payload = verifyToken(tempToken);
    if (!payload || payload.type !== '2fa') { res.status(401).json({ error: 'Invalid or expired challenge' }); return; }
    const user = db.prepare('SELECT * FROM User WHERE id = ?').get(payload.userId) as any;
    if (!user || !user.two_factor_enabled) { res.status(401).json({ error: 'Invalid challenge' }); return; }
    const { verifyTOTP } = require('../utils/totp');
    if (!verifyTOTP(user.two_factor_secret, String(code))) { res.status(401).json({ error: 'Invalid verification code' }); return; }
    const token = signToken({ userId: user.id, role: user.role, v: (user as any).tokenVersion || 0 });
    const { password, ...safe } = user;
    logActivity(user.id, 'login', 'User logged in with 2FA');
    res.json({ user: safe, token });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Logout: blacklist the presented token (in-memory; cleared on restart)
const tokenBlacklist = new Set<string>();
router.post('/logout-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      const row = db.prepare('SELECT tokenVersion FROM User WHERE id = ?').get(req.user.userId) as any;
      const nextV = ((row?.tokenVersion || 0) as number) + 1;
      db.prepare('UPDATE User SET tokenVersion = ? WHERE id = ?').run(nextV, req.user.userId);
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) tokenBlacklist.add(header.slice(7));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
export function isTokenBlacklisted(token: string): boolean { return tokenBlacklist.has(token); }

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, username, email, role, avatar, bio, createdAt FROM User WHERE id = ?').get(req.user!.userId) as any;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 2FA: setup (get secret + QR URL)
router.post('/2fa/setup', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { generateSecret } = require('../utils/totp');
    const user = db.prepare('SELECT id, two_factor_secret, two_factor_enabled, email FROM User WHERE id = ?').get(req.user!.userId) as any;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.two_factor_enabled) { res.json({ enabled: true, message: '2FA already enabled' }); return; }
    const secret = generateSecret();
    db.prepare('UPDATE User SET two_factor_secret = ? WHERE id = ?').run(secret, req.user!.userId);
    const otpauth = 'otpauth://totp/Mortar:' + user.email + '?secret=' + secret + '&issuer=Mortar';
    res.json({ secret, otpauth, enabled: false });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 2FA: verify and enable
router.post('/2fa/enable', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const user = db.prepare('SELECT two_factor_secret FROM User WHERE id = ?').get(req.user!.userId) as any;
    if (!user?.two_factor_secret) { res.status(400).json({ error: 'Setup 2FA first' }); return; }
    const { verifyTOTP } = require('../utils/totp');
    if (!verifyTOTP(user.two_factor_secret, code)) { res.status(400).json({ error: 'Invalid code' }); return; }
    db.prepare('UPDATE User SET two_factor_enabled = 1 WHERE id = ?').run(req.user!.userId);
    res.json({ success: true, message: '2FA enabled' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 2FA: disable
router.post('/2fa/disable', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare("UPDATE User SET two_factor_enabled = 0, two_factor_secret = '' WHERE id = ?").run(req.user!.userId);
    res.json({ success: true, message: '2FA disabled' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 2FA: check status
router.get('/2fa/status', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT two_factor_enabled FROM User WHERE id = ?').get(req.user!.userId) as any;
    res.json({ enabled: !!user?.two_factor_enabled });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Password Reset: request token (sends the reset link by email when SMTP is configured)
router.post('/forgot-password', (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const user = db.prepare('SELECT id, username FROM User WHERE email = ?').get(email) as any;
    if (!user) { res.json({ message: 'If the email exists, a reset link has been sent.' }); return; }
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString();
    db.prepare('UPDATE User SET reset_token = ?, reset_expires = ? WHERE id = ?').run(token, expires, user.id);
    // Deliver the reset link by email (best-effort; SMTP may not be configured)
    try {
      const siteUrl = ((db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || 'http://localhost:3001').replace(/\/$/, '');
      const tpl = renderTemplate('password_reset', { username: user.username, reset_link: siteUrl + '/admin#/reset?token=' + token });
      if (tpl) { void sendEmail(email, tpl.subject, tpl.html); }
    } catch { /* email delivery is best-effort */ }
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Password Reset: verify token and set new password
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ error: 'Token and password required' }); return; }
    if (!passwordOk(password)) { res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers' }); return; }
    const user = db.prepare('SELECT id FROM User WHERE reset_token = ? AND reset_expires > datetime(?)').get(token, new Date().toISOString()) as any;
    if (!user) { res.status(400).json({ error: 'Invalid or expired token' }); return; }
    const hashed = await bcrypt.hash(password, 12);
    db.prepare("UPDATE User SET password = ?, reset_token = '', reset_expires = '' WHERE id = ?").run(hashed, user.id);
    res.json({ message: 'Password has been reset.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
