# API Overview

All endpoints are served under `/api`. JSON in/out. Public endpoints need no
auth; admin endpoints require `Authorization: Bearer <token>` (or an app
password with the `App` scheme).

## Authentication

```
POST /api/auth/login          { email, password } -> { token, user } | { twoFactorRequired, tempToken }
POST /api/auth/2fa/verify     { tempToken, code } -> { token, user }
POST /api/auth/logout         (blacklists the presented token)
POST /api/auth/register       { username, email, password, role? }
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/2fa/setup | /2fa/enable | /2fa/disable | /2fa/status
```

Roles: `admin` > `editor` > `author` > `contributor` > `subscriber`.
Fine-grained capabilities via `requireCap` (e.g. `manage_options`,
`edit_posts`).

## Content

```
GET    /api/posts                 public list (site-isolated, paginated)
GET    /api/posts/slug/:slug      public single (password-protected flow)
GET    /api/posts/popular         top by views (site-isolated)
GET    /api/posts/archives        monthly archive counts
GET    /api/posts/author/:username
GET    /api/posts/archive/:year/:month
GET    /api/posts/admin           admin list (all statuses)
POST   /api/posts                 create
PUT    /api/posts/:id             update
DELETE /api/posts/:id             delete
POST   /api/posts/bulk-trash | /bulk-restore | /bulk-delete
PUT    /api/posts/:id/sticky | /restore | /password
POST   /api/posts/:id/clone
GET    /api/posts/:id/revisions
PUT    /api/posts/:id/revisions/:revId/restore

GET    /api/pages | /api/pages/slug/:slug | POST/PUT/DELETE
GET    /api/categories | POST/PUT/DELETE | /bulk-delete
GET    /api/tags | POST/PUT/DELETE | /bulk-delete
```

## Comments & Users

```
GET    /api/comments/post/:postId   public (approved only, no emails)
GET    /api/comments/admin          admin moderation queue
POST   /api/comments                submit (rate-limited, honeypot)
PUT    /api/comments/:id            moderate (approve/spam/trash)
DELETE /api/comments/:id
POST   /api/comments/bulk-action

GET    /api/users | POST /api/users (admin)
PUT    /api/users/:id | DELETE /api/users/:id
```

## Media

```
POST  /api/media/upload            multipart (allowlist + content verify)
GET   /api/media                   list/search
GET   /api/media/:id/img?w=&fmt=   responsive resize (jpeg/webp/avif, cached)
DELETE /api/media/:id | /bulk-delete
```

## Platform

```
GET    /api/themes                  list + active + effective settings
POST   /api/themes/:name/activate
PUT    /api/themes/:name/settings   per-theme overrides

GET    /api/plugins                 installed plugins
GET    /api/plugins/hooks           hook registry (actions + filters)
PUT    /api/plugins/:name/toggle    enable/disable (runs lifecycle hooks)
GET    /api/plugins/market/list     local market or remote catalog
POST   /api/plugins/market/:name/install
POST   /api/plugins/market/install-url   install from zip/tar.gz URL
DELETE /api/plugins/:name           uninstall (runs uninstall hook)

GET    /api/sites | POST/PUT/DELETE         multi-site management
PUT    /api/sites/:id/primary | /settings
GET    /api/links | POST/PUT/DELETE         friend links
GET    /api/editor/templates | POST/DELETE  custom block templates
       /api/editor/templates/export | /import
GET    /api/stats?days=N            PV/UV analytics + top posts
GET    /api/security/audit          security diagnostics (Site Health style)
```

## System & Install

```
GET    /api/settings                public (sensitive keys filtered) + theme merge
PUT    /api/settings                admin
GET    /api/settings/info           system info (driver-aware)
GET    /api/health | /api/health/detail
GET    /api/db/backup               database download
GET    /api/db/backup-full          database + uploads zip
POST   /api/db/restore-full         restore from backup zip
GET    /api/db/optimize             vacuum/analyze
GET    /api/install/status          installed?
POST   /api/install                 install wizard (db choice + admin account)
GET    /api/install                 admin: current db configuration
POST   /api/install/switch          admin: runtime database switch
POST   /api/install/reset           admin only: re-run the wizard

GET    /api/sitemap.xml             XML sitemap
GET    /api/feed/rss                RSS feed
GET    /robots.txt                  robots (honors blog_public)
```

## Post content pipeline

Public post content passes through, in order:

1. `post_content` **filters** (plugins)
2. **Shortcodes** (`[gallery]`, `[audio]`, `[video]`, plugin-defined)

Frontend then sanitizes with DOMPurify and rewrites CDN URLs.
