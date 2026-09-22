// Post URL shape on the client.
//
// The structure is a site setting (server/src/utils/slug.ts owns the rules and
// the validation). It is read, in order of preference, from the shell the server
// rendered for this request (a meta tag — see injectSeoMeta) and then from the
// settings fetch; every component builds post links through postPath() so a
// change of prefix moves all of them at once. Falls back to /post/ when neither
// source has a usable value.
const DEFAULT_PREFIX = '/post/';
const SLUG_TOKEN = '%slug%';
const MAX_LENGTH = 120;

// Same normalization as the server: one %slug%, ending the string, lowercase
// URL-safe segments, and a non-empty first segment that is not one of the app's
// own routes ('page' and 'type' included — they have views of their own).
const RESERVED = new Set([
  'category', 'tag', 'archive', 'author', 'search', 'links', 'login', 'register',
  'profile', 'my-posts', 'submit-post', 'newsletter', 'admin', 'api', 'uploads',
  'share', 'install', 'assets', 'page', 'type',
]);

function normalizeStructure(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s || s.length > MAX_LENGTH || !s.startsWith('/') || s.includes('//') || s.includes('..')) return null;
  if (s.split(SLUG_TOKEN).length - 1 !== 1 || !s.endsWith(SLUG_TOKEN)) return null;
  const p = s.slice(0, -SLUG_TOKEN.length);
  if (!p.endsWith('/') || !/^\/[a-z0-9_\-/]*$/.test(p)) return null;
  const segments = p.split('/').filter(Boolean);
  if (segments.length === 0 || RESERVED.has(segments[0])) return null;
  return '/' + segments.join('/') + '/';
}

// The structure the server baked into this page's shell. Reading it at module
// load is what makes a direct visit to a custom-prefix URL work on the FIRST
// render: the route table is built from this value, while the settings fetch
// that would otherwise set it resolves after the first paint — long enough for
// /blog/<slug> to render the 404 page and then swap it out.
//
// Note the ordering: everything above has to be initialized before `prefix` is
// computed. Evaluating normalizeStructure() against a later `const` (RESERVED)
// throws in its temporal dead zone, and since App.tsx imports this module at the
// top level that would take the whole bundle down.
function injectedStructure(): string | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector('meta[name="mortar-permalink"]');
  const value = el && el.getAttribute('content');
  return value ? value : null;
}

const injected = injectedStructure();
let prefix = normalizeStructure(injected) ?? DEFAULT_PREFIX;

// True when the shell already carried the structure. The settings bootstrap then
// trusts it over everything else: the shell describes the very response being
// rendered, whereas sessionStorage is a snapshot of an earlier visit and the
// settings GET may come back from the public page cache.
export function permalinkFromShell(): boolean {
  return injected !== null;
}

export function setPermalinkPrefix(structure: unknown): void {
  prefix = normalizeStructure(structure) ?? DEFAULT_PREFIX;
}

export function getPermalinkPrefix(): string {
  return prefix;
}

// Public path for a post. Slugs stay verbatim (they may be CJK), matching how
// every link was built before the prefix became configurable.
export function postPath(slug: unknown): string {
  return prefix + String(slug ?? '');
}

// react-router path for the configured prefix ('/blog/:slug'), so a direct visit
// to /blog/<slug> resolves. The legacy '/post/:slug' route stays registered too.
export function postRoutePath(): string {
  return prefix + ':slug';
}
