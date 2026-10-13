# Architecture

## Overview

Mortar is a monorepo with three workspaces:

```
mortar/
├── server/       Express API + data layer + plugins + themes + market
├── admin/        Admin panel SPA (React 18 + Vite + Tailwind)
├── frontend/     Public site SPA (React 18 + Vite + Tailwind)
├── docs/         Documentation
├── build.sh      One-command production build & restart
├── install.sh    One-click installer (curl | bash, systemd/launchd)
├── mortarctl.sh  Service helper (start/stop/restart/status/logs)
└── package.json  Root scripts (dev / build / start / db:*)
```

The server serves both SPAs in production (`/admin` and `/`) and proxies
`/api` + `/uploads` in development.

## Server

```
server/src/
├── index.ts            App bootstrap, middleware, route mounting, cron
├── utils/
│   ├── db.ts           Multi-driver database adapter (SQLite / MySQL / PostgreSQL)
│   ├── dbWorker.js     Worker-thread bridge for async MySQL/PG drivers
│   ├── hooks.ts        Action/filter hook registry (plugin API)
│   ├── shortcodes.ts   Shortcode registry ([gallery], [audio], [video], ...)
│   ├── ai.ts           AI provider abstraction (OpenAI-compatible + Anthropic,
│   │                   streaming, tool calling, timeouts/retry)
│   ├── aiTools.ts      AI tool registry (15 tools) + sandbox (audit, sanitizer,
│   │                   prompt-injection guard) + per-role tool permissions
│   ├── jwt.ts          JWT sign/verify (HS256)
│   └── totp.ts         TOTP for 2FA
├── middleware/
│   ├── auth.ts         authenticate / authorize / requireCap; capabilities
│   │                   resolved from the DB Role table (cached, invalidated
│   │                   on role changes)
│   ├── site.ts         Multi-site resolution (Host header -> site)
│   └── upload.ts       Multer storage with extension+MIME allowlist
├── routes/             One module per resource (posts, pages, media, ...)
├── plugins/            Installed plugins (plugin.json + index.ts)
├── market/             Plugin market packages
└── themes/             Themes (theme.json + settings + custom CSS)
```

### Database adapter

- **SQLite** (default, supported production path): `better-sqlite3`,
  synchronous, file at `server/data/mortar.db`; WAL + `busy_timeout` + FK
  enforcement on.
- **MySQL/MariaDB / PostgreSQL — experimental, not recommended for
  production**: `mysql2` / `pg` run on a worker thread; the main thread blocks
  with `Atomics.wait` so the existing synchronous call sites
  (`db.prepare(...).run/get/all`) keep working unchanged. The pool is limited
  to a single connection, so a slow query blocks the whole request loop. Use
  for local evaluation only.
- Dialect translation happens in the worker (PostgreSQL `?` → `$n`
  placeholders; MySQL `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`)
- Select via `DATABASE_URL` or the install wizard
- **Schema migrations**: an ordered, idempotent migration list (`MIGRATIONS`
  in `utils/db.ts`) is applied once each and recorded in `_SchemaMigration`;
  a failed migration aborts startup on SQLite.
- **Transactions**: `withTransaction(fn)` wraps a synchronous body in a
  transaction (nested calls become savepoints). Multi-table writes — post
  create/update/clone, imports, install, GDPR erase, site duplication — run
  inside one.

### Data model (34 tables + `_SchemaMigration` ledger)

```
User ──┬── Post ──┬── PostCategory ── Category
       │          ├── PostTag ──────── Tag
       │          ├── PostMeta
       │          ├── Revision
       │          └── Comment (self-join for threads)
       ├── Media
       └── AppPassword

Role                     RBAC roles (slug, name, capabilities JSON, isSystem)
Setting / SiteSetting    global + per-site key-value
Site                     multi-site domains
UserSite                 which sites a user may act on (see "Site access" below)
Menu                     menus with site isolation
Link                     friend links
Visit                    PV/UV analytics
Activity                 activity log

AiTask                   async agent tasks (status, steps, result)
AiAudit                  sandbox audit trail of every AI tool call
AiMemory                 per-user long-term memory
AiNotification           task completion notifications
AiUsage                  request/token usage statistics
```

All primary keys are CUID strings; dates are ISO-8601 text in UTC.

## Site access (multi-site)

`req.siteId` is resolved from the Host header (`middleware/site.ts`). That header
is client-controlled, so it decides **which site a request looks like it belongs
to, not what the caller is allowed to touch**. Authorisation comes from
`UserSite` (`utils/userSites.ts`):

* admins act on any site;
* a user with **no** assignments is unrestricted — the behaviour of every install
  before this existed, so upgrading changes nothing until an operator assigns
  sites (Users → *site access*);
* a user **with** assignments is confined to those sites plus the shared
  (site-less) content: admin lists are narrowed to that set, naming another site
  is refused with 403, and create/update bodies cannot target one either.

The same rule is applied to the AI assistant's entry points
(`actingSiteId` in `routes/ai.ts`) and to scheduled jobs / bot bindings when the
site is chosen. Public rendering is deliberately *not* affected: a visitor — or a
logged-in user reading another site's frontend — still sees that site's content,
because it is public.

## Admin SPA

