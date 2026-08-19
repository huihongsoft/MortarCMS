import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function TagCloudWidget() {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => { api.get('/tags').then(r => setTags(r.data)).catch(() => {}); }, []);
  if (tags.length === 0) return null;
  // Hotness = aggregated views of the tag's published posts (a viral post
  // beats many unread posts); font size and order follow it, the post count
  // stays in the tooltip.
  const sorted = [...tags].sort((a: any, b: any) => (b._count?.views || 0) - (a._count?.views || 0));
  const max = Math.max(...sorted.map((tag: any) => tag._count?.views || 0), 1);
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('tag cloud')),
    React.createElement('div', { className: 'flex flex-wrap gap-1.5' },
      sorted.map((tag: any) => {
        const size = 0.65 + ((tag._count?.views || 0) / max) * 0.35;
        const label = tag.name + ' (' + (tag._count?.views || 0) + ')';
        // A missing slug cannot link anywhere — render plain text
        if (!tag.slug) {
          return React.createElement('span', { key: tag.id, className: 'inline-block px-2 py-0.5 bg-gray-100 rounded-full text-gray-600', style: { fontSize: size + 'rem' } }, label);
        }
        return React.createElement(Link, {
          key: tag.id,
          to: '/tag/' + tag.slug,
          className: 'inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors',
          style: { fontSize: size + 'rem' },
          title: (tag._count?.posts || 0) + ' ' + t('posts') + ' · ' + (tag._count?.views || 0) + ' ' + t('views'),
        }, label);
      })
    )
  );
}
