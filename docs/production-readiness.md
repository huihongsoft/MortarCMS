# Production readiness

An honest assessment of what stands between Mortar and a mainstream
production-grade CMS, plus the plan and its progress. Written after auditing the
codebase (not from the feature list): every claim here was checked against the
source.

**Where it stands.** Feature density is above most self-built CMSs — content and
revisions, multi-site, roles and capabilities, a block editor, media with
variants and S3, comments, menus, forms, newsletter, webhooks, feeds, SEO meta +
sitemap, GDPR tools and an AI assistant. The blockers are not feature count:
they were licensing, single-instance architecture, a half-real remote-database
story, unreliable backup/restore and zero frontend test coverage.

**Not addressed here:** the license. `LICENSE` is **CC BY-NC-SA 4.0** — non-
commercial only, with a share-alike obligation. Any commercial or business use
requires a different license (MIT / Apache-2.0 / GPL) and that is a decision for
the maintainer, not a code change. Everything else below is in scope.

## Status

| # | Gap | Status |
|---|---|---|
| A1 | License blocks commercial use | **open** — maintainer decision |
| A2 | Single-instance only: in-memory caches, rate limits, scheduler | **done in 0.1.3** (safe by default; `SHARED_CACHE=1` / `REDIS_URL` for replicas) |
| A3 | MySQL/PostgreSQL are experimental, not real support | planned, batch 4 |
| A4 | Backup/restore unreliable (DB only, retention bug, no pre-upgrade copy) | **done in 0.1.3** |
| A5 | Versions drift from tags, no changelog, no release job | **done in 0.1.3** |
| B1 | No redirect manager (slug changes break URLs) | **done in 0.1.3** |
| B2 | No content i18n (no locale, translation groups, hreflang) | planned, batch 5 |
| B3 | Search is `LIKE`, no full-text index | planned, batch 5 |
| B4 | No CAPTCHA or submission limits on public forms | planned, batch 5 |
| B5 | Review workflow has no email, no queue screen | planned, batch 5 |
| B6 | No taxonomy bulk merge/rename | planned, batch 5 |
| B7 | No media folders, no EXIF, no video transcoding | planned, batch 5 |
| B8 | Scheduler has a backend but no admin screen | **done in 0.1.3** |
| B9 | Client-rendered SPA only (crawler fallback, no SSR) | planned, batch 6 |
| B10 | Accessibility: no focus trap, sparse `aria-label`, no RTL | planned, batch 6 |
| B11 | `siteId` columns had no index; admin `limit` unclamped; LIKE unescaped | **done in 0.1.3** |
| C | 2FA secret plaintext, no recovery codes, no failed-login audit, no app-wide CSP, process-local limits, unsigned plugins | **done in 0.1.3** (CSP ships report-only; see the known gaps) |
| D | Operator docs (troubleshooting, hardening, upgrade/rollback, monitoring) | **done in 0.1.3** |
| E | No frontend/admin/e2e tests, near-floor coverage gates, soft lint | planned, batch 7 |

## Done in 0.1.3

- **Backups**: the scheduled task writes the database **and uploads** as a
  `tar.gz`; retention prunes by file age (it sorted by filename, which carries a
  random suffix and could drop a recent archive); the archive stores the database
  as `mortar.db` whatever its configured path, so restoring a custom
  `MORTAR_DB_PATH` install works at all; the server takes its own
  `pre-migration-*.db` snapshot before applying any migration; the restore path
  accepts both formats, detected by magic bytes; the Docker image installs
  `zip`/`unzip` (the manual backup, restore and plugin `.zip` installs answered
  500 without them) and declares `backups/` as a volume.
- **Versions**: the four manifests agreed on nothing that matched the tags
  (`0.1.2` while `v0.1.3` was tagged) and the server hardcoded its own copy.
  `APP_VERSION` now reads `server/package.json`; CI fails on disagreement or on a
  tag that does not match; `CHANGELOG.md` documents the rules and the history; a
  tag builds the container image (pushes when registry secrets are set).
