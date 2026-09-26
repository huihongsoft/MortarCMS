import crypto from 'crypto';

// RFC 4648 base32, no padding — the alphabet every authenticator app understands.
const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

/** Null when `s` is not valid base32 — which is how a pre-fix secret is detected. */
export function base32Decode(s: string): Buffer | null {
  const clean = String(s || '').toUpperCase().replace(/[=\s]/g, '');
  if (!clean || !/^[A-Z2-7]+$/.test(clean)) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32_ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/**
 * A new TOTP secret: 160 bits of entropy, base32 (32 characters).
 *
 * This used to be base64 with `+=/` stripped, and the very same string went into
 * the `otpauth://` URI. No authenticator app can enrol that — base64 uses
 * characters outside the base32 alphabet (lower case, 0, 1, 8, 9), so the app
 * either refused the URI or derived a different key and showed codes that never
 * matched. Nothing caught it because both sides of the test called this module.
 * Secrets already enrolled keep working (see secretKey).
 */
export function generateSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

/** True for secrets issued before the base32 fix (they are not valid base32). */
export function isLegacySecret(secret: string): boolean {
  return base32Decode(secret) === null;
}

function secretKey(secret: string): Buffer {
  // Legacy secrets were base64; everything issued since the fix is base32. The
  // two alphabets can't be confused: a 32-character base64 string is never
  // limited to [A-Z2-7].
  return base32Decode(secret) ?? Buffer.from(String(secret), 'base64');
}

export function generateTOTP(secret: string, timeStep = 30, digits = 6, stepShift = 0): string {
  const counter = Math.floor(Date.now() / 1000 / timeStep) + stepShift;
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);
  const key = secretKey(secret);
  const hmacResult = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code = ((hmacResult[offset] & 0x7f) << 24 |
                (hmacResult[offset + 1] & 0xff) << 16 |
                (hmacResult[offset + 2] & 0xff) << 8 |
                (hmacResult[offset + 3] & 0xff));
  return (code % Math.pow(10, digits)).toString().padStart(digits, '0');
}

export function verifyTOTP(secret: string, token: string, timeStep = 30, digits = 6): boolean {
  // Constant-time comparison + a ±1 time-window tolerance for clock drift
  const expected = generateTOTP(secret, timeStep, digits);
  const valid = timingSafeEqualStr(expected, token);
  if (valid) return true;
  for (const shift of [-1, 1]) {
    if (timingSafeEqualStr(generateTOTP(secret, timeStep, digits, shift), token)) return true;
  }
  return false;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
