import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { t, getSiteLang, setLang } from '../../lib/i18n';

export default function Footer({ settings }: { settings: Record<string, string> }) {
  const currentLang = getSiteLang(settings);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  useEffect(() => { api.get('/menus/location/footer').then(r => setMenuItems(r.data.items || [])).catch(() => {}); }, []);
  const topLevel = menuItems.filter((i: any) => !i.parentId);
  return React.createElement('footer', { className: 'bg-gray-50 border-t border-gray-200 mt-16' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-8' },
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-6 mb-6' },
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('navigate', settings)),
          React.createElement('ul', { className: 'space-y-1' },
            React.createElement('li', null, React.createElement(Link, { to: '/', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('home', settings))),
            React.createElement('li', null, React.createElement(Link, { to: '/search', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('search', settings))),
            React.createElement('li', null, React.createElement('a', { href: '/api/feed/rss', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('rss feed', settings)))
          )
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('about', settings)),
          React.createElement('ul', { className: 'space-y-1' },
            React.createElement('li', null, React.createElement(Link, { to: '/page/about', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('about', settings))),
            React.createElement('li', null, React.createElement(Link, { to: '/page/' + (settings?.privacy_policy_slug || 'privacy-policy'), className: 'text-sm text-gray-500 hover:text-gray-700' }, t('privacy policy', settings)))
          )
        ),
        topLevel.length > 0 && React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('menu', settings)),
          React.createElement('ul', { className: 'space-y-1' },
            topLevel.map((mi: any) => React.createElement('li', { key: mi.id },
              React.createElement(Link, { to: mi.url, className: 'text-sm text-gray-500 hover:text-gray-700' }, mi.label))))
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('admin', settings)),
          React.createElement('ul', { className: 'space-y-1' },
            React.createElement('li', null, React.createElement('a', { href: '/admin', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('dashboard', settings))),
            React.createElement('li', null, React.createElement('a', { href: '/admin#/posts', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('posts', settings)))
          )
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('connect', settings)),
          React.createElement('ul', { className: 'space-y-1' },
            React.createElement('li', null, React.createElement('a', { href: '/api/feed/rss', target: '_blank', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('rss feed', settings))),
            React.createElement('li', null, React.createElement('a', { href: '/api/sitemap.xml', target: '_blank', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('sitemap', settings)))
          )
        )
      ),
      React.createElement('div', { className: 'pt-6 border-t border-gray-200 flex items-center justify-center gap-4 flex-wrap' },
        React.createElement('p', { className: 'text-sm text-gray-500' },
          '\u00a9 ' + new Date().getFullYear() + ' ' + (settings.site_title || 'Mortar CMS') + '. ' + t('powered by', settings) + ' Mortar. ',
          React.createElement('a', { href: '/api/feed/rss', className: 'text-primary-600 hover:text-primary-700', target: '_blank' }, t('rss feed', settings))
        ),
        React.createElement('button', {
          onClick: () => setLang(currentLang === 'zh' ? 'en' : 'zh'),
          className: 'text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors',
          'aria-label': t('switch language', settings),
        }, currentLang === 'zh' ? 'EN' : '\u4E2D\u6587')
      )
    )
  );
}
