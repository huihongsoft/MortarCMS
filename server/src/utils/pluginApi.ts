// Extension points a plugin can register from its register() call.
//
// Plugins used to be limited to hooks, shortcodes, AI tools and a settings
// schema: they could not answer an HTTP request, show a screen in the admin or
// add a block to the visual editor. These registries cover those three, and are
// attributed to the plugin that registered them (see withHookSource for hooks).
import type { RequestHandler } from 'express';

export interface PluginRoute {
  plugin: string;
  method: 'get' | 'post' | 'put' | 'delete';
  /** Path under the plugin's own namespace, e.g. 'status' or 'callback'. */
  path: string;
  handler: RequestHandler;
}

export interface PluginAdminPage {
  plugin: string;
  id: string;
  title: string;
  /** HTML rendered inside the admin shell; scripts are re-created client-side. */
  html: string;
}

export interface PluginEditorBlock {
  plugin: string;
  id: string;
  label: string;
  category?: string;
  /** Block markup, same shape as the built-in blocks. */
  content: string;
}

// The registries live on globalThis, not in module scope: plugins are loaded
// through require() (tsx/cjs) while the app itself is imported, so the two can
// resolve to different instances of this module — and then the plugin's
// registrations land in a registry the app never reads, or the plugin cannot see
// the "currently loading" plugin the manager just set.
interface ApiStore {
  routes: PluginRoute[];
  pages: PluginAdminPage[];
  blocks: PluginEditorBlock[];
  timers: { plugin: string; timer: ReturnType<typeof setInterval> }[];
  current: string | null;
}
const store: ApiStore = ((globalThis as any).__mortarPluginApi ||= { routes: [], pages: [], blocks: [], timers: [], current: null });

// Registration is only meaningful while a plugin's register() runs, so the
// manager marks which plugin is being loaded.
export function setPluginContext(name: string | null): void { store.current = name; }
export function currentPlugin(): string | null { return store.current; }

function requireContext(what: string): string {
  if (!store.current) throw new Error(what + ' may only be called from a plugin\'s register()');
  return store.current;
}

const PATH_RE = /^[A-Za-z0-9][A-Za-z0-9/_-]*$/;

export function addPluginRoute(method: PluginRoute['method'], path: string, handler: RequestHandler): void {
  const plugin = requireContext('addRoute');
  const clean = String(path || '').replace(/^\/+/, '');
  if (!PATH_RE.test(clean) || clean.includes('..')) throw new Error('Invalid plugin route path: ' + path);
  if (typeof handler !== 'function') throw new Error('addRoute needs a handler');
  const key = method.toUpperCase() + ' /' + clean;
  if (store.routes.some(r => r.plugin === plugin && r.method === method && r.path === clean)) {
    throw new Error('Route already registered: ' + key);
  }
  store.routes.push({ plugin, method, path: clean, handler });
}

export function addAdminPage(page: { id: string; title: string; html: string }): void {
  const plugin = requireContext('addAdminPage');
  const id = String(page?.id || '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('Admin page needs an id');
  if (!page?.title) throw new Error('Admin page needs a title');
  if (store.pages.some(p => p.plugin === plugin && p.id === id)) throw new Error('Admin page already registered: ' + id);
  store.pages.push({ plugin, id, title: String(page.title), html: String(page.html || '') });
}

export function addEditorBlock(block: { id: string; label: string; category?: string; content: string }): void {
  const plugin = requireContext('addEditorBlock');
  const id = String(block?.id || '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('Editor block needs an id');
  if (!block?.content) throw new Error('Editor block needs content');
  if (store.blocks.some(b => b.plugin === plugin && b.id === id)) throw new Error('Block already registered: ' + id);
  store.blocks.push({ plugin, id, label: String(block.label || id), category: block.category ? String(block.category) : undefined, content: String(block.content) });
}

// Periodic work a plugin needs (periodic scans, cleanup, digests).
//
// Plugins used to start their own setInterval from an `init` listener, which had
// two problems: deactivating the plugin left the timer running (media-cleanup
// kept deleting files), and enabling a plugin while the server was already up
// never fired `init` at all, so it silently did nothing until a restart.
// Registering the timer here binds it to the plugin's lifecycle.
export function addPluginInterval(fn: () => void, ms: number): void {
  const plugin = requireContext('addPluginInterval');
  if (typeof fn !== 'function') throw new Error('addPluginInterval needs a function');
  const every = Math.max(1000, Number(ms) || 60000);
  const timer = setInterval(() => {
    try { fn(); } catch (e: any) { console.log('[Plugins] ' + plugin + ' interval failed: ' + (e?.message || e)); }
  }, every);
  timer.unref?.();
  store.timers.push({ plugin, timer });
}

export function clearPluginIntervals(plugin: string): number {
  let cleared = 0;
  for (let i = store.timers.length - 1; i >= 0; i--) {
    if (store.timers[i].plugin !== plugin) continue;
    clearInterval(store.timers[i].timer);
    store.timers.splice(i, 1);
    cleared++;
  }
  return cleared;
}

// Dropping a plugin's registrations keeps deactivate/re-activate cycles from
// piling up duplicates (listeners are re-added when register() runs again).
export function removePluginRegistrations(plugin: string): void {
  for (const list of [store.routes, store.pages, store.blocks] as { plugin: string }[][]) {
    for (let i = list.length - 1; i >= 0; i--) if (list[i].plugin === plugin) list.splice(i, 1);
  }
}

export function listPluginRoutes(): Omit<PluginRoute, 'handler'>[] {
  return store.routes.map(({ handler, ...rest }) => { void handler; return rest; });
}

export function listAdminPages(): PluginAdminPage[] { return store.pages.slice(); }
export function listEditorBlocks(): PluginEditorBlock[] { return store.blocks.slice(); }

export function findPluginRoute(plugin: string, method: string, path: string): PluginRoute | null {
  const p = String(path || '').replace(/^\/+|\/+$/g, '');
  return store.routes.find(r => r.plugin === plugin && r.method === method.toLowerCase() && r.path === p) || null;
}

export function findAdminPage(plugin: string, id: string): PluginAdminPage | null {
  return store.pages.find(p => p.plugin === plugin && p.id === id) || null;
}
