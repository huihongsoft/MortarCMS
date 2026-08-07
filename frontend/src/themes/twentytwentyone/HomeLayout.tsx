import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import TagCloudWidget from '../../components/TagCloudWidget';
import RecentPostsWidget from '../../components/RecentPostsWidget';
import SearchWidget from '../../components/SearchWidget';
import ArchiveWidget from '../../components/ArchiveWidget';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// Twenty Twenty-One homepage: rounded cards + right sidebar
export default function TT1HomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage } = props;

  return React.createElement('div', null,
    catSlug && React.createElement('div', { className: 'py-12 text-center border-b border-gray-200' },
      React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
    ),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-12' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-10' },
        React.createElement('div', { className: 'lg:col-span-2 space-y-8' },
          posts.length === 0
            ? React.createElement('p', { className: 'text-gray-500 text-center py-16' }, loadError ? t('failed to load posts', settings) : t('no posts yet', settings))
            : posts.map((p: any) =>
                React.createElement('article', { key: p.id, className: 'bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow' },
                  p.featured && React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full h-52 object-cover rounded-2xl mb-6', loading: 'lazy' })),
                  React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-400 mb-3' },
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username),
                    p.categories?.[0] && React.createElement('span', { className: 'text-orange-600' }, p.categories[0].name),
                  ),
                  React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('h2', { className: 'text-2xl font-medium tracking-tight text-gray-900 hover:text-orange-600 mb-3' }, p.title)),
                  p.excerpt && React.createElement('p', { className: 'text-gray-500 text-sm leading-relaxed mb-4' }, p.excerpt),
                  React.createElement(Link, { to: '/post/' + p.slug, className: 'inline-block text-sm font-medium text-orange-600 hover:text-orange-500' }, t('read more', settings), ' \u2192'),
                )
              ),
          total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-4' },
            React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, '\u2190 ' + t('previous', settings)),
            React.createElement('span', { className: 'text-sm text-gray-400' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
            React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, t('next', settings) + ' \u2192'),
          )
        ),
        React.createElement('aside', { className: 'space-y-6' },
          React.createElement(SearchWidget),
          React.createElement(RecentPostsWidget),
          React.createElement(TagCloudWidget),
          React.createElement(ArchiveWidget),
        )
      )
    )
  );
}
