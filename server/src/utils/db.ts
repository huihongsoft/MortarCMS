import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';

// Driver selection: DATABASE_URL=mysql://... or postgres://... switches backends.
// SQLite stays the default (sync, direct); MySQL/PostgreSQL run on a worker
// thread bridged with Atomics so the existing sync call sites keep working.
// MORTAR_DB_PATH overrides the SQLite file location (isolated tests, custom
// Docker volume layouts, portable installs).
const DB_PATH = process.env.MORTAR_DB_PATH || path.join(__dirname, '../../data/mortar.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DATABASE_URL = process.env.DATABASE_URL || '';
let driver: 'sqlite' | 'mysql' | 'postgres' = 'sqlite';
let worker: Worker | null = null;
let workerSeq = 0;
const workerPending = new Map<number, { resolve: (v: any) => void; flag: Int32Array }>();

function parseUrl(url: string) {
  const m = url.match(/^(mysql|postgres):\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^/?]+)/);
  if (!m) throw new Error('Invalid DATABASE_URL: expected mysql://user:pass@host:port/db or postgres://...');
  return { driver: m[1] as 'mysql' | 'postgres', user: m[2], password: m[3], host: m[4], port: parseInt(m[5] || (m[1] === 'mysql' ? '3306' : '5432')), database: m[6] };
}

// Sync bridge: block the main thread until the worker replies (Atomics.wait)
function workerCall(op: string, payload: any = {}): any {
  if (!worker) throw new Error('Database worker not initialized');
  const id = ++workerSeq;
  const sab = new SharedArrayBuffer(4);
  const flag = new Int32Array(sab);
  let result: any;
  workerPending.set(id, { resolve: (v) => { result = v; }, flag });
  worker.postMessage({ id, op, ...payload });
  const wait = Atomics.wait(flag, 0, 0, 20000); // block up to 20s
  if (wait === 'timed-out') {
    workerPending.delete(id);
    throw new Error('Database operation timed out');
  }
  workerPending.delete(id);
  if (!result.ok) throw new Error(result.error || 'Database error');
  return result;
}

interface Statement {
  run: (...args: any[]) => any;
  get: (...args: any[]) => any;
  all: (...args: any[]) => any;
}

// Slow query tracker (in-memory ring buffer, exposed to the admin tools)
const SLOW_QUERIES: { sql: string; ms: number; at: string }[] = [];
export function listSlowQueries(): any[] { return SLOW_QUERIES; }

function recordSlow(sql: string, ms: number): void {
  if (ms > 150) {
    SLOW_QUERIES.push({ sql: sql.slice(0, 220), ms: Math.round(ms), at: new Date().toISOString() });
    if (SLOW_QUERIES.length > 20) SLOW_QUERIES.shift();
  }
}

function prepareSqlite(sql: string): Statement {
  const stmt = db.raw.prepare(sql);
  const timed = <T>(fn: () => T): T => {
    const t0 = Date.now();
    const r = fn();
    recordSlow(sql, Date.now() - t0);
    return r;
  };
  return {
    run: (...args: any[]) => timed(() => stmt.run(...args)),
    get: (...args: any[]) => timed(() => stmt.get(...args)),
    all: (...args: any[]) => timed(() => stmt.all(...args)),
  };
}

function prepareRemote(sql: string): Statement {
  return {
    run: (...args: any[]) => workerCall('run', { sql, args }),
    get: (...args: any[]) => workerCall('get', { sql, args }).row,
    all: (...args: any[]) => workerCall('all', { sql, args }).rows,
  };
}

const db: any = {
  prepare(sql: string): Statement { return driver === 'sqlite' ? prepareSqlite(sql) : prepareRemote(sql); },
  exec(sql: string): void {
    if (driver === 'sqlite') { db.execSqlite(sql); return; }
    workerCall('exec', { sql });
  },
  execSqlite(sql: string): void { db.raw.exec(sql); },
  pragma(p: string): void {
    if (driver === 'sqlite' && db.raw) { try { db.raw.pragma(p); } catch {} }
    // Remote drivers (MySQL/PostgreSQL) have no equivalent pragma — no-op.
  },
  get driver() { return driver; },
};

