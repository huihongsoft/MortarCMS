# API Overview

All endpoints are served under `/api`. JSON in/out. Public endpoints need no
auth; admin endpoints require `Authorization: Bearer <token>` (or an app
password with the `App` scheme).

## Authentication

```
POST /api/auth/login          { email, password } -> { token, user } | { twoFactorRequired, tempToken }
POST /api/auth/2fa/verify     { tempToken, code } -> { token, user }
POST /api/auth/logout         (blacklists the presented token)
POST /api/auth/logout-all     auth: bumps the session version, invalidating every token
POST /api/auth/register       { username, email, password, role? }
GET  /api/auth/me
PUT  /api/auth/me             auth: update own profile (username/email/bio/avatar)
PUT  /api/auth/me/password    auth: change own password
GET  /api/auth/me/comments    auth: comments authored by the caller
POST /api/auth/forgot-password
POST /api/auth/reset-password { token, password }
POST /api/auth/2fa/setup | /2fa/enable | /2fa/disable | /2fa/status   (all auth)
```

`GET /api/auth/me` and the other `/me` routes are self-service: any
authenticated user, no capability needed. `register` is the only public
write and respects the site's registration setting. `me` also returns the
caller's `capabilities`, which the admin UI uses to decide which navigation
entries to show.

A brute-force limiter (10 requests/minute per IP) covers the routes that verify a
secret — `login`, `register`, `2fa/verify`, `2fa/disable`, `me/password`,
`forgot-password`, `reset-password`. It is deliberately **not** router-wide:
`GET /api/auth/me` is called on every admin page load, and counting those against
the limiter logged administrators out while they were working.

Roles: `admin` > `editor` > `author` > `subscriber` — seeded in the `Role`
table and fully manageable from the admin (**角色与权限**). Fine-grained
capabilities via `requireCap` resolve from the DB role table (cached 3s;
invalidated on role changes). Every route is capability-gated; the role name in
the JWT only decides site assignment and display. Capability catalog (39 keys
across 5 groups): content (posts/pages/comments/categories/tags/links/forms),
media, appearance (themes/menus), system (users/roles/plugins/import/export/
sites/**view_sites**/security/options/system-info), **AI** (`ai_use` /
`ai_manage` / `ai_bindings` / `ai_tasks` / `ai_review`).

`manage_system` is the superuser key (database tools, installer, webhooks,
mailer, GDPR, activity log, custom post types, AI provider settings, newsletter
subscribers). No built-in role except `admin` holds it, so it must be granted
deliberately from the Roles page — that is why the area is not gated by
`manage_options`, which the `editor` role also holds.


## Content

```
GET    /api/posts                 public list (site-isolated, paginated)
GET    /api/posts/suggest         search autocomplete
GET    /api/posts/slug/:slug      public single (password-protected flow)
POST   /api/posts/slug/:slug/password   unlock a protected post (cookie)
GET    /api/posts/popular         top by views (site-isolated)
                                  ?category=<slug> scopes the ranking; gated,
                                  password-protected and noindex posts are
                                  excluded for anonymous callers (same rule as
                                  the public list)
GET    /api/posts/archives        monthly archive counts
GET    /api/posts/archive/:year    public yearly archive (`?month=` narrows it)
GET    /api/posts/archive/:year/:month   public monthly archive
GET    /api/posts/author/:username
POST   /api/posts/search-log      public: record an anonymous search term (hot-searches report)
GET    /api/posts/search-stats    manage_options: top 20 search terms, last 30 days
GET    /api/posts/admin           admin list (all statuses)
POST   /api/posts                 create
PUT    /api/posts/:id             update
DELETE /api/posts/:id             delete
PUT    /api/posts/:id/restore
PUT    /api/posts/:id/sticky
POST   /api/posts/bulk-trash | /bulk-restore | /bulk-status | /bulk-delete
POST   /api/posts/bulk-edit       edit_posts: change a field across many posts —
                                  { ids, changes{status,categoryIds,tagNames,tagMode,
                                  featured,authorId,meta}, dryRun? }. Per-post
                                  capability checks, per-post savepoint, and a
                                  per-post result list. Without `publish_posts`
                                  the only status a caller may set is `draft`
                                  (the same rule the single-post PUT applies).
GET    /api/posts/:id/preview-link  edit_posts: a signed URL (24h) showing this one
                                  unpublished post on the real theme to a reviewer
                                  with no account. Never cached, never indexed;
                                  revoked by the session version or a change to the
                                  owner's site assignments, and refused for pages
                                  (their route has no preview support).
POST   /api/posts/:id/lock | /unlock | /clone
GET    /api/posts/:id/revisions | /related
PUT    /api/posts/:id/revisions/:revId/restore

POST   /api/posts/frontend/submit-post   submit_posts: frontend submission (enters the pending queue)
GET    /api/posts/mine                   auth: the caller's own submissions + review status
POST   /api/posts/:id/review             review_posts: approve (publish) or reject (draft + notify)

GET    /api/pages/public | /api/pages/slug/:slug | POST/PUT/DELETE | /slug/:slug/password | /:id/revisions
GET    /api/categories | POST/PUT/DELETE | /bulk-delete
GET    /api/tags | POST/PUT/DELETE | /bulk-delete
```

