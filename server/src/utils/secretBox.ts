// Secret resolution and symmetric encryption, kept free of any database import.
//
// Everything at rest that must not be readable from a database dump goes through
// here: AI provider keys and bindings, and the TOTP secrets behind two-factor
// auth. The key is derived from the JWT secret, which is never stored in the
// database (see loadSecret below).
//
// This module deliberately does NOT import utils/db. db.ts needs encryptSecret
// for the migration that encrypts pre-existing TOTP secrets, and a static import
// back into the database module would be a cycle. The one place that does need
// the database — the legacy JWT-secret migration — requires it lazily.
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// ---- JWT secret resolution (moved here from utils/jwt.ts) ----
//
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

  // Migrate a legacy DB-stored secret, then remove it from the DB. Required
  // lazily on purpose: a static import of db.ts from here would make db.ts ↔
  // secretBox.ts a cycle (db.ts imports this module for the 2FA migration).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('./db').default;
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

// ---- Symmetric encryption for values stored at rest ----
//
// AES-256-GCM with a key derived from the JWT secret, so a database backup (or
// an export) does not expose credentials. Rotating JWT_SECRET therefore makes
// existing encrypted values unreadable — re-enter them (documented in
// docs/security-hardening.md).

/** Marks an encrypted value, and keeps plaintext legacy rows identifiable. */
export const SECRET_PREFIX = 'enc:v1:';

function secretKey(): Buffer {
  return crypto.createHash('sha256').update(loadSecret()).digest();
}

export function isEncryptedSecret(value: unknown): boolean {
  return String(value || '').startsWith(SECRET_PREFIX);
}

/** Encrypt an arbitrary string. Returns the `enc:v1:<base64>` envelope. */
export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const enc = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return SECRET_PREFIX + Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64');
}

/**
 * Decrypt an envelope produced by encryptSecret. Returns null when the value is
 * not encrypted or cannot be authenticated (a rotated JWT secret, a truncated
 * value) — callers decide what a missing secret means.
 */
export function decryptSecret(value: string): string | null {
  if (!isEncryptedSecret(value)) return null;
  try {
    const raw = Buffer.from(String(value).slice(SECRET_PREFIX.length), 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch { return null; }
}

/** Encrypt any JSON-serialisable value (used for credential blobs). */
export function encryptSecretJson(value: unknown): string {
  return encryptSecret(JSON.stringify(value));
}

/** Decrypt a JSON blob; null when it is not encrypted or fails to authenticate. */
export function decryptSecretJson<T = unknown>(value: string): T | null {
  const plain = decryptSecret(value);
  if (plain === null) return null;
  try { return JSON.parse(plain) as T; } catch { return null; }
}
