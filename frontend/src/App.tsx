import React, { useEffect, useState, Suspense, lazy } from 'react';
import ReadingProgress from './components/ReadingProgress';
import AdminBar from './components/AdminBar';
import ThemeSection from './components/ThemeSection';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlternateLinks, AlternatesProvider } from './components/LanguageLinks';
import { Routes, Route, useParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from './themes';
import { sanitizeCss } from './lib/safeCss';
import { headingCss } from './lib/typography';
import api from './lib/api';
import { initLightbox } from './lib/lightbox';
import { setPermalinkPrefix, postRoutePath, permalinkFromShell } from './lib/permalink';
import { isEnabledLang, setContentLangs } from './lib/contentLang';
import { ssrPayload } from './lib/ssr';
import { applyStoredLang } from './lib/i18n';
import { installCmsForms } from './lib/cmsForms';
import { applyNonce } from './lib/nonce';

// Route components, code-split in the browser.
//
// The server renderer needs them synchronously: React.lazy suspends on a promise
// and renderToString has nothing to wait with, so every route would come out as
// the Suspense spinner. entry-server.tsx therefore registers the real components
// under these names before rendering, and the proxy below picks the eager one
// when it is there. In the browser the registry is empty and the lazy wrapper
// runs, so code splitting is unchanged.
const eagerRoutes: Record<string, React.ComponentType<any>> = {};

/** Register route components that must render synchronously (server only). */
export function registerEagerRoutes(components: Record<string, React.ComponentType<any>>): void {
  Object.assign(eagerRoutes, components);
}
function routeComponent(name: string, factory: () => Promise<{ default: React.ComponentType<any> }>) {
  const Lazy = lazy(factory);
  return function RouteComponent(props: any) {
    return React.createElement(eagerRoutes[name] || Lazy, props);
  };
}

// Menu items can point at /admin (or /admin/…). Inside the SPA that route
// does not exist — a <Link> click would hit the 404 page while the address
// bar still shows /admin (the server only redirects to /admin/ on a full
// page load). Bounce such navigations to the real admin entry.
function AdminBounce() {
  React.useEffect(() => { window.location.replace('/admin/'); }, []);
  return null;
}

// Translated routes are registered as '/:lang/…' next to the unprefixed ones.
// The default language is the unprefixed URL, so a ":lang" that is not a
// language this site publishes must not render the default-language page under a
// bogus prefix — it falls through to the 404 page instead.
function LangGate({ children }: { children: React.ReactElement }) {
  const params = useParams();
  if (!isEnabledLang(params.lang)) return React.createElement(NotFound);
  return children;
}

function langRoute(path: string, element: React.ReactElement) {
  const routePath = path === '/' ? '/:lang' : '/:lang' + path;
  return React.createElement(Route, { key: routePath, path: routePath, element: React.createElement(LangGate, null, element) });
}

// Route-level code splitting: Home stays eager (first paint), the rest load on demand
const Home = routeComponent('Home', () => import('./pages/Home'));
const PostPage = routeComponent('PostPage', () => import('./pages/Post'));
const PageView = routeComponent('PageView', () => import('./pages/Page'));
const SearchPage = routeComponent('SearchPage', () => import('./pages/Search'));
const ArchivePage = routeComponent('ArchivePage', () => import('./pages/Archive'));
const LinksPage = routeComponent('LinksPage', () => import('./pages/Links'));
const AuthorPage = routeComponent('AuthorPage', () => import('./pages/Author'));
const NotFound = routeComponent('NotFound', () => import('./pages/NotFound'));
const ShareView = routeComponent('ShareView', () => import('./pages/ShareView'));
const Register = routeComponent('Register', () => import('./pages/Register'));
const Login = routeComponent('Login', () => import('./pages/Login'));
const Install = routeComponent('Install', () => import('./pages/Install'));
const SubmitPost = routeComponent('SubmitPost', () => import('./pages/SubmitPost'));
const MyPosts = routeComponent('MyPosts', () => import('./pages/MyPosts'));
const Profile = routeComponent('Profile', () => import('./pages/Profile'));
const NewsletterConfirm = routeComponent('NewsletterConfirm', () => import('./pages/NewsletterConfirm'));

function SiteLayout({ settings }: { settings: Record<string, string> }) {
  const theme = useTheme();
  // One delegated handler for every `[form]` block the content renders.
  React.useEffect(() => { installCmsForms(); }, []);
  // Theme heading standard: cap + max drive the .prose h1-h6 sizes for every
  // article/page body (content keeps its semantic h1-h6 tags). Site settings
  // override the theme's declared defaults.
  const headingCap = settings.theme_heading_cap === '1' ? 1 : (settings.theme_heading_cap === '2' ? 2 : (theme.typography?.cap || 2));
  const headingMax = parseInt(settings.theme_heading_max, 10) || theme.typography?.max || 24;
  const headingStyle = React.createElement('style', { key: 'theme-typography', dangerouslySetInnerHTML: { __html: ':root{--heading-max-size:' + headingMax + 'px}' + headingCss({ cap: headingCap, max: headingMax }) } });
  // AlternateLinksProvider wraps the routed content so a page can publish the
  // languages it exists in; the switcher renders itself right after <main> and
  // renders nothing at all unless the content has a translation.
  return React.createElement(AlternatesProvider, null,
    React.createElement('div', { className: 'min-h-screen flex flex-col' },
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
          // Legacy shape, kept so existing links and bookmarks keep resolving.
          React.createElement(Route, { path: '/post/:slug', element: React.createElement(PostPage, { settings }) }),
          // …and the configured prefix, when it is not the legacy one.
          postRoutePath() !== '/post/:slug'
            ? React.createElement(Route, { path: postRoutePath(), element: React.createElement(PostPage, { settings }) })
            : null,
          React.createElement(Route, { path: '/page/:slug', element: React.createElement(PageView, { settings }) }),
          React.createElement(Route, { path: '/archive/:year/:month', element: React.createElement(ArchivePage, { settings }) }),
          React.createElement(Route, { path: '/archive/:year', element: React.createElement(ArchivePage, { settings }) }),
          React.createElement(Route, { path: '/links', element: React.createElement(LinksPage, { settings }) }),
          React.createElement(Route, { path: '/author/:username', element: React.createElement(AuthorPage, { settings }) }),
          React.createElement(Route, { path: '/search', element: React.createElement(SearchPage, { settings }) }),
          React.createElement(Route, { path: '/register', element: React.createElement(Register) }),
          React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
          React.createElement(Route, { path: '/submit-post', element: React.createElement(SubmitPost, { settings }) }),
          React.createElement(Route, { path: '/my-posts', element: React.createElement(MyPosts, { settings }) }),
          React.createElement(Route, { path: '/profile', element: React.createElement(Profile, { settings }) }),
          React.createElement(Route, { path: '/newsletter/confirm', element: React.createElement(NewsletterConfirm, { settings, mode: 'confirm' }) }),
          React.createElement(Route, { path: '/newsletter/unsubscribe', element: React.createElement(NewsletterConfirm, { settings, mode: 'unsubscribe' }) }),
          React.createElement(Route, { path: '/share/ai/:token', element: React.createElement(ShareView, { settings }) }),
          React.createElement(Route, { path: '/tag/:slug', element: React.createElement(Home, { settings }) }),
          React.createElement(Route, { path: '/category/:slug', element: React.createElement(Home, { settings }) }),
          React.createElement(Route, { path: '/type/:slug', element: React.createElement(Home, { settings }) }),
          // The same routes in a translation: /en/post/<slug>, /ja/category/news.
          // Home covers the listing pages (home, tag, category, type), which are
          // the ones that actually differ per language.
          langRoute('/', React.createElement(Home, { settings })),
          langRoute('/post/:slug', React.createElement(PostPage, { settings })),
          postRoutePath() !== '/post/:slug'
            ? langRoute(postRoutePath(), React.createElement(PostPage, { settings }))
            : null,
          langRoute('/page/:slug', React.createElement(PageView, { settings })),
          langRoute('/archive/:year/:month', React.createElement(ArchivePage, { settings })),
          langRoute('/archive/:year', React.createElement(ArchivePage, { settings })),
          langRoute('/links', React.createElement(LinksPage, { settings })),
          langRoute('/author/:username', React.createElement(AuthorPage, { settings })),
          langRoute('/search', React.createElement(SearchPage, { settings })),
          langRoute('/tag/:slug', React.createElement(Home, { settings })),
          langRoute('/category/:slug', React.createElement(Home, { settings })),
          langRoute('/type/:slug', React.createElement(Home, { settings })),
          // Admin lives in a separate SPA — SPA-internal clicks on /admin
          // links (e.g. menu items) get bounced there instead of a 404
          React.createElement(Route, { path: '/admin', element: React.createElement(AdminBounce) }),
          React.createElement(Route, { path: '/admin/*', element: React.createElement(AdminBounce) }),
          React.createElement(Route, { path: '*', element: React.createElement(NotFound) }),
        ),
        ),
        React.createElement(ThemeSection, { settings, location: 'after_content' }),
      ),
      // The switcher sits below the content it translates. It renders nothing
      // unless the page published a translation list, so a single-language site
      // is unaffected.
      React.createElement(AlternateLinks, { settings }),
      React.createElement(ThemeSection, { settings, location: 'before_footer' }),
      // A theme may bring its own back-to-top button; only fall back to the
      // app-wide one, otherwise both render in the same corner.
      theme.BackToTop ? React.createElement(theme.BackToTop, { settings }) : React.createElement(ScrollToTop),
      React.createElement(CookieConsent, { settings }),
      React.createElement(theme.Footer, { settings }),
      React.createElement(ThemeSection, { settings, location: 'after_footer' })
    )
  );
}

