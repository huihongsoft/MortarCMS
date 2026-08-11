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

export function addAction(hook: string, fn: HookFn, priority = 10, source = 'core'): void {
  push(actions, hook, { fn, priority, source });
}

export function addFilter(hook: string, fn: HookFn, priority = 10, source = 'core'): void {
  push(filters, hook, { fn, priority, source });
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

export function removeAllHooks(hook: string): void {
  delete actions[hook];
  delete filters[hook];
}

export function hasAction(hook: string): boolean { return (actions[hook] || []).length > 0; }
export function hasFilter(hook: string): boolean { return (filters[hook] || []).length > 0; }

export function doAction(hook: string, ...args: any[]): void {
  (actions[hook] || []).forEach(l => l.fn(...args));
}

export function applyFilters(hook: string, value: any, ...args: any[]): any {
  (filters[hook] || []).forEach(l => { value = l.fn(value, ...args); });
  return value;
}

// Canonical hooks exposed by the core (reference list for the browser UI)
export const KNOWN_ACTIONS = [
  'init', 'post_created', 'post_updated', 'post_published', 'delete_post',
  'comment_added', 'comment_approved', 'comment_spam', 'delete_comment',
  'user_register',
];
export const KNOWN_FILTERS = ['post_content'];

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
