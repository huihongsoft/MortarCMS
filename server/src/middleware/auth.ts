import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import db from '../utils/db';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../routes/auth';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string; scope?: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  // Already authenticated (e.g. via app-password middleware)
  if (req.user) { next(); return; }
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  if (isTokenBlacklisted(token)) {
    res.status(401).json({ error: 'Session expired' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  // Only full session tokens authenticate. Partial tokens (e.g. the short-lived
  // `type: '2fa'` challenge issued after a correct password but before TOTP)
  // must NOT be usable as a session — otherwise 2FA is bypassable.
  if (payload.type) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  // Session version check: if the user "logged out everywhere", older tokens
  // carry a stale version and are rejected. A missing user row means the
  // account was deleted — reject the token as well.
  try {
    const user = db.prepare('SELECT tokenVersion FROM User WHERE id = ?').get(payload.userId) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    if (payload.v !== undefined && user.tokenVersion !== payload.v) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}


// A few GET endpoints still mutate state (maintenance/backup operations and
// the download counter). A read-only credential must not reach them even
// though the HTTP method looks safe.
const MUTATING_GET_RE = /^\/api\/(?:db\/(?:optimize|backup|backup-full)|media\/[^/]+\/download)\/?$/;

// A read-only app password may only perform safe (non-mutating) requests.
function appScopeAllows(scope: string, method: string, url: string): boolean {
  if (scope !== 'read') return true;
  if (!(method === 'GET' || method === 'HEAD' || method === 'OPTIONS')) return false;
  const path = String(url || '').split('?')[0];
  return !MUTATING_GET_RE.test(path);
}

// App Password authentication
export function appPasswordAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('App ')) { next(); return; }
  const token = header.slice(4);
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  let pw: any;
  try {
    pw = db.prepare('SELECT ap.*, u.id as userId, u.role, u.tokenVersion FROM AppPassword ap JOIN User u ON u.id = ap.userId WHERE ap.hash = ?').get(hash);
  } catch { next(); return; }
  // Unknown token: fall through as anonymous (protected routes still 401).
  if (!pw) { next(); return; }
  // Revoked / expired / issued before the user's last "log out everywhere":
  // do not grant the credential any authority.
  const expired = !!pw.expires_at && pw.expires_at < new Date().toISOString();
  const stale = Number(pw.token_version || 0) !== Number(pw.tokenVersion || 0);
  if (pw.revoked || expired || stale) { next(); return; }
  // A valid credential used outside its scope is an explicit 403, not a silent
  // downgrade to anonymous.
  if (!appScopeAllows(String(pw.scope || 'full'), req.method, req.originalUrl || req.url)) {
    res.status(403).json({ error: 'This app password is read-only' });
    return;
  }
  req.user = { userId: pw.userId, role: pw.role, scope: pw.scope };
  // Usage timestamp, throttled so reads don't trigger a write every request.
  try {
    if (!pw.last_used_at || Date.now() - Date.parse(pw.last_used_at) > 300000) {
      db.prepare('UPDATE AppPassword SET last_used_at = ? WHERE id = ?').run(new Date().toISOString(), pw.id);
    }
  } catch {}
  next();
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

// Resolve an optional caller for public endpoints that show more to a signed-in
// user. Unlike a bare verifyToken() this honours the token blacklist, rejects
// partial (2FA) tokens and enforces the session version, so a logged-out or
// demoted admin's old token can't unlock the admin view.
export function resolveOptionalUser(req: AuthRequest): { userId: string; role: string } | undefined {
  if (req.user) return req.user;
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return undefined;
  const token = header.slice(7);
  if (isTokenBlacklisted(token)) return undefined;
  const payload = verifyToken(token);
  if (!payload || payload.type) return undefined;
  try {
    const user = db.prepare('SELECT role, tokenVersion FROM User WHERE id = ?').get(payload.userId) as any;
    if (!user) return undefined;
    if (payload.v !== undefined && user.tokenVersion !== payload.v) return undefined;
    return { userId: payload.userId, role: user.role };
  } catch {
    return undefined;
  }
}

// Fallback capability map (used only if a role row is missing from the DB)
const FALLBACK_CAPABILITIES: Record<string, string[]> = {
  admin: ['*'],
  editor: ['edit_posts', 'edit_others_posts', 'publish_posts', 'delete_posts', 'delete_others_posts', 'moderate_comments', 'review_posts', 'manage_categories', 'manage_forms', 'upload_files', 'edit_pages', 'publish_pages', 'manage_options'],
  author: ['edit_posts', 'publish_posts', 'delete_posts', 'submit_posts', 'upload_files'],
  contributor: ['edit_posts', 'delete_posts'],
  subscriber: ['submit_posts'],
};

// Role → capabilities, cached briefly to avoid DB hits on every request.
// Invalidated by the roles admin routes via invalidateRoleCache().
let roleCache: { time: number; roles: Record<string, string[]> } = { time: 0, roles: {} };

export function invalidateRoleCache(): void {
  roleCache = { time: 0, roles: {} };
}

export function getRoleCapabilities(slug: string): string[] {
  const now = Date.now();
  if (now - roleCache.time > 3000) {
    roleCache = { time: now, roles: {} };
    try {
      const rows = db.prepare('SELECT slug, capabilities FROM Role').all() as any[];
      for (const r of rows) {
        try { roleCache.roles[r.slug] = JSON.parse(r.capabilities); } catch { roleCache.roles[r.slug] = []; }
      }
    } catch { /* DB not ready */ }
  }
  return roleCache.roles[slug] || FALLBACK_CAPABILITIES[slug] || [];
}

export function getAllRoles(): { slug: string; name: string; capabilities: string[]; isSystem: boolean }[] {
  try {
    const rows = db.prepare('SELECT slug, name, capabilities, isSystem FROM Role ORDER BY isSystem DESC, name').all() as any[];
    return rows.map((r: any) => {
      let caps: string[] = [];
      try { caps = JSON.parse(r.capabilities); } catch {}
      return { slug: r.slug, name: r.name, capabilities: caps, isSystem: !!r.isSystem };
    });
  } catch {
    return Object.keys(FALLBACK_CAPABILITIES).map(slug => ({ slug, name: slug, capabilities: FALLBACK_CAPABILITIES[slug], isSystem: true }));
  }
}

export function userCan(user: { userId: string; role: string } | undefined, cap: string): boolean {
  if (!user) return false;
  const caps = getRoleCapabilities(user.role);
  return caps.includes('*') || caps.includes(cap);
}

// Capability-based guard (WordPress-style fine-grained permissions)
export function requireCap(...caps: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!caps.some(cap => userCan(req.user, cap))) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
