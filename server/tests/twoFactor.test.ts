import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import bcrypt from 'bcryptjs';
import db, { initDB, runMigrations } from '../src/utils/db';
import authRoutes from '../src/routes/auth';
import { generateSecret, generateTOTP, verifyTOTP, base32Decode, base32Encode, isLegacySecret } from '../src/utils/totp';
import { sealSecret, readStoredSecret, generateRecoveryCodes, consumeRecoveryCode, serializeRecoveryHashes, countRecoveryCodes } from '../src/utils/twoFactor';
import { isEncryptedSecret } from '../src/utils/secretBox';

// Two problems this file pins down:
//
// 1. The `otpauth://` URI carried a base64 secret. No authenticator app can
//    enrol that, so the codes users saw never matched — and nothing caught it
//    because both sides of the test called the same module. The RFC 6238 vector
//    below is the proof that our derivation agrees with a real app.
// 2. The TOTP secret was stored in plaintext, so a backup archive (which this
//    app hands out by design) was enough to generate codes for any 2FA account.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-2fa.db';
const PW = 'Passw0rd1';
let pwHash = '';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  pwHash = bcrypt.hashSync(PW, 4);
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/auth';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('base32 secrets', () => {
  it('issues a secret an authenticator app can read', () => {
    for (let i = 0; i < 20; i++) {
      const secret = generateSecret();
      expect(secret).toMatch(/^[A-Z2-7]{32}$/);
      expect(isLegacySecret(secret)).toBe(false);
      // 20 bytes round-trip exactly.
      expect(base32Decode(secret)!.length).toBe(20);
    }
  });

  it('round-trips arbitrary bytes', () => {
    const buf = Buffer.from([0, 1, 2, 250, 255, 128, 7]);
    expect(base32Decode(base32Encode(buf))!.equals(buf)).toBe(true);
  });

  it('recognises the pre-fix secret shape as legacy', () => {
    // What generateSecret() used to return: base64 with +=/ stripped, so it uses
    // characters outside the base32 alphabet and cannot be valid base32.
    expect(isLegacySecret('rqSNG831nPtiXzI54fdNWN4ic')).toBe(true);
    expect(isLegacySecret('78OFAhGc8WHslhEwaHOMbsNVM8')).toBe(true);
  });
});

describe('TOTP derivation', () => {
  // RFC 6238 appendix B, SHA-1, 30-second step: the secret is the ASCII string
  // "12345678901234567890" and T=59s is counter 1. If these fail, no real
  // authenticator app will ever agree with us. stepShift targets that counter
  // without freezing the clock.
  const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const shiftToCounter1 = () => 1 - Math.floor(Date.now() / 1000 / 30);

  it('matches the published test vector', () => {
    expect(generateTOTP(RFC_SECRET, 30, 8, shiftToCounter1())).toBe('94287082');
    expect(generateTOTP(RFC_SECRET, 30, 6, shiftToCounter1())).toBe('287082');
  });

  it('verifies its own code and rejects a wrong one', () => {
    const secret = generateSecret();
    const code = generateTOTP(secret);
    expect(verifyTOTP(secret, code)).toBe(true);
    expect(verifyTOTP(secret, '000000')).toBe(false);
  });

  it('still verifies secrets issued before the base32 fix', () => {
    // Enrolled users must not be locked out by the encoding change.
    const legacy = 'rqSNG831nPtiXzI54fdNWN4ic';
    expect(verifyTOTP(legacy, generateTOTP(legacy))).toBe(true);
  });
});

describe('stored secrets are encrypted', () => {
  it('seals and reads back', () => {
    const secret = generateSecret();
    const sealed = sealSecret(secret);
    expect(sealed).not.toContain(secret);
    expect(isEncryptedSecret(sealed)).toBe(true);
    expect(readStoredSecret(sealed)).toBe(secret);
  });

  it('accepts a plaintext value so a pre-migration row still works', () => {
    const legacy = 'rqSNG831nPtiXzI54fdNWN4ic';
    expect(readStoredSecret(legacy)).toBe(legacy);
    expect(readStoredSecret('')).toBeNull();
    expect(readStoredSecret(null)).toBeNull();
  });

  it('encrypts existing plaintext rows during the migration', () => {
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion, two_factor_enabled, two_factor_secret) VALUES ('m19','m19','m19@test.dev','x','editor',0,1,?)")
      .run('rqSNG831nPtiXzI54fdNWN4ic');
    // Simulate the upgrade: pretend migration 19 had not run yet.
    db.prepare('DELETE FROM _SchemaMigration WHERE version = 19').run();
    runMigrations();

    const row = db.prepare("SELECT two_factor_secret, two_factor_recovery_codes FROM User WHERE id = 'm19'").get() as any;
    expect(isEncryptedSecret(row.two_factor_secret)).toBe(true);
    expect(readStoredSecret(row.two_factor_secret)).toBe('rqSNG831nPtiXzI54fdNWN4ic');
    // The column the recovery codes live in is part of the same migration.
    expect(row.two_factor_recovery_codes).toBe('');
  });
});

