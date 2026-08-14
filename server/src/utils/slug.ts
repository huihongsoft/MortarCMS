import db from './db';

export function getPermalinkPrefix(): string {
  const setting = (db.prepare("SELECT value FROM Setting WHERE key = 'permalink_structure'").get() as any);
  if (setting) return setting.value.replace('%slug%', '');
  return '/post/';
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
