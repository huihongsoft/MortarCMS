// Scheduled task system: tasks register with an interval, the scheduler tick
// runs due tasks, and admins can trigger/disable them from the tools panel.
// Enabled state persists in the Setting table; run stats live in memory.
import fs from 'fs';
import path from 'path';
import db from './db';
import { doAction } from './hooks';
import { purgeContentCaches } from './cache';

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

export function registerTask(def: TaskDef): void {
  let enabled = true;
  try {
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get('task_' + def.id + '_enabled') as any;
    if (row) enabled = row.value !== '0';
  } catch {}
  tasks.set(def.id, {
    def,
    state: { enabled, running: false, lastRun: null, lastStatus: null, runCount: 0 },
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

export async function runTaskNow(id: string): Promise<{ ok: boolean; error?: string; ms: number }> {
  const t = tasks.get(id);
  if (!t) return { ok: false, error: 'Unknown task', ms: 0 };
  const t0 = Date.now();
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
  t.state.running = false;
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

export function startScheduler(tickMs = 30000): void {
  setInterval(async () => {
    const now = Date.now();
    for (const { def, state } of tasks.values()) {
      if (!state.enabled || state.running) continue;
      if (state.lastRun !== null && now - state.lastRun < def.intervalMs) continue;
      state.running = true;
      runTaskNow(def.id).catch(() => {});
    }
  }, tickMs);
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
    intervalMs: 86_400_000,
    fn: async () => {
      try {
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
        console.log('[Task] AI usage report sent to ' + admins.length + ' admin(s)');
      } catch {}
    },
  });

  registerTask({
    id: 'backup_database',
    name: 'Backup database',
    desc: 'Copies the database to the backups folder; keeps only the newest backups (retention setting)',
    intervalMs: 86_400_000,
    fn: () => {
      const dataDir = path.join(__dirname, '..', '..', 'data');
      const backupDir = path.join(__dirname, '..', '..', 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      const src = path.join(dataDir, 'mortar.db');
      if (!fs.existsSync(src)) return;
      const stamp = new Date().toISOString().slice(0, 10) + '-' + Date.now().toString(36).slice(-4);
      fs.copyFileSync(src, path.join(backupDir, 'mortar-' + stamp + '.db'));
      // Retention: keep the newest N backups, drop the rest
      let retention = 10;
      try {
        retention = Math.max(1, parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'backup_retention'").get() as any)?.value || '10') || 10);
      } catch {}
      const files = fs.readdirSync(backupDir).filter(f => f.startsWith('mortar-') && f.endsWith('.db')).sort();
      while (files.length > retention) {
        try { fs.unlinkSync(path.join(backupDir, files.shift() as string)); } catch {}
      }
      try {
        db.prepare("INSERT INTO Setting (id, key, value) VALUES ('db_last_backup', 'db_last_backup', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date().toISOString());
      } catch {}
      console.log('[Task] Database backup created (retention ' + retention + ')');
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
