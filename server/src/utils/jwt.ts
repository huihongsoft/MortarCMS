import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

// In production always set JWT_SECRET; otherwise fall back to a random per-boot key
const SECRET = process.env.JWT_SECRET || (() => {
  console.warn('[JWT] JWT_SECRET not set — using a random key. Tokens will be invalidated on restart.');
  return require('crypto').randomBytes(32).toString('hex');
})();
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