## Comments & Users

```
GET    /api/comments/recent         public: latest approved comments across posts
GET    /api/comments/post/:postId   public (approved only, no emails)
POST   /api/comments/:id/like       public: like a comment
GET    /api/comments/admin          requireCap moderate_comments: moderation queue
                                    (?siteId=<id>, and a user assigned to
                                    specific sites only sees those sites'
                                    comments + the shared ones). A comment's
                                    site is its own when set (the per-site
                                    content screen can assign one), otherwise
                                    its post's
POST   /api/comments                submit (rate-limited, honeypot)
PUT    /api/comments/:id            moderate (approve/spam/trash)
DELETE /api/comments/:id
POST   /api/comments/bulk-action

GET    /api/users                 requireCap manage_users: list (with post counts)
PUT    /api/users/:id | DELETE /api/users/:id   manage_users
       (new users are created via POST /api/auth/register — no /api/users POST)
```

## Media

```
POST  /api/media/upload            requireCap upload_files: multipart (allowlist +
                                    content verify); optional siteId
GET   /api/media                   upload_files: list (?siteId=<id>; a user assigned
                                    to specific sites only sees those + shared files)
GET   /api/media/search            upload_files: lightweight search for pickers
GET   /api/media/:id               auth: metadata (scoped to the caller's sites)
GET   /api/media/:id/img?w=&fmt=   responsive resize (jpeg/webp/avif, cached; public —
                                    serves the same bytes as /uploads)
GET   /api/media/:id/download      public, same reasoning
POST  /api/media/bulk-edit         edit_media: bulk title/alt update
PUT   /api/media/:id               edit_media: metadata update
DELETE /api/media/:id | /bulk-delete   delete_media
```

## Platform

