// Scheduled task system: tasks register with an interval, the scheduler tick
// runs due tasks, and admins can trigger/disable them from the tools panel.
// Enabled state persists in the Setting table; run stats live in memory.
import fs from 'fs';
import path from 'path';
import db, { cuid, DB_PATH } from './db';
import { doAction } from './hooks';
import { purgeContentCaches, purgeAllCaches } from './cache';
import { postUrl } from './slug';
import { createBackupArchive, pruneBackups } from './backup';
import { sharedStore } from './sharedStore';
import { pruneRead } from './notifications';

export interface TaskDef {
  id: string;
  name: string;
  desc: string;
  intervalMs: number;
  fn: () => void | Promise<void>;
  source?: string;
}

interface TaskState {
  enabled: boolean;
  running: boolean;
  lastRun: number | null;
  lastStatus: 'ok' | 'error' | null;
  lastError?: string;
  lastDurationMs?: number;
  runCount: number;
}

const tasks = new Map<string, { def: TaskDef; state: TaskState }>();

// When a task last ran, persisted. It used to live only in memory, so every
// restart made every task look due and run it immediately — which is how the
// weekly AI report got mailed on each deploy. Persisting it also stops a second
// instance from repeating what the first one just did.
function lastRunKey(id: string): string { return 'task_' + id + '_last_run'; }

