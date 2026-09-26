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
