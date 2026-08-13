import React, { useEffect, useRef, useState } from 'react';
import StatusBar from './StatusBar';
import { Outlet, useLocation } from 'react-router-dom';
import { Globe, Moon, Sun, ExternalLink, LogOut, ChevronDown, Bot, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../lib/auth';
import { t, getLang, setLang } from '../lib/i18n';
import api from '../lib/api';

// Map routes to page titles for the admin bar breadcrumb (WordPress-style)
const routeTitles: [string, string][] = [
  ['/posts', 'posts'],
  ['/pages', 'pages'],
  ['/menus', 'menus'],
  ['/widgets', 'widgets'],
  ['/appearance', 'appearance'],
  ['/post-types', 'custom post types'],
  ['/media', 'media'],
  ['/comments', 'comments'],
  ['/categories', 'categories'],
  ['/tags', 'tags'],
  ['/links', 'links'],
  ['/sysinfo', 'system'],
  ['/hooks', 'system'],
  ['/api-docs', 'system'],
  ['/activity', 'system'],
  ['/import', 'import'],
  ['/plugins', 'plugins'],
  ['/sites', 'sites'],
  ['/users', 'users'],
  ['/roles', 'roles & permissions'],
  ['/security', 'security audit'],
  ['/ai/bindings', 'ai bindings'],
  ['/ai/settings', 'ai settings'],
  ['/ai', 'ai chat'],
  ['/settings', 'settings'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ctrl/Cmd+K opens the AI assistant from anywhere in the admin
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/ai');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [primary, setPrimary] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Close the mobile drawer when navigating to another route
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Re-trigger the fade-in animation on every route change (without remounting)
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.classList.remove('page-enter');
    void main.offsetWidth; // force reflow to restart the animation
    main.classList.add('page-enter');
  }, [location.pathname]);

  // Apply the active theme's primary color to the admin (CSS var override).
  // Also re-read it when the Appearance panel saves (mortar-settings-saved
  // event) so the accent color updates without a manual page reload.
  useEffect(() => {
    const applyPrimary = () => {
      api.get('/settings').then(r => {
        const c = r.data.theme_primary_color;
        if (c) { setPrimary(c); document.documentElement.style.setProperty('--admin-primary', c); }
      }).catch(() => {});
    };
    applyPrimary();
    window.addEventListener('mortar-settings-saved', applyPrimary);
    return () => window.removeEventListener('mortar-settings-saved', applyPrimary);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pageTitle = (routeTitles.find(([p]) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))) || [null, 'dashboard'])[1];

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('mortar_dark', document.documentElement.classList.contains('dark') ? '1' : '0');
  };
  const isDark = () => document.documentElement.classList.contains('dark');

  return React.createElement('div', { className: 'flex flex-col h-screen overflow-hidden' },
    React.createElement('div', { className: 'flex flex-1 min-h-0' },
      React.createElement('a', { href: '#main-content', className: 'skip-link' }, t('skip to content', getLang())),
    React.createElement(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    // Mobile drawer overlay (click to dismiss)
    sidebarOpen && React.createElement('div', {
      className: 'fixed inset-0 bg-black/40 z-20 lg:hidden',
      onClick: () => setSidebarOpen(false),
      'aria-hidden': 'true',
    }),
    React.createElement('div', { className: 'flex-1 lg:ml-64 flex flex-col min-h-screen' },
      // Admin bar (WordPress-style)
      React.createElement('header', { className: 'sticky top-0 z-40 h-12 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          // Mobile hamburger — the sidebar drawer is hidden below lg
          React.createElement('button', {
            onClick: () => setSidebarOpen(true),
            className: 'lg:hidden p-2 -ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors',
            'aria-label': t('open menu', getLang()),
          }, React.createElement(Menu, { size: 18 })),
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
      React.createElement('main', { ref: mainRef, id: 'main-content', role: 'main', tabIndex: -1, className: 'flex-1 p-4 lg:p-8 pb-16 bg-gray-50 dark:bg-gray-900 overflow-y-auto' },
        React.createElement(Outlet)
      ),
      // Floating AI assistant shortcut (Ctrl+K)
      !location.pathname.startsWith('/ai') && React.createElement('button', {
        onClick: () => navigate('/ai'),
        title: 'AI 助理 (Ctrl+K)',
        className: 'fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform',
      }, React.createElement(Bot, { size: 22 })),
    ),
    ),
    React.createElement(StatusBar),
  );
}
