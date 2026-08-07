import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';

// Magazine theme footer: dark red band + centered brand
export default function MagazineFooter({ settings }: { settings: Record<string, string> }) {
  return React.createElement('footer', { className: 'bg-gray-900 text-gray-300 mt-16' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-10' },
      React.createElement('div', { className: 'text-center mb-6' },
        React.createElement('p', { className: 'text-xl font-bold text-white', style: { fontFamily: 'Georgia, serif' } }, settings.site_title || 'Mortar'),
        settings.site_description && React.createElement('p', { className: 'text-xs uppercase tracking-[0.3em] text-red-400 mt-1' }, settings.site_description),
      ),
      React.createElement('div', { className: 'flex items-center justify-center gap-6 text-sm' },
        React.createElement(Link, { to: '/', className: 'hover:text-white' }, t('home', settings)),
        React.createElement(Link, { to: '/search', className: 'hover:text-white' }, t('search', settings)),
        React.createElement(Link, { to: '/page/about', className: 'hover:text-white' }, t('about', settings)),
        React.createElement('a', { href: '/api/feed/rss', className: 'hover:text-white' }, t('rss feed', settings)),
      ),
      React.createElement('p', { className: 'text-center text-xs text-gray-500 mt-6' }, t('powered by', settings) + ' Mortar'),
    )
  );
}
