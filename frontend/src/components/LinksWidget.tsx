import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function LinksWidget() {
  const [links, setLinks] = useState<any[]>([]);
  useEffect(() => { api.get('/links').then(r => setLinks(r.data || [])).catch(() => {}); }, []);
  if (links.length === 0) return null;
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('links')),
    React.createElement('ul', { className: 'space-y-1.5' },
      links.map((l: any) =>
        React.createElement('li', { key: l.id },
          React.createElement('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', className: 'flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600' },
            l.avatar ? React.createElement('img', { src: l.avatar, alt: '', className: 'w-5 h-5 rounded-full object-cover' }) : null,
            React.createElement('span', { className: 'truncate' }, l.name)
          )
        )
      )
    )
  );
}
