import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';

// WordPress Twenty Twenty-Four style footer: big about block + minimal links
export default function TTFooter({ settings }: { settings: Record<string, string> }) {
  const footerAbout = settings.theme_footer_about || '';
  return React.createElement('footer', { className: 'bg-white border-t border-gray-100 mt-24' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-6 py-16' },
      (footerAbout || settings.site_description) && React.createElement('div', { className: 'max-w-2xl mb-12' },
        React.createElement('h3', { className: 'text-2xl font-semibold tracking-tight text-gray-900 mb-3' }, t('about', settings)),
        React.createElement('p', { className: 'text-gray-600 leading-relaxed' }, footerAbout || settings.site_description),
      ),
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-8 mb-12' },
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-3' }, t('navigate', settings)),
          React.createElement('ul', { className: 'space-y-2' },
            React.createElement('li', null, React.createElement(Link, { to: '/', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('home', settings))),
            React.createElement('li', null, React.createElement(Link, { to: '/search', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('search', settings))),
            React.createElement('li', null, React.createElement('a', { href: '/api/feed/rss', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('rss feed', settings))),
          )
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-3' }, t('pages', settings)),
          React.createElement('ul', { className: 'space-y-2' },
            React.createElement('li', null, React.createElement(Link, { to: '/page/about', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('about', settings))),
            React.createElement('li', null, React.createElement(Link, { to: '/archive/2026/8', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('archives', settings))),
          )
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-3' }, t('categories', settings)),
          React.createElement('ul', { className: 'space-y-2' },
            React.createElement('li', null, React.createElement(Link, { to: '/category/technology', className: 'text-sm text-gray-500 hover:text-gray-900' }, 'Technology')),
            React.createElement('li', null, React.createElement(Link, { to: '/category/uncategorized', className: 'text-sm text-gray-500 hover:text-gray-900' }, 'Uncategorized')),
          )
        ),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm font-medium text-gray-900 mb-3' }, t('links', settings)),
          React.createElement('ul', { className: 'space-y-2' },
            React.createElement('li', null, React.createElement('a', { href: '/admin', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('admin', settings))),
            React.createElement('li', null, React.createElement(Link, { to: '/register', className: 'text-sm text-gray-500 hover:text-gray-900' }, t('register', settings))),
          )
        ),
      ),
      React.createElement('p', { className: 'text-sm text-gray-400 border-t border-gray-100 pt-8' }, '\u00A9 ' + new Date().getFullYear() + ' ' + (settings.site_title || 'Mortar') + ' \u00B7 ' + t('powered by', settings) + ' Mortar')
    )
  );
}
