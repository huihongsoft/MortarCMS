import db from './db';

// Permalink structure — the URL shape posts are published under.
//
// Only the PREFIX is configurable: `/post/%slug%` (default), `/blog/%slug%`,
// `/p/%slug%`… `%slug%` must appear exactly once and come last. The scope is
// narrow for two reasons:
//   * a root-level structure (`/%slug%`) puts post slugs in the same namespace as
//     the app's own routes, so a post slugged "search" would be shadowed, and an
//     existing slug could become unreachable the moment the setting changes;
//   * `/%category%/%slug%/` needs a resolution order neither the frontend router
//     nor the crawler route table has.
// Both are refused with a reason instead of silently half-working.
const DEFAULT_PREFIX = '/post/';
const SLUG_TOKEN = '%slug%';

// First path segment that would collide with an app route or a reserved path.
// 'page' and 'type' are here because the frontend routes them to their own views
// (/page/:slug serves a real page, /type/:slug a custom post type), so a post
// prefix of /page/ would make one of the two unreachable.
const RESERVED_PREFIXES = new Set([
  'category', 'tag', 'archive', 'author', 'search', 'links', 'login', 'register',
  'profile', 'my-posts', 'submit-post', 'newsletter', 'admin', 'api', 'uploads',
  'share', 'install', 'assets', 'page', 'type',
]);

// Longest usable prefix. Purely a sanity bound: a stored value that is not a
// path anyone would type, and that would otherwise sit in every generated link.
const MAX_PREFIX_LENGTH = 120;

// Normalized structure, or null when the input cannot be used.
export function normalizePermalinkStructure(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (s.length > MAX_PREFIX_LENGTH) return null;
  if (!s.startsWith('/') || s.includes('//') || s.includes('..')) return null;
  const tokens = s.split(SLUG_TOKEN).length - 1;
  if (tokens !== 1 || !s.endsWith(SLUG_TOKEN)) return null;
  const prefix = s.slice(0, -SLUG_TOKEN.length);
  if (!prefix.endsWith('/')) return null;
  if (!/^\/[a-z0-9_\-/]*$/.test(prefix)) return null;
  const segments = prefix.split('/').filter(Boolean);
  if (segments.length === 0) return null;                     // root-level: refused
  if (RESERVED_PREFIXES.has(segments[0])) return null;        // collides with a route
  return '/' + segments.join('/') + '/' + SLUG_TOKEN;
}

// The stored structure in normalized form ('/blog/%slug%'), or null when it is
// unset or unusable. This is the form the frontend normalizes too, so it is what
// the shell carries for the client (see injectSeoMeta).
export function getPermalinkStructure(): string | null {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'permalink_structure'").get() as any;
    return normalizePermalinkStructure(row?.value);
  } catch {
    return null; // not installed yet
  }
}

// The prefix every post URL is built from, always ending in '/'.
export function getPermalinkPrefix(): string {
  const structure = getPermalinkStructure();
  return structure ? structure.slice(0, -SLUG_TOKEN.length) : DEFAULT_PREFIX;
}

// Public URL path for a post. Slugs are used verbatim (they may be CJK) — every
// existing link in the app is built that way, so encoding here would change the
// URLs of already-published posts.
//
// `prefix` lets a loop that builds many URLs read the setting once instead of
// once per row (getPermalinkPrefix reads the Setting table, which is a round trip
// on the MySQL/Postgres drivers). Callers with a single slug omit it.
export function postUrl(slug: unknown, prefix: string = getPermalinkPrefix()): string {
  return prefix + String(slug ?? '');
}

// Why a structure was refused, for the settings UI.
export function permalinkStructureError(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s || normalizePermalinkStructure(s)) return null; // empty = keep the default
  // The token rule comes first: for a string with no %slug% at all, "too long" or
  // "bad characters" describes the wrong problem.
  if (s.split(SLUG_TOKEN).length - 1 !== 1 || !s.endsWith(SLUG_TOKEN)) {
    return '必须且只能包含一次 %slug%，并以其结尾（例如 /post/%slug%）';
  }
  if (!s.startsWith('/') || s.includes('//') || s.includes('..')) return '必须以 / 开头，且不能包含连续的 / 或 ..';
  if (!/^\/[a-z0-9_\-/]*%slug%$/.test(s)) return '只能使用小写字母、数字、- 和 /';
  if (s.length > MAX_PREFIX_LENGTH) return '固定链接结构过长（最多 ' + MAX_PREFIX_LENGTH + ' 个字符）';
  // The %slug% token needs a '/' in front of it, or the prefix and the slug run
  // together (/blog%slug% would produce /bloghello-world). Called out explicitly:
  // the generic fallback gave no clue which part was wrong.
  if (!s.slice(0, -SLUG_TOKEN.length).endsWith('/')) return '前缀必须以 / 结尾（例如 /blog/%slug%）';
  const segments = s.slice(0, -SLUG_TOKEN.length).split('/').filter(Boolean);
  if (segments.length === 0) return '不支持把文章放在根路径（会与应用自身路由冲突），请使用 /post/%slug% 这样的前缀';
  if (RESERVED_PREFIXES.has(segments[0])) return '前缀「' + segments[0] + '」会与应用自身路由冲突，请换一个';
  return '固定链接结构无效';
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    // Keep CJK characters — a pure-Chinese name must not produce an empty
    // slug (that broke tag/category links with 404s).
    .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function uniqueSlug(text: string, existing: string[]): string {
  const slug = slugify(text);
  if (!existing.includes(slug)) return slug;
  let i = 2;
  while (existing.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
