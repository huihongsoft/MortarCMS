import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Files, Image, MessageSquare, Users, UserCircle, Settings, Menu, Palette, Shapes, Server as ServerIcon, UploadCloud, Puzzle, Network, FolderTree, Tag as TagIcon, Link2, ShieldCheck, ShieldAlert, Bot, Cpu, MessageCircle, Workflow, Code, History, Layers, BarChart3, Webhook, ClipboardList, Mail, CalendarDays, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import CommentBadge from './CommentBadge';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import { canOpen } from '../lib/access';

const groups: { title: string; items: { to: string; icon: any; label: string; devModeOnly?: boolean }[] }[] = [
  {
    title: t('dashboard', getLang()),
    items: [
      { to: '/', icon: LayoutDashboard, label: t('dashboard', getLang()) },
    ],
  },
  {
    title: t('content', getLang()),
    items: [
      { to: '/posts', icon: FileText, label: t('posts', getLang()) },
      { to: '/calendar', icon: CalendarDays, label: t('calendar', getLang()) },
      { to: '/broken-links', icon: Link2, label: t('broken links', getLang()) },
      { to: '/pages', icon: Files, label: t('pages', getLang()) },
      { to: '/media', icon: Image, label: t('media', getLang()) },
      { to: '/comments', icon: MessageSquare, label: t('comments', getLang()) },
      { to: '/review', icon: ClipboardCheck, label: t('review queue', getLang()) },
      { to: '/redirects', icon: ArrowRightLeft, label: t('redirects', getLang()) },
      { to: '/categories', icon: FolderTree, label: t('categories', getLang()) },
      { to: '/tags', icon: TagIcon, label: t('tags', getLang()) },
      { to: '/links', icon: Link2, label: t('links', getLang()) },
      { to: '/forms', icon: ClipboardList, label: t('forms', getLang()) },
      // Subscriber management is admin-only on the server (it exposes the whole
      // mailing list), so keep the nav entry in step.
      { to: '/subscribers', icon: Mail, label: t('subscribers', getLang()) },
    ],
  },
  {
    title: t('appearance', getLang()),
    items: [
      { to: '/appearance', icon: Palette, label: t('appearance', getLang()) },
      { to: '/menus', icon: Menu, label: t('menus', getLang()) },
      { to: '/widgets', icon: Shapes, label: t('widgets', getLang()) },
      { to: '/post-types', icon: Layers, label: t('custom post types', getLang()) },
    ],
  },
  {
    title: t('ai assistant', getLang()),
    items: [
      { to: '/ai', icon: Bot, label: t('ai chat', getLang()) },
      { to: '/ai/bindings', icon: MessageCircle, label: t('ai bindings', getLang()) },
      { to: '/ai/settings', icon: Cpu, label: t('ai settings', getLang()) },
    ],
  },
  {
    title: t('system', getLang()),
    items: [
      // No role: every logged-in user has a profile (own bio/avatar, password,
      // 2FA, application passwords) — the user table below is admin-only.
      { to: '/profile', icon: UserCircle, label: t('my profile', getLang()) },
      { to: '/users', icon: Users, label: t('users', getLang()) },
      { to: '/roles', icon: ShieldCheck, label: t('roles & permissions', getLang()) },
      { to: '/plugins', icon: Puzzle, label: t('plugins', getLang()) },
      { to: '/sites', icon: Network, label: t('sites', getLang()) },
      { to: '/import', icon: UploadCloud, label: t('import', getLang()) },
      { to: '/security', icon: ShieldCheck, label: t('security audit', getLang()) },
      // Always visible (not developer-mode only): a failed-login burst is
      // something an operator needs to see without knowing a hidden toggle.
      { to: '/login-audit', icon: ShieldAlert, label: t('login audit', getLang()) },
      { to: '/system-tasks', icon: Workflow, label: t('scheduled tasks', getLang()) },
      { to: '/sysinfo', icon: ServerIcon, label: t('system', getLang()), devModeOnly: true },
      { to: '/stats', icon: BarChart3, label: t('visit stats', getLang()) },
      { to: '/hooks', icon: Workflow, label: t('hooks browser', getLang()), devModeOnly: true },
      { to: '/api-docs', icon: Code, label: t('api docs & test center', getLang()), devModeOnly: true },
      { to: '/activity', icon: History, label: t('activity log', getLang()), devModeOnly: true },
      { to: '/webhooks', icon: Webhook, label: t('webhooks', getLang()) },
      { to: '/settings', icon: Settings, label: t('settings', getLang()) },
    ],
  },
];

