import crypto from 'crypto';
import { encryptSecret, decryptSecret, isEncryptedSecret } from './secretBox';
import { base32Encode } from './totp';

// TOTP secrets and single-use recovery codes.
//
// The secret used to sit in `User.two_factor_secret` as plaintext, so a database
// dump (or a backup archive — which this project hands out by design) was enough
// to generate valid codes for every account with 2FA enabled. Migration 19
// encrypts the rows that predate this change; everything written since goes
// through sealSecret().

/** Encrypt a TOTP secret for storage. */
export function sealSecret(secret: string): string {
  return encryptSecret(secret);
}

/**
 * Read a stored TOTP secret. Plaintext values are still accepted: a row that
 * migration 19 could not encrypt (a rotated JWT secret, a value written by an
 * older binary) must not lock its owner out of their own account.
 */
export function readStoredSecret(stored: unknown): string | null {
  const value = String(stored || '');
  if (!value) return null;
  if (isEncryptedSecret(value)) return decryptSecret(value);
  return value;
}

// ---- Recovery codes ----
//
// Ten single-use codes, generated once and shown once. Only SHA-256 hashes are
// stored: the codes are 80 bits of randomness, so a fast hash is enough (same
// reasoning as the app-password and token hashes — bcrypt's cost buys nothing
// against a value that cannot be guessed, and would make the login path slow
// enough to notice).

export const RECOVERY_CODE_COUNT = 10;

/** Uppercase base32 only, so however the user types it (dashes, spaces, case) matches. */
export function normalizeRecoveryCode(code: unknown): string {
  return String(code || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
}

function hashRecoveryCode(code: unknown): string {
  return crypto.createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');
}

/** Fresh codes in display form (`XXXX-XXXX-XXXX-XXXX`) plus the hashes to store. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = base32Encode(crypto.randomBytes(10)); // 16 chars, 80 bits
    plain.push(raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12) + '-' + raw.slice(12, 16));
  }
  return { plain, hashed: plain.map((c) => hashRecoveryCode(c)) };
}

export function serializeRecoveryHashes(hashes: string[]): string {
  return JSON.stringify(hashes.slice(0, RECOVERY_CODE_COUNT));
}

export function parseRecoveryHashes(stored: unknown): string[] {
  try {
    const list = JSON.parse(String(stored || '[]'));
    return Array.isArray(list) ? list.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function countRecoveryCodes(stored: unknown): number {
  return parseRecoveryHashes(stored).length;
}

/**
 * Try to spend a recovery code. Returns the remaining hashes when it matched, so
 * the caller can persist them — a used code must never work twice, and that
 * makes the write mandatory rather than advisory.
 */
export function consumeRecoveryCode(stored: unknown, candidate: unknown): { ok: boolean; remaining: string[] } {
  const hashes = parseRecoveryHashes(stored);
  const wanted = hashRecoveryCode(candidate);
  const index = hashes.indexOf(wanted);
  if (index === -1) return { ok: false, remaining: hashes };
  return { ok: true, remaining: hashes.slice(0, index).concat(hashes.slice(index + 1)) };
}
