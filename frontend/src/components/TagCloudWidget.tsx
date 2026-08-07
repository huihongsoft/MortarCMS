import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function TagCloudWidget() {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => { api.get('/tags').then(r => setTags(r.data)).catch(() => {}); }, []);
  if (tags.length === 0) return null;
  const max = Math.max(...tags.map((tag: any) => tag._count?.posts || 0), 1);
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('tag cloud')),
    React.createElement('div', { className: 'flex flex-wrap gap-1.5' },
      tags.map((tag: any) => {
        const size = 0.65 + ((tag._count?.posts || 0) / max) * 0.35;
        return React.createElement(Link, {
          key: tag.id,
          to: '/tag/' + tag.slug,
          className: 'inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors',
          style: { fontSize: size + 'rem' },
          title: (tag._count?.posts || 0) + ' ' + t('posts'),
        }, tag.name + ' (' + (tag._count?.posts || 0) + ')');
      })
    )
  );
}
