# Troubleshooting

Start here: **Admin → System Info** shows the version, database driver/status,
disk usage, SMTP state and the scheduled-task list. **Admin → Security** runs a
self-audit. `GET /api/health` is a plain liveness check that also reports the
version, and it is what the Docker `HEALTHCHECK` uses.

For anything request-shaped, the log is the fastest source: JSON lines with a
`X-Request-Id` header echoed back to the client, so a user can quote the id from
a failing request. `LOG_LEVEL=debug` adds detail without a rebuild.

## The server will not start

| Symptom | Cause | Fix |
|---|---|---|
| `JWT_SECRET is required in production` | fail-fast by design | set `JWT_SECRET` (`NODE_ENV=production` refuses to run without it) |
| `Migration N failed` then exit | a migration threw on SQLite | startup aborts on purpose rather than serving a half-migrated schema — see [upgrade-rollback.md](upgrade-rollback.md); the pre-migration snapshot is in `server/backups/` |
| `ENOENT ... data/mortar.db` on a custom path | `MORTAR_DB_PATH` points somewhere that does not exist | the server creates the *directory*, not a missing volume mount; check the mount |
| Port already in use | another process on `PORT` | `lsof -i :3001`; change `PORT` |
| Starts then exits immediately | started with `npm run dev` under a supervisor expecting a foreground process | run `node server/dist/index.js` (what `install.sh` writes into the unit file) |

## The site loads but is broken

- **Blank page, console shows 404s for `/assets/*`**: the frontend build is
  missing or stale. Rebuild (`npm run build`) — hashed asset names mean a stale
  `index.html` references files that no longer exist.
- **Login succeeds then bounces back**: the token is being dropped. Check that
  the admin is served from the same origin as the API, and that cookies/headers
  reach the browser through the proxy (do not strip `Authorization`).
- **"No permission" screen for a role that should have access**: Admin → Roles →
  check the capability. Every route is capability-gated; the role name alone
  grants nothing. If a capability checkbox seems to do nothing, that is a bug —
  report it with the capability id.
- **Everything 403s after a role edit**: expected within 3 seconds (the
  capability cache), unless the edit removed the capability.
- **Photos/media return 404 but the row exists**: the file is missing from
  `server/uploads` (or the object storage bucket). With S3 configured, check the
  storage settings and re-run the `sync_media_to_storage` task.
- **Uploads rejected**: 10MB cap, allowlisted extensions, and non-images must
  pass a magic-byte check. An SVG that fails sanitising is rejected too.

## Backups and restore

- **"Database backup is only available for SQLite"** — expected: the file-copy
  and archive paths are SQLite-only. On MySQL/PostgreSQL, use the database's own
  dump tooling.
- **Restore says "Invalid backup: mortar.db not found"** — the archive was not
  produced by this app (the database must be at the archive root as
  `mortar.db`). Archives written by the scheduled task and by *Download full
  backup* both satisfy this.
- **Restore reported success but the site shows old data** — the server exits so
  a supervisor can restart it; without a supervisor it stays down. Start it
  again.
- **`zip: not found`** — the manual full backup, its restore and plugin `.zip`
  installs need `zip`/`unzip` on the host. The Docker image installs them; a
  bare-metal host may not have them (`apt install zip unzip`). The scheduled
  backup only needs `tar`, which is everywhere.
- **Scheduled backups are not there after a container rebuild** — mount
  `/app/server/backups` on a host path; the image declares it as a volume, but an
  anonymous volume is dropped with the container.

## Comments, forms, email

- **Comments are invisible after submitting** — comments are stored as
  `pending`; approve them in Admin → Comments. Check the spam-word setting too.
- **No notification emails** — SMTP must be configured in Admin → Settings, and
  the `mailer` task/templates exist independently. Admin → System Info shows the
  SMTP state; the mailer test send is in Admin → Settings.
- **Newsletter sends nothing** — subscribers must be `confirmed` (double opt-in)
  and the `newsletter_digest` task enabled.

## Slow or unresponsive

- **Admin → System Info → Database → Slow queries** lists recorded slow queries
  (in-memory, last 20). `Optimize` runs the SQLite maintenance.
- **Search is slow on large sites** — search is `LIKE`-based today; a full-text
  index is a known gap (`docs/production-readiness.md`).
- **Metrics**: there is no `/metrics` endpoint yet. Use `admin/dist` mount checks
  plus the health endpoints, or a process-level monitor. See
  [monitoring.md](monitoring.md).
- **High CPU after an upgrade** — check the scheduled tasks list for a task
  running more often than expected, and whether more than one server process is
  running against the same database (the scheduler and caches assume a single
  instance — see [deployment.md](deployment.md)).

## Multi-site

- **A post is missing from a site's frontend** — content with `siteId = NULL` is
  shared; content assigned to another site is not shown. Check the post's site
  in the editor and whether the user is assigned to that site (Admin → Users).
- **A user sees everything** — an account with no site assignment is
  unrestricted by design (see `docs/architecture.md`).
- **Wrong site served for a domain** — the host resolution strips ports and
  matches `Site.domain`; a host that matches nothing serves the primary site and
  logs one line. Check the domain value and that the site is active.

## Still stuck

Collect these before asking for help: the `X-Request-Id` of a failing request,
the server's log lines for it, `GET /api/health`, the version from Admin → System
Info, the database driver, and whether the install is Docker or systemd.

## Pages arrive as an empty shell

Public pages are server-rendered when `frontend/dist-ssr/entry-server.js` is
present; without it, or when the active theme is not one of the built-in ones the
renderer knows, the server falls back to the client-rendered shell (the page still
works in a browser, but a crawler sees an empty `<div id="root">`).

- `curl -s http://localhost:3001/api/health/ready` reports `ssr: true|false`.
- `false` on a source install: `cd frontend && npx vite build --config vite.ssr.config.ts`
  (or re-run `install.sh`, which builds it).
- `true` but the HTML is still empty: the theme. Only themes from
  `frontend/src/themes/*` can be rendered, because installed theme bundles import
  bare `react` specifiers that Node cannot resolve. `server.log` has the reason.

**Rebuild both frontend bundles together.** `npm run build` does; running
`npx vite build` alone leaves `dist-ssr` stale, and a stale renderer produces
markup the client bundle disagrees with — which shows up in the browser console as
React hydration errors (#418/#422/#425) rather than as an obviously broken page.
The server checks this itself: a renderer older than `frontend/dist/index.html` is
refused (with a line in the log) and the request falls back to the shell, because
a working page beats a subtly mismatched one.
