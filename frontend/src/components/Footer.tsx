import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../lib/i18n';

export default function Footer({ settings }: { settings: Record<string, string> }) {
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
            React.createElement('li', null, React.createElement(Link, { to: '/page/privacy-policy', className: 'text-sm text-gray-500 hover:text-gray-700' }, t('privacy policy', settings)))
          )
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
      React.createElement('div', { className: 'text-center pt-6 border-t border-gray-200' },
        React.createElement('p', { className: 'text-sm text-gray-500' },
          '\u00a9 ' + new Date().getFullYear() + ' ' + (settings.site_title || 'Mortar CMS') + '. ' + t('powered by', settings) + ' Mortar. ',
          React.createElement('a', { href: '/api/feed/rss', className: 'text-primary-600 hover:text-primary-700', target: '_blank' }, t('rss feed', settings))
        )
      )
    )
  );
}
