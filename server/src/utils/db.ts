import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';

// Driver selection: DATABASE_URL=mysql://... or postgres://... switches backends.
// SQLite stays the default (sync, direct); MySQL/PostgreSQL run on a worker
// thread bridged with Atomics so the existing sync call sites keep working.
// MORTAR_DB_PATH overrides the SQLite file location (isolated tests, custom
// Docker volume layouts, portable installs).
export const DB_PATH = process.env.MORTAR_DB_PATH || path.join(__dirname, '../../data/mortar.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DATABASE_URL = process.env.DATABASE_URL || '';
let driver: 'sqlite' | 'mysql' | 'postgres' = 'sqlite';
let worker: Worker | null = null;
let workerSeq = 0;
const workerPending = new Map<number, { resolve: (v: any) => void; flag: Int32Array }>();

function parseUrl(url: string) {
  let u: URL;
  try { u = new URL(url); } catch { throw new Error('Invalid DATABASE_URL: expected mysql://user:pass@host:port/db or postgres://...'); }
  const scheme = u.protocol.replace(/:$/, '');
  if (!['mysql', 'postgres', 'postgresql'].includes(scheme)) {
    throw new Error('Invalid DATABASE_URL: expected mysql:// or postgres://...');
  }
  const driver: 'mysql' | 'postgres' = scheme === 'mysql' ? 'mysql' : 'postgres';
  const database = decodeURIComponent(u.pathname.replace(/^\//, ''));
  if (!u.hostname || !database) throw new Error('Invalid DATABASE_URL: host and database name are required');
  return {
    driver,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port || (driver === 'mysql' ? '3306' : '5432'), 10),
    database,
  };
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
  let cfg: ReturnType<typeof parseUrl>;
  try {
    cfg = parseUrl(DATABASE_URL);
  } catch (e: any) {
    // Friendly fail-fast instead of a raw stack trace from module load.
    console.error('[DB] ' + e.message);
    process.exit(1);
  }
  driver = cfg.driver;
  worker = new Worker(path.join(__dirname, 'dbWorker.js'));
  worker.on('message', (msg) => {
    const p = workerPending.get(msg.id);
    if (p) { p.resolve(msg.result); Atomics.store(p.flag, 0, 1); Atomics.notify(p.flag, 0); }
  });
  worker.on('error', (e) => console.error('[DB Worker]', e.message));
  try {
    workerCall('init', { conn: cfg });
  } catch (e: any) {
    // Unreachable host / bad credentials: report cleanly instead of a raw stack.
    console.error('[DB] Could not connect to ' + cfg.driver + ' at ' + cfg.host + ':' + cfg.port + ' — ' + e.message);
    process.exit(1);
  }
  console.log('[DB] Using ' + cfg.driver + ' at ' + cfg.host + ':' + cfg.port + '/' + cfg.database);
} else {
  db.raw = new Database(DB_PATH);
  db.raw.pragma('journal_mode = WAL');
  db.raw.pragma('foreign_keys = ON');
  // WAL allows one writer at a time; busy_timeout keeps concurrent writes
  // (views/comments/ai usage) from failing with SQLITE_BUSY
  db.raw.pragma('busy_timeout = 5000');
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
      ('role-editor', 'editor', '编辑', '["edit_posts","edit_others_posts","publish_posts","delete_posts","delete_others_posts","moderate_comments","review_posts","manage_categories","manage_tags","manage_links","manage_forms","upload_files","edit_media","delete_media","edit_pages","publish_pages","delete_pages","manage_options","ai_use","ai_review","ai_tasks","view_system_info"]', 1, '2024-01-01'),
      ('role-author', 'author', '作者', '["edit_posts","publish_posts","delete_posts","submit_posts","upload_files","edit_media","ai_use"]', 1, '2024-01-01'),
      ('role-subscriber', 'subscriber', '订阅者', '["submit_posts"]', 1, '2024-01-01');

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

    -- Outbound webhooks: notify external systems when content events fire.
    -- events is a JSON array of hook names; secret signs each delivery body
    -- with HMAC-SHA256 (X-Webhook-Signature header).
    CREATE TABLE IF NOT EXISTS Webhook (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT NOT NULL DEFAULT '[]',
      secret TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      lastStatus INTEGER,
      lastError TEXT DEFAULT '',
      lastSentAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    -- Form builder: contact/application forms rendered via [form id="slug"].
    -- fields is a JSON array of {name,label,type,required,placeholder,options}.
    CREATE TABLE IF NOT EXISTS Form (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      fields TEXT NOT NULL DEFAULT '[]',
      successMessage TEXT NOT NULL DEFAULT '',
      emailTo TEXT NOT NULL DEFAULT '',
      emailSubject TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS FormSubmission (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL REFERENCES Form(id) ON DELETE CASCADE,
      data TEXT NOT NULL DEFAULT '{}',
      ip TEXT DEFAULT '',
      userId TEXT,
      spam INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE INDEX IF NOT EXISTS idx_formsub_form ON FormSubmission (formId, createdAt DESC);

    -- Outbound link checks (broken-link report; one row per URL per scan)
    CREATE TABLE IF NOT EXISTS BrokenLink (
      id TEXT PRIMARY KEY,
      postId TEXT,
      postTitle TEXT NOT NULL,
      url TEXT NOT NULL,
      anchor TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'ok',
      statusCode INTEGER,
      checkedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_brokenlink_status ON BrokenLink (status);
    CREATE INDEX IF NOT EXISTS idx_brokenlink_url ON BrokenLink (url);

    -- Search terms (for the admin hot-searches report; raw queries only,
    -- no visitor identity is stored)
    CREATE TABLE IF NOT EXISTS SearchLog (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE INDEX IF NOT EXISTS idx_searchlog_created ON SearchLog (createdAt);

    -- Newsletter subscribers: double opt-in via confirmToken; the digest
    -- scheduler only emails confirmed + subscribed addresses.
    CREATE TABLE IF NOT EXISTS Subscriber (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'subscribed',
      confirmed INTEGER NOT NULL DEFAULT 0,
      confirmToken TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE INDEX IF NOT EXISTS idx_subscriber_status ON Subscriber (status);
  `);

  // Migration ledger: every schema change below is applied once, in order, and
  // recorded here. Each step is idempotent (guarded by columnExists), so fresh
  // installs and pre-existing databases converge on the same schema instead of
  // relying on silently-swallowed ALTER TABLE errors.
  db.exec(`CREATE TABLE IF NOT EXISTS _SchemaMigration (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    appliedAt TEXT NOT NULL
  )`);

  runMigrations();
}

// ---- Schema migrations ---------------------------------------------------
// Ordered, idempotent schema steps. Versions are permanent: never reuse or
// renumber one. New changes get the next free version and run on every
// existing install exactly once.
const MIGRATIONS: { version: number; name: string; up: () => void }[] = [
  {
    version: 1,
    name: 'user-auth-columns',
    up: () => {
      addColumn('User', 'tokenVersion', 'INTEGER NOT NULL DEFAULT 0');
      addColumn('User', 'reset_token', "TEXT DEFAULT ''");
      addColumn('User', 'reset_expires', "TEXT DEFAULT ''");
      addColumn('User', 'two_factor_secret', "TEXT DEFAULT ''");
      addColumn('User', 'two_factor_enabled', 'INTEGER DEFAULT 0');
    },
  },
  {
    version: 2,
    name: 'post-columns',
    up: () => {
      // Multi-site content isolation: NULL siteId = global content visible everywhere
      addColumn('Post', 'siteId', 'TEXT');
      addColumn('Post', 'password', "TEXT DEFAULT ''");
      addColumn('Post', 'views', 'INTEGER DEFAULT 0');
      addColumn('Post', 'sticky', 'INTEGER DEFAULT 0');
      addColumn('Post', 'format', "TEXT DEFAULT 'standard'");
      addColumn('Post', 'lockedAt', "TEXT DEFAULT ''");
      addColumn('Post', 'lockedBy', "TEXT DEFAULT ''");
    },
  },
  {
    version: 3,
    name: 'activity-menu-media-columns',
    up: () => {
      addColumn('Activity', 'ip', "TEXT DEFAULT ''");
      addColumn('Activity', 'meta', "TEXT DEFAULT ''");
      addColumn('Menu', 'siteId', 'TEXT');
      addColumn('Media', 'siteId', 'TEXT');
      addColumn('Media', 'thumbnail', 'TEXT');
      addColumn('Media', 'width', 'INTEGER');
      addColumn('Media', 'height', 'INTEGER');
      addColumn('Media', 'srcset', 'TEXT');
      addColumn('Media', 'downloads', 'INTEGER DEFAULT 0');
    },
  },
  {
    version: 4,
    name: 'comment-columns',
    up: () => {
      addColumn('Comment', 'siteId', 'TEXT');
      addColumn('Comment', 'subscribe', 'INTEGER DEFAULT 0');
      addColumn('Comment', 'likes', 'INTEGER DEFAULT 0');
    },
  },
  {
    version: 5,
    name: 'link-columns',
    up: () => {
      addColumn('Link', 'categoryId', 'TEXT');
      addColumn('Link', 'siteId', 'TEXT');
      addColumn('Link', 'pageId', 'TEXT');
      addColumn('Link', 'menuOrder', 'INTEGER DEFAULT 0');
      addColumn('Link', 'active', 'INTEGER DEFAULT 1');
      addColumn('Link', 'clicks', 'INTEGER DEFAULT 0');
      addColumn('Link', 'icon', "TEXT DEFAULT ''");
      addColumn('LinkCategory', 'siteId', 'TEXT');
      addColumn('LinkCategory', 'pageId', 'TEXT');
    },
  },
  {
    version: 6,
    name: 'link-lookup-indexes',
    up: () => {
      db.exec('CREATE INDEX IF NOT EXISTS idx_link_category ON Link (categoryId)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_linkcat_site ON LinkCategory (siteId)');
    },
  },
  {
    version: 7,
    name: 'drop-legacy-link-ownership',
    up: () => {
      // Link-level site/page ownership was removed — ownership lives on the
      // category now. Drop the leftover columns (and their index).
      db.exec('DROP INDEX IF EXISTS idx_link_site');
      try { dropColumn('Link', 'siteId'); } catch { /* best-effort cleanup */ }
      try { dropColumn('Link', 'pageId'); } catch { /* best-effort cleanup */ }
    },
  },
  {
    version: 8,
    name: 'post-views-index',
    up: () => {
      // Must run after the views column exists (migration 2).
      db.exec('CREATE INDEX IF NOT EXISTS idx_post_views ON Post (views DESC)');
    },
  },
  {
    version: 9,
    name: 'migrate-legacy-friend-links',
    up: () => {
      // Legacy friend links lived in the Link table before the navigation
      // model existed — copy them to FriendLink so the blogroll keeps working.
      // Only rows with NO navigation features are copied (a bare link is a
      // friend link); categorized/site-bound/ordered/clicked ones stay in Link.
      const friendCount = (db.prepare('SELECT COUNT(*) as c FROM FriendLink').get() as any)?.c || 0;
      if (friendCount !== 0) return;
      db.exec(`INSERT INTO FriendLink (id, name, url, avatar, description, createdAt)
        SELECT id, name, url, avatar, description, createdAt FROM Link
        WHERE categoryId IS NULL
          AND (menuOrder IS NULL OR menuOrder = 0) AND active = 1 AND clicks = 0
          AND NOT EXISTS (SELECT 1 FROM LinkPost lp WHERE lp.linkId = Link.id)`);
      // The migrated rows now live in FriendLink under the same id — remove
      // them from Link so the navigation list stays clean. The delete repeats
      // the exact copy predicate (rather than "id in FriendLink") so a Link row
      // that merely shares an id with an unrelated friend link is never removed.
      db.exec(`DELETE FROM Link WHERE id IN (SELECT id FROM FriendLink)
        AND categoryId IS NULL
        AND (menuOrder IS NULL OR menuOrder = 0) AND active = 1 AND clicks = 0
        AND NOT EXISTS (SELECT 1 FROM LinkPost lp WHERE lp.linkId = Link.id)`);
    },
  },
  {
    version: 10,
    name: 'app-password-scope-expiry',
    up: () => {
      // App passwords get a scope (read-only vs full), an optional expiry, a
      // revoked flag and the user's tokenVersion at creation so that
      // "log out everywhere" invalidates them too.
      addColumn('AppPassword', 'scope', "TEXT NOT NULL DEFAULT 'full'");
      addColumn('AppPassword', 'expires_at', "TEXT DEFAULT ''");
      addColumn('AppPassword', 'revoked', 'INTEGER NOT NULL DEFAULT 0');
      addColumn('AppPassword', 'last_used_at', "TEXT DEFAULT ''");
      addColumn('AppPassword', 'token_version', 'INTEGER NOT NULL DEFAULT 0');
    },
  },
  {
    version: 11,
    name: 'backfill-app-password-token-version',
    up: () => {
      // Migration 10 gave pre-existing app passwords token_version = 0. For a
      // user who had ever used "log out everywhere" (tokenVersion > 0) that
      // reads as stale, silently breaking a working credential on upgrade.
      // Pin legacy rows to the user's *current* version so they stay valid;
      // credentials created after this migration are pinned as before.
      db.exec(`UPDATE AppPassword SET token_version = COALESCE(
        (SELECT tokenVersion FROM User WHERE User.id = AppPassword.userId), 0)
        WHERE token_version = 0`);
    },
  },
];

function columnExists(table: string, column: string): boolean {
  if (driver === 'sqlite') {
    try {
      const rows = db.raw.prepare(`PRAGMA table_info(${table})`).all() as any[];
      return rows.some((r) => String(r.name).toLowerCase() === column.toLowerCase());
    } catch {
      return false;
    }
  }
  try {
    const t = driver === 'postgres' ? table.toLowerCase() : table;
    const sql =
      driver === 'mysql'
        ? 'SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?'
        : 'SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?';
    const row: any = db.prepare(sql).get(t, column.toLowerCase());
    return Number(row?.c || 0) > 0;
  } catch {
    return false;
  }
}

function addColumn(table: string, column: string, definition: string): void {
  if (columnExists(table, column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function dropColumn(table: string, column: string): void {
  if (!columnExists(table, column)) return;
  db.exec(`ALTER TABLE ${table} DROP COLUMN ${column}`);
}

// Apply every migration not yet in the ledger. On SQLite a failure aborts
// startup (the supported production path must never run on a half-migrated
// schema); the experimental remote drivers stay bootable best-effort.
export function runMigrations(): void {
  const applied = new Set<number>();
  try {
    for (const r of db.prepare('SELECT version FROM _SchemaMigration').all() as any[]) {
      applied.add(Number(r.version));
    }
  } catch (e: any) {
    console.warn('[DB] Could not read migration ledger:', e.message);
  }
  const pending = MIGRATIONS.filter((m) => !applied.has(m.version)).sort((a, b) => a.version - b.version);
  for (const m of pending) {
    try {
      withTransaction(() => {
        m.up();
        db.prepare('INSERT INTO _SchemaMigration (version, name, appliedAt) VALUES (?, ?, ?)')
          .run(m.version, m.name, new Date().toISOString());
      });
      console.log(`[DB] Applied migration ${m.version}: ${m.name}`);
    } catch (e: any) {
      console.error(`[DB] Migration ${m.version} (${m.name}) failed: ${e.message}`);
      if (driver === 'sqlite') throw e;
    }
  }
}

// Run `fn` inside a database transaction. Nested calls become savepoints.
// `fn` must be synchronous — all data access goes through the sync db interface.
let txDepth = 0;
export function withTransaction<T>(fn: () => T): T {
  if (driver === 'sqlite') {
    if (!db.raw) throw new Error('SQLite database not initialized');
    // better-sqlite3 wraps the body and auto-rolls back on throw; nested
    // calls transparently become SAVEPOINTs.
    return db.raw.transaction(fn)();
  }
  const depth = txDepth++;
  const sp = `mortar_sp_${depth}`;
  try {
    workerCall('exec', { sql: depth === 0 ? 'BEGIN' : `SAVEPOINT ${sp}` });
    const result = fn();
    // The body must be synchronous: an async body would let us COMMIT before it
    // resolved, breaking atomicity (and losing the rollback).
    if (result && typeof (result as any).then === 'function') {
      throw new Error('withTransaction callback must be synchronous');
    }
    workerCall('exec', { sql: depth === 0 ? 'COMMIT' : `RELEASE SAVEPOINT ${sp}` });
    return result;
  } catch (e) {
    try {
      workerCall('exec', { sql: depth === 0 ? 'ROLLBACK' : `ROLLBACK TO SAVEPOINT ${sp}` });
    } catch {}
    throw e;
  } finally {
    txDepth--;
  }
}

// Runtime driver reconfiguration (install wizard): switch SQLite <-> MySQL/PG
export function reconfigureDb(url: string): void {
  // Defense in depth: the URL is persisted to .env verbatim, so a newline would
  // let a crafted value inject extra environment lines.
  if (/[\r\n]/.test(url)) throw new Error('Invalid DATABASE_URL');
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

// Close the underlying database cleanly (graceful shutdown). SQLite checkpoints
// its WAL on close; the remote drivers close their pool before the worker exits.
export function closeDb(): void {
  if (driver === 'sqlite') {
    try { db.raw?.close(); } catch {}
    db.raw = null;
    return;
  }
  if (worker) {
    try { workerCall('close'); } catch {}
    try { worker.terminate(); } catch {}
    worker = null;
  }
}

export function cuid(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 10);
  return t + r;
}

export default db;
