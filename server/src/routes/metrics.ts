import { Router, Response } from 'express';
import db, { schemaVersion } from '../utils/db';
import { listTasks } from '../utils/scheduler';
import { cacheStats } from '../utils/cache';
import { renderMetrics, setGauge } from '../utils/metrics';

const router = Router();

// Prometheus exposition.
//
// Deliberately unauthenticated, like /api/health: a scraper has no session, and
// everything here is an aggregate — counters by method and status class, process
// memory, cache size, per-task run timestamps. No paths, no IPs, no addresses,
// nothing user-identifying. If that still matters to you, block it at the proxy
// or scrape it over a private network (`docs/monitoring.md` has the guidance).
router.get('/', (_req, res: Response) => {
  try {
    // Collected here rather than on every change: a scrape is infrequent and the
    // request path should not pay for metrics.
    let dbReady = 1;
    try { db.prepare('SELECT 1').get(); } catch { dbReady = 0; }
    setGauge('mortar_db_ready', '1 when the database answers a trivial query', dbReady);
    const schema = schemaVersion();
    setGauge('mortar_schema_migrations_applied', 'Migrations recorded in the ledger', schema.applied);
    setGauge('mortar_schema_migrations_expected', 'Migrations this build knows about', schema.latest);

    const cache = cacheStats();
    setGauge('mortar_cache_entries', 'Entries held by the page cache', cache.entries);
    setGauge('mortar_cache_enabled', '1 when the page cache is on', cache.enabled ? 1 : 0);

    for (const task of listTasks()) {
      const labels = { task: String(task.id) };
      if (typeof task.lastRun === 'number') {
        setGauge('mortar_scheduler_task_last_run_timestamp', 'Unix time of the last run', Math.floor(task.lastRun / 1000), labels);
      }
      setGauge('mortar_scheduler_task_runs_total', 'Runs since this process started', task.runCount || 0, { ...labels, status: task.lastStatus || 'never' });
      setGauge('mortar_scheduler_task_enabled', '1 when the task is enabled', task.enabled ? 1 : 0, labels);
    }

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(renderMetrics());
  } catch {
    // Never leak internals in a scrape response.
    res.status(500).type('text/plain').send('# metrics unavailable\n');
  }
});

export default router;
