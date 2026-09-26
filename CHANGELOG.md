# Changelog

All notable changes to Mortar are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Version rules.** `package.json` (root, `server/`, `admin/`, `frontend/`) is the
single source of truth — the four files must agree, the CI job
`version-consistency` enforces it, and the server reads `server/package.json` at
runtime for `APP_VERSION` (`/api/health`, `/api/schema`, plugin `requires`
checks). Release tags are `v<version>`, always with the `v` prefix; the
`version-consistency` job also fails a tag that disagrees with the manifests.

## [Unreleased]

## [0.1.3] - 2026-09-26

### Added

- **Plugin extension points**: plugins can register HTTP routes
  (`/api/ext/<plugin>/<path>`), an admin screen the shell hosts, and
  visual-editor blocks — each attributed to the plugin that registered it.
- Comment threads render recursively (a reply to a reply used to exist in the
  database and never appear); a child of an unapproved parent is promoted
  instead of dropped.
- Shared pagination for the archive/author/search screens (those lists had no
  pager at all), delegated `[form]` submission handling, per-theme 404 layouts.
- Admin **My Profile** page (bio, avatar, password, 2FA, application passwords),
  an unsaved-changes guard for the editors, and a "no permission" screen instead
  of a page that fails on every request.
- **Media library**: folders with counts and an "unfiled" view, bulk move into a
  folder, and per-image metadata (format, colour space, density, orientation, an
  EXIF block present or not) read from the file when its details are first opened.
  Duplicate categories and tags can be **merged** — the posts move to the target
  before the source is removed, which deleting could not do.
- **Editorial workflow**: a general `Notification` table replaces the AI
  assistant's (the review flow used to write into it, so an author's approval
  arrived in the assistant's inbox), approval and rejection email the author,
  notifications link to what they are about, and the review queue has its own
  screen instead of being a filter on the posts list.
- **Full-text search** (SQLite): FTS5 with the trigram tokenizer — the default
  tokenizer cannot find word boundaries in Chinese, which this CMS publishes —
  kept in step by triggers and ranked by bm25. Queries shorter than three
  characters, including two-character CJK words, fall back to LIKE instead of
  matching nothing; MySQL/PostgreSQL keep the LIKE path.
- **Local anti-spam** for comments and form submissions: honeypot, fill time,
  link count, a URL in the name field, and the `spam_words` setting — which had
  no server-side reader at all, so the admin screen was describing behaviour that
  did not exist. A word from that list is decisive; the other signals combine into
  a threshold. Form submissions also get the rate limit they never had, and the
  honeypot is now enforced on the server instead of only in the browser script a
  direct POST never runs.
- **Redirect management**, and slug editing that works: the editor sent `slug`
  and the API schema dropped it, so changing a post's URL was silently a no-op.
  Slugs are editable now, and a published post or page that changes slug gets a
  301 automatically so the old URL keeps working. The screen adds 301/302,
  search, hit counts, a CSV import and an "automatic" marker for the rows the
  slug-change path writes.
- **Content languages**: a post or page carries a language, and versions of the
  same content are linked into a translation group. The site's default language
  stays **unprefixed**, so adding a translation changes no existing URL (every
  row written before this says "default"); other languages live at `/<lang>/…`.
  The editor gains a language picker and a "translate into <lang>" action that
  files a draft in the same group with the source's content and categories, the
  sitemap emits `xhtml:link` alternates, the injected head emits `hreflang` plus
  `x-default`, the reader gets a language switcher under the content, and
  changing a published item's language writes a 301 the same way a slug change
  does. `content_langs` lists the offered languages (Settings → General). A
  single-language site is byte-for-byte unchanged.
- **Two-factor auth that works**: TOTP secrets are base32 (an authenticator app
  can enrol them — the previous base64 secret could not be), encrypted at rest,
  and paired with ten single-use recovery codes. Existing secrets keep working.
- **Login audit**: failed logins and wrong 2FA codes are recorded, with a screen
  that shows the events and the last 24 hours of failures grouped by source. The
  login lockout now lives in the database, so restarting the service no longer
  clears it.
