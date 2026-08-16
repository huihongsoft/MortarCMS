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

## Available hooks

| Hook | Type | When |
|------|------|------|
| `init` | action | Server startup |
| `post_created` | action | A post is created |
| `post_updated` | action | A post is updated |
| `post_published` | action | A post transitions to published |
| `delete_post` | action | A post is deleted |
| `comment_added` | action | A comment is submitted |
| `comment_approved` / `comment_spam` | action | Comment moderation |
| `delete_comment` | action | A comment is deleted |
| `user_register` | action | A new user registers |
| `post_content` | filter | Post HTML before it is served (then shortcodes) |

The admin Plugins page shows the live registry (Installed / Market tabs).

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
