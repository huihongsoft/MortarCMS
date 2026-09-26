import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import db, { initDB } from '../src/utils/db';
import { sha256File, verifyArtifact, normalize } from '../src/utils/artifact';
import { recordArtifactHash, getArtifactHash, listPlugins } from '../src/plugins/manager';

// Plugins run in-process with full privileges — there is no sandbox — so the
// only integrity control available is knowing which artifact was installed and
// refusing one that does not match what the publisher announced. These pin the
// comparison itself (the install path calls it before extracting anything).
let tmp = '';
let file = '';
let digest = '';

beforeAll(() => {
  initDB();
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mortar-artifact-'));
  file = path.join(tmp, 'pkg.zip');
  fs.writeFileSync(file, Buffer.from('pretend this is a plugin archive'));
  digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
});

afterAll(() => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ } });

describe('artifact fingerprints', () => {
  it('hashes a file', () => {
    expect(sha256File(file)).toBe(digest);
    expect(sha256File(path.join(tmp, 'missing.zip'))).toBeNull();
  });

  it('accepts the digest in the shapes a publisher might paste', () => {
    expect(normalize(digest.toUpperCase())).toBe(digest);
    expect(normalize('sha256:' + digest)).toBe(digest);
    expect(normalize('  SHA256:' + digest + '  ')).toBe(digest);
    expect(normalize('')).toBeUndefined();
    expect(normalize(undefined)).toBeUndefined();
  });

  it('passes when the digest matches, and when none was given', () => {
    expect(verifyArtifact(file, digest).ok).toBe(true);
    expect(verifyArtifact(file, 'sha256:' + digest.toUpperCase()).ok).toBe(true);
    // No expectation = an unverified but successful install.
    const unverified = verifyArtifact(file);
    expect(unverified.ok).toBe(true);
    expect(unverified.sha256).toBe(digest);
  });

  it('fails on a mismatch instead of accepting "close enough"', () => {
    const other = crypto.createHash('sha256').update('something else').digest('hex');
    const r = verifyArtifact(file, other);
    expect(r.ok).toBe(false);
    expect(r.expected).toBe(other);
    expect(r.sha256).toBe(digest);
    // A truncated digest must not match a prefix of the real one.
    expect(verifyArtifact(file, digest.slice(0, 32)).ok).toBe(false);
  });
});

describe('recorded install fingerprints', () => {
  it('round-trips through the settings table', () => {
    recordArtifactHash('checksum-test-plugin', digest);
    expect(getArtifactHash('checksum-test-plugin')).toBe(digest);
    expect(getArtifactHash('never-installed')).toBeNull();
  });

  it('is reported per plugin, and absent for one copied in by hand', () => {
    // A plugin directory without a recorded hash (e.g. copied by hand) must be
    // reported as unknown rather than as an empty digest.
    const dir = path.join(__dirname, '..', 'plugins', 'checksum-probe');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'plugin.json'), JSON.stringify({ name: 'checksum-probe', version: '1.0.0' }));
    try {
      const found = listPlugins().find((p) => p.name === 'checksum-probe') as any;
      expect(found).toBeTruthy();
      expect(found.artifactHash).toBeUndefined();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    expect(db.prepare('SELECT 1').get()).toBeTruthy();
  });
});
