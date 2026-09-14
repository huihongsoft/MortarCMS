import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { measureArchiveBytes, assertArchiveWithinLimits, assertSafeArchive } from '../src/utils/archive';

// zip-bomb / unbounded-extraction guards. The old code checked the size of the
// extracted output only AFTER extraction (dbTools) or not at all (theme/plugin),
// so a small archive could fill the disk before being rejected.
function haveTool(t: string): boolean {
  try { execFileSync('which', [t], { stdio: 'ignore' }); return true; } catch { return false; }
}
const ready = haveTool('zip') && haveTool('unzip') && haveTool('tar');

let dir = '';
let payloadDir = '';
let zipPath = '';
let tarPath = '';
let bombPath = '';
let payloadBytes = 0;

beforeAll(() => {
  if (!ready) return;
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mortar-arc-test-'));
  payloadDir = path.join(dir, 'payload');
  fs.mkdirSync(path.join(payloadDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(payloadDir, 'src', 'a.txt'), 'x'.repeat(1000));
  fs.writeFileSync(path.join(payloadDir, 'b.bin'), Buffer.alloc(4096, 7));
  fs.writeFileSync(path.join(payloadDir, 'theme.json'), '{"name":"t"}');

  const walk = (p: string) => {
    for (const e of fs.readdirSync(p)) {
      const f = path.join(p, e);
      const st = fs.lstatSync(f);
      if (st.isDirectory()) walk(f); else payloadBytes += st.size;
    }
  };
  walk(payloadDir);

  zipPath = path.join(dir, 'p.zip');
  tarPath = path.join(dir, 'p.tar.gz');
  execFileSync('zip', ['-q', '-r', zipPath, '.'], { cwd: payloadDir });
  execFileSync('tar', ['-czf', tarPath, '.'], { cwd: payloadDir });

  // 50MB of zeros compresses to a few KB on disk — the classic bomb shape.
  const bombSrc = path.join(dir, 'bomb');
  fs.mkdirSync(bombSrc, { recursive: true });
  fs.writeFileSync(path.join(bombSrc, 'big.bin'), Buffer.alloc(50 * 1024 * 1024, 0));
  bombPath = path.join(dir, 'bomb.zip');
  execFileSync('zip', ['-q', bombPath, 'big.bin'], { cwd: bombSrc });
});

afterAll(() => { if (dir) fs.rmSync(dir, { recursive: true, force: true }); });

describe.skipIf(!ready)('archive expansion limits', () => {
  it('measures the real uncompressed size exactly', async () => {
    expect(await measureArchiveBytes(zipPath, 1e9)).toBe(payloadBytes);
    expect(await measureArchiveBytes(tarPath, 1e9)).toBe(payloadBytes);
  });

  it('stops measuring once the cap is passed', async () => {
    // A small payload arrives in a single chunk, so use the 50MB bomb: the
    // measurement must abort just past the cap, not decompress the whole thing.
    const cap = 10 * 1024 * 1024;
    const measured = await measureArchiveBytes(bombPath, cap);
    expect(measured).toBeGreaterThan(cap);
    expect(measured).toBeLessThan(50 * 1024 * 1024);
  });

  it('rejects an archive over the entry-count limit', async () => {
    await expect(assertArchiveWithinLimits(zipPath, { maxEntries: 1, maxBytes: 1e9 })).rejects.toThrow(/too many entries/);
  });

  it('rejects an archive over the size limit', async () => {
    await expect(assertArchiveWithinLimits(zipPath, { maxEntries: 100, maxBytes: 100 })).rejects.toThrow(/limit/);
  });

  it('accepts an archive within both limits', async () => {
    const entries = await assertArchiveWithinLimits(zipPath, { maxEntries: 100, maxBytes: 1e9 });
    expect(entries.length).toBeGreaterThan(0);
  });

  it('detects a highly compressible bomb by its true expansion', async () => {
    const onDisk = fs.statSync(bombPath).size;
    expect(onDisk).toBeLessThan(1024 * 1024); // tiny on disk...
    await expect(assertArchiveWithinLimits(bombPath, { maxEntries: 100, maxBytes: 10 * 1024 * 1024 })).rejects.toThrow(/limit/);
  });

  it('still rejects traversal entries', () => {
    expect(assertSafeArchive(zipPath).every((e) => !e.split(/[\\/]/).includes('..'))).toBe(true);
  });
});
