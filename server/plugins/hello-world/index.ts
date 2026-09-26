import { addFilter, doAction } from '../../src/utils/hooks';
import { addShortcode } from '../../src/utils/shortcodes';
import { addPluginRoute, addAdminPage, addEditorBlock } from '../../src/utils/pluginApi';
import db from '../../src/utils/db';

// Reference plugin: every extension point Mortar offers, in one file.
//
// register() runs when the plugin is loaded (at startup for active plugins) and
// again after being re-enabled. Everything registered here is attributed to
// this plugin — hooks, routes, admin pages and editor blocks — so keep the
// registrations INSIDE register(): a call at module scope happens during
// require(), where nothing knows which plugin is registering.
export function register() {
  // 1) A content filter: greeting banner on top of every post.
  addFilter('post_content', (html: string) => {
    if (!html) return html;
    return '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px;">\u{1F44B} Hello! This banner was injected by the <strong>hello-world</strong> plugin.</div>' + html;
  }, 10, 'hello-world');

  // 2) A shortcode: [hello name="World"]
  addShortcode('hello', (attrs) => '<span style="color:#6366f1;font-weight:600;">Hello, ' + (attrs.name || 'World') + '!</span>');

  // 3) An HTTP endpoint: GET /api/ext/hello-world/ping
  //    Runs without auth unless the plugin checks req.user itself, so a plugin
  //    can serve public callbacks as well as protected ones.
  addPluginRoute('get', 'ping', (_req, res) => {
    res.json({ ok: true, plugin: 'hello-world', time: new Date().toISOString() });
  });

  // 4) An admin screen, rendered by the admin shell at /admin/plugin/hello-world/greeting
  addAdminPage({
    id: 'greeting',
    title: 'Hello World',
    html: '<div class="card p-5"><h3 class="text-sm font-semibold mb-2">Hello World</h3>' +
      '<p class="text-sm text-gray-600">This screen is served by the <code>hello-world</code> plugin through ' +
      '<code>addAdminPage()</code>; its greeting banner is applied to every post by a ' +
      '<code>post_content</code> filter.</p></div>',
  });

  // 5) A block for the visual editor
  addEditorBlock({
    id: 'hello-banner',
    label: 'Hello banner',
    category: 'Content',
    content: '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;text-align:center;">' +
      '<p style="margin:0;font-size:16px;">\u{1F44B} Hello from the hello-world plugin!</p></div>',
  });
}

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