- **Content-Security-Policy** on the app's own documents (report-only until
  `CSP_ENFORCE=1`), plus a SHA-256 fingerprint for plugin archives that a market
  catalog can require before anything is extracted.
- **Pre-migration database snapshot**: the server copies the SQLite file to
  `backups/pre-migration-*.db` (newest 5 kept) before any pending migration runs.
  Migrations are forward-only, so this is the way back from a bad upgrade; the
  snapshot is taken by the server itself, so every upgrade path gets one —
  Docker, systemd and a manual restart alike.

### Changed

- **Public pages are server-rendered.** The frontend builds a second bundle
  (`frontend/dist-ssr/entry-server.js`) that the server loads and calls per
  request, so a visitor and a crawler get the real page — title, body, post list,
  links — and the client hydrates that markup rather than rendering from scratch.
  It is best-effort by design: no bundle, a theme the renderer does not have, a
  content fetch that fails, or a 404 all fall back to the client-rendered shell,
  and `/api/health/ready` reports `ssr: true|false` so "why is my HTML empty" has
  an answer. Two things make it safe: the server sanitizes with the *same*
  DOMPurify the browser uses (jsdom supplies the DOM — a lighter DOM silently
  turns DOMPurify into a pass-through, so a render without a working sanitizer is
  refused rather than served), and the payload shipped for hydration is
  `<`-escaped so a post containing `</script>` cannot break out of its script tag.