function readLastRun(id: string): number | null {
  try {
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get(lastRunKey(id)) as any;
    const n = Number(row?.value);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch { return null; }
}

function writeLastRun(id: string, at: number): void {
  try {
    db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(lastRunKey(id), lastRunKey(id), String(at));
  } catch { /* best effort — a missed timestamp costs a duplicate run, not correctness */ }
}

export function registerTask(def: TaskDef): void {
  let enabled = true;
  try {
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get('task_' + def.id + '_enabled') as any;
    if (row) enabled = row.value !== '0';
  } catch {}
  tasks.set(def.id, {
    def,
    state: { enabled, running: false, lastRun: readLastRun(def.id), lastStatus: null, runCount: 0 },
  });
}

export function listTasks(): any[] {
  const now = Date.now();
  return [...tasks.values()].map(({ def, state }) => ({
    id: def.id,
    name: def.name,
    desc: def.desc,
    intervalMs: def.intervalMs,
    source: def.source || 'core',
    enabled: state.enabled,
    running: state.running,
    lastRun: state.lastRun,
    lastStatus: state.lastStatus,
    lastError: state.lastError,
    lastDurationMs: state.lastDurationMs,
    runCount: state.runCount,
    nextRun: state.enabled && state.lastRun !== null ? state.lastRun + def.intervalMs : null,
    due: state.enabled && (state.lastRun === null || now - state.lastRun >= def.intervalMs),
  }));
}

// Only one process may run a given task at a time. The lock lives in the shared
// store (the database by default) and is released as soon as the task finishes;
// the TTL is the safety net for a process that dies mid-run — after it expires
// another instance may start the task, which is the right trade-off against a
// task being blocked forever by a crashed holder.
const TASK_LOCK_TTL_MS = 15 * 60_000;

export async function runTaskNow(id: string): Promise<{ ok: boolean; error?: string; ms: number; skipped?: boolean }> {
  const t = tasks.get(id);
  if (!t) return { ok: false, error: 'Unknown task', ms: 0 };
  if (t.state.running) return { ok: false, error: 'Task is already running', ms: 0, skipped: true };

  const store = await sharedStore();
  const release = await store.acquireLock('lock:task:' + id, TASK_LOCK_TTL_MS);
  if (!release) {
    // Another instance is running it. Reported rather than silently ignored: an
    // operator clicking "run now" deserves to know why nothing happened.
    return { ok: false, error: 'Another instance is running this task right now', ms: 0, skipped: true };
  }

  const t0 = Date.now();
  t.state.running = true;
  try {
    await t.def.fn();
    t.state.lastStatus = 'ok';
    t.state.lastError = undefined;
  } catch (e: any) {
    t.state.lastStatus = 'error';
    t.state.lastError = e?.message || String(e);
  }
  t.state.lastDurationMs = Date.now() - t0;
  t.state.runCount++;
  t.state.lastRun = Date.now();
  writeLastRun(id, t.state.lastRun);
  t.state.running = false;
  await release().catch(() => {});
  // Plugins/webhooks can report or alert on scheduled work (failures included).
  try { doAction('task_run', id, t.state.lastStatus === 'ok', t.state.lastError || '', t.state.lastDurationMs); } catch {}
  return { ok: t.state.lastStatus === 'ok', error: t.state.lastError, ms: t.state.lastDurationMs };
}

export function setTaskEnabled(id: string, enabled: boolean): void {
  const t = tasks.get(id);
  if (!t) return;
  t.state.enabled = enabled;
  try {
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run('task_' + id + '_enabled', 'task_' + id + '_enabled', enabled ? '1' : '0');
  } catch {}
}

let schedulerTimer: NodeJS.Timeout | null = null;

export function startScheduler(tickMs = 30000): void {
  if (schedulerTimer) return;
  schedulerTimer = setInterval(async () => {
    const now = Date.now();
    for (const { def, state } of tasks.values()) {
      if (!state.enabled || state.running) continue;
      // lastRun is the persisted one, so a restart no longer re-runs everything.
      if (state.lastRun !== null && now - state.lastRun < def.intervalMs) continue;
      // runTaskNow owns the running flag and the cross-instance lock; a second
      // tick lands on the flag or loses the lock race and is skipped.
      runTaskNow(def.id).catch(() => {});
    }
  }, tickMs);
  // Don't keep the event loop alive just for the scheduler (clean shutdown).
  schedulerTimer.unref?.();
}

// Stop the scheduler tick (used during graceful shutdown).
export function stopScheduler(): void {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
}

// ---- Built-in tasks ----

export function registerBuiltinTasks(): void {
  registerTask({
    id: 'publish_scheduled',
    name: 'Publish scheduled posts',
    desc: 'Publishes posts whose scheduled time has arrived',
    intervalMs: 60_000,
    fn: () => {
      const now = new Date().toISOString();
      const rows = db.prepare("SELECT id FROM Post WHERE status = 'scheduled' AND publishedAt <= ?").all(now) as any[];
      if (rows.length === 0) return;
      db.prepare("UPDATE Post SET status = 'published', publishedAt = ? WHERE status = 'scheduled' AND publishedAt <= ?").run(now, now);
      rows.forEach((r: any) => { try { doAction('post_published', r.id); } catch {} });
      purgeContentCaches();
      console.log('[Task] Published ' + rows.length + ' scheduled posts');
    },
  });

  registerTask({
    id: 'purge_trash',
    name: 'Purge trashed content',
    desc: 'Permanently deletes posts/pages trashed more than 30 days ago',
    intervalMs: 86_400_000,
    fn: () => {
      const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const r = db.prepare("DELETE FROM Post WHERE status = 'trash' AND updatedAt < ?").run(cutoff);
      if (r.changes > 0) {
        purgeContentCaches();
        console.log('[Task] Purged ' + r.changes + ' trashed items');
      }
    },
  });

  registerTask({
    id: 'prune_activity',
    name: 'Prune activity log',
    desc: 'Removes activity log entries older than 90 days',
    intervalMs: 86_400_000,
    fn: () => {
      const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
      const r = db.prepare('DELETE FROM Activity WHERE createdAt < ?').run(cutoff);
      if (r.changes > 0) console.log('[Task] Pruned ' + r.changes + ' activity entries');
    },
  });

  registerTask({
    id: 'db_maintenance',
    name: 'Database maintenance',
    desc: 'Runs a WAL checkpoint weekly to keep the database compact',
    intervalMs: 7 * 86_400_000,
    fn: () => {
      try { db.raw?.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
    },
  });

  registerTask({
    id: 'ai_usage_report',
    name: 'AI usage weekly report',
    desc: 'Emails admins a summary of the past 7 days of AI usage (requires SMTP)',
    // Weekly, matching the name and the 7-day window. It ran daily before, and
    // nothing recorded when it last sent, so every restart or deploy made the
    // scheduler think a week had passed and mail the report again (multiplied by
    // the number of instances). The send time is now persisted.
    intervalMs: 7 * 86_400_000,
    fn: async () => {
      try {
        const sentKey = 'ai_usage_report_last_sent';
        const lastSent = (db.prepare('SELECT value FROM Setting WHERE key = ?').get(sentKey) as any)?.value;
        if (lastSent && Date.now() - new Date(lastSent).getTime() < 7 * 86_400_000) return;
        const admins = db.prepare("SELECT email FROM User WHERE role = 'admin' AND email != ''").all() as any[];
        const sendEmailMod = await import('./mailer');
        const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
        const rows = db.prepare("SELECT kind, COUNT(*) as c, COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) >= ? GROUP BY kind").all(since) as any[];
        const total = (db.prepare("SELECT COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) >= ?").get(since) as any)?.t || 0;
        if (rows.length === 0 || admins.length === 0) return; // nothing to report
        const lines = rows.map((r: any) => '<tr><td>' + r.kind + '</td><td>' + r.c + '</td><td>' + r.t + '</td></tr>').join('');
        const siteTitle = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar';
        const html = '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">' +
          '<h2 style="color:#2563eb;">' + siteTitle + ' · AI 用量周报</h2>' +
          '<p>过去 7 天 AI 使用情况：</p>' +
          '<table style="border-collapse:collapse;width:100%;"><tr style="background:#f3f4f6;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">类型</th><th style="padding:8px;border:1px solid #e5e7eb;">次数</th><th style="padding:8px;border:1px solid #e5e7eb;">Token</th></tr>' + lines + '</table>' +
          '<p style="margin-top:12px;color:#374151;">合计 Token：<strong>' + total + '</strong></p></div>';
        for (const a of admins) {
          await sendEmailMod.sendEmail(a.email, siteTitle + ' AI 用量周报', html);
        }
        db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
          .run(sentKey, sentKey, new Date().toISOString());
        console.log('[Task] AI usage report sent to ' + admins.length + ' admin(s)');
      } catch {}
    },
  });

  // AI bookkeeping grows one row per tool call / per request, and nothing else
  // ever deletes it: the audit rows alone carry args + output (up to ~6KB each),
  // so a modest site reaches hundreds of MB a year. AiUsage is deliberately NOT
  // pruned — it is the source for the daily budget and for the all-time totals on
  // /ai/usage, and a silent "totals actually mean the last N days" is worse than
  // the rows it would save (they are tiny next to AiAudit).
  registerTask({
    id: 'prune_ai_records',
    name: 'Prune old AI records',
    desc: 'Drops AI audit rows older than 90 days, read notifications older than 30 days, and AI sessions untouched for a year',
    intervalMs: 86_400_000,
    fn: () => {
      try {
        const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
        const audit = db.prepare('DELETE FROM AiAudit WHERE createdAt < ?').run(daysAgo(90)).changes;
        const notes = pruneRead(daysAgo(30));
        const sessions = db.prepare('DELETE FROM AiSession WHERE updatedAt < ?').run(daysAgo(365)).changes;
        // Expired share links: they used to stay readable forever, and they live
        // in the Setting table where they bloat every settings read. Rows written
        // before the TTL existed have no expiresAt, so age is the fallback.
        let shares = 0;
        try {
          const nowIso = new Date().toISOString();
          const cutoff = daysAgo(30); // matches SHARE_TTL_MS in routes/ai.ts
          for (const r of db.prepare("SELECT key, value FROM Setting WHERE key LIKE 'ai_share_%'").all() as any[]) {
            let exp = '';
            let created = '';
            try { const d = JSON.parse(r.value || '{}'); exp = String(d?.expiresAt || ''); created = String(d?.createdAt || ''); } catch { /* unparsable: leave it alone */ }
            const stale = exp ? exp < nowIso : (created ? created < cutoff : false);
            if (stale) shares += db.prepare('DELETE FROM Setting WHERE key = ?').run(r.key).changes;
          }
        } catch { /* pruning must never break the task */ }
        if (audit || notes || sessions || shares) {
          console.log('[Task] Pruned AI records: audit=' + audit + ' notifications=' + notes + ' sessions=' + sessions + ' shares=' + shares);
        }
      } catch { /* pruning must never break the scheduler */ }
    },
  });

  registerTask({
    id: 'prune_revisions',
    name: 'Prune old revisions',
    desc: 'Keeps the newest 30 revisions per post and removes older ones',
    intervalMs: 7 * 86_400_000,
    fn: () => {
      try {
        const posts = db.prepare('SELECT DISTINCT postId FROM Revision').all() as any[];
        let pruned = 0;
        for (const { postId } of posts) {
          const keep = (db.prepare('SELECT id FROM Revision WHERE postId = ? ORDER BY createdAt DESC, id DESC LIMIT 30').all(postId) as any[]).map((r: any) => r.id);
          if (keep.length < 30) continue;
          const marks = keep.map(() => '?').join(',');
          const r = db.prepare('DELETE FROM Revision WHERE postId = ? AND id NOT IN (' + marks + ')').run(postId, ...keep);
          pruned += r.changes;
        }
        if (pruned > 0) console.log('[Task] Pruned ' + pruned + ' old revisions');
      } catch {}
    },
  });

  registerTask({
    id: 'backup_database',
    name: 'Backup database',
    desc: 'Writes a database + uploads archive to the backups folder (mirrors it to object storage when configured); keeps only the newest backups (retention setting)',
    intervalMs: 86_400_000,
    fn: async () => {
      // Use the real database path: a hardcoded server/data/mortar.db would
      // silently back up nothing when MORTAR_DB_PATH is customised.
      if (!fs.existsSync(DB_PATH)) { console.log('[Task] Backup skipped: database file not found at ' + DB_PATH); return; }
      let retention = 10;
      try {
        retention = Math.max(1, parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'backup_retention'").get() as any)?.value || '10') || 10);
      } catch {}
      // Database *and* uploads: the old copy took only the .db file, so a restore
      // brought the content back with every image missing.
      const entry = await createBackupArchive({ includeUploads: true });
      pruneBackups(retention);
      // Object storage: mirror the archive remotely and trim old copies to the
      // same retention (best-effort — a remote failure never fails the task).
      // Names embed an ISO timestamp, so name order is chronological here.
      try {
        const { getStorageConfig, storeFile, listRemoteFiles, deleteRemoteFile } = await import('./storage');
        const cfg = getStorageConfig();
        if (cfg.provider === 's3') {
          await storeFile('backups/' + entry.name, fs.readFileSync(entry.path), 'application/gzip');
          const keys = (await listRemoteFiles('backups/')).sort();
          while (keys.length > retention) {
            const old = keys.shift() as string;
            try { await deleteRemoteFile(old); } catch {}
          }
          console.log('[Task] Backup mirrored to object storage (retention ' + retention + ')');
        }
      } catch (e: any) { console.log('[Task] Backup mirror to object storage failed: ' + e.message); }
      try {
        db.prepare("INSERT INTO Setting (id, key, value) VALUES ('db_last_backup', 'db_last_backup', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date().toISOString());
      } catch {}
      console.log('[Task] Backup created: ' + entry.name + ' (' + entry.bytes + ' bytes, retention ' + retention + ')');
      try { doAction('backup_completed', entry.path); } catch {}
    },
  });

  registerTask({
    id: 'purge_ai_tasks',
    name: 'Prune AI task history',
    desc: 'Deletes finished AI tasks older than 90 days and keeps at most 500 records',
    intervalMs: 86_400_000,
    fn: () => {
      try {
        const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
        const r = db.prepare("DELETE FROM AiTask WHERE status IN ('done','failed','cancelled') AND createdAt < ?").run(cutoff);
        if (r.changes > 0) console.log('[Task] Pruned ' + r.changes + ' old AI tasks');
        // Hard cap on total history rows (running tasks are never removed)
        const extra = db.prepare("SELECT COUNT(*) as c FROM AiTask WHERE status IN ('done','failed','cancelled')").get() as any;
        const excess = ((extra?.c || 0) - 500);
        if (excess > 0) {
          const ids = db.prepare("SELECT id FROM AiTask WHERE status IN ('done','failed','cancelled') ORDER BY createdAt ASC LIMIT ?").all(excess) as any[];
          for (const row of ids) db.prepare('DELETE FROM AiTask WHERE id = ?').run(row.id);
          console.log('[Task] Trimmed ' + ids.length + ' AI task records (cap 500)');
        }
      } catch {}
    },
  });

  registerTask({
    id: 'newsletter_digest',
    name: 'Newsletter digest',
    desc: 'Emails confirmed subscribers the latest posts (daily by default; weekly via newsletter_frequency setting)',
    intervalMs: 86_400_000,
    fn: async () => {
      try {
        const freq = (db.prepare("SELECT value FROM Setting WHERE key = 'newsletter_frequency'").get() as any)?.value || 'daily';
        const lastRaw = (db.prepare("SELECT value FROM Setting WHERE key = 'newsletter_last_sent_at'").get() as any)?.value || '';
        const lastSent = lastRaw ? new Date(lastRaw).getTime() : 0;
        const nowMs = Date.now();
        if (freq === 'weekly' && lastSent && nowMs - lastSent < 7 * 86_400_000) return; // not due yet
        // Only the first run (no cursor) sends — afterwards the cursor gates it
        if (!lastRaw) return;
        const since = new Date(lastSent).toISOString();
        const posts = db.prepare("SELECT id, title, slug, excerpt FROM Post WHERE type = 'post' AND status = 'published' AND publishedAt > ? ORDER BY publishedAt DESC LIMIT 10").all(since) as any[];
        if (posts.length === 0) return;
        const subs = db.prepare("SELECT id, email, confirmToken FROM Subscriber WHERE status = 'subscribed' AND confirmed = 1 AND email != ''").all() as any[];
        if (subs.length === 0) return;
        const sendEmailMod = await import('./mailer');
        const info = {
          title: (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar',
          url: (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '',
        };
        const base = info.url || 'http://localhost:3001';
        const items = posts.map(p =>
          '<div style="margin-bottom:16px;"><a href="' + base + postUrl(p.slug) + '" style="font-size:16px;font-weight:600;color:#2563eb;text-decoration:none;">' + String(p.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>' +
          (p.excerpt ? '<p style="margin:4px 0 0;font-size:13px;color:#4b5563;">' + String(p.excerpt).substring(0, 200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>' : '') + '</div>').join('');
        let sent = 0;
        for (const s of subs) {
          try {
            const tpl = sendEmailMod.renderTemplate('newsletter_digest', {
              site_title: info.title,
              posts_html: items,
              unsubscribe_link: base + '/newsletter/unsubscribe?token=' + s.confirmToken,
              site_url: base,
            });
            if (tpl) {
              const r = await sendEmailMod.sendEmail(s.email, tpl.subject, tpl.html);
              if (r.ok) sent++;
            }
          } catch {}
        }
        db.prepare("INSERT INTO Setting (id, key, value) VALUES ('newsletter_last_sent_at', 'newsletter_last_sent_at', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date(nowMs).toISOString());
        // Served by the cached /api/settings.
        try { purgeAllCaches(); } catch { /* cache maintenance must not fail the task */ }
        if (sent > 0) console.log('[Task] Newsletter digest sent to ' + sent + ' subscriber(s)');
      } catch {}
    },
  });

  registerTask({
    id: 'sync_media_to_storage',
    name: 'Migrate media to object storage',
    desc: 'Uploads locally-stored media to the configured object store and rewrites URLs (idempotent)',
    intervalMs: 86_400_000,
    fn: async () => {
      try {
        const { getStorageConfig, storeFile, keyFromUrl } = await import('./storage');
        const cfg = getStorageConfig();
        if (cfg.provider !== 's3') return;
        const rows = db.prepare("SELECT id, url, thumbnail, srcset, mimeType FROM Media WHERE url LIKE '/uploads/%' ORDER BY createdAt DESC LIMIT 200").all() as any[];
        if (rows.length === 0) return;
        const fsMod = await import('fs');
        const pathMod = await import('path');
        const readLocal = (p: string): Buffer | null => {
          try {
            const fp = pathMod.default.join(__dirname, '../..', p);
            return fsMod.default.existsSync(fp) ? fsMod.default.readFileSync(fp) : null;
          } catch { return null; }
        };
        let migrated = 0;
        for (const m of rows) {
          try {
            const buf = readLocal(m.url);
            if (!buf) continue;
            const key = m.id + '-' + String(m.url).replace(/^\/uploads\//, '').replace(/^.*\//, '');
            const url = await storeFile(key, buf, m.mimeType || 'application/octet-stream');
            let thumb: string | null = m.thumbnail;
            if (m.thumbnail && m.thumbnail.startsWith('/uploads/')) {
              const tb = readLocal(m.thumbnail);
              if (tb) thumb = await storeFile(m.id + '-thumb.jpg', tb, 'image/jpeg');
            }
            let srcset: string | null = m.srcset;
            if (m.srcset) {
              try {
                const parsed = JSON.parse(m.srcset);
                const out: Record<string, string> = {};
                for (const [size, p] of Object.entries(parsed)) {
                  if (typeof p === 'string' && p.startsWith('/uploads/')) {
                    const sb = readLocal(p);
                    if (sb) out[size] = await storeFile(m.id + '-w' + size + '.webp', sb, 'image/webp');
                    else out[size] = p;
                  } else if (typeof p === 'string') out[size] = p;
                }
                srcset = JSON.stringify(out);
              } catch {}
            }
            db.prepare('UPDATE Media SET url = ?, thumbnail = ?, srcset = ? WHERE id = ?').run(url, thumb, srcset, m.id);
            migrated++;
          } catch (e: any) { console.log('[Task] media migrate failed for ' + m.id + ': ' + e.message); }
        }
        if (migrated > 0) console.log('[Task] Migrated ' + migrated + ' media item(s) to object storage');
      } catch {}
    },
  });

  registerTask({
    id: 'scan_broken_links',
    name: 'Scan broken links',
    desc: 'Checks outbound links in published posts/pages for 404s (SSRF-guarded, max 50 URLs per run)',
    intervalMs: 86_400_000,
    fn: async () => {
      try {
        const { fetchUrlGuarded } = await import('./ssrf');
        const posts = db.prepare("SELECT id, title, content, siteId FROM Post WHERE status = 'published' AND type IN ('post','page') ORDER BY updatedAt DESC LIMIT 100").all() as any[];
        // Own-domain links never count as broken (site_url host is skipped)
        let ownHost = '';
        try { ownHost = new URL((db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '').host; } catch {}
        const hrefRe = /<a[^>]+href="(https?:\/\/[^"]+)"/gi;
        const toCheck: { postId: string; postTitle: string; url: string; anchor: string; siteId: string | null }[] = [];
        const seen = new Set<string>();
        const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
        for (const p of posts) {
          const content = String(p.content || '');
          hrefRe.lastIndex = 0;
          let mm: RegExpExecArray | null;
          while ((mm = hrefRe.exec(content)) !== null) {
            if (toCheck.length >= 50) break;
            const url = mm[1];
            if (seen.has(url)) continue;
            seen.add(url);
            if (ownHost) {
              try { if (new URL(url).host === ownHost) continue; } catch { continue; }
            }
            const recent = db.prepare('SELECT 1 FROM BrokenLink WHERE url = ? AND checkedAt > ? LIMIT 1').get(url, sevenDaysAgo);
            if (recent) continue;
            const anchor = (mm[0].match(/>([^<]{0,60})</)?.[1] || '').trim();
            toCheck.push({ postId: p.id, postTitle: p.title, url, anchor: anchor.slice(0, 100), siteId: p.siteId || null });
          }
          if (toCheck.length >= 50) break;
        }
        if (toCheck.length === 0) return;
        let checked = 0;
        for (const c of toCheck) {
          const now = new Date().toISOString();
          let status = 0;
          try {
            const res = await fetchUrlGuarded(c.url, { timeoutMs: 5000 });
            status = res ? res.status : 0;
          } catch {}
          const st = status === 0 ? 'error' : (status >= 200 && status < 400 ? 'ok' : 'broken');
          try {
            // Replace the previous entry for this URL so a fixed link leaves
            // the report instead of piling up stale 'broken' rows forever
            db.prepare('DELETE FROM BrokenLink WHERE url = ?').run(c.url);
            db.prepare('INSERT INTO BrokenLink (id, postId, postTitle, url, anchor, status, statusCode, checkedAt, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
              .run(cuid(), c.postId, c.postTitle, c.url, c.anchor, st, status === 0 ? null : status, now, c.siteId);
            checked++;
          } catch {}
        }
        if (checked > 0) console.log('[Task] Checked ' + checked + ' outbound link(s)');
      } catch {}
    },
  });

  registerTask({
    id: 'prune_search_log',
    name: 'Prune search log',
    desc: 'Deletes search-log entries older than 30 days (the hot-searches report only needs the last month)',
    intervalMs: 86_400_000,
    fn: () => {
      try {
        const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
        const r = db.prepare('DELETE FROM SearchLog WHERE createdAt < ?').run(cutoff);
        if (r.changes > 0) console.log('[Task] Pruned ' + r.changes + ' old search-log entries');
      } catch {}
    },
  });

  registerTask({
    id: 'prune_visits',
    name: 'Prune visit logs',
    desc: 'Deletes visit records (which store raw visitor IPs) older than 180 days — GDPR retention',
    intervalMs: 86_400_000,
    fn: () => {
      try {
        let retentionDays = 180;
        try {
          retentionDays = Math.max(7, parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'visit_retention_days'").get() as any)?.value || '180') || 180);
        } catch {}
        const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString().slice(0, 10);
        const r = db.prepare('DELETE FROM Visit WHERE date < ?').run(cutoff);
        if (r.changes > 0) console.log('[Task] Pruned ' + r.changes + ' visit records (retention ' + retentionDays + 'd)');
      } catch {}
    },
  });
}