```
GET    /api/themes                  public: list + active + effective settings
                                    (?siteId=<id>, admin: as that site sees it)
POST   /api/themes/:name/activate   manage_themes: { siteId? } — activate for one site
PUT    /api/themes/:name/settings   manage_themes: per-theme overrides
                                    (?siteId=<id> = that site's own layer;
                                    theme_<name>_<key> keys)
POST   /api/themes/install          install_themes: install a theme zip (multipart "file")
POST   /api/themes/rebuild          rebuild_themes: one-click rebuild theme bundles
DELETE /api/themes/:name            delete_themes: remove a theme (active/default protected)
GET    /api/themes/:name/files      manage_themes: list editable theme files
GET    /api/themes/:name/file       manage_themes: read one file (?path=)
PUT    /api/themes/:name/file       manage_themes: write a CSS file (only writable type)
GET    /api/themes/sections         public: visual theme sections (hook locations)
PUT    /api/themes/sections/:location   manage_themes: save a section (html + css, ?siteId=<id>)
GET    /api/themes/:name/backups    manage_themes: list settings snapshots
POST   /api/themes/:name/backups    manage_themes: create a snapshot
POST   /api/themes/:name/backups/:id/restore   manage_themes: roll back to a snapshot
DELETE /api/themes/:name/backups/:id           manage_themes

GET    /api/plugins                 requireCap manage_plugins: installed plugins
GET    /api/plugins/hooks           manage_plugins: compact hook summary (names + listener counts)
PUT    /api/plugins/:name/toggle    manage_plugins: enable/disable (runs lifecycle hooks)
GET    /api/plugins/:name/settings  manage_plugins: settings schema + values + read-only reports
PUT    /api/plugins/:name/settings  manage_plugins: save settings (validated against the schema)
GET    /api/plugins/market/list     manage_plugins: local market or remote catalog
POST   /api/plugins/market/:name/install   manage_plugins
POST   /api/plugins/market/install-url     manage_plugins: install from zip/tar.gz URL
DELETE /api/plugins/:name           manage_plugins: uninstall (must be inactive)

GET    /api/sites/current           public: current site info (resolved from the Host header)
GET    /api/sites                   authorize admin/editor: sites + per-site content stats
POST   /api/sites                   manage_sites: create
PUT    /api/sites/:id               manage_sites: update
POST   /api/sites/:id/primary       manage_sites: make primary
GET    /api/sites/:id/settings      manage_sites: read per-site overrides
PUT    /api/sites/:id/settings      manage_sites: per-site overrides (theme_active picks
                                    the site's theme, '' = follow global)
GET    /api/sites/:id/content       manage_sites: content assignable to the site
POST   /api/sites/:id/content/assign   manage_sites: assign content to the site
POST   /api/sites/:id/content/global   manage_sites: make content visible on every site
POST   /api/sites/:id/duplicate     manage_sites: duplicate row + overrides + menus
DELETE /api/sites/:id               manage_sites: delete

GET    /api/links                   public: navigation links (site-filtered; inactive
                                    hidden from anonymous callers)
POST   /api/links | PUT/DELETE /:id manage_options
POST   /api/links/:id/click         public: count a click
GET    /api/links/categories        public: link categories + counts
POST   /api/links/categories        manage_options
PUT    /api/links/categories/:id    manage_options
DELETE /api/links/categories/:id    manage_options

GET    /api/editor/templates        edit_posts: custom block templates
POST   /api/editor/templates | DELETE /:id      manage_options
GET    /api/editor/templates/export | POST /import   manage_options
GET    /api/editor/shortcodes       edit_posts: registered shortcodes (name + description)
GET    /api/editor/forms            edit_posts: enabled forms for the [form] inserter
GET    /api/editor/canvas-css       edit_posts: built frontend CSS for the builder canvas
GET    /api/editor/preview-cms/:type   edit_posts: live preview HTML for CMS data blocks
GET    /api/stats?days=N            manage_options: PV/UV analytics + top posts (visit rows
                                    carry the resolved site; scoped to the caller's sites)
GET    /api/stats/dashboard         manage_options: dashboard counts + recents (same scoping)
GET    /api/security/audit          manage_options: security diagnostics (Site Health style)
```

## System & Install

```
GET    /api/settings                public (sensitive keys filtered) + theme merge
PUT    /api/settings                admin
GET    /api/settings/info           admin only: system info (driver-aware)
GET    /api/settings/health         public: minimal health (no memory/stats)
POST   /api/settings/storage/test   admin: test the object-storage connection
GET    /api/widgets                 public: widget registry + active configuration
GET    /api/schema                  public: machine-readable endpoint catalog
GET    /api/health                  public: liveness check
GET    /api/health/detail           manage_options: detailed site health
GET    /api/db/status               admin: driver, size, table rows, indexes, last maintenance
GET    /api/db/slow-queries         admin: recorded slow queries (>150ms)
GET    /api/db/integrity            admin: SQLite integrity check
GET    /api/db/backup               admin: database download
GET    /api/db/backup-full          admin: database + uploads zip
POST   /api/db/restore-full         admin: restore from backup zip (multipart "file")
GET    /api/db/optimize             admin: vacuum/analyze
GET    /api/db/backups              admin: list backup files
GET    /api/db/backups/:name        admin: download a backup file
DELETE /api/db/backups/:name        admin: delete a backup file
POST   /api/db/reset-content        admin: wipe all content, all sites (fresh empty site)
POST   /api/db/reset-demo           admin: the same wipe, then import the sample content
GET    /api/install/status          public: installed?
POST   /api/install                 public: install wizard (db choice + admin account, optional sampleData)
GET    /api/install                 admin: current db configuration
POST   /api/install/switch          admin: runtime database switch
POST   /api/install/reset           admin only: re-run the wizard
```

