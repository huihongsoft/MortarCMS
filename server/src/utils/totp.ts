import crypto from 'crypto';

export function generateSecret(): string {
  return crypto.randomBytes(20).toString('base64').replace(/[+=/]/g, '').substring(0, 32);
}

export function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
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
  return generateTOTP(secret, timeStep, digits) === token;
}
