import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { loadSecret } from './jwt';

// Password protection for posts/pages (WordPress-style "password protected").
//
// The stored value is a bcrypt hash once a password has been set through the
// admin UI. Two details matter:
//   - The editor round-trips the stored value on every save, so callers must
//     treat "unchanged value" as a no-op rather than re-hashing (see
//     routes/posts.ts and routes/pages.ts).
//   - Legacy plaintext values are still accepted and are upgraded to a hash on
//     the first successful check.

const BCRYPT_RE = /^\$2[aby]\$/;

export function isHashedContentPassword(stored: string): boolean {
  return BCRYPT_RE.test(String(stored || ''));
}

export function hashContentPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

// Constant-time check. `upgraded` is set when a legacy plaintext value matched
// and should be replaced with the returned hash.
export async function verifyContentPassword(submitted: string, stored: string): Promise<{ ok: boolean; upgraded?: string }> {
  if (!stored) return { ok: false };
  if (isHashedContentPassword(stored)) return { ok: await bcrypt.compare(submitted, stored) };
  // Digest both sides before comparing: timingSafeEqual needs equal lengths, and
  // a raw comparison would leak the password length.
  const a = crypto.createHash('sha256').update(submitted).digest();
  const b = crypto.createHash('sha256').update(stored).digest();
  if (!crypto.timingSafeEqual(a, b)) return { ok: false };
  return { ok: true, upgraded: await hashContentPassword(submitted) };
}

// Unlock cookie value (WordPress wp-postpass equivalent). Derived from the stored
// hash through an HMAC of the server secret, so a captured cookie cannot be
// brute-forced offline — the raw password is never the input to a fast hash
// anymore — and the value rotates whenever the password changes.
export function contentUnlockMatches(cookieValue: unknown, id: string, stored: string): boolean {
  const expected = crypto.createHmac('sha256', loadSecret()).update(id + ':' + stored).digest('hex');
  const given = Buffer.from(String(cookieValue || ''), 'utf8');
  const want = Buffer.from(expected, 'utf8');
  return given.length === want.length && crypto.timingSafeEqual(given, want);
}

export function contentUnlockToken(id: string, stored: string): string {
  return crypto.createHmac('sha256', loadSecret()).update(id + ':' + stored).digest('hex');
}
