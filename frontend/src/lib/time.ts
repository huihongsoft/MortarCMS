// SQLite CURRENT_TIMESTAMP stores UTC without a timezone marker
// ('2026-08-12 04:19:49'); JS would parse it as local time and skew by the
// offset. Detect the no-timezone form and treat it as UTC.
function parseTime(dateStr: string): number {
  const s = String(dateStr || '');
  const m = s.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(m ? s.replace(' ', 'T') + 'Z' : s).getTime();
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = parseTime(dateStr);
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(then).toLocaleDateString();
}

export function readingTime(content: string): string {
  const text = (content || '').replace(/<[^>]*>/g, '');
  // Chinese/Japanese text has no word separators — count characters there,
  // plus latin words, so CJK articles no longer read as "1 min".
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  const latinWords = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil((cjkChars + latinWords) / 200));
  return mins + ' min read';
}
