import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Magazine theme header: serif masthead + red accent + centered nav
export default function MagazineHeader({ settings }: { settings: Record<string, string> }) {
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

  const headerLayout = settings.theme_header_layout || 'centered';
  const bannerText = settings.theme_banner_text || '';

  return React.createElement('header', { className: 'bg-white border-b-4 border-red-700 sticky top-0 z-40 shadow-sm' },
    // Masthead
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-5 ' + (headerLayout === 'centered' ? 'text-center' : 'flex items-end justify-between') },
      React.createElement(Link, { to: '/', className: 'inline-block' },
        React.createElement('h1', { className: 'text-3xl md:text-4xl font-bold tracking-tight text-gray-900', style: { fontFamily: 'Georgia, serif' } }, settings.site_title || 'Mortar'),
        settings.site_description && React.createElement('p', { className: 'text-xs uppercase tracking-[0.3em] text-red-700 mt-1' }, settings.site_description)
      ),
      bannerText && React.createElement('p', { className: 'text-sm italic text-gray-500 hidden md:block' }, bannerText)
    ),
    // Nav bar
    React.createElement('div', { className: 'border-t border-gray-200' },
      React.createElement('div', { className: 'max-w-5xl mx-auto px-4 h-12 flex items-center justify-between' },
        React.createElement('div', { className: 'hidden md:flex items-center gap-7' },
          React.createElement(Link, { to: '/', className: 'text-sm font-medium text-gray-700 hover:text-red-700' }, t('home', settings)),
          menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
            React.createElement(Link, { key: item.id, to: item.url, className: 'text-sm font-medium text-gray-700 hover:text-red-700 uppercase tracking-wide' }, item.label)),
        ),
        React.createElement('div', { className: 'hidden md:flex items-center gap-5 text-sm' },
          currentUser
            ? React.createElement(React.Fragment, null,
                React.createElement('span', { className: 'text-gray-600' }, currentUser.username),
                React.createElement('button', { onClick: logout, className: 'text-gray-400 hover:text-gray-600' }, t('logout')),
              )
            : React.createElement(React.Fragment, null,
                React.createElement(Link, { to: '/login', className: 'text-gray-600 hover:text-red-700' }, t('sign in')),
                React.createElement(Link, { to: '/register', className: 'text-gray-600 hover:text-red-700' }, t('register', settings)),
              ),
          React.createElement('a', { href: '/admin', className: 'px-3 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800' }, t('admin', settings)),
        ),
        React.createElement('button', { onClick: () => setMenuOpen(!menuOpen), className: 'md:hidden p-2 text-gray-600' }, menuOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
      ),
      menuOpen && React.createElement('div', { className: 'md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2' },
        React.createElement(Link, { to: '/', className: 'block text-sm text-gray-600 py-1' }, t('home', settings)),
        menuItems.filter((item: any) => !(item.url === '/' && (item.label.toLowerCase() === 'home' || item.label === t('home', settings)))).map((item: any) =>
          React.createElement(Link, { key: item.id, to: item.url, className: 'block text-sm text-gray-600 py-1' }, item.label)),
        currentUser
          ? React.createElement('button', { onClick: logout, className: 'block text-sm text-gray-400 py-1' }, t('logout'))
          : React.createElement(Link, { to: '/login', className: 'block text-sm text-gray-600 py-1' }, t('sign in')),
        React.createElement(Link, { to: '/register', className: 'block text-sm text-gray-600 py-1' }, t('register', settings)),
        React.createElement('a', { href: '/admin', className: 'block text-sm text-red-700 font-medium py-1' }, t('admin', settings)),
      )
    )
  );
}
