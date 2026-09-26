import { useEffect, useState } from 'react';
import { getSiteLang } from './i18n';
import { renderNow } from './ssr';

// Re-render every minute so relative times stay current without reloading.
// The first value is the server's clock when the page was rendered (see
// lib/ssr.ts): starting from Date.now() here would make the client's first
// render disagree with the server's by however long the response took.
export function useTimeTick(): number {
  const [tick, setTick] = useState(renderNow);
  useEffect(() => {
    setTick(Date.now());
    const iv = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}

/**
 * The locale to format dates and numbers with.
 *
 * Deliberately the *site's* language rather than the environment's: a date
 * formatted during render has to come out the same on the server (Node's ICU
 * default) and in the visitor's browser, or React reports a hydration mismatch
 * and re-renders the subtree — which is the flash server rendering is meant to
 * remove. The visitor's own `mortar_lang` override still wins, so a reader who
 * switched the UI language gets dates in that language too.
 */
export function localeTag(): string {
  const lang = getSiteLang();
  if (lang === 'zh') return 'zh-CN';
  return /^[a-z]{2}(-[A-Za-z0-9]{2,8})?$/.test(lang || '') ? lang : 'en-US';
}

// SQLite CURRENT_TIMESTAMP stores UTC without a timezone marker
// ('2026-08-12 04:19:49'); JS would parse it as local time and skew by the
// offset. Detect the no-timezone form and treat it as UTC.
function parseTime(dateStr: string): number {
  const s = String(dateStr || '');
  const m = s.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(m ? s.replace(' ', 'T') + 'Z' : s).getTime();
}

export function timeAgo(dateStr: string): string {
  const zh = getSiteLang() === 'zh';
  // renderNow(), not Date.now(): this runs during render (theme layouts stamp
  // every card with it), so it has to agree between the server and the client's
  // first render. See lib/ssr.ts.
  const now = renderNow();
  const then = parseTime(dateStr);
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return zh ? '刚刚' : 'just now';
  if (mins < 60) return zh ? mins + ' 分钟前' : mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return zh ? hours + ' 小时前' : hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return zh ? days + ' 天前' : days + 'd ago';
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return zh ? weeks + ' 周前' : weeks + 'w ago';
  return new Date(then).toLocaleDateString(localeTag());
}

/**
 * A date (or date+time) formatted in the site's own locale.
 *
 * Same reasoning as localeTag: `new Date(x).toLocaleDateString()` with no locale
 * uses the *environment's*, which is the server's on a server render and the
 * visitor's in the browser. Both also go through parseTime so a SQLite
 * 'YYYY-MM-DD HH:MM:SS' timestamp is not read as local time.
 */
export function formatDate(value: unknown): string {
  const ms = parseTime(String(value ?? ''));
  return Number.isFinite(ms) && ms > 0 ? new Date(ms).toLocaleDateString(localeTag()) : '';
}

export function formatDateTime(value: unknown): string {
  const ms = parseTime(String(value ?? ''));
  return Number.isFinite(ms) && ms > 0 ? new Date(ms).toLocaleString(localeTag()) : '';
}

/**
 * The current year for a copyright line.
 *
 * `new Date().getFullYear()` renders in the *environment's* timezone, so the
 * server (usually UTC) and a visitor east of it can disagree on New Year's Eve —
 * a hydration mismatch over a footer. Formatting in the site's own timezone (UTC
 * when it is not configured) makes both sides agree.
 */
export function currentYear(timeZone?: string): number {
  const now = new Date(renderNow());
  try {
    const parts = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: timeZone || 'UTC' }).formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    if (year) return year;
  } catch { /* unknown timezone name — fall through to UTC */ }
  return now.getUTCFullYear();
}

export function readingTime(content: string): string {
  const zh = getSiteLang() === 'zh';
  const text = (content || '').replace(/<[^>]*>/g, '');
  // Chinese/Japanese text has no word separators — count characters there,
  // plus latin words, so CJK articles no longer read as "1 min".
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  const latinWords = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil((cjkChars + latinWords) / 200));
  return zh ? mins + ' 分钟阅读' : mins + ' min read';
}
