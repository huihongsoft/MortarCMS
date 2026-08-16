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

Roles: `admin` > `editor` > `author` > `contributor` > `subscriber` —
seeded in the `Role` table and fully manageable from the admin
(**角色与权限**). Fine-grained capabilities via `requireCap` resolve from
the DB role table (cached 3s; invalidated on role changes). Capability
catalog: content (posts/pages/comments/categories/tags/links), media,
appearance (themes/menus/widgets), system (users/roles/plugins/import/
export/sites/security/options), **AI** (`ai_use` / `ai_manage` /
`ai_bindings` / `ai_tasks` / `ai_review`).

## Content

```
GET    /api/posts                 public list (site-isolated, paginated)
GET    /api/posts/suggest         search autocomplete
GET    /api/posts/slug/:slug      public single (password-protected flow)
POST   /api/posts/slug/:slug/password   unlock a protected post (cookie)
GET    /api/posts/popular         top by views (site-isolated)
GET    /api/posts/archives        monthly archive counts
GET    /api/posts/author/:username
GET    /api/posts/archive/:year/:month
GET    /api/posts/admin           admin list (all statuses)
POST   /api/posts                 create
PUT    /api/posts/:id             update
DELETE /api/posts/:id             delete
PUT    /api/posts/:id/restore
PUT    /api/posts/:id/sticky
POST   /api/posts/bulk-trash | /bulk-restore | /bulk-status | /bulk-delete
POST   /api/posts/:id/lock | /unlock | /clone
GET    /api/posts/:id/revisions | /related
PUT    /api/posts/:id/revisions/:revId/restore

GET    /api/pages/public | /api/pages/slug/:slug | POST/PUT/DELETE | /slug/:slug/password | /:id/revisions
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

GET    /api/users                 admin list (with post counts)
PUT    /api/users/:id | DELETE /api/users/:id
       (new users are created via POST /api/auth/register — no /api/users POST)
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
GET    /api/themes/sections         visual theme sections (hook locations)
PUT    /api/themes/sections/:location   save a section (html + css)
POST   /api/themes/rebuild          one-click rebuild theme bundles

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
GET    /api/editor/canvas-css       built frontend CSS for the builder canvas
GET    /api/editor/preview-cms/:type live preview HTML for CMS data blocks
GET    /api/stats?days=N            PV/UV analytics + top posts
GET    /api/security/audit          security diagnostics (Site Health style)
```

## System & Install

```
GET    /api/settings                public (sensitive keys filtered) + theme merge
PUT    /api/settings                admin
GET    /api/settings/info           admin only: system info (driver-aware)
GET    /api/settings/health         public: minimal health (no memory/stats)
GET    /api/widgets                 widget registry + active configuration
GET    /api/health | /api/health/detail
GET    /api/db/backup               database download
GET    /api/db/backup-full          database + uploads zip
POST   /api/db/restore-full         restore from backup zip
GET    /api/db/optimize             vacuum/analyze
POST   /api/db/reset-content        admin: wipe all content (fresh empty site)
GET    /api/install/status          installed?
POST   /api/install                 install wizard (db choice + admin account, optional sampleData)
GET    /api/install                 admin: current db configuration
POST   /api/install/switch          admin: runtime database switch
POST   /api/install/reset           admin only: re-run the wizard

## AI Assistant

```
GET    /api/ai/settings             provider config (keys masked) + permission config
PUT    /api/ai/settings             save providers / default / allowed roles / tool perms
POST   /api/ai/test                 test a provider connection
POST   /api/ai/chat                 plain chat (no tools)
POST   /api/ai/assistant            streaming agent (SSE: delta/tools/done) + tools
POST   /api/ai/generate             editor helpers (generate/polish/continue/translate/
                                    summarize/seo/tags/topics; style & language opts)
POST   /api/ai/task                 start async task (step tracking)
GET    /api/ai/tasks | /api/ai/tasks/:id   list / inspect tasks
POST   /api/ai/tasks/:id/cancel | /retry
DELETE /api/ai/tasks/:id
GET    /api/ai/schedules | POST | DELETE   scheduled AI tasks (interval/daily/weekly)
GET    /api/ai/memories | DELETE /:key     long-term memory management
GET    /api/ai/notifications | POST /read-all   task completion notifications
GET    /api/ai/usage                usage statistics (admin)
GET    /api/ai/audit                sandbox audit trail (admin)
GET    /api/ai/bindings | POST | PUT | DELETE   WeChat/DingTalk bindings
POST   /api/ai/webhook/:token            generic bot entry — acts as the bound user
GET    /api/ai/webhook/wechat/:token     WeChat MP URL verification (echostr)
POST   /api/ai/webhook/wechat/:token     WeChat MP text message (XML) → AI reply
POST   /api/ai/webhook/dingtalk/:token   DingTalk enterprise-bot callback (encrypted)
POST   /api/ai/bindings/:id/test-group   push a test message to a DingTalk group robot
POST   /api/ai/review-comments      AI spam/approve classification
POST   /api/ai/batch-translate      translate up to 10 posts (creates drafts)
POST   /api/ai/compare              side-by-side model comparison
POST   /api/ai/vision | /image-gen  direct image analysis / generation
POST   /api/ai/share | GET /api/ai/share/:token   shareable conversations
```

## Roles & Permissions (RBAC)

```
GET    /api/roles                   roles + user counts + capability catalog
POST   /api/roles                   create custom role
PUT    /api/roles/:slug             update name / capabilities (admin locked)
DELETE /api/roles/:slug             delete custom role (system/in-use protected)
```

## System & Install

```
GET    /api/settings                public (sensitive keys filtered) + theme merge

## Post content pipeline

Public post content passes through, in order:

1. `post_content` **filters** (plugins)
2. **Shortcodes** (`[gallery]`, `[audio]`, `[video]`, plugin-defined)
3. **CMS block rendering** (`data-cms` placeholders from the visual builder
   → live post lists / categories / comments / search / archive / tag cloud)

Frontend then sanitizes with DOMPurify and rewrites CDN URLs (src, href,
data-src and poster attributes).

## AI agent loop

The assistant wraps each provider call in an agent loop:

1. System prompt = assistant role + site context snapshot + long-term
   memory + available tools (filtered by the user's role)
2. Provider may return tool calls (streamed or not) → tools execute with
   the user's identity & permissions → results feed back → repeat (max 6-10)
3. Every tool call is audited to `AiAudit`; generated HTML is sanitized;
   user messages are wrapped to defuse prompt injection
