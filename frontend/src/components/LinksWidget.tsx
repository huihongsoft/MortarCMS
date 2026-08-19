import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Navigation-site link widget: links grouped by category, each showing its
// description and any associated posts (e.g. an official site plus its
// tutorials). Clicking a link also bumps its click counter.
export default function LinksWidget() {
  const [groups, setGroups] = useState<{ category: any; links: any[] }[]>([]);
  useEffect(() => {
    api.get('/links').then((r) => {
      const links: any[] = (r.data || []).filter((l: any) => l.active !== 0);
      const catOrder: any[] = [];
      const map = new Map<string, any[]>();
      for (const l of links) {
        const key = l.categoryId || '';
        if (!map.has(key)) { map.set(key, []); catOrder.push(key); }
        map.get(key)!.push(l);
      }
      // Categories sorted by their menuOrder, uncategorized last
      api.get('/links/categories').then((cr) => {
        const cats = new Map<string, any>();
        (cr.data || []).forEach((c: any) => cats.set(c.id, c));
        const sortedKeys = [...catOrder].sort((a, b) => {
          if (!a) return 1; if (!b) return -1;
          return (cats.get(a)?.menuOrder || 0) - (cats.get(b)?.menuOrder || 0);
        });
        setGroups(sortedKeys.map((k) => ({ category: k ? cats.get(k) : null, links: map.get(k)! })));
      }).catch(() => {
        setGroups(catOrder.map((k) => ({ category: null, links: map.get(k)! })));
      });
    }).catch(() => {});
  }, []);
  if (groups.length === 0) return null;

  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('links')),
    React.createElement('div', { className: 'space-y-4' },
      groups.map((g) => (
        React.createElement('div', { key: g.category?.id || 'uncat' },
          g.category && React.createElement('h4', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5' }, g.category.name),
          React.createElement('div', { className: 'space-y-2' },
            g.links.map((l: any) => (
              React.createElement('div', { key: l.id, className: 'group' },
                React.createElement('a', {
                  href: l.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  onClick: () => { try { api.post('/links/' + l.id + '/click'); } catch {} },
                  className: 'flex items-start gap-2 text-sm text-gray-700 hover:text-primary-600',
                },
                  l.avatar
                    ? React.createElement('img', { src: l.avatar, alt: '', className: 'w-5 h-5 rounded-full object-cover mt-0.5 flex-shrink-0' })
                    : React.createElement('span', { className: 'w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5' }, (l.name || '?')[0].toUpperCase()),
                  React.createElement('span', { className: 'min-w-0' },
                    React.createElement('span', { className: 'font-medium block truncate' }, l.name),
                    l.description && React.createElement('span', { className: 'text-xs text-gray-400 block line-clamp-2' }, l.description)
                  )
                ),
                // Associated posts (e.g. the site's tutorials)
                (l.posts || []).length > 0 && React.createElement('div', { className: 'ml-7 mt-1 flex flex-wrap gap-1' },
                  l.posts.slice(0, 4).map((p: any) => (
                    React.createElement(Link, { key: p.id, to: '/post/' + p.slug, className: 'px-1.5 py-0.5 text-[10px] rounded bg-primary-50 text-primary-600 hover:bg-primary-100' }, p.title)
                  )),
                  (l.posts || []).length > 4 && React.createElement('span', { className: 'text-[10px] text-gray-400' }, '+' + ((l.posts || []).length - 4))
                )
              )
            ))
          )
        )
      ))
    )
  );
}
