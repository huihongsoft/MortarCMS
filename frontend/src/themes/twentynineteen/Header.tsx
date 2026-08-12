import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Twenty Nineteen header: bold typography, generous spacing
export default function TN19Header({ settings }: { settings: Record<string, string> }) {
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

  return React.createElement('header', { className: 'bg-white border-b border-gray-200' },
    React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-10' },
      React.createElement(Link, { to: '/', className: 'block text-center' },
        React.createElement('h1', { className: 'text-4xl font-extrabold tracking-tight text-gray-900' }, settings.site_title || 'Mortar'),
      ),
      React.createElement('nav', { className: 'hidden md:flex items-center justify-center gap-8 mt-8' },
        React.createElement(Link, { to: '/', className: 'text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900' }, item.label)),
        React.createElement(Link, { to: '/search', className: 'text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900' }, t('search', settings)),
        currentUser
          ? React.createElement('button', { onClick: logout, className: 'text-sm uppercase tracking-widest text-gray-400 hover:text-gray-600' }, t('logout'))
          : React.createElement(Link, { to: '/login', className: 'text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900' }, t('sign in')),
        React.createElement('a', { href: '/admin', className: 'text-sm uppercase tracking-widest text-primary-600 hover:text-primary-700' }, t('admin', settings)),
      ),
      React.createElement('div', { className: 'md:hidden flex justify-between items-center mt-4' },
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'p-2 text-gray-600', 'aria-label': t('toggle menu', settings), 'aria-expanded': menuOpen, 'aria-controls': 'mobile-nav' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
        React.createElement('a', { href: '/admin', className: 'text-xs uppercase tracking-widest text-primary-600' }, t('admin', settings)),
      ),
      menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 mt-4 pt-4 space-y-2' },
        React.createElement(Link, { to: '/', className: 'block text-sm text-gray-600 py-1' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-600 py-1' }, item.label)),
        currentUser ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout'))
          : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-600 py-1' }, t('sign in')),
      ),
    )
  );
}
