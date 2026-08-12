import crypto from 'crypto';

export function generateSecret(): string {
  return crypto.randomBytes(20).toString('base64').replace(/[+=/]/g, '').substring(0, 32);
}

export function generateTOTP(secret: string, timeStep = 30, digits = 6, stepShift = 0): string {
  const counter = Math.floor(Date.now() / 1000 / timeStep) + stepShift;
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);
  // generateSecret() always produces base64; decode consistently (auto-pads)
  const key = Buffer.from(secret, 'base64');
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
