import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import TagCloudWidget from '../../components/TagCloudWidget';
import RecentPostsWidget from '../../components/RecentPostsWidget';
import SearchWidget from '../../components/SearchWidget';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// Twenty Seventeen homepage: clean list + right sidebar
export default function TS17HomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage } = props;

  return React.createElement('div', null,
    catSlug && React.createElement('div', { className: 'py-12 text-center' },
      React.createElement('h1', { className: 'text-3xl font-normal text-gray-900 capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
    ),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-10' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-10' },
        React.createElement('div', { className: 'lg:col-span-2 space-y-10' },
          posts.length === 0
            ? React.createElement('p', { className: 'text-gray-500 text-center py-16' }, loadError ? t('failed to load posts', settings) : t('no posts yet', settings))
            : posts.map((p: any) =>
                React.createElement('article', { key: p.id, className: 'pb-8 border-b border-gray-200' },
                  p.featured && React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full h-56 object-cover mb-6', loading: 'lazy' })),
                  React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500 mb-3' },
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username),
                    p.categories?.[0] && React.createElement('span', { className: 'text-gray-500' }, p.categories[0].name),
                  ),
                  React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('h2', { className: 'text-2xl font-normal text-gray-900 hover:text-gray-600 mb-3' }, p.title)),
                  p.excerpt && React.createElement('p', { className: 'text-gray-600 text-sm leading-relaxed mb-4' }, p.excerpt),
                  React.createElement(Link, { to: '/post/' + p.slug, className: 'text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-gray-600' }, t('read more', settings), ' \u2192'),
                )
              ),
          total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-4' },
            React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, '\u2190 ' + t('previous', settings)),
            React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
            React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, t('next', settings) + ' \u2192'),
          )
        ),
        React.createElement('aside', { className: 'space-y-6' },
          React.createElement(SearchWidget),
          React.createElement(RecentPostsWidget),
          React.createElement(TagCloudWidget),
        )
      )
    )
  );
}