`GET /api/settings` resolves everything for the site serving the request (its
Host), and an **admin** may add `?siteId=<id>` to read another site's effective
values — that is how the Appearance panel edits a site's theme. Every other
`/api/settings/*` route is admin-only.

## AI Assistant

```
GET    /api/ai/settings             provider config (keys masked) + permission config
                                    (allowedRoles, toolPermissions, usageLimit,
                                    allowUnattendedRisky)
PUT    /api/ai/settings             save providers / default / allowed roles / tool perms
                                    / allowUnattendedRisky (admin only)
POST   /api/ai/test                 test a provider connection
POST   /api/ai/chat                 plain chat (no tools)
POST   /api/ai/summarize            compress a long conversation excerpt
POST   /api/ai/assistant            streaming agent (SSE) + tools. Events:
                                      delta       incremental text
                                      tools       tool names about to run
                                      tool_result a tool's output (name + output)
                                      pending     high-risk calls that were NOT run;
                                                  carries {token, calls[]} to approve
                                      done        final text
                                      error       failure message
POST   /api/ai/assistant/approve    approve or cancel a pending plan: {token, approved}
                                    the token is signed, bound to its user, valid for
                                    10 minutes, and single-use (a replay gets 409)
POST   /api/ai/generate             editor helpers (generate/polish/continue/translate/
                                    summarize/seo/tags/topics; style & language opts)
POST   /api/ai/task                 start async task (step tracking)
GET    /api/ai/tasks | /api/ai/tasks/:id   list / inspect tasks
POST   /api/ai/tasks/:id/cancel | /retry
DELETE /api/ai/tasks/:id
GET    /api/ai/schedules | POST | DELETE   scheduled AI tasks (interval/daily/weekly)
GET    /api/ai/memories | DELETE /:key     long-term memory management
GET    /api/ai/notifications | POST /notifications/read-all   task completion notifications
POST   /api/ai/notifications/:id/read           mark one notification read
GET    /api/ai/sessions | POST | PUT /:id | DELETE [/:id]    server-side chat sessions
                                                (cross-device; DELETE without id clears all)
GET    /api/ai/usage                usage statistics (admin)
GET    /api/ai/audit                sandbox audit trail (admin)
GET    /api/ai/bindings | POST | PUT | DELETE   chat bindings (WeChat/DingTalk/Telegram/Slack)
GET    /api/ai/binding-platforms         the platforms a binding may use, with the
                                         credential fields each one needs (the admin
                                         form is rendered from this)
POST   /api/ai/webhook/:token            generic bot entry — acts as the bound user
GET    /api/ai/webhook/wechat/:token     WeChat MP URL verification (echostr)
POST   /api/ai/webhook/wechat/:token     WeChat MP text message (XML) → AI reply
POST   /api/ai/webhook/dingtalk/:token   DingTalk enterprise-bot callback (encrypted)
POST   /api/ai/webhook/telegram/:token   Telegram update; the delivery must carry the
                                         X-Telegram-Bot-Api-Secret-Token set at setWebhook
POST   /api/ai/webhook/slack/:token      Slack Events API (url_verification + events);
                                         signed with the app's Signing Secret
POST   /api/ai/bindings/:id/test-group   push a test message to a DingTalk group robot
POST   /api/ai/review-comments      AI spam/approve classification
POST   /api/ai/batch-translate      translate up to 10 posts (creates drafts)
POST   /api/ai/compare              side-by-side model comparison
POST   /api/ai/vision | /image-gen  direct image analysis / generation
POST   /api/ai/share | GET /api/ai/share/:token | DELETE /api/ai/share/:token
                                    shareable conversations (GET is public;
                                    DELETE is the author or an admin)
```

