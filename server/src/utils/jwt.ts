import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import db from './db';

// JWT secret resolution order:
//   1. JWT_SECRET env var — REQUIRED in production (fail fast if missing).
//   2. server/data/.jwt-secret file (mode 0600) — dev fallback so tokens survive
//      server restarts without requiring env configuration.
//   3. A legacy secret previously persisted in the Setting table is migrated to
//      the file and removed from the DB, so a database backup can never be used
//      to forge tokens.
// The secret is resolved lazily (per call): the DB may not be initialized yet
// when this module is first imported.
const SECRET_FILE = path.join(__dirname, '../../data/.jwt-secret');

let cachedSecret: string | null = null;

export function loadSecret(): string {
  if (cachedSecret) return cachedSecret;

  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('[JWT] JWT_SECRET is short — use a long random string (32+ chars) in production.');
    }
    cachedSecret = process.env.JWT_SECRET;
    return cachedSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    // Fail fast: silently falling back to a generated/DB secret in production
    // would invalidate every session on restart and risks token forgery if the
    // secret leaks.
    console.error('[JWT] JWT_SECRET environment variable is REQUIRED in production.');
    console.error('      Generate one and add it to your environment, e.g.:');
    console.error('      node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  // Dev fallback: persist the secret in a 0600 file so sessions survive restarts.
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const fromFile = fs.readFileSync(SECRET_FILE, 'utf8').trim();
      if (fromFile) { cachedSecret = fromFile; return cachedSecret; }
    }
  } catch { /* fall through */ }

  // Migrate a legacy DB-stored secret, then remove it from the DB.
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'jwt_secret'").get() as any;
    if (row?.value) {
      cachedSecret = row.value;
      try {
        db.prepare("DELETE FROM Setting WHERE key = 'jwt_secret'").run();
        console.warn('[JWT] Migrated DB-stored JWT secret to ' + SECRET_FILE + ' (removed from DB).');
      } catch { /* best effort */ }
    }
  } catch { /* DB not ready yet — a new secret is generated below */ }

  if (!cachedSecret) {
    cachedSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[JWT] No JWT_SECRET set — generated a dev secret stored in ' + SECRET_FILE);
  }
  try {
    fs.mkdirSync(path.dirname(SECRET_FILE), { recursive: true });
    fs.writeFileSync(SECRET_FILE, cachedSecret, { mode: 0o600 });
  } catch (err: any) {
    console.warn('[JWT] Could not persist dev secret: ' + err.message);
  }
  return cachedSecret;
}

// Fail fast in production: verify JWT_SECRET at module load (i.e. server
// startup) rather than on the first signed request.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[JWT] JWT_SECRET environment variable is REQUIRED in production.');
  console.error('      Generate one and add it to your environment, e.g.:');
  console.error('      node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

const EXPIRES_IN = '7d';

export function signToken(payload: { userId: string; role: string; type?: string; v?: number }, expiresIn: SignOptions['expiresIn'] = EXPIRES_IN): string {
  return jwt.sign(payload, loadSecret(), { expiresIn });
}

export function verifyToken(token: string): { userId: string; role: string; type?: string; v?: number } | null {
  try {
    return jwt.verify(token, loadSecret(), { algorithms: ['HS256'] }) as { userId: string; role: string; type?: string; v?: number };
  } catch {
    return null;
  }
}