- **Search and pagination hardening**: LIKE wildcards are escaped everywhere (a
  search for `100%` matched every row in four admin screens, and `%%%` degenerated
  into a full scan), with the MySQL `ESCAPE '\\'` rewrite in the dialect layer;
  the admin post list clamps `limit`.
- **Multi-site**: migration 18 indexes the `siteId` columns every site-scoped
  query filters on.
- **Data integrity**: media deletion removes the row before the files (it was the
  other way round, so a mid-way failure left a broken image reference and a bulk
  delete could stop half-applied).
- **Redirects**: a `Redirect` table with a cached lookup in front of both SPAs,
  a management screen (search, 301/302, hit counts, CSV import) and — the part
  that made the gap real — slug editing actually works now: the editor sent
  `slug` and the API schema dropped it, so changing a slug was silently a no-op.
  A published post or page that changes slug gets a 301 automatically, so the old
  URL (and whatever search engines indexed) keeps working.
- **Security**: TOTP secrets are encrypted at rest and have single-use recovery
  codes; the secrets are base32 now, so authenticator apps can actually enrol
  them (they could not before — see the commit for the RFC vector that pins it).
  Failed logins and wrong 2FA codes are recorded and surfaced in a Login Audit
  screen (always visible, not behind developer mode). An app-wide CSP ships
  report-only, `CSP_ENFORCE=1` enforces it once a session has been watched. The
  login lockout moved into the database, so a restart no longer clears it, and
  plugin archives get a SHA-256 that a catalog can require before extraction.
- **Operations and multi-instance**: the scheduler takes a leader lock and
  remembers each task's last run in the database — a restart no longer re-runs
  every task, and a second instance no longer repeats what the first did. A
  `sharedStore` (database by default, Redis via `REDIS_URL`) carries the page
  cache generation, so one instance's purge reaches the others without putting a
  shared read on the request path. `GET /metrics` serves Prometheus text and
  `GET /api/health/ready` answers readiness (database up + schema current). The
  scheduled tasks finally have a screen: list, enable/disable, run now, last and
  next run, last error.
- **Docs**: [troubleshooting.md](troubleshooting.md),
  [security-hardening.md](security-hardening.md),
  [upgrade-rollback.md](upgrade-rollback.md),
  [monitoring.md](monitoring.md) — and the deployment docs now describe what the
  code actually does (the previous backup section described a manual cron and a
  nonexistent `npm run db:optimize`).

## Plan (remaining batches)

Each batch ends with the full test suite, all three builds and lint green.

- **Batch 4 — remote databases**: pool + multi-thread the worker bridge (keeping
  the synchronous `db.prepare()` call sites), finish the dialect coverage
  (`INSERT OR REPLACE`, `sqlite_master`/`PRAGMA` guards), logical backup and
  restore for MySQL/PostgreSQL, three-driver CI matrix.
- **Batch 5 — content features**: local anti-spam, full-text search, workflow
  email + a real notification table, taxonomy bulk merge, media folders and EXIF,
  then complete content i18n (locale, translation groups, language URLs,
  hreflang).
- **Batch 6 — frontend**: server-side rendering with hydration across the
  themes; dialog focus trap, `aria-label` sweep, RTL, `Intl` formatting.
- **Batch 7 — quality**: Playwright smoke tests over the critical path
  (login → post → publish → slug change → redirect → revision restore → logout),
  coverage thresholds raised to the real baseline, lint warnings ratcheted,
  bundle-size budget.

## Deliberately out of scope

- Video transcoding needs `ffmpeg`; documented as not supported rather than
  half-implemented.
- Plugin sandboxing: plugins are trusted in-process code (they get the database,
  the filesystem and the network). A real sandbox would require redesigning the
  plugin API and would break existing plugins; the trade-off is documented
  instead, with checksums for integrity.
