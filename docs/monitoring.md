# Monitoring and logging

Honest starting point: **there is no `/metrics` endpoint and no tracing yet.**
What exists is structured logging and a set of health endpoints you can poll.
This page covers what to watch today, and what to add when you need more.

## Health endpoints

| Endpoint | Auth | Returns | Use it for |
|---|---|---|---|
| `GET /api/health` | none | `{status:"ok", version}` | liveness. The Docker `HEALTHCHECK` polls it |
| `GET /api/health/detail` | `manage_system` | per-subsystem checks (database, disk, uploads, memory, node version) | a real readiness probe, richer than liveness |
| `GET /api/settings/health` | none | public site health summary | external uptime checks |
| `GET /api/settings/info` | `manage_system` | app/node/memory, table counts, settings | capacity snapshots |
| `GET /api/db/status` | `manage_system` | driver, size, per-table rows, indexes, last maintenance | growth tracking |
| `GET /api/db/slow-queries` | `manage_system` | last 20 slow queries (in-memory) | performance triage |
| `GET /api/security/audit` | `manage_security` | scored checks with advice | a periodic security review |

Liveness is cheap; use `/api/health`. Readiness should assert that the database
answers — `/api/health/detail` does that, but it needs a token, so most
deployments check `/api/health` plus their own TCP/database probe.

If you need an unauthenticated readiness probe, terminate it at the proxy: query
`/api/health` and assert `status == "ok"`, or run a small script that calls
`/api/health/detail` with an app password scoped to `read`.

## Logging

- **Format**: JSON in production, pretty in development (`LOG_LEVEL`, default
  `info` in production).
- **Fields**: `level`, `time` (ISO), `msg`, plus request context — `req.id`,
  method, path, status, response time, and the client IP when `TRUST_PROXY=1`.
- **Correlation**: the server honours an incoming `X-Request-Id` and echoes it
  back, so a user can quote the id from a failing request. Any reverse proxy or
  client that generates one gets end-to-end correlation for free.
- **Redaction**: `authorization`, `cookie`, `password`, `token` and `apiKey`
  fields are stripped by the logger. Query strings are masked.
- **Errors**: application errors are logged with detail (stack, cause) while the
  HTTP response carries only our own message — logs are the place to look, and
  they are not meant to be exposed to users.

Shipping the log to a collector is the deployment's job (journald, Docker's log
driver, filebeat, or `LOG_LEVEL=info` piped into whatever you already run).
There is no in-app rotation: use logrotate/journald. A suggested policy:

```
/app/mortar/server/logs/*.log {
  daily
  rotate 14
  compress
  missingok
  notifempty
  copytruncate
}
```

## What to alert on

- `/api/health` failing twice in a row (process down or wedged).
- Disk usage on the volume holding `server/data`, `server/uploads` **and
  `server/backups`** — uploads grow with traffic, backups with retention.
- The newest file in `server/backups/` being older than 1.5× the backup interval
  (scheduled task failing, or the scheduler not running).
- `login_failed` hook bursts (subscribe via a webhook or plugin — failures do not
  reach the activity log) and a `/api/security/audit` score getting worse.
- Repeated 5xx in the log, or a step change in response time.
- Scheduled-task failures: Admin → System Info → Tasks shows each task's last run
  and result; a `db_last_backup` setting that stops advancing means backups have
  stopped.

## Metrics (not implemented)

There is no Prometheus/OpenMetrics endpoint, no OpenTelemetry tracing and no
error-reporting integration. If you need them today:

- **Blackbox**: poll the health endpoints and expose `probe_success` /
  `probe_duration_seconds` from your monitoring stack.
- **Process**: `node_exporter`/`process-exporter` gives CPU, RSS, file
  descriptors and restart counts.
- **Traffic**: measure at the reverse proxy (request rate, status classes,
  latency percentiles) — the app's own counters are per-process and reset on
  restart.

Adding `/metrics` (Prometheus text format, no new dependency) with request
counters, DB query timing and scheduler run state is on the roadmap in
`docs/production-readiness.md`.

## Multi-instance caveat

Caches, rate limiters and the scheduler hold state in process memory, so a
deployment with more than one replica has per-replica limits and runs every
scheduled task on every replica. The application documents single-instance as its
supported topology (`docs/deployment.md`); if you run replicas anyway, expect
duplicate task runs and watch the backup directory for duplicates.