## Roles & Permissions (RBAC)

```
GET    /api/roles                   roles + user counts + capability catalog
POST   /api/roles                   create custom role
PUT    /api/roles/:slug             update name / capabilities (admin locked)
DELETE /api/roles/:slug             delete custom role (system/in-use protected)
```

## Custom post types

```
GET    /api/post-types              public: built-in (post/page) + registered types
GET    /api/post-types/:slug/fields  public: the field schema for a type (key, label,
                                    type, required, options, private) — definitions
                                    only, never values
POST   /api/post-types              admin: register { slug, label, supports[] }
PUT    /api/post-types/:slug        admin: edit label/supports (slug is immutable)
DELETE /api/post-types/:slug        admin: unregister (existing content is kept)
```

## Custom fields

A field group defines typed fields for one content type. The values live in
`PostMeta` and are readable as `post.fields` (typed, definition order) or
`post.meta[key]`; `[field name="key"]` outputs one in content. A field marked
`private` keeps its value for editors but is stripped from every anonymous
payload — list, single post, page — and the shortcode refuses to emit it.

```
GET    /api/field-groups            edit_posts: all groups
GET    /api/field-groups/for/:type  edit_posts: flat field list for one type
POST   /api/field-groups            manage_system: create
PUT    /api/field-groups/:id        manage_system: update
DELETE /api/field-groups/:id        manage_system: delete (stored values are kept)
```

Writes to `PostMeta` may only name the application's own `_` keys through a
short allowlist — the SEO/CSS fields the editor owns, plus `_members_only`
(a publishing setting a human has to be able to clear); any other `_`-prefixed
key is refused (400), on the single save, the page save and the bulk edit alike.
Reading is narrower than writing: `_members_only` never appears in an anonymous
payload.

## Saved views

Named filter sets for the content list — per user, or shared with the creator's
role. A view only remembers choices; applying one re-runs the list endpoint's
own site validation, so it cannot widen what the caller may see.

```
GET    /api/saved-views             auth: own views + those shared with my role
POST   /api/saved-views             auth: create { name, filters, siteId?, shared? }
                                    (50 per user; 400 beyond that)
PUT    /api/saved-views/:id         owner (or admin): rename / re-scope
DELETE /api/saved-views/:id         owner (or admin)
```

## Forms

Public submission is rate-limited globally and uses a hidden `_hp` honeypot.
Admin CRUD requires `manage_forms` and is site-scoped (forms and their
submissions inherit a site; a site-assigned user only sees their own + shared).

```
POST   /api/forms/:slug/submit      public: submit a form rendered by [form id="..."]
                                    (declared fields only; required/email/number
                                    validated; emails the owner unless honeypot)
GET    /api/admin/forms             manage_forms: list + unread submission counts
POST   /api/admin/forms             manage_forms: create { name, fields[], emailTo?, ... }
GET    /api/admin/forms/:id         manage_forms: detail + field definitions
PUT    /api/admin/forms/:id         manage_forms: update
DELETE /api/admin/forms/:id         manage_forms: delete form + submissions
GET    /api/admin/forms/:id/submissions            manage_forms: paginated (?page&limit&status)
POST   /api/admin/forms/:id/submissions/read       manage_forms: mark read (?submissionId optional)
DELETE /api/admin/forms/:id/submissions/:sid       manage_forms: delete one submission
GET    /api/admin/forms/:id/submissions/export     manage_forms: CSV download
```

## Newsletter

