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
| B2 | No content i18n (no locale, translation groups, hreflang) | **done in 0.1.3** (posts/pages; default language stays unprefixed) |
| B3 | Search is `LIKE`, no full-text index | **done in 0.1.3** (SQLite FTS5 trigram; MySQL/PG keep LIKE) |
| B4 | No CAPTCHA or submission limits on public forms | **done in 0.1.3** (local signals; no external CAPTCHA) |
| B5 | Review workflow has no email, no queue screen | **done in 0.1.3** |
| B6 | No taxonomy bulk merge/rename | **done in 0.1.3** |
| B7 | No media folders, no EXIF, no video transcoding | **done in 0.1.3** for folders + image metadata; EXIF fields and transcoding are still out |
| B8 | Scheduler has a backend but no admin screen | **done in 0.1.3** |
| B9 | Client-rendered SPA only (crawler fallback, no SSR) | **done in 0.1.3** — prerender + hydration for the built-in themes; an installed custom theme still falls back to the shell |
| B10 | Accessibility: no focus trap, sparse `aria-label`, no RTL | **partly done in 0.1.3** — dialog focus trap, icon-button names, locale-stable Intl formatting; RTL is not implemented |
| B11 | `siteId` columns had no index; admin `limit` unclamped; LIKE unescaped | **done in 0.1.3** |
| C | 2FA secret plaintext, no recovery codes, no failed-login audit, no app-wide CSP, process-local limits, unsigned plugins | **done in 0.1.3** (CSP ships report-only; see the known gaps) |
| D | Operator docs (troubleshooting, hardening, upgrade/rollback, monitoring) | **done in 0.1.3** |
| E | No frontend/admin/e2e tests, near-floor coverage gates, soft lint | **done in 0.1.3** — Playwright smoke over the publishing path, coverage ratcheted to the real baseline, `no-unused-vars` an error, bundle budgets in CI |

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
- **Media organisation**: folders with counts, an "unfiled" view, bulk move, and
  an image's own metadata (format, colour space, density, orientation, whether an
  EXIF block exists) read from the file the first time its details are opened —
  not backfilled at upgrade, and not a claim to have parsed EXIF fields proper.
- **Duplicate taxonomies** can be merged: the posts move to the target inside one
  transaction before the source is removed, which deleting could not do.
- **Workflow notifications**: a general `Notification` table (migration 24) that
  absorbed the AI assistant's, so an author's "your submission was approved" no
  longer arrives in the assistant's inbox. Approval and rejection now email the
  author as well as notifying them in-app, the notification carries a link to the
  post, and the review queue has a screen of its own instead of being a status
  filter on the posts list.
- **Full-text search** on SQLite: FTS5 with the **trigram** tokenizer (the
  default tokenizer has no word boundaries to find in Chinese, which this CMS
  publishes), maintained by triggers so no write path can forget it, ranked by
  bm25 and combined with every existing visibility filter. Queries shorter than a
  trigram — including two-character CJK words — fall back to LIKE rather than
  silently matching nothing, and MySQL/PostgreSQL keep the LIKE path entirely.
- **Local anti-spam**: public submissions are scored server-side — honeypot,
  fill time, link count, a URL in the name field, and the `spam_words` setting
  (which had no reader on the server at all before this: the admin described
  behaviour that did not exist). A word from the operator's list is decisive; the
  rest combine into a threshold. Form submissions finally have a rate limit, and
  the honeypot is enforced on the server rather than only in the browser script
  a direct POST never runs.
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
- **Content languages**: the default language is served unprefixed and every
  other one at `/<lang>/…`, which is what keeps an existing install's URLs intact
  when it adds a translation. A post or page carries `lang`, versions of the same
  content share a `translationGroup`, the sitemap and the injected head emit
  `hreflang` (with `x-default`), the reader gets a language switcher, and the
  editor can start a translation as a draft that already carries the source's
  content and categories. `content_langs` decides which languages exist, so a
  site that never fills it in has no prefixed URLs at all.
- **Server rendering**: the frontend builds a second bundle
  (`frontend/dist-ssr/entry-server.js`) that the server loads and calls per
  request. Public pages arrive as real HTML — title, body, list of posts, links —
  and the client hydrates that markup instead of rendering from scratch. It stays
  best-effort by construction: no bundle, an installed theme the renderer does not
  have, a content fetch that fails or a path we answer 404 for all fall back to
  the previous client-rendered shell, and the whole document is cached like any
  other content response (`/api/health/ready` reports whether it is active).
  Two guards make it safe: content is sanitized on the server with the *same*
  DOMPurify the browser uses (jsdom supplies the DOM — a lighter DOM silently
  disables DOMPurify, so a render without a working sanitizer is refused rather
  than served), and the render payload is `<`-escaped so content containing
  `</script>` cannot break out of its script element.
- **Accessibility**: the admin dialog now traps Tab, restores focus to whatever
  opened it, and carries `aria-describedby`; every icon-only button in the admin
  has an accessible name (104 of them had only a hover tooltip); dates and
  counters are formatted through one locale-aware helper instead of the
  environment's locale. RTL is **not** done — it needs a logical-property sweep
  (`ms-`/`me-`/`ps-`/`pe-`) across both SPAs, tracked below.
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
- ~~**Batch 5 — content features**~~ **done in 0.1.3**: redirects with automatic
  301s, local anti-spam, SQLite full-text search, the notification table and
  review queue, taxonomy merge, media folders with per-image metadata, and
  content languages (translation groups, language URLs, hreflang).
- ~~**Batch 6 — frontend**~~ **done in 0.1.3** except RTL: server rendering with
  hydration (built-in themes), dialog focus trap, the `aria-label` sweep, and
  locale-stable `Intl` formatting.
- ~~**Batch 7 — quality**~~ **done in 0.1.3**: Playwright smoke over the critical
  path (sign in → publish → rename the slug → the old URL 301s → edit → restore a
  revision → log out), plus assertions on the HTML the server hands a crawler;
  coverage thresholds at the real baseline; `no-unused-vars` an error;
  bundle-size budgets enforced in CI.

## Known gaps after 0.1.3

- **RTL**: neither SPA is RTL-aware. Doing it properly means moving every
  physical utility (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`,
  `text-right`) to Tailwind's logical equivalents and letting the site language
  set `dir` — a mechanical sweep of both codebases, not a patch.
- **SSR and custom themes**: only the themes that ship in the repository source
  (`frontend/src/themes/*`) can be rendered by the server, because the installed
  theme bundles load bare `react` specifiers that Node cannot resolve. An install
  running a theme from elsewhere serves the client-rendered shell instead — no
  error, just no prerender.
- **CSP enforcement**: the nonce now covers the frontend's inline scripts (the
  importmap and the render payload), but before setting `CSP_ENFORCE=1` the admin
  still needs attention — its shell has an inline dark-mode script, the block
  editor loads Font Awesome from cdnjs (blocked by `style-src 'self'`), and a
  plugin screen injects inline scripts. `docs/security-hardening.md` lists them.

## Deliberately out of scope

- Video transcoding needs `ffmpeg`; documented as not supported rather than
  half-implemented.
- Plugin sandboxing: plugins are trusted in-process code (they get the database,
  the filesystem and the network). A real sandbox would require redesigning the
  plugin API and would break existing plugins; the trade-off is documented
  instead, with checksums for integrity.
