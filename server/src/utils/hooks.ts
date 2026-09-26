// Simple hook system (actions + filters) with priorities and source tracking.
// Listeners with lower priority numbers run first (plugin/theme convention).
type HookFn = (...args: any[]) => any;

export interface HookListener {
  fn: HookFn;
  priority: number;
  source: string; // where it was registered: 'core', plugin name, or theme
}

const actions: Record<string, HookListener[]> = {};
const filters: Record<string, HookListener[]> = {};

function push(list: Record<string, HookListener[]>, hook: string, entry: HookListener): void {
  if (!list[hook]) list[hook] = [];
  list[hook].push(entry);
  list[hook].sort((a, b) => a.priority - b.priority);
}

// While a plugin's register() runs, everything it registers belongs to that
// plugin. Without this the bundled plugins all registered with the default
// source 'core': the hooks browser showed them as core listeners and
// removeAllHooks() could not reset them (it keeps anything labelled core).
let registeringSource: string | null = null;

export function withHookSource<T>(source: string, fn: () => T): T {
  const prev = registeringSource;
  registeringSource = source;
  try { return fn(); } finally { registeringSource = prev; }
}

export function addAction(hook: string, fn: HookFn, priority = 10, source?: string): void {
  push(actions, hook, { fn, priority, source: source || registeringSource || 'core' });
}

export function addFilter(hook: string, fn: HookFn, priority = 10, source?: string): void {
  push(filters, hook, { fn, priority, source: source || registeringSource || 'core' });
}

// Remove one listener by reference, or all listeners on the hook when fn is omitted
export function removeAction(hook: string, fn?: HookFn): void {
  if (!actions[hook]) return;
  actions[hook] = fn ? actions[hook].filter(l => l.fn !== fn) : [];
}

export function removeFilter(hook: string, fn?: HookFn): void {
  if (!filters[hook]) return;
  filters[hook] = fn ? filters[hook].filter(l => l.fn !== fn) : [];
}

// Reset a hook to its canonical state: drop every dynamic (plugin/admin)
// listener but keep core registrations so built-in behavior stays intact.
export function removeAllHooks(hook: string): void {
  if (actions[hook]) actions[hook] = actions[hook].filter(l => l.source === 'core');
  if (filters[hook]) filters[hook] = filters[hook].filter(l => l.source === 'core');
}

// Drop every listener a plugin registered. Deactivating a plugin used to leave
// its hooks running (nothing removed them), and re-activating ran register()
// again on top — the banner/listener then appeared twice per toggle.
export function removeHooksBySource(source: string): number {
  let removed = 0;
  for (const map of [actions, filters]) {
    for (const hook of Object.keys(map)) {
      const before = map[hook].length;
      map[hook] = map[hook].filter(l => l.source !== source);
      removed += before - map[hook].length;
    }
  }
  return removed;
}

export function hasAction(hook: string): boolean { return (actions[hook] || []).length > 0; }
export function hasFilter(hook: string): boolean { return (filters[hook] || []).length > 0; }

// Depth guard: a listener that re-triggers the same hook (directly or via a
// filter chain) would otherwise recurse forever. Listeners run against a
// snapshot so ones registered mid-dispatch don't fire in the same pass.
const MAX_HOOK_DEPTH = 25;
let hookDepth = 0;

function runListeners(list: HookListener[], args: any[], apply: (l: HookListener) => any): void {
  if (hookDepth >= MAX_HOOK_DEPTH) { console.error('[Hooks] recursion depth exceeded'); return; }
  hookDepth++;
  try {
    for (const l of [...list]) {
      try { apply(l); } catch (e) { console.error('[Hooks] listener error:', e); }
    }
  } finally { hookDepth--; }
}

export function doAction(hook: string, ...args: any[]): void {
  runListeners(actions[hook] || [], args, l => l.fn(...args));
}

export function applyFilters(hook: string, value: any, ...args: any[]): any {
  const list = filters[hook] || [];
  runListeners(list, args, l => { value = l.fn(value, ...args); });
  return value;
}

// Canonical hooks exposed by the core (reference list for the browser UI)
export const KNOWN_ACTIONS = [
  'init', 'post_created', 'post_updated', 'post_published', 'post_restored', 'delete_post',
  'comment_added', 'comment_approved', 'comment_spam', 'delete_comment',
  'user_register', 'user_updated', 'user_deleted', 'media_uploaded', 'media_updated', 'media_deleted',
  'form_submitted', 'post_submitted', 'site_reset', 'settings_saved',
  'menu_saved', 'menu_deleted', 'theme_activated', 'theme_deactivated',
  'plugin_activated', 'plugin_deactivated', 'task_run',
  'user_login', 'login_failed', 'backup_completed',
];
export const KNOWN_FILTERS = ['post_content', 'comment_validate'];

export interface HookInfo {
  name: string;
  canonical: boolean;
  listeners: { source: string; priority: number }[];
}

export function listHooks(): { actions: HookInfo[]; filters: HookInfo[] } {
  const collect = (map: Record<string, HookListener[]>, known: string[]): HookInfo[] => {
    const names = [...new Set([...known, ...Object.keys(map)])];
    return names.map(name => ({
      name,
      canonical: known.includes(name),
      listeners: (map[name] || []).map(l => ({ source: l.source, priority: l.priority })),
    }));
  };
  return { actions: collect(actions, KNOWN_ACTIONS), filters: collect(filters, KNOWN_FILTERS) };
}

// Built-in hooks
import db from './db';

addAction('init', () => { console.log('[Hook] System initialized'); });

addFilter('post_content', (content: string) => {
  return content; // Plugins can modify post content here
});

addAction('post_published', (postId: string) => {
  console.log('[Hook] Post published: ' + postId);
});

addAction('post_created', (postId: string, status: string) => {
  // Plugins can hook post creation here
});

addAction('post_updated', (postId: string) => {
  // Plugins can hook post updates here
});

addAction('comment_added', (commentId: string) => {
  console.log('[Hook] New comment: ' + commentId);
});