```
POST   /api/newsletter/subscribe    public: subscribe (double opt-in when SMTP is
                                    configured, immediate otherwise)
POST   /api/newsletter/confirm      public: { token } confirm a subscription
POST   /api/newsletter/unsubscribe  public: { token } unsubscribe
GET    /api/admin/subscribers       admin: list (?page&limit&q&status) + totals
DELETE /api/admin/subscribers/:id   admin: delete a subscriber (PII)
GET    /api/admin/subscribers/export   admin: CSV download
POST   /api/admin/newsletter/send   admin: { to } = single test send, omitted =
                                    broadcast the recent-posts digest to every
                                    confirmed subscriber (one email each)
```

Subscriber management and mass sending expose the whole mailing list, so they
are **admin-only** (`authorize('admin')`), not merely `manage_options`.

## GDPR & privacy

```
GET  /api/gdpr/export               auth: export all personal data for the caller
POST /api/gdpr/erase                auth: erase the caller's data (content anonymized,
                                    media deleted; password/2FA/credentials removed)
GET  /api/gdpr/admin/export/:id     admin: export any user's data
POST /api/gdpr/admin/erase/:id      admin: erase any user's data (not self)
```

## Friend links & menus

```
GET    /api/friend-links            public: blogroll (name/url/avatar/description)
POST   /api/friend-links            manage_options
PUT    /api/friend-links/:id        manage_options
DELETE /api/friend-links/:id        manage_options

GET    /api/menus/location/:location   public: menu for a location (items: [] if none)
GET    /api/menus                   manage_menus: all menus (site-scoped)
POST   /api/menus                   manage_menus: create (item URLs validated)
PUT    /api/menus/:id               manage_menus: update
DELETE /api/menus/:id               manage_menus: delete
```

Friend links are a separate, lightweight model from the `/api/links`
navigation-site links above.

## Broken links & activity

```
GET    /api/admin/broken-links      manage_options: broken-link report
                                    (?page&limit&status; scoped to the caller's sites)
DELETE /api/admin/broken-links/:id  manage_options: remove a report entry

GET    /api/activity                admin: activity log (?page&limit&q)
```

## Export / Import

```
GET  /api/export/export             requireCap export: JSON dump of posts, pages,
                                    categories, tags, users, settings (secrets
                                    stripped), menus, comments, media, links,
                                    link categories/associations, friend links
POST /api/export/import/preview     export: { ...dump } -> counts + slug conflicts
                                    (writes nothing)
POST /api/export/import             export: apply a dump (one transaction;
                                    sanitizes untrusted content)
POST /api/import/wxr                requireCap import: WordPress WXR XML
                                    (multipart "file")
POST /api/import/markdown           import: Markdown files (multipart "files",
                                    up to 20 with frontmatter)
```

## Webhooks

Outbound event webhooks. Secrets are generated server-side, returned **once**
on create/reset, and never listed again.

```
GET    /api/admin/webhooks                   admin: list (secretSet flag only)
POST   /api/admin/webhooks                   admin: create { name, url, events[] }
PUT    /api/admin/webhooks/:id               admin: update name/url/events/active
DELETE /api/admin/webhooks/:id               admin
POST   /api/admin/webhooks/:id/reset-secret  admin: rotate (returns new secret once)
POST   /api/admin/webhooks/:id/test          admin: deliver a test event
```

## Hooks & scheduled tasks

Hooks are registered in code; the write routes below only manage the
in-process registrations and are useful for debugging/tests. The full registry
is `GET /api/system/hooks` (the compact summary is `GET /api/plugins/hooks`).

```
GET    /api/system/hooks                    requireCap view_system_info: registry
                                            (actions + filters) with listeners
POST   /api/system/hooks/actions/:name      admin: add a dynamic action listener
POST   /api/system/hooks/filters/:name      admin: add a dynamic filter
DELETE /api/system/hooks/:kind/:name        admin: remove listeners (kind=action|filter)
DELETE /api/system/hooks/:kind/:name/reset  admin: reset a canonical hook
GET    /api/plugins/hooks                   manage_plugins: hook summary

GET    /api/system/tasks                    manage_options: scheduled tasks + run stats
POST   /api/system/tasks/:id/run            manage_options: run a task now
PUT    /api/system/tasks/:id/enabled        manage_options: enable/disable a task
```

