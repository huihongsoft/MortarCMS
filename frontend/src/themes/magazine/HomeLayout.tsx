import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Folder } from 'lucide-react';
import TagCloudWidget from '../../components/TagCloudWidget';
import RecentPostsWidget from '../../components/RecentPostsWidget';
import PopularPostsWidget from '../../components/PopularPostsWidget';
import ArchiveWidget from '../../components/ArchiveWidget';
import SearchWidget from '../../components/SearchWidget';
import LinksWidget from '../../components/LinksWidget';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// Magazine homepage template: serif headline for the first post + left sidebar
export default function MagazineHomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories } = props;

  const serif = { fontFamily: 'Georgia, serif' };
  const [lead, ...rest] = posts;

  return React.createElement('div', null,
    catSlug && React.createElement('div', { className: 'bg-red-700 text-white py-10 text-center' },
      React.createElement('h1', { className: 'text-3xl font-bold capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
    ),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-8' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' },
        // Left sidebar (magazine style)
        React.createElement('aside', { className: 'order-2 lg:order-1 space-y-6' },
          (() => {
            const activeWidgets: string[] = (() => { try { return JSON.parse(settings.widgets_active || '[]'); } catch { return []; } })();
            const has = (id: string) => activeWidgets.length === 0 || activeWidgets.includes(id);
            return React.createElement(React.Fragment, null,
              has('search') && React.createElement(SearchWidget),
              has('recent_posts') && React.createElement(RecentPostsWidget),
              has('popular') && React.createElement(PopularPostsWidget),
              has('tag_cloud') && React.createElement(TagCloudWidget),
              has('archives') && React.createElement(ArchiveWidget),
              has('links') && React.createElement(LinksWidget),
            );
          })(),
          React.createElement('div', { className: 'rounded-lg border-2 border-red-700 p-4' },
            React.createElement('h3', { className: 'text-sm font-bold text-red-700 mb-3 uppercase tracking-wider', style: serif }, t('categories', settings)),
            categories.length === 0
              ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('no categories yet', settings))
              : React.createElement('ul', { className: 'space-y-1' }, categories.map((c: any) => React.createElement('li', { key: c.id },
                  React.createElement(Link, { to: '/category/' + c.slug, className: 'text-sm ' + (catSlug === c.slug ? 'text-red-700 font-medium' : 'text-gray-600 hover:text-red-700') }, c.name, c._count?.posts > 0 ? React.createElement('span', { className: 'text-gray-400 ml-1' }, '(' + c._count.posts + ')') : null)
                ))))
        ),
        // Main column
        React.createElement('div', { className: 'order-1 lg:order-2 lg:col-span-2' },
          posts.length === 0
            ? loadError
              ? React.createElement('div', { className: 'text-center py-20' }, React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('failed to load posts', settings)))
              : React.createElement('div', { className: 'text-center py-20' }, React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no posts yet', settings)))
            : React.createElement('div', { className: 'space-y-10' },
                // Lead story: big card
                lead && React.createElement('article', { className: 'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200' },
                  lead.featured && React.createElement('img', { src: cdnUrl(lead.featured, settings), alt: lead.title, className: 'w-full h-64 object-cover', loading: 'lazy' }),
                  React.createElement('div', { className: 'p-6' },
                    React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500 mb-2' },
                      React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(lead.publishedAt || lead.createdAt)),
                      React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), lead.author?.username),
                      lead.categories?.[0] && React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Folder, { size: 12 }), lead.categories[0].name)
                    ),
                    React.createElement(Link, { to: '/post/' + lead.slug },
                      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 hover:text-red-700 mb-2', style: serif }, lead.title)),
                    lead.excerpt && React.createElement('p', { className: 'text-gray-600 text-sm leading-relaxed' }, lead.excerpt),
                    React.createElement(Link, { to: '/post/' + lead.slug, className: 'inline-block mt-3 text-sm font-medium text-red-700 hover:text-red-800' }, t('read more', settings)),
                  )
                ),
                // Rest of posts: list with left border
                rest.map((p: any) => React.createElement('article', { key: p.id, className: 'border-l-4 border-red-700 pl-4 py-2' },
                  React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('h3', { className: 'text-lg font-bold text-gray-900 hover:text-red-700', style: serif }, p.title)),
                  React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500 mt-1' },
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username)
                  ),
                  p.excerpt && React.createElement('p', { className: 'text-gray-600 text-sm mt-2' }, p.excerpt)
                ))
              ),
          total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-6' },
            React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50' }, '\u2190 ' + t('previous', settings)),
            React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
            React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50' }, t('next', settings) + ' \u2192')
          )
        )
      )
    )
  );
}
