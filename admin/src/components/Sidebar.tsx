import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Files, Image, MessageSquare, Users, Settings, Menu, Palette, Shapes, Server as ServerIcon, UploadCloud, Puzzle, Network, FolderTree, Tag as TagIcon, Link2, ShieldCheck, Bot, Cpu, MessageCircle, Workflow, Code, History, Layers, BarChart3 } from 'lucide-react';
import CommentBadge from './CommentBadge';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';

const groups: { title: string; items: { to: string; icon: any; label: string; role?: string; devModeOnly?: boolean }[] }[] = [
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
      { to: '/pages', icon: Files, label: t('pages', getLang()) },
      { to: '/media', icon: Image, label: t('media', getLang()) },
      { to: '/comments', icon: MessageSquare, label: t('comments', getLang()) },
      { to: '/categories', icon: FolderTree, label: t('categories', getLang()) },
      { to: '/tags', icon: TagIcon, label: t('tags', getLang()) },
      { to: '/links', icon: Link2, label: t('links', getLang()) },
    ],
  },
  {
    title: t('appearance', getLang()),
    items: [
      { to: '/appearance', icon: Palette, label: t('appearance', getLang()) },
      { to: '/menus', icon: Menu, label: t('menus', getLang()) },
      { to: '/widgets', icon: Shapes, label: t('widgets', getLang()) },
      { to: '/post-types', icon: Layers, label: t('custom post types', getLang()), role: 'admin' },
    ],
  },
  {
    title: t('ai assistant', getLang()),
    items: [
      { to: '/ai', icon: Bot, label: t('ai chat', getLang()) },
      { to: '/ai/bindings', icon: MessageCircle, label: t('ai bindings', getLang()) },
      { to: '/ai/settings', icon: Cpu, label: t('ai settings', getLang()), role: 'admin' },
    ],
  },
  {
    title: t('system', getLang()),
    items: [
      { to: '/users', icon: Users, label: t('users', getLang()), role: 'admin' },
      { to: '/roles', icon: ShieldCheck, label: t('roles & permissions', getLang()), role: 'admin' },
      { to: '/plugins', icon: Puzzle, label: t('plugins', getLang()), role: 'admin' },
      { to: '/sites', icon: Network, label: t('sites', getLang()), role: 'admin' },
      { to: '/import', icon: UploadCloud, label: t('import', getLang()), role: 'admin' },
      { to: '/security', icon: ShieldCheck, label: t('security audit', getLang()), role: 'admin' },
      { to: '/sysinfo', icon: ServerIcon, label: t('system', getLang()), role: 'admin', devModeOnly: true },
      { to: '/stats', icon: BarChart3, label: t('visit stats', getLang()), role: 'admin' },
      { to: '/hooks', icon: Workflow, label: t('hooks browser', getLang()), role: 'admin', devModeOnly: true },
      { to: '/api-docs', icon: Code, label: t('api docs & test center', getLang()), role: 'admin', devModeOnly: true },
      { to: '/activity', icon: History, label: t('activity log', getLang()), role: 'admin', devModeOnly: true },
      { to: '/settings', icon: Settings, label: t('settings', getLang()), role: 'admin' },
    ],
  },
];

export default function Sidebar({ open = true, onClose }: { open?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth();
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
            g.items.filter(l => (!l.role || user?.role === 'admin' || l.role === user?.role) && (!l.devModeOnly || devMode)).map(link =>
              React.createElement(NavLink, {
                key: link.to,
                to: link.to,
                // Exact match for '/' and '/ai' (which has sibling routes
                // /ai/bindings + /ai/settings — prefix matching would keep
                // 'AI chat' highlighted there); other links keep prefix
                // matching so e.g. the post editor still highlights Posts
                end: link.to === '/' || link.to === '/ai',
                className: ({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`,
              }, React.createElement(link.icon, { size: 18 }), link.label)
            )
          )
        )
      )
    )
  );
}
