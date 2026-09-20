// Runs before every test file. db.ts reads MORTAR_DB_PATH at import time, so
// assigning a unique path here gives each test file its own SQLite database —
// no cross-file contamination and no risk of one file's cleanup deleting a
// database another file is still using.
import crypto from 'crypto';
import fs from 'fs';

// Same reasoning for uploads: resetSite()/importDemoData() delete files from
// UPLOADS_DIR, and without this override a test run wiped the real
// server/uploads directory (paths.ts already supports the override; the setup
// just never set it).
process.env.UPLOADS_DIR = '/tmp/mortar-vitest-uploads-' + process.pid;
try { fs.mkdirSync(process.env.UPLOADS_DIR, { recursive: true }); } catch { /* best effort */ }
process.on('exit', () => {
  try { fs.rmSync(process.env.UPLOADS_DIR as string, { recursive: true, force: true }); } catch { /* best effort */ }
});

// vitest runs tests in workers, where process 'exit' handlers do not always run —
// so the per-process dirs accumulated in /tmp. Sweep ones left by earlier runs:
// only dirs older than an hour, so a concurrently running suite keeps its own.
try {
  const os = require('os');
  const path = require('path');
  const cutoff = Date.now() - 3600_000;
  for (const name of fs.readdirSync(os.tmpdir())) {
    if (!name.startsWith('mortar-vitest-uploads-')) continue;
    const full = path.join(os.tmpdir(), name);
    if (full === process.env.UPLOADS_DIR) continue;
    try { if (fs.statSync(full).mtimeMs < cutoff) fs.rmSync(full, { recursive: true, force: true }); } catch { /* best effort */ }
  }
} catch { /* best effort */ }

process.env.MORTAR_DB_PATH =
  '/tmp/mortar-vitest-' + process.pid + '-' + crypto.randomBytes(4).toString('hex') + '.db';

process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-0123456789abcdef0123456789abcdef';
