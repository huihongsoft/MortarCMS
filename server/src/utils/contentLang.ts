import db from './db';
import { getPermalinkPrefix } from './slug';

// Content languages.
//
// One rule drives everything: **the site's default language is served without a
// URL prefix**, and every other language gets `/<lang>/…`. That is what keeps an
// existing single-language install's URLs working when it adds a translation —
// nothing about the default language's paths changes.
//
// `Post.lang = ''` means "the default", so a row written before this feature
// existed is already correct.

/** Languages offered in the editor, from `content_langs` (comma separated). */
export function contentLangs(): string[] {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'content_langs'").get() as any;
    const list = String(row?.value || '').split(/[,\s]+/).map((l) => normalizeLang(l)).filter(Boolean) as string[];
    const def = defaultLang();
    // The default is always offered and always first.
    return [def, ...list.filter((l) => l !== def)];
  } catch {
    return [defaultLang()];
  }
}

/** The site's own language — the one served unprefixed. */
export function defaultLang(): string {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'site_lang'").get() as any;
    return normalizeLang(row?.value) || 'zh';
  } catch {
    return 'zh';
  }
}

/** A `xx` or `xx-YY` tag, or null when the input cannot be one. */
export function normalizeLang(raw: unknown): string | null {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return null;
  return /^[a-z]{2}(-[a-z0-9]{2,8})?$/.test(value) ? value : null;
}

/** True when this language is served with a prefix (i.e. it is not the default). */
export function isPrefixedLang(lang: string): boolean {
  return !!lang && lang !== defaultLang();
}

/**
 * `/<lang>` for a prefixed language, '' for the default.
 *
 * `defaultLanguage` lets a loop read the setting once instead of once per row —
 * the same reason `slug.postUrl` takes its prefix as an argument: these read the
 * Setting table, which is a round trip on the MySQL/Postgres drivers. Callers
 * building a single URL omit it.
 */
export function langPrefix(lang: string, defaultLanguage: string = defaultLang()): string {
  const l = normalizeLang(lang);
  return l && l !== defaultLanguage ? '/' + l : '';
}

/**
 * Split a leading language prefix off a public path.
 *
 * Only a segment that looks like a language *and* is not one of the app's own
 * routes is treated as one: `/en/post/x` is English, `/author/x` is the author
 * page and `/links` is the links page — both are two letters away from being
 * mistaken for a language tag, and getting that wrong would 404 real pages.
 */
const RESERVED_FIRST_SEGMENT = new Set([
  'api', 'admin', 'uploads', 'themes', 'metrics', 'assets', 'post', 'page', 'category',
  'tag', 'archive', 'author', 'search', 'links', 'login', 'register', 'profile',
  'my-posts', 'submit-post', 'newsletter', 'share', 'install', 'type', 'review',
]);

export function parseLangFromPath(rawPath: string): { lang: string; rest: string } {
  const path = '/' + String(rawPath || '').replace(/^\/+/, '');
  const m = path.match(/^\/([^/]+)(\/.*)?$/);
  if (!m) return { lang: '', rest: '/' };
  const first = m[1].toLowerCase();
  const rest = m[2] || '/';
  if (RESERVED_FIRST_SEGMENT.has(first)) return { lang: '', rest: path };
  const lang = normalizeLang(first);
  if (!lang || !isPrefixedLang(lang)) return { lang: '', rest: path };
  return { lang, rest };
}

/**
 * The language a request path asks for, and the path with the prefix removed.
 *
 * Stricter than parseLangFromPath: the prefix only counts when this site actually
 * publishes that language (`content_langs`). A single-language install therefore
 * has no prefixed URLs at all — `/en/post/x` there is an ordinary unknown path
 * and keeps answering 404 instead of becoming a real page over a language it
 * never declared.
 */
export function requestLang(rawPath: string): { lang: string; rest: string } {
  const parsed = parseLangFromPath(rawPath);
  if (!parsed.lang) return parsed;
  const path = '/' + String(rawPath || '').replace(/^\/+/, '');
  return contentLangs().includes(parsed.lang) ? parsed : { lang: '', rest: path };
}

/** The public path of a post in a given language. */
export function postPathForLang(slug: unknown, lang: unknown, prefix: string, defaultLanguage: string = defaultLang()): string {
  return langPrefix(String(lang || ''), defaultLanguage) + prefix + String(slug ?? '');
}

/** The public path of a page in a given language. */
export function pagePathForLang(slug: unknown, lang: unknown, defaultLanguage: string = defaultLang()): string {
  return langPrefix(String(lang || ''), defaultLanguage) + '/page/' + String(slug ?? '');
}

/**
 * Every published language of the same content, as public paths — including the
 * one asked about, so a caller can render a language switcher from it directly.
 * Empty when the item is not part of a translation group (the common case: a
 * single-language site never builds one).
 */
export function translationsOf(post: any): { lang: string; path: string }[] {
  if (!post?.translationGroup) return [];
  try {
    const prefix = getPermalinkPrefix();
    // Both settings are read once for the whole group, not per row (see langPrefix).
    const def = defaultLang();
    const rows = db.prepare("SELECT slug, lang, type FROM Post WHERE translationGroup = ? AND status = 'published' ORDER BY lang").all(post.translationGroup) as any[];
    return rows.map((r) => ({ lang: r.lang || def, path: r.type === 'page' ? pagePathForLang(r.slug, r.lang, def) : postPathForLang(r.slug, r.lang, prefix, def) }));
  } catch {
    return [];
  }
}