export default function Sidebar({ open = true, onClose }: { open?: boolean; onClose?: () => void }) {
  const { user, logout, can } = useAuth();
  // Screens registered by plugins (addAdminPage). Fetched rather than hardcoded
  // so activating a plugin adds its entry without a rebuild.
  const [pluginPages, setPluginPages] = useState<{ plugin: string; id: string; title: string; path: string }[]>([]);
  useEffect(() => {
    if (!can('manage_plugins')) return;
    const load = () => api.get('/ext/pages').then(r => setPluginPages(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    load();
    window.addEventListener('mortar-plugins-changed', load);
    return () => window.removeEventListener('mortar-plugins-changed', load);
  }, [user?.capabilities, user?.role]);
  // Diagnostic entries (activity log, API docs) only show in developer mode
  // (toggled in Settings > General)
  const [devMode, setDevMode] = useState(false);
  useEffect(() => {
    const load = () => api.get('/settings').then(r => {
      setDevMode(r.data?.dev_mode === '1');
    }).catch(() => {});
    load();
    // Refresh when settings are saved (developer mode toggle) so the menu
    // updates immediately without a page reload
    window.addEventListener('mortar-settings-saved', load);
    return () => window.removeEventListener('mortar-settings-saved', load);
  }, []);

  return React.createElement('aside', {
    className: 'sidebar w-64 bg-white dark:bg-gray-900 flex flex-col fixed left-0 top-0 bottom-9 z-30 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ' + (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'),
    'aria-label': t('admin navigation', getLang()),
  },
    // Logo row: same height (h-12) as the top admin bar on the right
    React.createElement('div', { className: 'h-12 flex items-center px-5 border-b border-gray-100 dark:border-gray-800' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-md' }, 'M'),
        React.createElement('h1', { className: 'text-sm font-bold tracking-tight text-gray-900 dark:text-white' }, 'Mortar'),
      )
    ),
    React.createElement('nav', { className: 'flex-1 px-3 py-4 overflow-y-auto' },
      groups.map(g =>
        React.createElement('div', { key: g.title, className: 'mb-4' },
          React.createElement('p', { className: 'px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500' }, g.title),
          React.createElement('div', { className: 'space-y-0.5' },
            // Visibility comes from lib/access, the same table the route guard uses.
            g.items.filter(l => (!l.devModeOnly || devMode) && canOpen(user, can, l.to)).map(link =>
              React.createElement(NavLink, {
                key: link.to,
                to: link.to,
                // Exact match for '/' and '/ai' (which has sibling routes
                // /ai/bindings + /ai/settings — prefix matching would keep
                // 'AI chat' highlighted there); other links keep prefix
                // matching so e.g. the post editor still highlights Posts
                end: link.to === '/' || link.to === '/ai',
                className: ({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`,
              // capitalize, like the page title and role in Layout: the dictionary
              // keys ARE the English copy and they are lowercase ("broken links"),
              // which read as broken labels in English mode. No effect on Chinese.
              }, React.createElement(link.icon, { size: 18 }), React.createElement('span', { className: 'capitalize' }, link.label))
            )
          )
        )
      ),
      // Plugin screens live at the bottom of the System group
      pluginPages.length > 0 && React.createElement('div', { key: 'plugin-pages', className: 'mb-4' },
        React.createElement('p', { className: 'px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500' }, t('plugins', getLang())),
        React.createElement('div', { className: 'space-y-0.5' },
          pluginPages.map(p => React.createElement(NavLink, {
            key: p.path,
            to: p.path,
            className: ({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`,
          }, React.createElement(Puzzle, { size: 18 }), React.createElement('span', { className: 'truncate' }, p.title)))
        )
      )
    )
  );
}
