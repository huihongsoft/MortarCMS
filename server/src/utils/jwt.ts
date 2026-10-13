import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { loadSecret } from './secretBox';

// Secret resolution moved to utils/secretBox so that module stays free of a
// database import (db.ts needs its encryption helpers for the 2FA migration, and
// importing them from here would be a cycle). Re-exported because callers —
// utils/ai.ts among them — import it from this module.
export { loadSecret };

const EXPIRES_IN = '7d';

export function signToken(payload: { userId: string; role: string; type?: string; v?: number }, expiresIn: SignOptions['expiresIn'] = EXPIRES_IN): string {
  return jwt.sign(payload, loadSecret(), { expiresIn });
}

export function verifyToken(token: string): { userId: string; role: string; type?: string; v?: number; exp?: number } | null {
  try {
    return jwt.verify(token, loadSecret(), { algorithms: ['HS256'] }) as { userId: string; role: string; type?: string; v?: number; exp?: number };
  } catch {
    return null;
  }
}

// A preview link is a capability carried in a URL: it names exactly one post and
// nothing else. `type: 'preview'` keeps it from ever acting as a session —
// authenticate() rejects any payload that carries a type, so handing the link to
// a reviewer cannot hand them the account.
//
// `v` mirrors the session tokenVersion, so "log out everywhere" and a password
// change invalidate outstanding preview links too. See GET /posts/:id/preview-link.
export function signPreviewToken(
  payload: { userId: string; pid: string; sid?: string | null; v?: number },
  expiresIn: SignOptions['expiresIn'] = '24h',
): string {
  return jwt.sign({ ...payload, type: 'preview' }, loadSecret(), { expiresIn });
}

export function verifyPreviewToken(token: string): { userId: string; pid: string; sid?: string | null; v?: number; exp?: number } | null {
  const p = verifyToken(token) as any;
  if (!p || p.type !== 'preview') return null;
  if (typeof p.userId !== 'string' || typeof p.pid !== 'string' || !p.pid) return null;
  return p;
}