export default function App() {
  // Seeded from the server render when there is one: the first client render has
  // to produce the same markup, and `{}` here would make every themed page differ.
  const [settings, setSettings] = useState<Record<string, string>>(() => ssrPayload().settings || {});
  // Live theme preview (?theme=…): filled from window.location.search after
  // mount so the first render (server and client) does not read `window`.
  const [previewTheme, setPreviewTheme] = useState('');
  // Bumped when the visitor's stored UI language is applied, to re-render every
  // string through t() with the right language.
  const [, setLangVersion] = useState(0);

  // The visitor's own UI language lives in localStorage, which the server cannot
  // read — so it is applied here, after the first render has already matched the
  // server's, rather than inside it.
  useEffect(() => { if (applyStoredLang()) setLangVersion(v => v + 1); }, []);

  useEffect(() => {
    setPreviewTheme(new URLSearchParams(window.location.search).get('theme') || '');
    initLightbox();
    // Serve cached settings for the first paint, then refresh in the background.
    // Not for the permalink though: the shell already told lib/permalink the
    // structure for this very request, and re-applying a snapshot from an earlier
    // visit would undo it (the cache is only a first-paint shortcut for copy,
    // never for routing).
    try {
      const cached = sessionStorage.getItem('mortar_settings');
      // Skipped when the server already rendered this page with the real
      // settings: the snapshot is from an earlier visit and may be older.
      if (cached && !ssrPayload().settings) {
        const parsed = JSON.parse(cached);
        setSettings(parsed);
        if (!permalinkFromShell()) setPermalinkPrefix(parsed?.permalink_structure);
      }
    } catch {}
    // The shell normally carries the language list (meta[name=mortar-langs]); this
    // is the fallback for a shell served without it. Applied before the render
    // that consumes it, and ignored once the shell has spoken.
    api.get('/settings').then(r => {
      setContentLangs(r.data?.site_lang, r.data?.content_langs);
      setSettings(r.data);
      // Post URLs are built from this (lib/permalink): every theme and widget
      // reads it through postPath(), so one assignment moves all of them.
      // Skipped when the shell already carried the structure: this response may
      // come from the public page cache and be older than the HTML we are
      // looking at, which would flip the route table mid-session.
      if (!permalinkFromShell()) setPermalinkPrefix(r.data?.permalink_structure);
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
          if (k === 'heading_font' || k === 'body_font') {
            // Font names only via the whitelist — never inject a raw value
            if (!fontStacks[v]) return '';
            return '--' + k.replace(/_/g, '-') + ':' + fontStacks[v];
          }
          // Colors only as hex — a raw value containing } could escape :root{}
          if (!/^#[0-9a-fA-F]{3,8}$/.test(v)) return '';
          return '--' + k.replace(/_/g, '-') + ':' + v;
        })
        .filter(Boolean).join(';');
      if (vars) {
        let el = document.getElementById('mortar-theme-vars') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-vars'; document.head.appendChild(el); }
        el.textContent = ':root{' + vars + '}';
      }
      // Flag dark themes on <body data-theme="dark"> so global CSS can adapt
      // Tailwind light surfaces/text (bg-gray-50, text-gray-900, ...) to dark.
      const bg = r.data.theme_background || '';
      const m = bg.match(/#([0-9a-f]{6})/i);
      let isDark = false;
      if (m) {
        const n = parseInt(m[1], 16);
        const lum = ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
        isDark = lum < 128;
      }
      document.body.dataset.theme = isDark ? 'dark' : 'light';
      // Content width used by .prose.prose-gray.prose-lg (article/page body)
      document.body.dataset.contentWidth = r.data.content_width || 'normal';
      // Unsaved custom CSS preview (Appearance panel opens ?preview_css=...).
      // Security: the query parameter is attacker-controllable (a crafted link
      // could inject arbitrary CSS, e.g. attribute-selector data exfiltration),
      // so it is only honored for signed-in users and goes through the same
      // sanitizer as every other injected stylesheet.
      const previewCss = new URLSearchParams(window.location.search).get('preview_css');
      let cssToApply = r.data.theme_custom_css || '';
      if (previewCss !== null && previewCss !== '' && localStorage.getItem('mortar_token')) {
        cssToApply = sanitizeCss(previewCss);
      }
      if (cssToApply) {
        let el = document.getElementById('mortar-theme-css') as HTMLStyleElement | null;
        if (!el) { el = document.createElement('style'); el.id = 'mortar-theme-css'; document.head.appendChild(el); }
        el.textContent = sanitizeCss(cssToApply);
      }
      const titleEl = document.getElementById('site-title');
      if (titleEl && r.data.site_title) titleEl.textContent = r.data.site_title;
      // Header/footer custom code injection (scripts re-created so they execute).
      // Deliberate trusted-admin feature (analytics/pixels), equivalent to
      // WordPress's header/footer scripts — these settings are writable only by
      // an admin. Do NOT feed untrusted content here.
      const injectCode = (id: string, code: string, container: HTMLElement) => {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('div'); el.id = id; container.appendChild(el); }
        el.innerHTML = code;
        el.querySelectorAll('script').forEach(s => {
          const ns = document.createElement('script');
          ns.textContent = s.textContent;
          if (s.src) ns.src = s.src;
          // Under an enforcing CSP an inline script needs the document's nonce,
          // and re-creating the element drops it.
          applyNonce(ns);
          s.replaceWith(ns);
        });
      };
      if (r.data.header_code) injectCode('mortar-header-code', r.data.header_code, document.head);
      if (r.data.footer_code) injectCode('mortar-footer-code', r.data.footer_code, document.body);
    }).catch(() => {});
  }, []);

  return React.createElement(ErrorBoundary, null,
    React.createElement(ThemeProvider, { themeName: previewTheme || settings.theme_name, children: React.createElement(SiteLayout, { settings }) })
  );
}
