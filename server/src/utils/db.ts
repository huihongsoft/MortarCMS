import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';
import { snapshotDatabaseFile } from './dbSnapshot';
import { encryptSecret, isEncryptedSecret } from './secretBox';

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

    -- Revoked sessions ("log out" / "log out everywhere"). Persisted so a
    -- restart cannot resurrect a logged-out token; keyed by a hash so the raw
    -- token is never stored. Rows are purged once the token would have expired.
    CREATE TABLE IF NOT EXISTS RevokedToken (
      hash TEXT PRIMARY KEY,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    -- Single-use record for AI approval tokens. Those tokens are signed and
    -- deliberately stateless, so replay protection needs one row per consumed
    -- plan: without it a lost response makes the user retry the approval and the
    -- write happens twice (verified: two drafts from one token). Keyed by a hash
    -- so the token itself is never stored; rows are purged once expired.
    CREATE TABLE IF NOT EXISTS AiApprovalUse (
      hash TEXT PRIMARY KEY,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    -- Sites a user may act on (utils/userSites.ts). A user with no rows here
    -- keeps the old behaviour — any site — so upgrading never locks anyone out;
    -- assigning sites switches that user to explicit-only.
    CREATE TABLE IF NOT EXISTS UserSite (
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      siteId TEXT NOT NULL REFERENCES Site(id) ON DELETE CASCADE,
      PRIMARY KEY (userId, siteId)
    );

    CREATE TABLE IF NOT EXISTS Role (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      capabilities TEXT NOT NULL DEFAULT '[]',
      isSystem INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    -- System roles are seeded from BUILTIN_ROLES below (one source of truth for
    -- the shipped defaults, shared with the alignment migration).

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

  seedBuiltinRoles();
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
  {
    version: 13,
    name: 'analytics-form-brokenlink-site',
    up: () => {
      // These four tables carried no site, so their admin views (visit stats, hot
      // searches, form submissions, broken-link report) always mixed every site
      // together — nothing could be scoped to the sites a user is assigned to.
      addColumn('Visit', 'siteId', 'TEXT');
      addColumn('SearchLog', 'siteId', 'TEXT');
      addColumn('Form', 'siteId', 'TEXT');
      addColumn('BrokenLink', 'siteId', 'TEXT');
    },
  },
  {
    version: 12,
    name: 'ai-task-site',
    up: () => {
      // The site a task was started from. Without it a retry ran with no site
      // scope at all, so on a multi-site install a task could read and write
      // across every site.
      addColumn('AiTask', 'siteId', 'TEXT');
    },
  },
  {
    version: 16,
    name: 'align-builtin-role-capabilities',
    up: () => {
      // Old installs carry role rows seeded long ago whose capability lists are
      // missing things the current defaults grant (an editor without
      // moderate_comments/manage_options could not moderate comments or open the
      // dashboard). Add-only: nothing an administrator removed is restored.
      const changed = alignBuiltinRoleCapabilities();
      for (const c of changed) console.log('[DB] role ' + c.slug + ': added ' + c.added.join(', '));
    },
  },
  {
    version: 17,
    name: 'capability-route-alignment',
    up: () => {
      // The last role-slug route guards moved to capabilities, so the built-in
      // editor default gained the two keys it needs to keep screens it already
      // had:
      //   - manage_security: /security and /broken-links were gated by
      //     manage_options before, and editors hold manage_options;
      //   - view_sites: GET /sites backs the post editor's site dropdown, which
      //     editors could already reach (site create/remove stays manage_sites).
      // Targeted add-only, deliberately NOT alignBuiltinRoleCapabilities(): that
      // tops up every missing editor default and would resurrect capabilities an
      // administrator removed on purpose. New installs get the same values from
      // seedBuiltinRoles().
      const added = addRoleCapabilities('editor', ['manage_security', 'view_sites']);
      if (added.length) console.log('[DB] role editor: added ' + added.join(', '));
    },
  },
  {
    version: 18,
    name: 'site-scoped-indexes',
    up: () => {
      // Every site-scoped query filters on `siteId` (`siteId IS NULL OR siteId = ?`),
      // yet none of these tables had an index on it — the only one in the schema was
      // LinkCategory's. On a multi-site install every list, moderation view and
      // analytics read was therefore a full table scan.
      //
      // Single-column on purpose: the column is low-cardinality, so a composite
      // would not pay for itself, and the same tables are also queried with no site
      // scope at all (where a siteId-leading index cannot help).
      //
      // Note for the remote drivers: MySQL cannot index a TEXT column without a
      // prefix length and has no `CREATE INDEX IF NOT EXISTS`. These statements are
      // the SQLite/Postgres form; the MySQL rewrite lands with the rest of the
      // remote-driver work (see docs/deployment.md).
      const targets: [string, string][] = [
        ['idx_post_site', 'Post'],
        ['idx_comment_site', 'Comment'],
        ['idx_media_site', 'Media'],
        ['idx_menu_site', 'Menu'],
        ['idx_visit_site', 'Visit'],
        ['idx_searchlog_site', 'SearchLog'],
        ['idx_form_site', 'Form'],
        ['idx_brokenlink_site', 'BrokenLink'],
        ['idx_aitask_site', 'AiTask'],
      ];
      for (const [name, table] of targets) db.exec('CREATE INDEX IF NOT EXISTS ' + name + ' ON ' + table + ' (siteId)');
    },
  },
  {
    version: 19,
    name: 'encrypt-2fa-secrets',
    up: () => {
      // Recovery codes: single-use, SHA-256 hashed, stored as a JSON array.
      addColumn('User', 'two_factor_recovery_codes', "TEXT DEFAULT ''");
      // TOTP secrets were stored in plaintext, so a database dump — or a backup
      // archive, which this app hands out by design — was enough to generate
      // valid codes for every account with 2FA on. Encrypt the rows written
      // before this change; the routes encrypt everything written since.
      //
      // A row that cannot be encrypted is left alone rather than cleared: losing
      // the secret would lock its owner out of an account they had hardened, and
      // the read path accepts a plaintext value for exactly this case.
      const rows = db.prepare("SELECT id, two_factor_secret FROM User WHERE two_factor_secret IS NOT NULL AND two_factor_secret <> ''").all() as any[];
      let encrypted = 0;
      for (const row of rows) {
        const value = String(row.two_factor_secret);
        if (isEncryptedSecret(value)) continue;
        try {
          db.prepare('UPDATE User SET two_factor_secret = ? WHERE id = ?').run(encryptSecret(value), row.id);
          encrypted++;
        } catch (err: any) {
          console.warn('[DB] Could not encrypt the 2FA secret of user ' + row.id + ': ' + (err?.message || err));
        }
      }
      if (encrypted > 0) console.log('[DB] Encrypted ' + encrypted + ' stored 2FA secret(s)');
    },
  },
  {
    version: 20,
    name: 'rate-limit-counters',
    up: () => {
      // Counters that survive a restart and are shared by every process on the
      // same database — the login lockout always, and the express-rate-limit
      // windows when RATE_LIMIT_STORE=db (see utils/rateLimitStore.ts).
      db.exec(`CREATE TABLE IF NOT EXISTS RateLimit (
        key TEXT PRIMARY KEY,
        hits INTEGER NOT NULL DEFAULT 0,
        resetAt TEXT NOT NULL
      )`);
      db.exec('CREATE INDEX IF NOT EXISTS idx_ratelimit_reset ON RateLimit (resetAt)');
    },
  },
  {
    version: 21,
    name: 'shared-cache',
    up: () => {
      // Keys shared between processes: the scheduler's leader lock, the page
      // cache generation, and anything else that must agree across instances
      // (see utils/sharedStore.ts). Rows carry their own expiry; the store prunes
      // opportunistically, and `expiresAt` is indexed because the lock steal and
      // the prune both filter on it.
      db.exec(`CREATE TABLE IF NOT EXISTS SharedCache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expiresAt TEXT
      )`);
      db.exec('CREATE INDEX IF NOT EXISTS idx_sharedcache_expires ON SharedCache (expiresAt)');
    },
  },
  {
    version: 15,
    name: 'role-capability-alignment',
    up: () => {
      // Bring the seeded capability lists in line with what the routes actually
      // enforced, in both directions, so switching the routes to capabilities
      // cannot change who can do what:
      //   - editors could manage menus, but the list never said manage_menus;
      //   - authors were granted edit_media, but media metadata was admin/editor
      //     only (keeping the grant would have handed authors every media row in
      //     their sites).
      // The capability each role must keep: wherever a route used to name roles
      // directly, that role's list has to carry the capability now, or the same
      // people lose access the moment the route is capability-gated. Which is
      // why this is a migration and not just a seed change — a live install has
      // its own (often sparse) role rows.
      const sync = (slug: string, add: string[], remove: string[]) => {
        const row = db.prepare('SELECT id, capabilities FROM Role WHERE slug = ?').get(slug) as any;
        if (!row) return;
        let caps: string[];
        try { caps = JSON.parse(row.capabilities); } catch { return; }
        if (!Array.isArray(caps) || caps.includes('*')) return;
        let changed = false;
        for (const c of remove) { if (caps.includes(c)) { caps = caps.filter(x => x !== c); changed = true; } }
        for (const c of add) { if (!caps.includes(c)) { caps.push(c); changed = true; } }
        if (changed) db.prepare('UPDATE Role SET capabilities = ? WHERE id = ?').run(JSON.stringify(caps), row.id);
      };
      // editor: menus + the media metadata routes + the page routes it could
      // already use.
      sync('editor', ['manage_menus', 'edit_media', 'delete_media', 'edit_pages', 'publish_pages', 'delete_pages'], []);
      // author: upload_files (already present everywhere) — media metadata was
      // never author-accessible, so drop the grants that said otherwise.
      sync('author', ['upload_files'], ['edit_media', 'delete_media']);
    },
  },
  {
    version: 14,
    name: 'post-previous-status',
    up: () => {
      // Trashing dropped the old status, so restoring always came back as a
      // draft: a published post that was trashed and restored silently went
      // offline again. Remember what it was before the trash.
      addColumn('Post', 'previousStatus', 'TEXT');
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

// Shipped capability defaults for the built-in roles. The seed inserts these for
// a new install; alignBuiltinRoleCapabilities() tops up an existing install whose
// rows predate the current defaults (an install seeded years ago had an editor
// without `moderate_comments` or `manage_options`, so those editors could not
// moderate comments or open the dashboard — for no visible reason).
export const BUILTIN_ROLES: { slug: string; name: string; capabilities: string[] }[] = [
  { slug: 'admin', name: '管理员', capabilities: ['*'] },
  {
    slug: 'editor', name: '编辑',
    capabilities: [
      'edit_posts', 'edit_others_posts', 'publish_posts', 'delete_posts', 'delete_others_posts',
      'moderate_comments', 'review_posts', 'manage_categories', 'manage_tags', 'manage_links', 'manage_forms',
      'upload_files', 'edit_media', 'delete_media',
      'edit_pages', 'publish_pages', 'delete_pages', 'manage_menus',
      'manage_options', 'manage_security', 'view_sites', 'ai_use', 'ai_review', 'ai_tasks', 'view_system_info',
    ],
  },
  { slug: 'author', name: '作者', capabilities: ['edit_posts', 'publish_posts', 'delete_posts', 'submit_posts', 'upload_files', 'ai_use'] },
  { slug: 'subscriber', name: '订阅者', capabilities: ['submit_posts'] },
];

function seedBuiltinRoles(): void {
  const stmt = db.prepare("INSERT OR IGNORE INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES (?, ?, ?, ?, 1, '2024-01-01')");
  for (const r of BUILTIN_ROLES) stmt.run('role-' + r.slug, r.slug, r.name, JSON.stringify(r.capabilities));
}

/**
 * Schema state, for the readiness probe and the metrics endpoint: how many
 * migrations the ledger says were applied, and how many exist in this build.
 * `applied < latest` means the running process is on an older schema than its
 * code — which a readiness probe should treat as "not ready to serve".
 */
export function schemaVersion(): { applied: number; latest: number } {
  const latest = MIGRATIONS.length ? Math.max(...MIGRATIONS.map((m) => m.version)) : 0;
  let appliedVersions: number[] = [];
  try {
    appliedVersions = (db.prepare('SELECT version FROM _SchemaMigration').all() as any[]).map((r) => Number(r.version));
  } catch { /* the ledger table is created by initDB; absent means nothing applied */ }
  const applied = MIGRATIONS.filter((m) => appliedVersions.includes(m.version)).length;
  return { applied, latest: MIGRATIONS.length };
}

// Add-only top-up of the built-in role rows: only missing defaults are added, so
// nothing an administrator removed by hand comes back, and custom roles are never
// touched. Returns what changed so the migration can log it.
export function alignBuiltinRoleCapabilities(): { slug: string; added: string[] }[] {
  const changed: { slug: string; added: string[] }[] = [];
  for (const def of BUILTIN_ROLES) {
    if (def.capabilities.includes('*')) continue;             // admin stays '*'
    let row: any;
    try { row = db.prepare('SELECT id, capabilities FROM Role WHERE slug = ?').get(def.slug); } catch { return changed; }
    if (!row) continue;                                        // no row: the code fallback applies
    let caps: string[];
    try { caps = JSON.parse(row.capabilities); } catch { continue; }
    if (!Array.isArray(caps) || caps.includes('*')) continue;   // '*' supersedes the list
    const added = def.capabilities.filter((c) => !caps.includes(c));
    if (added.length === 0) continue;
    db.prepare('UPDATE Role SET capabilities = ? WHERE id = ?').run(JSON.stringify([...caps, ...added]), row.id);
    changed.push({ slug: def.slug, added });
  }
  return changed;
}

// Add-only top-up of ONE role row. Unlike alignBuiltinRoleCapabilities() this
// touches just the capabilities the caller names, so a migration can grant what
// a route change requires without resurrecting every missing default an
// administrator may have removed on purpose. Returns what was added.
export function addRoleCapabilities(slug: string, caps: string[]): string[] {
  let row: any;
  try { row = db.prepare('SELECT id, capabilities FROM Role WHERE slug = ?').get(slug); } catch { return []; }
  if (!row) return [];
  let current: string[];
  try { current = JSON.parse(row.capabilities); } catch { return []; }
  if (!Array.isArray(current) || current.includes('*')) return [];   // '*' supersedes the list
  const added = caps.filter((c) => !current.includes(c));
  if (added.length === 0) return [];
  db.prepare('UPDATE Role SET capabilities = ? WHERE id = ?').run(JSON.stringify([...current, ...added]), row.id);
  return added;
}

function addColumn(table: string, column: string, definition: string): void {
  if (columnExists(table, column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function dropColumn(table: string, column: string): void {
  if (!columnExists(table, column)) return;
  db.exec(`ALTER TABLE ${table} DROP COLUMN ${column}`);
}

// True when this database has never had a migration applied and holds no
// accounts — i.e. the migrations about to run are the initial schema, not an
// upgrade of live data. The ledger is the primary signal; the `User` check
// covers a database restored without its ledger, which does have data worth
// snapshotting.
function isFreshInstall(applied: Set<number>): boolean {
  if (applied.size > 0) return false;
  try {
    return !db.prepare('SELECT 1 FROM User LIMIT 1').get();
  } catch {
    // The table does not exist yet on a brand-new file.
    return true;
  }
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
  // Snapshot before the first migration of this boot mutates the schema. There
  // is no `down()` anywhere, so this file copy is the only way back from a bad
  // upgrade — the upgrade docs point at it. Skipped for the remote drivers
  // (the database is not a file we can copy) and on a fresh install, where
  // "pending" is just the initial schema creation and there is no data yet to
  // protect — that snapshot would only eat one of the five kept slots.
  if (pending.length > 0 && driver === 'sqlite' && !isFreshInstall(applied) && fs.existsSync(DB_PATH)) {
    const snap = snapshotDatabaseFile('v' + pending.map((m) => m.version).join('-'), DB_PATH);
    if (snap) console.log('[DB] Pre-migration snapshot: ' + snap);
  }
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
