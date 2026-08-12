import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Files } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Published pages list (WordPress-style Pages widget)
export default function PagesWidget() {
  const [pages, setPages] = useState<any[]>([]);
  useEffect(() => { api.get('/pages/public').then(r => setPages(r.data || [])).catch(() => {}); }, []);
  if (pages.length === 0) return null;
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5' }, React.createElement(Files, { size: 14, className: 'text-gray-400' }), t('pages')),
    React.createElement('ul', { className: 'space-y-1.5' },
      pages.map((p: any) => React.createElement('li', { key: p.id },
        React.createElement(Link, { to: '/page/' + p.slug, className: 'text-sm text-gray-600 hover:text-primary-600' }, p.title)
      ))
    )
  );
}
