import React, { useEffect, useState } from 'react';
import SearchPage from './pages/Search';
import ArchivePage from './pages/Archive';
import AuthorPage from './pages/Author';
import NotFound from './pages/NotFound';
import ReadingProgress from './components/ReadingProgress';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import Register from './pages/Register';
import Login from './pages/Login';
import Install from './pages/Install';
import { Routes, Route } from 'react-router-dom';
import { getTheme } from './themes';
import Home from './pages/Home';
import PostPage from './pages/Post';
import PageView from './pages/Page';
import api from './lib/api';

export default function App() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/settings').then(r => {
      setSettings(r.data);
      if (r.data.site_lang) localStorage.setItem('mortar_site_lang', r.data.site_lang);
      // Apply active theme: CSS variables + custom CSS
      const themeKeys = ['primary_color', 'background', 'text_color', 'link_color', 'heading_font', 'body_font'];
      const vars = themeKeys
        .map(k => { const v = r.data['theme_' + k]; return v ? '--' + k.replace(/_/g, '-') + ':' + v : ''; })
        .filter(Boolean).join(';');
      if (vars) {
        let el = document.getElementById('mortar-theme-vars') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-vars'; document.head.appendChild(el); }
        el.textContent = ':root{' + vars + '}';
      }
      if (r.data.theme_custom_css) {
        let el = document.getElementById('mortar-theme-css') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-css'; document.head.appendChild(el); }
        el.textContent = r.data.theme_custom_css;
      }
      const titleEl = document.getElementById('site-title');
      if (titleEl && r.data.site_title) titleEl.textContent = r.data.site_title;
      // Header/footer custom code injection (scripts re-created so they execute)
      const injectCode = (id: string, code: string, container: HTMLElement) => {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('div'); el.id = id; container.appendChild(el); }
        el.innerHTML = code;
        el.querySelectorAll('script').forEach(s => {
          const ns = document.createElement('script');
          ns.textContent = s.textContent;
          if (s.src) ns.src = s.src;
          s.replaceWith(ns);
        });
      };
      if (r.data.header_code) injectCode('mortar-header-code', r.data.header_code, document.head);
      if (r.data.footer_code) injectCode('mortar-footer-code', r.data.footer_code, document.body);
    }).catch(() => {});
  }, []);

  return React.createElement('div', { className: 'min-h-screen flex flex-col' },
    React.createElement(ReadingProgress),
    React.createElement(getTheme(settings.theme_name).Header, { settings }),
    React.createElement('main', { className: 'flex-1' },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/install', element: React.createElement(Install) }),
        React.createElement(Route, { path: '/', element: React.createElement(Home, { settings }) }),
        React.createElement(Route, { path: '/post/:slug', element: React.createElement(PostPage, { settings }) }),
        React.createElement(Route, { path: '/page/:slug', element: React.createElement(PageView, { settings }) }),
        React.createElement(Route, { path: '/archive/:year/:month', element: React.createElement(ArchivePage, { settings }) }),
        React.createElement(Route, { path: '/author/:username', element: React.createElement(AuthorPage, { settings }) }),
        React.createElement(Route, { path: '/search', element: React.createElement(SearchPage, { settings }) }),
        React.createElement(Route, { path: '/register', element: React.createElement(Register) }),
        React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
        React.createElement(Route, { path: '/tag/:slug', element: React.createElement(Home, { settings }) }),
        React.createElement(Route, { path: '/category/:slug', element: React.createElement(Home, { settings }) }),
        React.createElement(Route, { path: '*', element: React.createElement(NotFound) }),
      )
    ),
    React.createElement(ScrollToTop),
    React.createElement(CookieConsent),
    React.createElement(getTheme(settings.theme_name).Footer, { settings })
  );
}
