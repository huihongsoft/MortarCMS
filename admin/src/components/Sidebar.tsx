import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Files, Image, MessageSquare, Users, Settings, Menu, Palette, Shapes, Server as ServerIcon, UploadCloud, Puzzle, Network, FolderTree, Tag as TagIcon, Link2, ShieldCheck, Bot, Cpu, MessageCircle } from 'lucide-react';
import CommentBadge from './CommentBadge';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';

const groups: { title: string; items: { to: string; icon: any; label: string; role?: string }[] }[] = [
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
      { to: '/sysinfo', icon: ServerIcon, label: t('system', getLang()), role: 'admin' },
      { to: '/settings', icon: Settings, label: t('settings', getLang()), role: 'admin' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return React.createElement('aside', { className: 'sidebar w-64 bg-white dark:bg-gray-900 flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-gray-200 dark:border-gray-800' },
    React.createElement('div', { className: 'p-5 border-b border-gray-100 dark:border-gray-800' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md' }, 'M'),
        React.createElement('h1', { className: 'text-lg font-bold tracking-tight text-gray-900 dark:text-white' }, 'Mortar'),
      ),
      React.createElement('span', { className: 'text-gray-400 dark:text-gray-500 text-xs' }, t('admin panel', getLang()))
    ),
    React.createElement('nav', { className: 'flex-1 px-3 py-4 overflow-y-auto' },
      groups.map(g =>
        React.createElement('div', { key: g.title, className: 'mb-4' },
          React.createElement('p', { className: 'px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500' }, g.title),
          React.createElement('div', { className: 'space-y-0.5' },
            g.items.filter(l => !l.role || user?.role === 'admin' || l.role === user?.role).map(link =>
              React.createElement(NavLink, {
                key: link.to,
                to: link.to,
                end: link.to === '/',
                className: ({ isActive }: { isActive: boolean }) => `sidebar-link ${isActive ? 'active' : ''}`,
              }, React.createElement(link.icon, { size: 18 }), link.label)
            )
          )
        )
      )
    )
  );
}
