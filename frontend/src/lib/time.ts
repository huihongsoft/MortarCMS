import { getSiteLang } from './i18n';

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
  const now = Date.now();
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
  return new Date(then).toLocaleDateString(zh ? 'zh-CN' : undefined);
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
