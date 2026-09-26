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

### Security

- Capability grants stay bounded by the granter: a role holding `manage_roles`
  cannot write capabilities it does not itself hold (and so cannot escalate to
  `*`), and the superuser capability cannot be handed out by a non-superuser.

### Known gaps

Tracked here so an upgrade is not a surprise; see `docs/production-readiness.md`
for the full list with priorities.

- No redirect manager: changing a post's slug breaks the old URL (301s are not
  written automatically), and there is no way to add one by hand.
- Single-instance by design: caches, rate limiters and the scheduler keep state
  in process memory (`docs/deployment.md`).
- MySQL/PostgreSQL remain experimental: pooled concurrency, full dialect
  coverage and logical backups for those drivers are not in yet.
- Content is single-language: no per-post locale, translation grouping or
  `hreflang`.
- Search is `LIKE`-based (no full-text index); the frontend is a client-rendered
  SPA with a crawler fallback rather than server rendering.
- No CAPTCHA or submission rate limit on public forms; comment spam filtering
  relies on a honeypot plus the optional AI review.
- The app-wide CSP is report-only until `CSP_ENFORCE=1` is set; plugin screens
  with inline scripts are the thing to check before flipping it.
- Plugin and market packages carry a SHA-256 but are not signed, and plugins run
  unsandboxed with full server privileges (`docs/plugins.md`).