- React Router with `basename="/admin"` (clean URLs, refresh-safe)
- Route-level code splitting (lazy) + vendor chunking
- TipTap-based three-mode editor (Rich / Markdown / HTML) with block
  templates and custom HTML blocks
- **Visual drag-and-drop builder** (GrapesJS): 23 blocks, property panel,
  live CMS data preview, real site CSS in the canvas, zoom, block search
- **AI assistant**: multi-session streaming chat, async tasks, slash
  commands, voice input, prompt library, notifications
- **RBAC**: Roles & Permissions page — 39 capabilities across 5 groups
  (content / media / appearance / system / AI), custom roles. Every catalogued
  key is enforced by at least one route, and every route guard is
  capability-based (no role-slug allow-lists outside the plugin API)
- WordPress-style UI: grouped sidebar, admin bar, light/dark mode that
  follows the active theme color

## Frontend SPA

- `BrowserRouter`, SEO via `useSEO` (title/meta/OG/Twitter/canonical/JSON-LD)
- Theme application: CSS variables from the active theme + custom CSS
- Widget system driven by `widgets_active` settings

## Plugin system

- Directory: `server/plugins/<name>/` with `plugin.json` + `index.ts`
- `register()` registers hooks; optional `activate()` / `deactivate()` /
  `uninstall()` lifecycle functions
- Hooks: `addAction(name, fn)` / `addFilter(name, fn)`
- Market: local `server/market/` + remote catalogs (`market_url` setting),
  install from URL (zip/tar.gz with zip-slip guard)

## Theme system

- Directory: `server/themes/<name>/theme.json`
- Settings (colors, fonts, layout) exposed to the frontend as CSS variables
- Per-theme override storage (`theme_<name>_<key>`), one-click activation
- Admin appearance panel edits the active theme's settings + custom CSS
- **Visual theme sections**: HTML/CSS blocks designed in the builder,
  injected at 6 hook locations (before/after header/content/footer)
- One-click theme bundle rebuild from the Appearance page

## Cron

Every 60s: auto-publishes scheduled posts.
Every 60s: AI scheduler runs interval/daily/weekly agent tasks.
Daily: the newsletter digest (see below).

### Newsletter digest

Three settings drive it, and they mean different things on purpose:

| Setting | Meaning |
|---|---|
| `newsletter_frequency` | `daily` (default) or `weekly` — the throttle |
| `newsletter_last_sent_at` | when the last digest was **sent** (drives the weekly throttle) |
| `newsletter_digest_cursor` | `<publishedAt>\|<id>` of the newest post already carried (the window) |

They are separate because one value cannot answer both questions. The throttle
asks "how long since we mailed" — a property of the clock; the window asks "which
posts have we carried" — a property of the data. Deriving the throttle from the
cursor made a weekly digest mail daily on a quiet site, where the newest post is
older than a week.

The window is `publishedAt > cursor`, bounded above by `now` so a post dated in
the future is never mailed (it would also push the cursor forward and suppress
every later digest). Posts are carried oldest-first so the cursor can advance to
the newest one carried; the email lists them newest-first. Posts sharing a
`publishedAt` — what an import or a bulk publish produces — are ordered by id and
the cursor carries that id, so the older of a pair cannot hide the newer.

The cursor only advances after a successful send: if nothing was delivered (SMTP
down), the same window is retried instead of those posts falling outside every
later window.

## Roles and capabilities

Built-in roles ship with a capability list defined once in `server/src/utils/db.ts`
(`BUILTIN_ROLES`): the seed inserts it for a new install, and migration 16
(`align-builtin-role-capabilities`) tops up an existing install's rows with any
missing default — add-only, so a capability an administrator removed by hand is
never silently restored, and custom roles are never touched. Without that step an
install seeded long ago could have an editor whose row predated the current
defaults (no `moderate_comments`, no `manage_options`), which looked like a bug:
the editor simply could not moderate comments or open the dashboard.

`FALLBACK_CAPABILITIES` in `server/src/middleware/auth.ts` mirrors the same lists
for the case where the `Role` table has no row at all (a deleted row, a database
restored without it) — keep the two in step.

Migration 17 (`capability-route-alignment`) is the follow-up that finished the
job: the remaining role-slug guards (`authorize('admin')` on the database tools,
installer, webhooks, mailer, GDPR, activity log, custom post types, AI provider
settings and subscribers) became the `manage_system` capability, and category/
tag/link/security/site-list access moved onto their own keys. It adds exactly
`manage_security` and `view_sites` to the built-in editor row and nothing else —
deliberately not `alignBuiltinRoleCapabilities()`, which would resurrect every
missing default an administrator may have removed on purpose.

`admin/src/lib/access.ts` is the UI half: one table that drives the sidebar
entries, the route guard (a "no permission" screen instead of an empty page for a
direct URL) and the in-page buttons. Its rules are capability-based (the single
`roles:` entry left is the API-docs screen), so a custom role granted a key
really does reach the screen it unlocks. The server stays the real gate: every
route answers 401/403 on its own.

Because the admin caches its capability snapshot at login, `Roles.tsx` fires a
`mortar-permissions-changed` window event after a successful save and
`AuthProvider` re-reads `/auth/me` on it — otherwise editing your own role left
the sidebar stale until a full reload.
