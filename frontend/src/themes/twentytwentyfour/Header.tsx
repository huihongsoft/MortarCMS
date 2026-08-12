import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// WordPress Twenty Twenty-Four style header: minimal, generous whitespace
export default function TTHeader({ settings }: { settings: Record<string, string> }) {
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

  return React.createElement('header', { className: 'bg-white border-b border-gray-100' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-6 h-20 flex items-center justify-between' },
      React.createElement(Link, { to: '/', className: 'text-2xl font-bold tracking-tight text-gray-900' }, settings.site_title || 'Mortar'),
      React.createElement('div', { className: 'hidden md:flex items-center gap-8' },
        React.createElement(Link, { to: '/', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900' }, item.label)),
        React.createElement('div', { className: 'flex items-center gap-5' },
          currentUser
            ? React.createElement(React.Fragment, null,
                React.createElement('span', { className: 'text-sm text-gray-600' }, currentUser.username),
                React.createElement('button', { onClick: logout, className: 'text-sm text-gray-400 hover:text-gray-600' }, t('logout')))
            : React.createElement(React.Fragment, null,
                React.createElement(Link, { to: '/login', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('sign in')),
                React.createElement(Link, { to: '/register', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('register', settings))),
          React.createElement('a', { href: '/admin', className: 'px-4 py-1.5 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700' }, t('admin', settings)),
        )
      ),
      React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden p-2 text-gray-600', 'aria-label': t('toggle menu', settings), 'aria-expanded': menuOpen, 'aria-controls': 'mobile-nav' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
    ),
    menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 px-6 py-4 space-y-3' },
      React.createElement(Link, { to: '/', className: 'block text-sm text-gray-600' }, t('home', settings)),
      menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
        React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-600' }, item.label)),
      currentUser
        ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400' }, t('logout'))
        : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-600' }, t('sign in')),
      React.createElement(Link, { to: '/register', className: 'block text-sm text-gray-600' }, t('register', settings)),
      React.createElement('a', { href: '/admin', className: 'block text-sm text-gray-900 font-medium' }, t('admin', settings)),
    )
  );
}