- **Every route is capability-gated.** 64 guards still named roles directly
  (`authorize('admin')`), so editing a role on the Roles page changed nothing for
  posts, taxonomy, links, security, settings or the database tools. New
  capabilities: `manage_system` (database tools, installer, webhooks, mailer,
  GDPR, activity log, custom post types, AI provider settings, subscribers) and
  `view_sites` (the site list the post editor's dropdown needs). Migration 17
  adds `manage_security` + `view_sites` to the built-in editor row, add-only.
- The capability catalog ships ids only and the admin translates them, so the
  Roles screen follows the language toggle; `edit_theme_options` and
  `manage_widgets` were removed — no route read them.
- Scheduled backups now carry **the database and uploads** in one `tar.gz`
  (they carried only the SQLite file, so a restore brought the content back with
  every image missing). `/api/db/restore-full` accepts both the zip download and
  the tar.gz archive; the archive stores the database as `mortar.db` whatever
  its configured filename is, which previously made a custom `MORTAR_DB_PATH`
  restore impossible.
- Admin CSS: `.input-field`, `.btn-*`, `.card` and `.sidebar-link` moved into
  `@layer components`. They were emitted after `@tailwind utilities`, so at equal
  specificity they silently beat every `w-*` / `text-*` / `pl-*` a call site
  passed (the Subscribers search collapsed to 30px, 77 small buttons rendered at
  14px instead of 12px).
- Appearance page: the five collapsible panels share one `Section` component —
  the header carries the section hint, the padding moved off the card so the
  hover/open tint covers the row, and the chevron is a real icon that rotates.
- Versions aligned to 0.1.3 across all four manifests (they said 0.1.2 while
  `v0.1.3` was tagged) and `APP_VERSION` now reads the manifest instead of a
  hardcoded string.
- Docker: the runtime image installs `zip`/`unzip` (the manual full backup, its
  restore and plugin `.zip` installs answered 500 without them) and
  `/app/server/backups` is a volume, so scheduled backups survive a container
  rebuild.

### Fixed

- LIKE wildcards are escaped on every search, not just the public post list:
  searching "100%" or "a_b" in the admin posts list, media, activity, newsletter
  or the AI tools matched far more rows than the user typed, and a wildcard-only
  pattern degenerated into a full scan. MySQL needs the escape character doubled
  (`ESCAPE '\\'`); the dialect layer rewrites it.
- The admin post list clamps `?limit` (an unclamped value returned the whole
  table in one response).
- Migration 18 adds the missing `siteId` indexes — every site-scoped list,
  moderation view and analytics read was a full table scan on a multi-site
  install.
- Media deletion removes the row before the files. It deleted the files first, so
  a failure in between left a row pointing at a file that was gone (a broken
  image), and a bulk delete could stop half-way with mixed state.
- Backup retention prunes by file age instead of by name: names carry a random
  suffix, so the "oldest" pick within a day was arbitrary and could drop a recent
  backup.
- `theme_deactivated` fires on a theme switch, not only on delete; shortcodes are
  attributed to their plugin, so deactivating one takes its tags with it.

### Tests

- **End-to-end smoke tests** (Playwright, `npm run e2e`, run in CI against the
  built app): the publishing path through the real admin UI — sign in, write,
  publish, rename the slug, follow the automatic 301 from the old URL, edit twice,
  restore the original revision, sign out — plus the HTML the server hands a
  crawler (rendered body, nonce on every inline script, an un-injectable payload,
  real 404s). It already earned its keep: it is what proved the prerendered pages
  actually hydrate, and it caught an icon-only *link* with no accessible name that
  an earlier button-only sweep had missed.
- Coverage thresholds were a floor nobody dared raise (15/8/17/18 against a real
  50/45/58/56). Raised to 48/42/55/53, so a feature losing its tests now fails.
- `no-unused-vars` is an error (the 90-warning backlog is cleared), and
  `npm run check:bundle` enforces gzip budgets per app plus per-file ceilings for
  the block editor's vendor bundle.

### Security

- The CSP now carries a **per-response nonce**, and the server stamps it onto the
  inline scripts a document contains (the frontend's importmap, the render
  payload; the client stamps the header/footer code it re-creates). This was a
  real hole rather than a hardening step: with `CSP_ENFORCE=1` the importmap was
  blocked, and a blocked importmap means no module resolution — the frontend never
  booted. Report-only mode had been hiding it.
- Admin accessibility: the dialog traps Tab, restores focus to whatever opened it
  and exposes `aria-describedby`; 104 icon-only buttons gained an accessible name
  (they had a hover tooltip and nothing else); dates and counters go through one
  locale-aware helper instead of the browser's locale, so the same timestamp reads
  the same everywhere.
- Capability grants stay bounded by the granter: a role holding `manage_roles`
  cannot write capabilities it does not itself hold (and so cannot escalate to
  `*`), and the superuser capability cannot be handed out by a non-superuser.

### Known gaps

Tracked here so an upgrade is not a surprise; see `docs/production-readiness.md`
for the full list with priorities.

- Multi-instance needs configuration: the scheduler's lock and last run are in
  the database and the login lockout is shared, but the page cache coherence
  poller, the express-rate-limit windows and the role/site caches are per-process
  unless `SHARED_CACHE=1` / `RATE_LIMIT_STORE=db` (or `REDIS_URL`) is set.
- MySQL/PostgreSQL remain experimental: pooled concurrency, full dialect
  coverage and logical backups for those drivers are not in yet.
- Content languages cover posts and pages (the two types with a public URL);
  categories, tags and menus have no per-language variant, and there is no
  bulk translation screen — translations are created one at a time from the
  editor.
- Search is full-text on SQLite only; MySQL and PostgreSQL still scan with LIKE.
- Server rendering only covers the themes that ship in this repository
  (`frontend/src/themes/*`); an installed theme from elsewhere loads bare `react`
  specifiers that Node cannot resolve, so those installs keep the client-rendered
  shell. Neither SPA is RTL-aware yet.
- The app-wide CSP is report-only until `CSP_ENFORCE=1` is set. The frontend is
  ready for enforcement (its inline scripts carry the nonce); the **admin** is
  not — its shell's inline dark-mode script has no nonce, the block editor loads
  Font Awesome from cdnjs (`style-src 'self'` blocks it), and plugin screens
  inject inline scripts. `docs/security-hardening.md` has the checklist.
- Plugin and market packages carry a SHA-256 but are not signed, and plugins run
  unsandboxed with full server privileges (`docs/plugins.md`).
- MySQL/PostgreSQL remain experimental: the dialect gaps and the SQLite-only
  backup path are known, and the sync driver bridge answers one query at a time.
