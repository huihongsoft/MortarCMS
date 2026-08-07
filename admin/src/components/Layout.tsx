import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Globe, Moon, Sun, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../lib/auth';
import { t, getLang, setLang } from '../lib/i18n';
import api from '../lib/api';

// Map routes to page titles for the admin bar breadcrumb (WordPress-style)
const routeTitles: [string, string][] = [
  ['/', 'dashboard'],
  ['/posts', 'posts'],
  ['/pages', 'pages'],
  ['/menus', 'menus'],
  ['/widgets', 'widgets'],
  ['/appearance', 'appearance'],
  ['/media', 'media'],
  ['/comments', 'comments'],
  ['/sysinfo', 'system'],
  ['/import', 'import'],
  ['/plugins', 'plugins'],
  ['/sites', 'sites'],
  ['/users', 'users'],
  ['/settings', 'settings'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [primary, setPrimary] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Apply the active theme's primary color to the admin (CSS var override)
  useEffect(() => {
    api.get('/settings').then(r => {
      const c = r.data.theme_primary_color;
      if (c) { setPrimary(c); document.documentElement.style.setProperty('--admin-primary', c); }
    }).catch(() => {});
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pageTitle = (routeTitles.find(([p]) => location.pathname.startsWith(p)) || [null, 'dashboard'])[1];

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('mortar_dark', document.documentElement.classList.contains('dark') ? '1' : '0');
  };
  const isDark = () => document.documentElement.classList.contains('dark');

  return React.createElement('div', { className: 'flex min-h-screen' },
    React.createElement(Sidebar),
    React.createElement('div', { className: 'flex-1 lg:ml-64 flex flex-col min-h-screen' },
      // Admin bar (WordPress-style)
      React.createElement('header', { className: 'sticky top-0 z-40 h-12 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'w-5 h-5 rounded-md bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm' }, 'M'),
          React.createElement('span', { className: 'text-gray-900 dark:text-white font-semibold text-sm' }, 'Mortar'),
          React.createElement('span', { className: 'text-gray-300 dark:text-gray-600 text-sm' }, '/'),
          React.createElement('span', { className: 'text-gray-600 dark:text-gray-300 text-sm capitalize' }, t(pageTitle, getLang())),
        ),
        React.createElement('div', { className: 'flex items-center gap-1' },
          React.createElement('a', { href: '/', target: '_blank', title: t('view site', getLang()), className: 'p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors' }, React.createElement(ExternalLink, { size: 16 })),
          React.createElement('button', { onClick: () => setLang(getLang() === 'zh' ? 'en' : 'zh'), title: t('language', getLang()), className: 'p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1' }, React.createElement(Globe, { size: 16 }), React.createElement('span', { className: 'text-xs' }, getLang() === 'zh' ? 'EN' : '中')),
          React.createElement('button', { onClick: toggleDark, title: t('dark mode', getLang()), className: 'p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors' },
            isDark() ? React.createElement(Sun, { size: 16 }) : React.createElement(Moon, { size: 16 })),
          // User menu
          React.createElement('div', { ref: menuRef, className: 'relative' },
            React.createElement('button', { onClick: () => setUserMenuOpen(!userMenuOpen), className: 'flex items-center gap-2 ml-2 pl-3 border-l border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors' },
              React.createElement('div', { className: 'w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium shadow-sm' }, user?.username?.charAt(0).toUpperCase()),
              React.createElement('span', { className: 'text-xs hidden sm:block' }, user?.username),
              React.createElement(ChevronDown, { size: 12 }),
            ),
            userMenuOpen && React.createElement('div', { className: 'absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50' },
              React.createElement('div', { className: 'px-3 py-2 border-b border-gray-100 dark:border-gray-700' },
                React.createElement('p', { className: 'text-sm text-gray-900 dark:text-gray-100 truncate' }, user?.username),
                React.createElement('p', { className: 'text-xs text-gray-500 capitalize' }, t(user?.role || 'user', getLang())),
              ),
              React.createElement('button', { onClick: logout, className: 'w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700' }, React.createElement(LogOut, { size: 14 }), t('logout', getLang())),
            ),
          ),
        ),
      ),
      React.createElement('main', { className: 'flex-1 p-4 lg:p-8 bg-gray-50 dark:bg-gray-900' },
        React.createElement(Outlet)
      ),
    ),
  );
}
