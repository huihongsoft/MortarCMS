import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

export default function Header({ settings }: { settings: Record<string, string> }) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.get('/menus/location/primary').then(r => setMenuItems(r.data.items || [])).catch(() => {});
    if (localStorage.getItem('mortar_token')) {
      api.get('/auth/me').then(r => setCurrentUser(r.data)).catch(() => localStorage.removeItem('mortar_token'));
    }
  }, []);

  function logout() {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('mortar_token');
    window.location.href = '/';
  }

  // Build a top-level + children tree so menu items with a parentId render
  // as hover dropdowns (multi-level navigation)
  const childrenOf = (parentId: string | null) =>
    menuItems.filter((i: any) => (i.parentId || null) === parentId && !(i.url === '/' && (i.label.toLowerCase() === 'home' || i.label === t('home', settings))));

  const renderItem = (item: any) => {
    const kids = childrenOf(item.id);
    if (kids.length === 0) {
      return React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900' }, item.label);
    }
    // Top-level item with children → hover dropdown
    return React.createElement('div', { key: item.id, className: 'relative group' },
      React.createElement(Link, { to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1' }, item.label, React.createElement('span', { className: 'text-xs' }, '\u25be')),
      React.createElement('div', { className: 'absolute left-0 top-full pt-2 hidden group-hover:block z-50' },
        React.createElement('div', { className: 'bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]' },
          kids.map(k => React.createElement(Link, { key: k.id, to: k.url, className: 'block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900' }, k.label)))));
  };

  return React.createElement('header', { className: 'bg-white border-b border-gray-200 sticky top-0 z-40' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 h-16 flex items-center justify-between' },
      React.createElement(Link, { to: '/', className: 'text-xl font-bold text-gray-900 tracking-tight' }, settings.site_title || 'Mortar'),
      React.createElement('div', { className: 'hidden md:flex items-center gap-6' },
        React.createElement(Link, { to: '/', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('home', settings)),
        childrenOf(null).map(renderItem),
        currentUser
          ? React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, currentUser.username),
              React.createElement('button', { onClick: logout, className: 'text-sm text-gray-400 hover:text-gray-600' }, t('logout')),
            )
          : React.createElement(React.Fragment, null,
              settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/login', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('sign in')),
              React.createElement(Link, { to: '/register', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('register', settings)),
            ),
        settings.frontend_show_login !== '0' && React.createElement('a', { href: '/admin', className: 'text-sm text-primary-600 hover:text-primary-700 font-medium' }, t('admin', settings))
      ),
      React.createElement('div', { className: 'flex items-center gap-3 md:hidden' },
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'p-2 text-gray-600', 'aria-label': t('toggle menu', settings), 'aria-expanded': menuOpen, 'aria-controls': 'mobile-nav' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 }))
      )
    ),
    menuOpen && React.createElement('div', { id: 'mobile-nav', className: 'md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1' },
      React.createElement(Link, { to: '/', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('home', settings)),
      (() => {
        const rows: any[] = [];
        const walk = (parentId: string | null, depth: number) => {
          menuItems.filter((i: any) => (i.parentId || null) === parentId && !(i.url === '/' && (i.label.toLowerCase() === 'home' || i.label === t('home', settings))))
            .forEach((item: any) => {
              rows.push(React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-600 py-1', style: { paddingLeft: 8 + depth * 14 }, onClick: () => setMenuOpen(false) }, item.label));
              walk(item.id, depth + 1);
            });
        };
        walk(null, 0);
        return rows;
      })(),
      currentUser
        ? React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'block text-sm text-gray-600 py-1' }, currentUser.username),
            React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout')),
          )
        : settings.frontend_show_login !== '0' && React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('sign in')),
      React.createElement(Link, { to: '/register', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('register', settings)),
      settings.frontend_show_login !== '0' && React.createElement('a', { href: '/admin', className: 'block text-sm text-primary-600 font-medium py-1' }, t('admin', settings))
    )
  );
}
