import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import db from './db';

// JWT secret: env var wins; otherwise generate once and persist in the DB so
// tokens survive server restarts (a random per-boot key invalidates every
// session on each restart — the cause of "save failed" 401s).
function loadSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'jwt_secret'").get() as any;
    if (row?.value) return row.value;
    const secret = require('crypto').randomBytes(32).toString('hex');
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'jwt_secret', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('jwt_secret', secret);
    console.warn('[JWT] No JWT_SECRET env var — generated a persistent secret (stored in DB).');
    return secret;
  } catch {
    // DB not ready yet (e.g. fresh install before tables exist) — per-boot key
    console.warn('[JWT] JWT_SECRET not set — using a random key. Tokens will be invalidated on restart.');
    return require('crypto').randomBytes(32).toString('hex');
  }
}

const SECRET = loadSecret();
const EXPIRES_IN = '7d';

export function signToken(payload: { userId: string; role: string; type?: string }, expiresIn: SignOptions['expiresIn'] = EXPIRES_IN): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token: string): { userId: string; role: string; type?: string } | null {
  try {
    return jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as { userId: string; role: string; type?: string };
  } catch {
    return null;
  }
}
