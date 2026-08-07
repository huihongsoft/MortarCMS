import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Default monthly archive template
export default function ArchiveLayout(props: any) {
  const { data, year, month } = props;

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Link, { to: '/', className: 'inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6' }, React.createElement(ArrowLeft, { size: 14 }), t('back')),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6' }, MONTHS[parseInt(month || '1') - 1] + ' ' + year),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, data.total + ' ' + t('posts')),
    data.posts.length === 0
      ? React.createElement('p', { className: 'text-gray-500' }, t('no posts in this month'))
      : React.createElement('div', { className: 'space-y-6' },
          data.posts.map((p: any) => React.createElement('article', { key: p.id, className: 'pb-6 border-b border-gray-100 last:border-0' },
            React.createElement(Link, { to: '/post/' + p.slug }, React.createElement('h2', { className: 'text-lg font-bold text-gray-900 hover:text-primary-600 mb-2' }, p.title)),
            React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500' },
              React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt))
            ),
            p.excerpt && React.createElement('p', { className: 'text-sm text-gray-600 mt-2' }, p.excerpt)
          ))
        )
  );
}
