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
│   ├── jwt.ts          JWT sign/verify (HS256)
│   └── totp.ts         TOTP for 2FA
├── middleware/
│   ├── auth.ts         authenticate / authorize / requireCap + token blacklist
│   ├── site.ts         Multi-site resolution (Host header -> site)
│   └── upload.ts       Multer storage with extension+MIME allowlist
├── routes/             One module per resource (posts, pages, media, ...)
├── plugins/            Installed plugins (plugin.json + index.ts)
├── market/             Plugin market packages
└── themes/             Themes (theme.json + settings + custom CSS)
```

### Database adapter

- **SQLite** (default): `better-sqlite3`, synchronous, file at `server/data/mortar.db`
- **MySQL/MariaDB / PostgreSQL**: `mysql2` / `pg` run on a worker thread;
  the main thread blocks with `Atomics.wait` so the existing synchronous
  call sites (`db.prepare(...).run/get/all`) keep working unchanged
- Dialect translation happens in the worker (PostgreSQL `?` → `$n`
  placeholders; MySQL `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`)
- Select via `DATABASE_URL` or the install wizard

### Data model (19 tables)

```
User ──┬── Post ──┬── PostCategory ── Category
       │          ├── PostTag ──────── Tag
       │          ├── PostMeta
       │          ├── Revision
       │          └── Comment (self-join for threads)
       ├── Media
       └── AppPassword

Setting / SiteSetting    global + per-site key-value
Site                     multi-site domains
Menu                     menus with site isolation
Link                     friend links
Visit                    PV/UV analytics
Activity                 activity log
```

All primary keys are CUID strings; dates are ISO-8601 text in UTC.

## Admin SPA

- React Router with `basename="/admin"` (clean URLs, refresh-safe)
- Route-level code splitting (lazy) + vendor chunking
- TipTap-based three-mode editor (Rich / Markdown / HTML) with block
  templates and custom HTML blocks
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
- Admin appearance panel edits the active theme's settings

## Cron

Every 60s: auto-publishes scheduled posts.
