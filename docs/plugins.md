# Plugin Development

Mortar's plugin system follows the WordPress model: a plugin is a folder with
metadata and code that registers hooks.

> **AI tool registry**: plugins can extend the AI assistant with new
> tools by importing `registerTool(name, description, parameters, fn)`
> from `server/src/utils/aiTools`. New tools become available to the
> agent (subject to per-role tool permissions in **AI 设置**) and are
> audited like every other tool call.

## Structure

```
server/plugins/<name>/
├── plugin.json     # name, version, description, author
└── index.ts        # register() + optional lifecycle hooks
```

```json
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "Adds a greeting banner to posts.",
  "author": "Mortar Team"
}
```

## Registering hooks

```ts
import { addAction, addFilter } from '../../src/utils/hooks';

export function register() {
  addFilter('post_content', (html, post) => {
    if (!html) return html;
    return '<div class="banner">Hello from my plugin!</div>' + html;
  });

  addAction('comment_added', (commentId) => {
    // e.g. notify an external service
  });
}
```

## Lifecycle hooks (WordPress-style)

```ts
import db from '../../src/utils/db';

export async function activate() {
  // Runs when the plugin is enabled
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run('p1', 'my_plugin_activated_at', new Date().toISOString());
}

export function deactivate() {
  // Runs when the plugin is disabled
}

export function uninstall() {
  // Runs before the plugin folder is removed
  db.prepare("DELETE FROM Setting WHERE key = 'my_plugin_activated_at'").run();
}
```

## Shortcodes

```ts
import { addShortcode } from '../../src/utils/shortcodes';

export function register() {
  addShortcode('hello', (attrs, content) =>
    '<span>Hello, ' + (attrs.name || 'World') + '!</span>');
}
```

Usage in post content: `[hello name="Mortar"]`

## HTTP endpoints, admin screens and editor blocks

Besides hooks, a plugin can own an HTTP endpoint, add a screen to the admin and
contribute a block to the visual editor. All three are registered from
`register()` — a call at module scope runs during `require()`, where nothing
knows which plugin is registering, and throws.

```ts
import { addPluginRoute, addAdminPage, addEditorBlock } from '../../src/utils/pluginApi';

export function register() {
  // GET /api/ext/<plugin-name>/ping
  addPluginRoute('get', 'ping', (req, res) => res.json({ ok: true }));

  addAdminPage({
    id: 'greeting',
    title: 'My plugin',            // sidebar entry + page heading
    html: '<div class="card p-5">Any HTML; scripts are re-created when rendered.</div>',
  });

  addEditorBlock({
    id: 'my-banner', label: 'My banner', category: 'Content',
    content: '<div style="padding:16px">Block markup</div>',
  });
}
```

| Call | Where it shows up | Notes |
|------|-------------------|-------|
| `addPluginRoute(method, path, handler)` | `/api/ext/<plugin>/<path>` | Path is namespaced per plugin. The handler runs **without auth** — check `req.user` (a session is attached when a Bearer token is sent) if the endpoint should be protected. Only active plugins answer; unknown paths 404. |
| `addAdminPage({ id, title, html })` | `/admin/plugin/<plugin>/<id>` + a sidebar entry | Requires `manage_plugins` to view. The HTML is injected as-is (plugins are trusted server-side code); inline scripts are re-created after injection. |
| `addEditorBlock({ id, label, category, content })` | Visual editor → block inserter → "Plugins" | Blocks are merged into the built-in registry at editor start. |
| `addPluginInterval(fn, ms)` | nothing visible | Periodic work tied to the plugin's lifecycle: it starts when the plugin is enabled and stops when it is disabled. Use this instead of `setInterval` in an `init` listener — a timer started there kept running after deactivation (media cleanup kept deleting files) and never started at all when the plugin was enabled while the server was already up. |

Deactivation also drops the plugin's AI tools (`registerTool`), hook listeners and
shortcodes, so a disabled plugin cannot keep answering, keep spending the AI
budget, or keep running on a timer.

Deactivating a plugin removes everything it registered — routes, screens, blocks,
hook listeners and shortcodes — and purges the content cache (its shortcodes and
content filters are part of the cached HTML). `register()` re-adds all of it if
the plugin is enabled again. A plugin whose `register()` throws is not left
marked active; the toggle rolls back and its partial registrations are dropped.

## What plugins cannot do yet

- **Per-site activation**: `active_plugins` is one install-wide setting. The hook
  and shortcode systems have no request context, so "this plugin only on site B"
  could not be honoured consistently; it is deliberately not exposed.
- **Declared dependencies** on other plugins (`requires_plugins`), plugin
  updates, and sandboxing/permissions: none. Plugins run in-process with full
  database access.
- **Custom tables** are possible (`db.prepare('CREATE TABLE IF NOT EXISTS …')` in
  `activate()`), but there is no migration ledger for plugins — create tables
  idempotently and drop them in `uninstall()`.

## Available hooks

