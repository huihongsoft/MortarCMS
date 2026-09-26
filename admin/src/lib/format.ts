import { getLang } from './i18n';

// Dates and numbers formatted for the admin's own language.
//
// `new Date(x).toLocaleString()` formats in the *environment's* locale, which is
// the browser's — so the same timestamp read differently on two machines, and the
// admin's language toggle did not affect it. Every user-facing date goes through
// here so the choice is made once, from getLang().

const locale = (): string => (getLang() === 'zh' ? 'zh-CN' : 'en-US');

// SQLite CURRENT_TIMESTAMP writes 'YYYY-MM-DD HH:MM:SS' with no timezone marker;
// JS would read it as local time and shift it by the offset.
function toDate(value: unknown): Date | null {
  const s = String(value ?? '');
  if (!s) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(s) ? s.replace(' ', 'T') + 'Z' : s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date + time, for a log line or a "last run" column. */
export function formatDateTime(value: unknown): string {
  const d = toDate(value);
  return d ? d.toLocaleString(locale()) : '';
}

/** Date only. */
export function formatDate(value: unknown): string {
  const d = toDate(value);
  return d ? d.toLocaleDateString(locale()) : '';
}

/** Thousands separators, for counters. */
export function formatNumber(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString(locale()) : '0';
}
