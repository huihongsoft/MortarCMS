// Single source of truth for "may this account use this screen".
//
// The server is the real gate (every route answers 403/401); this table only
// decides what the UI offers, so the sidebar, the route guard and the in-page
// buttons cannot drift apart. Each rule mirrors the guard on the endpoints the
// screen actually calls — keep them in step when a route's guard changes.
//
//   cap   — a capability the caller must hold (see server/src/routes/roles.ts)
//   roles — an allow-list of role names, for screens whose routes are still
//           guarded by role rather than capability
//
// An empty rule means "any signed-in account".

export interface AccessRule {
  cap?: string;
  roles?: string[];
}

// Longest path first matters when matching prefixes (e.g. /posts/new).
export const ROUTE_ACCESS: Record<string, AccessRule> = {
  '/': { cap: 'manage_options' },            // the dashboard is stats-driven
  '/posts': { cap: 'edit_posts' },
  '/posts/new': { cap: 'edit_posts' },
  '/calendar': { cap: 'edit_posts' },        // calls /posts/admin
  '/broken-links': { cap: 'manage_security' },
  '/pages': { cap: 'edit_pages' },
  '/pages/new': { cap: 'edit_pages' },
  '/media': { cap: 'upload_files' },
  '/comments': { cap: 'moderate_comments' },
  '/categories': { cap: 'manage_categories' },
  '/tags': { cap: 'manage_tags' },
  '/links': { cap: 'manage_links' },
  '/forms': { cap: 'manage_forms' },
  // Subscriber management exposes the whole mailing list (PII), so it needs the
  // superuser capability — manage_options is held by editors too.
  '/subscribers': { cap: 'manage_system' },
  '/appearance': { cap: 'manage_themes' },
  '/menus': { cap: 'manage_menus' },
  // Widgets and the home-page editor both save through PUT /settings.
  '/widgets': { cap: 'manage_system' },
  '/post-types': { cap: 'manage_system' },
  '/ai': { cap: 'ai_use' },
  '/ai/bindings': { cap: 'ai_bindings' },
  '/ai/settings': { cap: 'ai_manage' },
  '/profile': {},
  '/users': { cap: 'manage_users' },
  '/roles': { cap: 'manage_roles' },
  '/plugins': { cap: 'manage_plugins' },
  // The screen manages sites (create/remove); the post editor's dropdown calls
  // GET /sites directly and is gated by view_sites server-side, which is why an
  // editor can use the dropdown without being able to open this screen.
  '/sites': { cap: 'manage_sites' },
  '/import': { cap: 'import' },
  '/security': { cap: 'manage_security' },
  // Login attempts carry addresses and source IPs, so this stays with the
  // superuser screens rather than with manage_security (which editors hold).
  '/login-audit': { cap: 'manage_system' },
  '/sysinfo': { cap: 'manage_system' },
  '/stats': { cap: 'manage_options' },
  '/hooks': { cap: 'view_system_info' },
  '/api-docs': { roles: ['admin'] },
  '/activity': { cap: 'manage_system' },
  '/webhooks': { cap: 'manage_system' },
  '/settings': { cap: 'manage_system' },
  '/home-editor': { cap: 'manage_system' },      // reached from Settings → Reading
  '/plugin': { cap: 'manage_plugins' },          // plugin-provided screens
};

export interface AccessUser {
  role?: string;
  capabilities?: string[];
}

/** Rule for a path: exact match, then the longest matching prefix. */
export function accessFor(path: string): AccessRule {
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  if (ROUTE_ACCESS[clean]) return ROUTE_ACCESS[clean];
  let best = '';
  for (const key of Object.keys(ROUTE_ACCESS)) {
    if (key === '/') continue;
    if (clean === key || clean.startsWith(key + '/')) {
      if (key.length > best.length) best = key;
    }
  }
  return best ? ROUTE_ACCESS[best] : {};
}

export function allowed(user: AccessUser | null | undefined, rule: AccessRule, can: (cap: string) => boolean): boolean {
  if (!user) return false;
  if (rule.roles && !(user.role === 'admin' || rule.roles.includes(user.role || ''))) return false;
  if (rule.cap && !can(rule.cap)) return false;
  return true;
}

export function canOpen(user: AccessUser | null | undefined, can: (cap: string) => boolean, path: string): boolean {
  return allowed(user, accessFor(path), can);
}

/** The first screen this account can actually use — used to land them somewhere
 *  sensible instead of on a "no permission" page after login. */
export function firstAllowedPath(user: AccessUser | null | undefined, can: (cap: string) => boolean): string {
  for (const path of ['/', '/posts', '/media', '/comments', '/profile']) {
    if (canOpen(user, can, path)) return path;
  }
  return '/profile';
}