| Hook | Type | When |
|------|------|------|
| `init` | action | Server startup |
| `post_created` | action | A post or page is created — `(id, status, type)` |
| `post_updated` | action | A post or page is updated — `(id, type)` |
| `post_published` | action | A post/page transitions to published — `(id, type?)` |
| `post_restored` | action | A post leaves the trash — `(id, status)` |
| — | — | `delete_post` fires once per deletion: when a post enters the trash. Emptying the trash permanently is cleanup and emits no second event. |
| `delete_post` | action | A post/page is trashed or permanently deleted — `(id, type?)` |
| `comment_added` | action | A comment is submitted |
| `comment_approved` / `comment_spam` | action | Comment moderation |
| `delete_comment` | action | A comment is deleted |
| `user_register` / `user_updated` / `user_deleted` | action | Account lifecycle. `user_updated` receives only the changed fields — never the password. |
| `media_uploaded` / `media_updated` / `media_deleted` | action | Media lifecycle (id) |
| `settings_saved` | action | Settings written (list of keys) |
| `menu_saved` / `menu_deleted` | action | Menu changed — `(id, 'created'\|'updated')` |
| `theme_activated` / `theme_deactivated` | action | Theme switched (`theme_deactivated` carries the previous theme) or a theme was deleted — `(name, siteId)` |
| `plugin_activated` / `plugin_deactivated` | action | Plugin toggled — `(name, active)` |
| `task_run` | action | Scheduled task finished — `(id, ok, error, ms)` |
| `form_submitted`, `post_submitted` | action | Visitor submissions |
| `user_login` / `login_failed` | action | Authentication |
| `backup_completed`, `site_reset` | action | Maintenance |
| `post_content` | filter | Post HTML before it is served (then shortcodes) |
| `comment_validate` | filter | A comment before it is stored |

Pages are posts of type `page`, so they fire the `post_*` hooks with the type
attached — a listener that builds a URL should check it (`/page/<slug>` vs
`/post/<slug>`).

Bulk post actions fire the same hooks as the single-row routes (`delete_post`
per trashed row, `post_updated` / `post_published` per status change), so a
listener never misses an event because the editor used the checkbox toolbar.

The admin Plugins page shows the live registry (Installed / Market tabs); the
**Hooks** page (dev mode) lists every listener with its source. A plugin that
omits the `source` argument of `addAction`/`addFilter` is attributed to
`plugin:<name>` automatically while its `register()` runs, so it never shows up
as a core listener.

## Market & distribution

- **Local market**: put a package in `server/market/<name>/`
- **Remote catalog**: set `market_url` to a JSON catalog:

```json
{
  "packages": [
    { "name": "my-plugin", "version": "1.0.0", "description": "...", "url": "https://example.com/my-plugin.zip" }
  ]
}
```

- **Install from URL**: `POST /api/plugins/market/install-url { "url": "..." }`
  (zip or tar.gz; the archive is scanned for zip-slip before extraction)

## Security notes

- Plugins execute server-side with full DB access — install only trusted code
- All database access must use parameterized queries (`db.prepare(...)` with `?`)
- Never log secrets; validate any external input

## Bundled plugins

| Plugin | What it does | Config (Settings API) |
|--------|--------------|------------------------|
| `hello-world` | Demo banner injected into post content | — |
| `post-footer` | Signature footer with date appended to posts | — |
| `comments-spam-guard` | Auto-marks spammy comments as spam | `spam_words` (extra keywords) |
| `seo-tools` | Reserved (reading time is built into themes) | — |
| `search-engine-ping` | Pings Google/Bing sitemap on publish; optional Baidu push | `seo_ping_enabled`, `seo_baidu_token`, `seo_baidu_site` |
| `comment-email-notify` | Emails the admin on new comments (needs SMTP) | `comment_notify_enabled`, `comment_notify_email` |
| `post-expiry` | Time windows: `meta.available_from` auto-publishes, `meta.expiry_at` auto-unpublishes (to draft or to members-only) | `post_expiry_enabled`, `post_expiry_action` (`draft`\|`members`) |
| `event-webhook` | Pushes post/comment/user events to an external webhook (DingTalk group robot, your service) with HMAC signature | `event_webhook_url`, `event_webhook_secret`, `event_webhook_events` |
| `daily-digest` | Daily content summary email (posts/comments/users) at a set time | `daily_digest_enabled`, `daily_digest_time`, `daily_digest_email` |
| `content-stats` | `[stats]` shortcode: site content counts (`[stats posts comments]` filters) | — |
| `login-alert` | Brute-force email alert (3+ failed logins / 5 min, 1h cooldown) | `login_alert_enabled`, `login_alert_email` |
| `backup-notify` | Email after each automatic DB backup | `backup_notify_enabled`, `backup_notify_email` |
| `ai-auto-tags` | AI tool `suggest_tags`: tag suggestions from existing vocabulary + title keywords | — |
| `content-archive` | Moves stale published posts (no update for N days) back to draft | `content_archive_enabled`, `archive_after_days` |
| `comment-guard-ip` | Rejects comments from blacklisted IPs / emails before storing | `comment_guard_enabled`, `comment_ip_blacklist`, `comment_email_blacklist` |
| `media-cleanup` | Reports (or deletes) orphaned media files not referenced by any post | `media_cleanup_enabled`, `media_cleanup_days`, `media_cleanup_delete` |
| `link-health-check` | Probes friend links daily and emails about broken ones | `link_health_enabled`, `link_health_notify`, `link_health_email` |
| `ai-comment-review` | AI reviews new comments; obvious spam is auto-marked (needs an AI provider) | `ai_review_comments_enabled` |
| `auto-excerpt` | Fills missing post excerpts from the first content paragraph | `auto_excerpt_enabled`, `auto_excerpt_length` |
| `content-shortcodes` | `[views]`, `[word-count]`, `[post-title]` shortcodes | — |

Plugin settings are plain `Setting` rows, so they can be written with
`PUT /api/settings` (admin) or from a plugin's own admin UI.
