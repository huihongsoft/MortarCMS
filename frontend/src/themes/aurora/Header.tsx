import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Aurora header: glassy, minimal — logo left, primary menu right
export default function Header({ settings }: { settings: Record<string, string> }) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.get('/menus/location/primary').then(r => setMenuItems(r.data.items || [])).catch(() => {});
    if (localStorage.getItem('mortar_token')) {
      api.get('/auth/me').then(r => setCurrentUser(r.data)).catch(() => localStorage.removeItem('mortar_token'));
    }
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function logout() {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('mortar_token');
    window.location.href = '/';
  }

  const childrenOf = (parentId: string | null) =>
    menuItems.filter((i: any) => (i.parentId || null) === parentId && !(i.url === '/' && (i.label.toLowerCase() === 'home' || i.label === t('home', settings))));

  const renderItem = (item: any) => {
    const kids = childrenOf(item.id);
    if (kids.length === 0) {
      return React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900 transition-colors' }, item.label);
    }
    return React.createElement('div', { key: item.id, className: 'relative group' },
      React.createElement(Link, { to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors' }, item.label, React.createElement('span', { className: 'text-xs' }, '\u25be')),
      React.createElement('div', { className: 'absolute left-0 top-full pt-2 hidden group-hover:block z-50' },
        React.createElement('div', { className: 'bg-white/95 backdrop-blur border border-gray-100 rounded-xl shadow-xl shadow-gray-900/5 py-1.5 min-w-[170px]' },
          kids.map(k => React.createElement(Link, { key: k.id, to: k.url, className: 'block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900' }, k.label)))));
  };

  return React.createElement('header', {
    className: 'sticky top-0 z-40 transition-all duration-300 ' + (scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-900/[0.06] shadow-sm shadow-gray-900/[0.03]' : 'bg-transparent border-b border-transparent'),
  },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-6 h-16 flex items-center justify-between' },
      React.createElement(Link, { to: '/', className: 'flex items-center gap-2 group' },
        React.createElement('span', { className: 'w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110' }),
        React.createElement('span', { className: 'text-lg font-semibold tracking-tight text-gray-900' }, settings.site_title || 'Mortar'),
      ),
      React.createElement('nav', { className: 'hidden md:flex items-center gap-8' },
        childrenOf(null).map(renderItem),
        currentUser
          ? React.createElement('div', { className: 'flex items-center gap-4' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, currentUser.username),
              React.createElement('button', { onClick: logout, className: 'text-sm text-gray-400 hover:text-gray-700 transition-colors' }, t('logout', settings)),
            )
          : React.createElement(React.Fragment, null,
              settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/login', className: 'text-sm text-gray-600 hover:text-gray-900 transition-colors' }, t('sign in', settings)),
            ),
        settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/admin', className: 'px-4 py-2 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors' }, t('admin', settings)),
      ),
      React.createElement('button', {
        onClick: () => setMenuOpen(!menuOpen),
        className: 'md:hidden p-2 -mr-2 text-gray-600',
        'aria-label': t('toggle menu', settings),
        'aria-expanded': menuOpen,
      }, React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, menuOpen ? React.createElement('path', { d: 'M6 6l12 12M18 6L6 18' }) : React.createElement('path', { d: 'M4 7h16M4 12h16M4 17h16' }))),
    ),
    menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 bg-white/95 backdrop-blur px-6 py-4 space-y-1' },
      React.createElement(Link, { to: '/', className: 'block text-sm text-gray-700 py-2', onClick: () => setMenuOpen(false) }, t('home', settings)),
      (() => {
        const rows: any[] = [];
        const walk = (parentId: string | null, depth: number) => {
          menuItems.filter((i: any) => (i.parentId || null) === parentId && !(i.url === '/' && (i.label.toLowerCase() === 'home' || i.label === t('home', settings))))
            .forEach((item: any) => {
              rows.push(React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-700 py-2', style: { paddingLeft: 8 + depth * 14 }, onClick: () => setMenuOpen(false) }, item.label));
              walk(item.id, depth + 1);
            });
        };
        walk(null, 0);
        return rows;
      })(),
      currentUser
        ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-500 py-2' }, t('logout', settings))
        : settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-700 py-2', onClick: () => setMenuOpen(false) }, t('sign in', settings)),
      settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/admin', className: 'block text-sm font-medium text-gray-900 py-2', onClick: () => setMenuOpen(false) }, t('admin', settings)),
    ),
  );
}
