// Runs before every test file. db.ts reads MORTAR_DB_PATH at import time, so
// assigning a unique path here gives each test file its own SQLite database —
// no cross-file contamination and no risk of one file's cleanup deleting a
// database another file is still using.
import crypto from 'crypto';

process.env.MORTAR_DB_PATH =
  '/tmp/mortar-vitest-' + process.pid + '-' + crypto.randomBytes(4).toString('hex') + '.db';

process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-0123456789abcdef0123456789abcdef';