describe('recovery codes', () => {
  it('generates ten distinct codes and stores only hashes', () => {
    const { plain, hashed } = generateRecoveryCodes();
    expect(plain).toHaveLength(10);
    expect(new Set(plain).size).toBe(10);
    expect(hashed).toHaveLength(10);
    for (const h of hashed) expect(h).toMatch(/^[0-9a-f]{64}$/);
    const stored = serializeRecoveryHashes(hashed);
    expect(stored).not.toContain(plain[0]);
    expect(countRecoveryCodes(stored)).toBe(10);
  });

  it('spends a code exactly once, tolerating how it was typed', () => {
    const { plain, hashed } = generateRecoveryCodes();
    const stored = serializeRecoveryHashes(hashed);
    const typed = '  ' + plain[3].toLowerCase().replace(/-/g, '') + '  ';

    const first = consumeRecoveryCode(stored, typed);
    expect(first.ok).toBe(true);
    expect(first.remaining).toHaveLength(9);

    // Replaying the same code against the remaining set must fail.
    expect(consumeRecoveryCode(serializeRecoveryHashes(first.remaining), plain[3]).ok).toBe(false);
    // The other codes still work.
    expect(consumeRecoveryCode(serializeRecoveryHashes(first.remaining), plain[4]).ok).toBe(true);
  });

  it('rejects an unknown code', () => {
    const { hashed } = generateRecoveryCodes();
    expect(consumeRecoveryCode(serializeRecoveryHashes(hashed), 'AAAA-BBBB-CCCC-DDDD').ok).toBe(false);
  });
});

describe('2FA login over HTTP', () => {
  const secret = generateSecret();

  beforeAll(() => {
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion, two_factor_enabled, two_factor_secret) VALUES ('u-2fa','twofa','twofa@test.dev',?, 'admin',0,1,?)")
      .run(pwHash, sealSecret(secret));
  });

  async function challenge(): Promise<string> {
    const r = await fetch(base + '/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'twofa@test.dev', password: PW }),
    });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.twoFactorRequired).toBe(true);
    return body.tempToken;
  }

  it('issues a session for a valid TOTP code', async () => {
    const tempToken = await challenge();
    const r = await fetch(base + '/2fa/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tempToken, code: generateTOTP(secret) }),
    });
    expect(r.status).toBe(200);
    expect((await r.json()).token).toBeTruthy();
  });

  it('accepts a recovery code once and then refuses it', async () => {
    const { plain, hashed } = generateRecoveryCodes();
    db.prepare("UPDATE User SET two_factor_recovery_codes = ? WHERE id = 'u-2fa'").run(serializeRecoveryHashes(hashed));

    const first = await fetch(base + '/2fa/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tempToken: await challenge(), code: plain[0] }),
    });
    expect(first.status).toBe(200);
    const body = await first.json();
    expect(body.recoveryCodeUsed).toBe(true);
    expect(body.recoveryCodesRemaining).toBe(9);

    // Same code, same account, second time: the login must fail.
    const replay = await fetch(base + '/2fa/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tempToken: await challenge(), code: plain[0] }),
    });
    expect(replay.status).toBe(401);
    // ...and the spent code is gone from storage, not merely rejected once.
    const stored = (db.prepare("SELECT two_factor_recovery_codes FROM User WHERE id = 'u-2fa'").get() as any).two_factor_recovery_codes;
    expect(countRecoveryCodes(stored)).toBe(9);
  });

  it('rejects a recovery code for an account that never had one', async () => {
    db.prepare("UPDATE User SET two_factor_recovery_codes = '' WHERE id = 'u-2fa'").run();
    const r = await fetch(base + '/2fa/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tempToken: await challenge(), code: 'AAAA-BBBB-CCCC-DDDD' }),
    });
    expect(r.status).toBe(401);
  });
});
