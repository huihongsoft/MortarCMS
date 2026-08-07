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
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function uniqueSlug(text: string, existing: string[]): string {
  let slug = slugify(text);
  if (!existing.includes(slug)) return slug;
  let i = 2;
  while (existing.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
