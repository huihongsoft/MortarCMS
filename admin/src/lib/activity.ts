import { t } from './i18n';

// Turn audit actions like "PUT /api/posts/abc123" or "login" into
// human-readable descriptions ("更新文章"). Unknown routes keep the raw
// string so no audit detail is ever lost.
export function describeActivity(action: string, lang?: string): string {
  if (!action) return '';
  const parts = action.trim().split(/\s+/);
  const method = parts[0]?.toUpperCase() || '';
  const path = parts[1] || '';
  if (method === 'LOGIN' || action === 'login') return t('login', lang);
  const verb = method === 'POST' ? t('create', lang)
    : method === 'PUT' ? t('update', lang)
    : method === 'DELETE' ? t('delete', lang)
    : method === 'GET' ? t('view', lang) : '';
  const m = path.match(/^\/api\/([a-z-]+)/);
  const resource = m ? m[1] : '';
  const names: Record<string, string> = {
    posts: t('posts', lang), pages: t('pages', lang), categories: t('category', lang), tags: t('tags', lang),
    comments: t('comments', lang), media: t('media', lang), users: t('users', lang), menus: t('menus', lang),
    links: t('links', lang), settings: t('settings', lang), sites: t('sites', lang), themes: t('themes', lang),
    plugins: t('plugins', lang), roles: t('roles', lang), 'custom-post-types': t('custom post types', lang),
    db: t('database', lang), ai: t('ai', lang), activity: t('activity', lang), 'editor/templates': t('templates', lang),
  };
  if (verb && names[resource]) return verb + ' ' + names[resource];
  return action;
}