## Cache

```
GET  /api/system/cache        manage_options: page-cache stats
POST /api/system/cache/purge  manage_options: purge every cached response
PUT  /api/system/cache        manage_options: { enabled, ttl } (ttl clamped 5-3600s)
```

## Mailer

```
GET    /api/mailer/templates        admin: email templates + rendered previews
POST   /api/mailer/test             admin: { to } send a test email
POST   /api/mailer/send             admin: { to, template, vars } send any template
DELETE /api/mailer/templates/:name  admin: reset a template to its built-in version
```

## App passwords

Personal API credentials (per-user, no admin needed). Send them as
`Authorization: App <token>` instead of a Bearer JWT. `scope` is `full` or
`read`; a `read` credential is limited to GET/HEAD/OPTIONS and is refused on
the few mutating GETs (db optimize/backup/backup-full, media download).
`/api/mcp` is the exception — JSON-RPC is a POST even when it only reads — so
its scope is decided per tool instead (see below).
"Log out everywhere" invalidates them too.

```
GET    /api/app-passwords              auth: the caller's own passwords
POST   /api/app-passwords              auth: create { name, scope?, expiresInDays? }
                                       (token returned once)
POST   /api/app-passwords/:id/revoke   auth: revoke (row kept for the audit trail)
DELETE /api/app-passwords/:id          auth: delete
```

## MCP (Model Context Protocol)

`POST /api/mcp` speaks JSON-RPC 2.0, so an external agent (Claude Desktop, an
IDE, another agent framework) can drive the site with **the same tool registry
the built-in assistant uses** — same per-tool permissions, same refusal of risky
calls, same site scoping. It is a transport, not a second implementation.

```
POST   /api/mcp    initialize | ping | tools/list | tools/call
GET    /api/mcp    a liveness probe for clients that check before POSTing
```

Authenticate with an **App password** (`Authorization: App <token>`); a session
JWT is not accepted, because an MCP client has no browser to log in with.

* `tools/list` returns only what the credential's role may use (`canUseTool`).
* A `read`-scoped App password may only call tools that cannot change anything
  (`isReadOnlyTool`, default-deny: an unclassified tool — including a plugin's —
  needs `full`).
* A **risky** call (publishing, deleting, theme/site settings) is refused with
  the same message an unattended task gets. MCP clients cannot show an approval
  card, so they follow the unattended rule: an operator who wants them enabled
  sets `ai_allow_unattended_risky` in AI settings.

Client configuration (Claude Desktop, `claude_desktop_config.json`):

```json
{ "mcpServers": { "mortar": {
  "type": "http",
  "url": "https://your-site.example/api/mcp",
  "headers": { "Authorization": "App <your-app-password>" }
} } }
```

## Plugin extensions (`/api/ext`)

Everything a plugin extends lives under `/api/ext/<plugin>/<path>`, dispatched
through one router so runtime-registered routes are reachable. The
plugin-declared endpoints (`/:plugin/*`) run **before** any auth so a plugin
decides its own access (webhook callbacks, public widgets); a Bearer token is
resolved when offered, so a plugin can read `req.user` if it wants to require
one. Only active plugins answer; anything else is a 404.

```
GET  /api/ext/pages              manage_plugins: admin pages plugins registered
                                 (drives the admin navigation)
GET  /api/ext/pages/:plugin/:id  manage_plugins: one page body (HTML)
GET  /api/ext/blocks             edit_posts: editor blocks contributed by plugins
ANY  /api/ext/:plugin/*          plugin-defined; auth as the plugin chooses
```

## Feeds & sitemap

```
GET /api/feed/rss        public: RSS 2.0 (per-site domain/title/description)
GET /api/feed/atom       public: Atom 1.0
GET /api/feed/json       public: JSON Feed
GET /api/feed/comments   public: comments feed
GET /api/sitemap.xml     public: XML sitemap (site-filtered, 5-minute cache)
```

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

