import React from 'react';
import { Rss } from 'lucide-react';
import { t } from '../lib/i18n';

// RSS subscription link (WordPress-style widget)
export default function RssWidget() {
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('subscribe')),
    React.createElement('a', {
      href: '/api/feed/rss',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium',
    }, React.createElement(Rss, { size: 16 }), t('rss feed')),
    React.createElement('p', { className: 'text-xs text-gray-500 mt-2' }, t('get the latest posts in your feed reader'))
  );
}