if (DATABASE_URL) {
  const cfg = parseUrl(DATABASE_URL);
  driver = cfg.driver;
  worker = new Worker(path.join(__dirname, 'dbWorker.js'));
  worker.on('message', (msg) => {
    const p = workerPending.get(msg.id);
    if (p) { p.resolve(msg.result); Atomics.store(p.flag, 0, 1); Atomics.notify(p.flag, 0); }
  });
  worker.on('error', (e) => console.error('[DB Worker]', e.message));
  const init = workerCall('init', { conn: cfg });
  console.log('[DB] Using ' + cfg.driver + ' at ' + cfg.host + ':' + cfg.port + '/' + cfg.database);
} else {
  db.raw = new Database(DB_PATH);
  db.raw.pragma('journal_mode = WAL');
  db.raw.pragma('foreign_keys = ON');
  console.log('[DB] Using SQLite at ' + DB_PATH);
}

export function initDB(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'author',
      avatar TEXT,
      bio TEXT,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      tokenVersion INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Post (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      excerpt TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      type TEXT NOT NULL DEFAULT 'post',
      featured TEXT,
      authorId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      parentId TEXT REFERENCES Post(id) ON DELETE SET NULL,
      menuOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      publishedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      parentId TEXT REFERENCES Category(id) ON DELETE SET NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS PostCategory (
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      categoryId TEXT NOT NULL REFERENCES Category(id) ON DELETE CASCADE,
      PRIMARY KEY (postId, categoryId)
    );

    CREATE TABLE IF NOT EXISTS Tag (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS PostTag (
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      tagId TEXT NOT NULL REFERENCES Tag(id) ON DELETE CASCADE,
      PRIMARY KEY (postId, tagId)
    );

    CREATE TABLE IF NOT EXISTS PostMeta (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      UNIQUE(postId, key)
    );

    CREATE TABLE IF NOT EXISTS Comment (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      parentId TEXT REFERENCES Comment(id) ON DELETE CASCADE,
      siteId TEXT,
      userId TEXT REFERENCES User(id) ON DELETE SET NULL,
      subscribe INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS Media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      width INTEGER,
      height INTEGER,
      siteId TEXT,
      userId TEXT REFERENCES User(id) ON DELETE SET NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    
    CREATE TABLE IF NOT EXISTS Menu (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'primary',
      items TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS Setting (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Revision (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS AiAudit (
      id TEXT PRIMARY KEY,
      userId TEXT,
      role TEXT,
      tool TEXT NOT NULL,
      args TEXT,
      output TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Role (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      capabilities TEXT NOT NULL DEFAULT '[]',
      isSystem INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    -- Seed system roles with their default capability sets
    INSERT OR IGNORE INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES
      ('role-admin', 'admin', '管理员', '["*"]', 1, '2024-01-01'),
      ('role-editor', 'editor', '编辑', '["edit_posts","edit_others_posts","publish_posts","delete_posts","delete_others_posts","moderate_comments","manage_categories","manage_tags","manage_links","upload_files","edit_media","delete_media","edit_pages","publish_pages","delete_pages","manage_options","ai_use","ai_review","ai_tasks","view_system_info"]', 1, '2024-01-01'),
      ('role-author', 'author', '作者', '["edit_posts","publish_posts","delete_posts","upload_files","edit_media","ai_use"]', 1, '2024-01-01'),
      ('role-subscriber', 'subscriber', '订阅者', '[]', 1, '2024-01-01');

    CREATE TABLE IF NOT EXISTS AiMemory (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(userId, key)
    );

    CREATE TABLE IF NOT EXISTS AiUsage (
      id TEXT PRIMARY KEY,
      userId TEXT,
      kind TEXT NOT NULL,
      model TEXT,
      tokens INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AiNotification (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      taskId TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AiTask (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      steps TEXT NOT NULL DEFAULT '[]',
      result TEXT,
      error TEXT,
      createdAt TEXT NOT NULL,
      finishedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS Activity (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS AppPassword (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS Visit (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      ip TEXT NOT NULL,
      path TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE INDEX IF NOT EXISTS idx_visit_date ON Visit (date);

    CREATE TABLE IF NOT EXISTS Link (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS Site (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      domain TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      isPrimary INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS SiteSetting (
      siteId TEXT NOT NULL REFERENCES Site(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (siteId, key)
    );

    -- Performance indexes for hot queries
    CREATE INDEX IF NOT EXISTS idx_post_status_type ON Post (status, type, publishedAt);
    CREATE INDEX IF NOT EXISTS idx_post_slug ON Post (slug);
    CREATE INDEX IF NOT EXISTS idx_post_author ON Post (authorId);
    CREATE INDEX IF NOT EXISTS idx_comment_post_status ON Comment (postId, status);
    CREATE INDEX IF NOT EXISTS idx_comment_parent ON Comment (parentId);
    CREATE INDEX IF NOT EXISTS idx_postcat_post ON PostCategory (postId);
    CREATE INDEX IF NOT EXISTS idx_postcat_cat ON PostCategory (categoryId);
    CREATE INDEX IF NOT EXISTS idx_posttag_post ON PostTag (postId);
    CREATE INDEX IF NOT EXISTS idx_posttag_tag ON PostTag (tagId);
    CREATE INDEX IF NOT EXISTS idx_media_user ON Media (userId);
    CREATE INDEX IF NOT EXISTS idx_media_created ON Media (createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_revision_post ON Revision (postId, createdAt);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON Activity (createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON Activity (userId);
    CREATE INDEX IF NOT EXISTS idx_comment_created ON Comment (createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_aitask_created ON AiTask (createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_aiusage_created ON AiUsage (createdAt DESC);

    CREATE TABLE IF NOT EXISTS AiSession (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'New chat',
      messages TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aisession_user ON AiSession (userId, updatedAt DESC);

    CREATE TABLE IF NOT EXISTS LinkCategory (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      menuOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS LinkPost (
      linkId TEXT NOT NULL REFERENCES Link(id) ON DELETE CASCADE,
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      PRIMARY KEY (linkId, postId)
    );
    CREATE INDEX IF NOT EXISTS idx_linkpost_link ON LinkPost (linkId);
    CREATE INDEX IF NOT EXISTS idx_linkpost_post ON LinkPost (postId);

    -- Friend links (blogroll): lightweight list, separate from the
    -- navigation-site Link model (categories / post associations / sites)
    CREATE TABLE IF NOT EXISTS FriendLink (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);

  // Schema migrations (best-effort; column may already exist on fresh DBs)
  try { db.exec("ALTER TABLE User ADD COLUMN tokenVersion INTEGER NOT NULL DEFAULT 0"); } catch {}
  // Multi-site content isolation: NULL siteId = global content visible on every site
  try { db.exec("ALTER TABLE Post ADD COLUMN siteId TEXT"); } catch {}
  // Post password protection column (missing from the base CREATE TABLE)
  try { db.exec("ALTER TABLE Post ADD COLUMN password TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE Post ADD COLUMN views INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Post ADD COLUMN sticky INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Post ADD COLUMN format TEXT DEFAULT 'standard'"); } catch {}
  try { db.exec("ALTER TABLE Post ADD COLUMN lockedAt TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE Post ADD COLUMN lockedBy TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE User ADD COLUMN reset_token TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE User ADD COLUMN reset_expires TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE User ADD COLUMN two_factor_secret TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE User ADD COLUMN two_factor_enabled INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Activity ADD COLUMN ip TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE Activity ADD COLUMN meta TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE Menu ADD COLUMN siteId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Media ADD COLUMN siteId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Comment ADD COLUMN siteId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Comment ADD COLUMN subscribe INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Media ADD COLUMN thumbnail TEXT"); } catch {}
  try { db.exec("ALTER TABLE Media ADD COLUMN width INTEGER"); } catch {}
  try { db.exec("ALTER TABLE Media ADD COLUMN height INTEGER"); } catch {}
  try { db.exec("ALTER TABLE Media ADD COLUMN srcset TEXT"); } catch {}
  // Navigation-site link model: categories, sub-site ownership, linked page
  // and post associations, ordering, enabled state, click counter
  try { db.exec("ALTER TABLE Link ADD COLUMN categoryId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN siteId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN pageId TEXT"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN menuOrder INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN active INTEGER DEFAULT 1"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN clicks INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE Link ADD COLUMN icon TEXT DEFAULT ''"); } catch {}
  // Category-level site ownership: a category bound to a site (and its links,
  // unless a link overrides with its own siteId) only shows on that site
  try { db.exec("ALTER TABLE LinkCategory ADD COLUMN siteId TEXT"); } catch {}
  // The views index must be created after the column exists (fresh installs
  // create the column via the ALTER TABLE migrations above).
  try { db.exec("CREATE INDEX IF NOT EXISTS idx_post_views ON Post (views DESC)"); } catch {}
  // One-time migration: legacy friend links lived in the Link table before
  // the navigation model existed — copy them to FriendLink so the blogroll
  // keeps working while Link becomes the navigation-site model. Only rows
  // with NO navigation features are copied (a bare link is a friend link);
  // categorized/site-bound/ordered/clicked/associated links stay in Link.
  try {
    const friendCount = (db.prepare('SELECT COUNT(*) as c FROM FriendLink').get() as any)?.c || 0;
    if (friendCount === 0) {
      db.exec(`INSERT INTO FriendLink (id, name, url, avatar, description, createdAt)
        SELECT id, name, url, avatar, description, createdAt FROM Link
        WHERE categoryId IS NULL AND siteId IS NULL AND pageId IS NULL
          AND (menuOrder IS NULL OR menuOrder = 0) AND active = 1 AND clicks = 0
          AND NOT EXISTS (SELECT 1 FROM LinkPost lp WHERE lp.linkId = Link.id)`);
    }
  } catch {}
}

// Runtime driver reconfiguration (install wizard): switch SQLite <-> MySQL/PG
export function reconfigureDb(url: string): void {
  if (driver === 'sqlite' && db.raw) { try { db.raw.close(); } catch {} db.raw = null; }
  if (worker) { try { worker.terminate(); } catch {} worker = null; }
  if (!url) {
    driver = 'sqlite';
    db.raw = new Database(DB_PATH);
    db.raw.pragma('journal_mode = WAL');
    db.raw.pragma('foreign_keys = ON');
    return;
  }
  const cfg = parseUrl(url);
  driver = cfg.driver;
  worker = new Worker(path.join(__dirname, 'dbWorker.js'));
  worker.on('message', (msg) => {
    const p = workerPending.get(msg.id);
    if (p) { p.resolve(msg.result); Atomics.store(p.flag, 0, 1); Atomics.notify(p.flag, 0); }
  });
  worker.on('error', (e) => console.error('[DB Worker]', e.message));
  const init = workerCall('init', { conn: cfg });
  if (!init.ok) throw new Error(init.error || 'Database connection failed');
  // Persist for future restarts
  const envPath = path.join(__dirname, '../..', '.env');
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const line = 'DATABASE_URL=' + url;
  if (existing.includes('DATABASE_URL=')) {
    fs.writeFileSync(envPath, existing.replace(/DATABASE_URL=.*/g, line));
  } else {
    fs.writeFileSync(envPath, existing.trimEnd() + '\n' + line + '\n');
  }
}

export function cuid(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 10);
  return t + r;
}

export default db;
