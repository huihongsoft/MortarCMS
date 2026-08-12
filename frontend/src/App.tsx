import React, { useEffect, useState, Suspense, lazy } from 'react';
import ReadingProgress from './components/ReadingProgress';
import AdminBar from './components/AdminBar';
import ThemeSection from './components/ThemeSection';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './themes';
import { headingCss } from './lib/typography';
import api from './lib/api';
import { initLightbox } from './lib/lightbox';

// lazyWithRetry: a lazy() wrapper whose failure falls through to the app
// ErrorBoundary (React.lazy rejects once and caches the failure — retrying
// means reloading the chunk, so the boundary's reload action is the recovery).
function lazyWithRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(factory);
}

// Route-level code splitting: Home stays eager (first paint), the rest load on demand
const Home = lazyWithRetry(() => import('./pages/Home'));
const PostPage = lazyWithRetry(() => import('./pages/Post'));
const PageView = lazyWithRetry(() => import('./pages/Page'));
const SearchPage = lazyWithRetry(() => import('./pages/Search'));
const ArchivePage = lazyWithRetry(() => import('./pages/Archive'));
const AuthorPage = lazyWithRetry(() => import('./pages/Author'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const ShareView = lazyWithRetry(() => import('./pages/ShareView'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Install = lazyWithRetry(() => import('./pages/Install'));

function SiteLayout({ settings }: { settings: Record<string, string> }) {
  const theme = useTheme();
  // Theme heading standard: cap + max drive the .prose h1-h6 sizes for every
  // article/page body (content keeps its semantic h1-h6 tags). Site settings
  // override the theme's declared defaults.
  const headingCap = settings.theme_heading_cap === '1' ? 1 : (settings.theme_heading_cap === '2' ? 2 : (theme.typography?.cap || 2));
  const headingMax = parseInt(settings.theme_heading_max, 10) || theme.typography?.max || 24;
  const headingStyle = React.createElement('style', { key: 'theme-typography', dangerouslySetInnerHTML: { __html: headingCss({ cap: headingCap, max: headingMax }) } });
  return React.createElement('div', { className: 'min-h-screen flex flex-col' },
      headingStyle,
      React.createElement(AdminBar),
      React.createElement('a', { href: '#main-content', className: 'skip-link' }, 'Skip to content'),
      React.createElement(ReadingProgress),
      React.createElement(ThemeSection, { settings, location: 'before_header' }),
      React.createElement(theme.Header, { settings }),
      React.createElement(ThemeSection, { settings, location: 'after_header' }),
      React.createElement('main', { id: 'main-content', role: 'main', className: 'flex-1' },
        React.createElement(ThemeSection, { settings, location: 'before_content' }),
        React.createElement(Suspense, { fallback: React.createElement('div', { className: 'flex items-center justify-center py-24' },
            React.createElement('div', { className: 'w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin' })
          ) },
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
          React.createElement(Route, { path: '/share/ai/:token', element: React.createElement(ShareView, { settings }) }),
          React.createElement(Route, { path: '/tag/:slug', element: React.createElement(Home, { settings }) }),
          React.createElement(Route, { path: '/category/:slug', element: React.createElement(Home, { settings }) }),
          React.createElement(Route, { path: '/type/:slug', element: React.createElement(Home, { settings }) }),
          React.createElement(Route, { path: '*', element: React.createElement(NotFound) }),
        ),
        ),
        React.createElement(ThemeSection, { settings, location: 'after_content' }),
      ),
      React.createElement(ThemeSection, { settings, location: 'before_footer' }),
      React.createElement(ScrollToTop),
      React.createElement(CookieConsent, { settings }),
      React.createElement(theme.Footer, { settings }),
      React.createElement(ThemeSection, { settings, location: 'after_footer' })
  );
}

export default function App() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    initLightbox();
    // Serve cached settings for the first paint, then refresh in the background
    try {
      const cached = sessionStorage.getItem('mortar_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}
    api.get('/settings').then(r => {
      setSettings(r.data);
      try { sessionStorage.setItem('mortar_settings', JSON.stringify(r.data)); } catch {}
      // Apply active theme: CSS variables + custom CSS
      const fontStacks: Record<string, string> = {
        system: '-apple-system, system-ui, "Segoe UI", Roboto, sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      };
      const themeKeys = ['primary_color', 'background', 'text_color', 'link_color', 'heading_font', 'body_font'];
      const vars = themeKeys
        .map(k => {
          const v = r.data['theme_' + k];
          if (!v) return '';
          const val = (k === 'heading_font' || k === 'body_font') ? (fontStacks[v] || v) : v;
          return '--' + k.replace(/_/g, '-') + ':' + val;
        })
        .filter(Boolean).join(';');
      if (vars) {
        let el = document.getElementById('mortar-theme-vars') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-vars'; document.head.appendChild(el); }
        el.textContent = ':root{' + vars + '}';
      }
      // Unsaved custom CSS preview (Appearance panel opens ?preview_css=...).
      // Security: the query parameter is attacker-controllable (a crafted link
      // could inject arbitrary CSS, e.g. attribute-selector data exfiltration),
      // so it is only honored for signed-in users and stripped of the worst
      // primitives (@import / url() / expression) before injection.
      const previewCss = new URLSearchParams(window.location.search).get('preview_css');
      let cssToApply = r.data.theme_custom_css || '';
      if (previewCss !== null && previewCss !== '' && localStorage.getItem('mortar_token')) {
        cssToApply = previewCss.replace(/@import[^;]+;?/gi, '').replace(/url\([^)]*\)/gi, 'url()').replace(/expression\([^)]*\)/gi, '');
      }
      if (cssToApply) {
        let el = document.getElementById('mortar-theme-css') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-css'; document.head.appendChild(el); }
        el.textContent = cssToApply;
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

  return React.createElement(ErrorBoundary, null,
    React.createElement(ThemeProvider, { themeName: (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('theme')) || settings.theme_name, children: React.createElement(SiteLayout, { settings }) })
  );
}
