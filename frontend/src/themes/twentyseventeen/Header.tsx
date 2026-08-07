import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Twenty Seventeen header: centered brand, clean nav, optional header image
export default function TS17Header({ settings }: { settings: Record<string, string> }) {
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

  const headerImage = settings.theme_header_image || '';

  return React.createElement('header', { className: 'bg-white' },
    headerImage && React.createElement('div', { className: 'h-48 md:h-64 overflow-hidden' },
      React.createElement('img', { src: headerImage, alt: '', className: 'w-full h-full object-cover' })),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-8 text-center' },
      React.createElement(Link, { to: '/' },
        React.createElement('h1', { className: 'text-3xl md:text-4xl font-normal tracking-tight text-gray-900' }, settings.site_title || 'Mortar')),
      React.createElement('p', { className: 'text-sm text-gray-500 mt-2' }, settings.site_description || ''),
    ),
    React.createElement('nav', { className: 'border-t border-gray-200' },
      React.createElement('div', { className: 'max-w-5xl mx-auto px-4 h-12 flex items-center justify-between' },
        React.createElement('div', { className: 'hidden md:flex items-center gap-8' },
          React.createElement(Link, { to: '/', className: 'text-sm text-gray-700 hover:text-gray-900' }, t('home', settings)),
          menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
            React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm text-gray-700 hover:text-gray-900' }, item.label)),
          React.createElement(Link, { to: '/search', className: 'text-sm text-gray-700 hover:text-gray-900' }, t('search', settings)),
        ),
        React.createElement('div', { className: 'hidden md:flex items-center gap-5 text-sm' },
          currentUser
            ? React.createElement(React.Fragment, null,
                React.createElement('span', { className: 'text-gray-600' }, currentUser.username),
                React.createElement('button', { onClick: logout, className: 'text-gray-400 hover:text-gray-600' }, t('logout')))
            : React.createElement(Link, { to: '/login', className: 'text-gray-600 hover:text-gray-900' }, t('sign in')),
          React.createElement('a', { href: '/admin', className: 'text-gray-900 font-medium hover:text-gray-600' }, t('admin', settings)),
        ),
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden p-2 text-gray-600' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
      ),
      menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 px-4 py-3 space-y-2' },
        React.createElement(Link, { to: '/', className: 'block text-sm text-gray-700 py-1' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-700 py-1' }, item.label)),
        currentUser ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout'))
          : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-700 py-1' }, t('sign in')),
        React.createElement('a', { href: '/admin', className: 'block text-sm text-gray-900 py-1' }, t('admin', settings)),
      )
    )
  );
}