Every call goes through `chatCompleteWithFallback`, which walks the enabled
providers in order (the default first). A provider may name a `fastModel`: the
mechanical operations — compressing a conversation, suggesting terms, rating a
comment — then ask for it with `tier: 'fast'`, while anything that produces
prose a human reads (writing, translating, asking, tasks) always uses the main
model. The hint is per attempt, so a fallback provider uses its own fast model. It moves to the next one when the
failure is ABOUT THE PROVIDER — unreachable, 5xx, 401/403/429 — and does not
retry a request the provider rejected on its merits (a 400 means the payload is
wrong, and every provider would reject it the same way). Once a streaming
response has emitted text it is never restarted: the answer is already on the
user's screen.

### Semantic retrieval

Off until an embedding model is named in AI settings (`ai_embedding_model`; the
provider is the default one unless `ai_embedding_provider` points elsewhere).
Vectors come from an OpenAI-compatible `/embeddings` endpoint — the same
configuration and budget as everything else, and a local Ollama works too.

```
GET /api/posts/semantic?q=&limit=   public: posts closest in meaning to the query.
                                    { posts, semantic }. `semantic: false` means
                                    no model is configured (or the provider
                                    failed) — fall back to `?search=`.
GET /api/posts/:id/related          public: related by meaning once the index
                                    exists, else by category as before.
```

The assistant reaches it through `search_site_content`, which is now a hybrid:
the keyword score still runs (an exact term is the most precise signal there is)
and the semantic ranking is unioned with it, so enabling embeddings can only ADD
results. Each result carries the post's URL, so an answer can cite what it used —
the system prompt asks for exactly that, and says to admit it when the site has
nothing rather than answer from memory. `complete_post`'s "related reading" block
uses the same ranking, so two articles about one subject link to each other even
when they share no words.

Vectors are stored one row per post (`PostEmbedding`, base64 Float32Array) and
compared in-process; the maintenance task `embed_posts` fills the index hourly,
20 posts per run, skipping any whose text has not changed. Nothing is embedded
for a post a visitor could not read anyway: a draft, a password-protected post or
a members-only one is filtered out *after* ranking, so it never occupies a
result slot.

### The visitor question box

Off by default (AI settings → 访客问答). It is the only AI endpoint an anonymous
caller can reach, so it is the operator's decision to switch on, it has its own
per-IP limiter (5/min) on top of the global one, and it obeys the same daily
budget as everything else.

```
GET  /api/ai/public-qa   public: { enabled } — the front end asks before
                         offering the box (the generic settings endpoint hides
                         every ai_ key from anonymous callers)
POST /api/ai/ask         public: { question, lang? } → { answer, sources[] }
                         sources are { title, slug, url }: the slug is what a
                         localised front end needs to rebuild the link with its
                         own language prefix
```

The `lang` a localised visitor sends restricts retrieval to that edition, so an
English reader is not answered from the Chinese edition of a post.

Retrieval for this one path is restricted to what a VISITOR may read —
published, not password-protected, not members-only, not noindex — never a
draft. The answer is generated only from the retrieved passages, cites them as
`[n]`, and says the site has nothing rather than answering from the model's own
knowledge. The passages are labelled as data, not instructions, so text inside a
post cannot hijack the answer.

**Residual, deliberately accepted:** a post's text is untrusted, and a prompt
that says "this is data" is a mitigation, not a proof. Someone who can publish
can try to make the box speak in the site's voice (an off-topic or defamatory
answer). What they cannot do is escape the answer's text rendering, add a link
to the clickable source list (those are built server-side from the retrieved
rows), or reach any credential — the prompt holds none.

### Authoring aids

```
POST   /api/ai/alt-text        ai_use + upload_files|edit_media: describe images
                               { ids: [] } (max 10 per request). Fills `Media.alt`
                               through the vision tool; an image that already has
                               alt text is skipped and never overwritten.
POST   /api/ai/suggest-terms   ai_use: { title, content } →
                               { categories: [], tags: [] }. Sees the site's
                               existing vocabulary so it reuses browsable terms.
                               Returned, never applied — the author decides.
```
