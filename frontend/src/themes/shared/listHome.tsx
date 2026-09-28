import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import TagCloudWidget from '../../components/TagCloudWidget';
import RecentPostsWidget from '../../components/RecentPostsWidget';
import ArchiveWidget from '../../components/ArchiveWidget';
import SearchWidget from '../../components/SearchWidget';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';
import { postPath } from '../../lib/permalink';

// The "list of posts + right sidebar" homepage, shared by the themes that are the
// same layout in different clothes.
//
// twentyseventeen and twentytwentyone were 86% identical — a card list versus a
// flat list, an orange accent versus grey, `py-12` versus `py-10`. Two 55-line
// files differing only in class strings is a copy, not a design difference, so the
// structure lives here once and each theme passes its tokens.
//
// The other small themes are *not* merged here on purpose: twentynineteen has a
// hero with a rule and a single column, twentytwentyfour a two-column grid,
// magazine a masthead and a featured card. Those are different layouts, and a
// factory general enough to hold all five would be a worse description of them
// than five files.
export interface ListHomeStyles {
  /** Wrapper padding for the page body. */
  pagePadding: string;
  /** Vertical gap between posts. */
  listGap: string;
  /** Extra class on the category banner (a rule under it, in twentytwentyone). */
  bannerExtra?: string;
  /** The banner heading, e.g. normal weight vs bold. */
  bannerTitle: string;
  /** One post's wrapper: a divided row, or a rounded card. */
  article: string;
  image: string;
  /** The category name in the post meta. */
  category: string;
  title: string;
  excerpt: string;
  readMore: string;
  /** twentytwentyone also puts the archive list in its sidebar. */
  archiveWidget?: boolean;
}

export function listHomeLayout(styles: ListHomeStyles) {
  return function ListHomeLayout(props: any) {
    const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage } = props;
    const perPage = parseInt(settings.posts_per_page || '10');

    return React.createElement('div', null,
      catSlug && React.createElement('div', { className: 'py-12 text-center' + (styles.bannerExtra ? ' ' + styles.bannerExtra : '') },
        React.createElement('h1', { className: styles.bannerTitle }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
      ),
      React.createElement('div', { className: 'max-w-5xl mx-auto px-4 ' + styles.pagePadding },
        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-10' },
          React.createElement('div', { className: 'lg:col-span-2 ' + styles.listGap },
            posts.length === 0
              ? React.createElement('p', { className: 'text-gray-500 text-center py-16' }, loadError ? t('failed to load posts', settings) : t('no posts yet', settings))
              : posts.map((p: any) =>
                  React.createElement('article', { key: p.id, className: styles.article },
                    p.featured && React.createElement(Link, { to: postPath(p.slug) },
                      React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: styles.image, loading: 'lazy' })),
                    React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500 mb-3' },
                      React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                      React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username),
                      p.categories?.[0] && React.createElement('span', { className: styles.category }, p.categories[0].name),
                    ),
                    React.createElement(Link, { to: postPath(p.slug) },
                      React.createElement('h2', { className: styles.title }, p.title)),
                    p.excerpt && React.createElement('p', { className: styles.excerpt }, p.excerpt),
                    React.createElement(Link, { to: postPath(p.slug), className: styles.readMore }, t('read more', settings), ' \u2192'),
                  )
                ),
            total > perPage && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-4' },
              React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, '\u2190 ' + t('previous', settings)),
              React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / perPage)),
              React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * perPage >= total, className: 'px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, t('next', settings) + ' \u2192'),
            )
          ),
          React.createElement('aside', { className: 'space-y-6' },
            React.createElement(SearchWidget),
            React.createElement(RecentPostsWidget),
            React.createElement(TagCloudWidget),
            styles.archiveWidget && React.createElement(ArchiveWidget),
          )
        )
      )
    );
  };
}
