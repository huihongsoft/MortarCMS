import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// Aurora footer: minimal, hairline top border
export default function Footer({ settings }: { settings: Record<string, string> }) {
  const year = new Date().getFullYear();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  useEffect(() => { api.get('/menus/location/footer').then(r => setMenuItems(r.data.items || [])).catch(() => {}); }, []);
  const topLevel = menuItems.filter((i: any) => !i.parentId);
  return React.createElement('footer', { className: 'border-t border-gray-900/[0.06] mt-24' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'w-4 h-4 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600' }),
        React.createElement('span', { className: 'text-sm font-semibold text-gray-900 tracking-tight' }, settings.site_title || 'Mortar'),
      ),
      React.createElement('nav', { className: 'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500' },
        topLevel.length > 0
          ? topLevel.map((mi: any) => React.createElement(Link, { key: mi.id, to: mi.url, className: 'hover:text-gray-900 transition-colors' }, mi.label))
          : React.createElement(React.Fragment, null,
              React.createElement(Link, { to: '/', className: 'hover:text-gray-900 transition-colors' }, t('home', settings)),
              settings.privacy_policy_slug && React.createElement(Link, { to: '/page/' + settings.privacy_policy_slug, className: 'hover:text-gray-900 transition-colors' }, t('privacy policy', settings)),
              React.createElement(Link, { to: '/api/feed/rss', className: 'hover:text-gray-900 transition-colors', target: '_blank', rel: 'noopener' }, 'RSS'),
            ),
      ),
      React.createElement('p', { className: 'text-xs text-gray-400' }, '© ' + year + ' ' + (settings.site_title || 'Mortar')),
    ),
  );
}
