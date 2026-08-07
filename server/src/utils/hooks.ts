// Simple WordPress-like hook system
type HookFn = (...args: any[]) => void;

const actions: Record<string, HookFn[]> = {};
const filters: Record<string, HookFn[]> = {};

export function addAction(hook: string, fn: HookFn): void {
  if (!actions[hook]) actions[hook] = [];
  actions[hook].push(fn);
}

export function doAction(hook: string, ...args: any[]): void {
  (actions[hook] || []).forEach(fn => fn(...args));
}

export function addFilter(hook: string, fn: HookFn): void {
  if (!filters[hook]) filters[hook] = [];
  filters[hook].push(fn);
}

export function applyFilters(hook: string, value: any, ...args: any[]): any {
  (filters[hook] || []).forEach(fn => { value = fn(value, ...args); });
  return value;
}

// Canonical hooks exposed by the core (WordPress-style reference list)
export const KNOWN_ACTIONS = [
  'init', 'post_created', 'post_updated', 'post_published', 'delete_post',
  'comment_added', 'comment_approved', 'comment_spam', 'delete_comment',
  'user_register',
];
export const KNOWN_FILTERS = ['post_content'];

export function listHooks(): { actions: string[]; filters: string[] } {
  return {
    actions: [...new Set([...KNOWN_ACTIONS, ...Object.keys(actions)])],
    filters: [...new Set([...KNOWN_FILTERS, ...Object.keys(filters)])],
  };
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
