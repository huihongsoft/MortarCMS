import { addFilter, doAction } from '../../src/utils/hooks';
import { addShortcode } from '../../src/utils/shortcodes';
import db from '../../src/utils/db';

// Greeting banner appended to post content
export function register() {
  addFilter('post_content', (html: string, post: any) => {
    if (!html) return html;
    return '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px;">\u{1F44B} Hello! This banner was injected by the <strong>hello-world</strong> plugin.</div>' + html;
  }, 10, 'hello-world');
}

// Shortcode demo: [hello name="World"]
addShortcode('hello', (attrs) => '<span style="color:#6366f1;font-weight:600;">Hello, ' + (attrs.name || 'World') + '!</span>');

// Lifecycle: called when the plugin is enabled
export async function activate() {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES ('hw-activated', 'hello_world_activated_at', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date().toISOString());
  console.log('[hello-world] Activated');
}

// Lifecycle: called when the plugin is disabled
export function deactivate() {
  console.log('[hello-world] Deactivated');
  doAction('log', 'hello-world deactivated');
}

// Lifecycle: called before the plugin folder is removed
export function uninstall() {
  db.prepare("DELETE FROM Setting WHERE key = 'hello_world_activated_at'").run();
  console.log('[hello-world] Uninstalled');
}
