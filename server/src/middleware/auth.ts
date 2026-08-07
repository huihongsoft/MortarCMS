import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import db from '../utils/db';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../routes/auth';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
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

  req.user = payload;
  next();
}


// App Password authentication
export function appPasswordAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('App ')) { next(); return; }
  const token = header.slice(4);
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const pw = db.prepare('SELECT ap.*, u.id as userId, u.role FROM AppPassword ap JOIN User u ON u.id = ap.userId WHERE ap.hash = ?').get(hash) as any;
  if (pw) { req.user = { userId: pw.userId, role: pw.role }; }
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

// WordPress-style capability map
const CAPABILITIES: Record<string, string[]> = {
  admin: ['*'],
  editor: ['edit_posts', 'edit_others_posts', 'publish_posts', 'delete_posts', 'delete_others_posts', 'moderate_comments', 'manage_categories', 'upload_files', 'edit_pages', 'publish_pages', 'manage_options'],
  author: ['edit_posts', 'edit_others_posts', 'publish_posts', 'delete_posts', 'upload_files'],
  contributor: ['edit_posts', 'delete_posts'],
  subscriber: [],
};

export function userCan(user: { userId: string; role: string } | undefined, cap: string): boolean {
  if (!user) return false;
  const caps = CAPABILITIES[user.role] || [];
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
