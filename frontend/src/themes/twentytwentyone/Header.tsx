import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Twenty Twenty-One header: logo with border + nav, black on white
export default function TT1Header({ settings }: { settings: Record<string, string> }) {
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

  const showBorder = (settings.theme_show_logo_border || '1') !== '0';

  return React.createElement('header', { className: 'bg-white border-b border-gray-200' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 h-20 flex items-center justify-between' },
      React.createElement(Link, { to: '/', className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold ' + (showBorder ? 'ring-2 ring-orange-500 ring-offset-2' : '') }, 'M'),
        React.createElement('span', { className: 'text-xl font-bold tracking-tight text-gray-900' }, settings.site_title || 'Mortar'),
      ),
      React.createElement('div', { className: 'hidden md:flex items-center gap-6' },
        React.createElement(Link, { to: '/', className: 'text-sm text-gray-700 hover:text-orange-600' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-700 hover:text-orange-600' }, item.label)),
        React.createElement('div', { className: 'flex items-center gap-4' },
          currentUser
            ? React.createElement(React.Fragment, null,
                React.createElement('span', { className: 'text-sm text-gray-600' }, currentUser.username),
                React.createElement('button', { onClick: logout, className: 'text-sm text-gray-400 hover:text-gray-600' }, t('logout')))
            : React.createElement(React.Fragment, null,
                React.createElement(Link, { to: '/login', className: 'text-sm text-gray-700 hover:text-orange-600' }, t('sign in')),
                React.createElement(Link, { to: '/register', className: 'text-sm text-gray-700 hover:text-orange-600' }, t('register', settings))),
          React.createElement('a', { href: '/admin', className: 'text-sm text-white bg-orange-600 hover:bg-orange-500 px-4 py-1.5 rounded-full' }, t('admin', settings)),
        )
      ),
      React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden p-2 text-gray-600', 'aria-label': t('toggle menu', settings), 'aria-expanded': menuOpen, 'aria-controls': 'mobile-nav' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
    ),
    menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 px-4 py-3 space-y-2' },
      React.createElement(Link, { to: '/', className: 'block text-sm text-gray-700 py-1' }, t('home', settings)),
      menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
        React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-700 py-1' }, item.label)),
      currentUser ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout'))
        : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-700 py-1' }, t('sign in')),
      React.createElement('a', { href: '/admin', className: 'block text-sm text-orange-600 font-medium py-1' }, t('admin', settings)),
    )
  );
}
