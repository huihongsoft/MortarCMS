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

  
  return React.createElement('header', { className: 'bg-white border-b border-gray-200 sticky top-0 z-40' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 h-16 flex items-center justify-between' },
      React.createElement(Link, { to: '/', className: 'text-xl font-bold text-gray-900 tracking-tight' }, settings.site_title || 'Mortar'),
      React.createElement('div', { className: 'hidden md:flex items-center gap-6' },
        React.createElement(Link, { to: '/', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) => React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-600 hover:text-gray-900' }, item.label)),
        currentUser
          ? React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, currentUser.username),
              React.createElement('button', { onClick: logout, className: 'text-sm text-gray-400 hover:text-gray-600' }, t('logout')),
            )
          : React.createElement(React.Fragment, null,
              React.createElement(Link, { to: '/login', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('sign in')),
              React.createElement(Link, { to: '/register', className: 'text-sm text-gray-600 hover:text-gray-900' }, t('register', settings)),
            ),
        React.createElement('a', { href: '/admin', className: 'text-sm text-primary-600 hover:text-primary-700 font-medium' }, t('admin', settings))
      ),
      React.createElement('div', { className: 'flex items-center gap-3 md:hidden' },
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'p-2 text-gray-600' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 }))
      )
    ),
    menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2' },
      React.createElement(Link, { to: '/', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('home', settings)),
      menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) => React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, item.label)),
      currentUser
        ? React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'block text-sm text-gray-600 py-1' }, currentUser.username),
            React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout')),
          )
        : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('sign in')),
      React.createElement(Link, { to: '/register', className: 'block text-sm text-gray-600 py-1', onClick: () => setMenuOpen(false) }, t('register', settings)),
      React.createElement('a', { href: '/admin', className: 'block text-sm text-primary-600 font-medium py-1' }, t('admin', settings))
    )
  );
}
