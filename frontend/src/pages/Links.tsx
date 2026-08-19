import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Navigation-site page: links grouped by category, each card showing the
// site's icon, name, description and any associated posts (e.g. an official
// site plus its install/usage tutorials). Clicking a link bumps its counter.
export default function LinksPage({ settings }: { settings: Record<string, string> }) {
  const [groups, setGroups] = useState<{ category: any; links: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  // ?category=slug (menu items point here) filters to a single category
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/links').then((r) => {
      const links: any[] = (r.data || []).filter((l: any) => l.active !== 0);
      const byCat = new Map<string, any[]>();
      for (const l of links) {
        const key = l.categoryId || '';
        if (!byCat.has(key)) byCat.set(key, []);
        byCat.get(key)!.push(l);
      }
      api.get('/links/categories').then((cr) => {
        const cats = new Map<string, any>();
        (cr.data || []).forEach((c: any) => cats.set(c.id, c));
        const sorted = [...byCat.keys()].sort((a, b) => {
          if (!a) return 1; if (!b) return -1;
          return (cats.get(a)?.menuOrder || 0) - (cats.get(b)?.menuOrder || 0);
        });
        setGroups(sorted.map((k) => ({ category: k ? cats.get(k) : null, links: byCat.get(k)! })));
        setLoading(false);
      }).catch(() => { setGroups([...byCat.entries()].map(([k, v]) => ({ category: null, links: v }))); setLoading(false); });
    }).catch(() => setLoading(false));
  }, []);

  // ?category=slug: show only that category's links
  const visibleGroups = categoryFilter
    ? groups.filter((g) => g.category && g.category.slug === categoryFilter)
    : groups;

  useSEO({
    siteTitle: settings.site_title,
    title: t('navigation links'),
    url: window.location.origin + '/links',
    jsonLd: groups.flatMap(g => g.links.map((l: any) => ({ '@type': 'ListItem', position: 1, name: l.name, url: l.url }))).length
      ? [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: groups.flatMap(g => g.links.slice(0, 8).map((l: any) => ({ '@type': 'ListItem', position: 1, name: l.name, url: l.url }))) }]
      : [],
  });

  if (loading) return React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-12' }, React.createElement('p', { className: 'text-gray-400' }, t('loading') + '…'));
  if (groups.length === 0) return React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-12' }, React.createElement('p', { className: 'text-gray-500' }, t('no links yet')));
  if (visibleGroups.length === 0) return React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-12' }, React.createElement('p', { className: 'text-gray-500' }, t('no links yet')));

  return React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-10' },
    React.createElement('h1', { className: 'text-2xl sm:text-3xl font-bold text-gray-900 mb-8', style: { fontSize: 'var(--heading-max-size, 30px)' } },
      categoryFilter ? (visibleGroups[0]?.category?.name || t('navigation links')) : t('navigation links')),
    categoryFilter && React.createElement('p', { className: 'mb-6' },
      React.createElement(Link, { to: '/links', className: 'text-sm text-primary-600 hover:underline' }, '← ' + t('all categories'))
    ),
    visibleGroups.map((g) => (
      React.createElement('section', { key: g.category?.id || 'uncat', className: 'mb-10' },
        g.category && React.createElement('h2', { className: 'text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100' }, g.category.name),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          g.links.map((l: any) => (
            React.createElement('div', { key: l.id, className: 'rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:border-primary-200 transition-shadow' },
              React.createElement('a', {
                href: l.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                onClick: () => { try { api.post('/links/' + l.id + '/click'); } catch {} },
                className: 'flex items-center gap-3',
              },
                l.avatar
                  ? React.createElement('img', { src: l.avatar, alt: '', className: 'w-10 h-10 rounded-full object-cover flex-shrink-0' })
                  : React.createElement('span', { className: 'w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0' }, (l.name || '?')[0].toUpperCase()),
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('p', { className: 'font-semibold text-gray-900 truncate' }, l.name),
                  l.site && React.createElement('p', { className: 'text-[10px] text-gray-400' }, l.site.name)
                )
              ),
              l.description && React.createElement('p', { className: 'text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2' }, l.description),
              // Linked internal page
              l.page && React.createElement('p', { className: 'text-xs mt-1.5' },
                React.createElement(Link, { to: '/page/' + l.page.slug, className: 'text-primary-600 hover:underline' }, '↗ ' + l.page.title)
              ),
              // Associated posts (e.g. the site's tutorials)
              (l.posts || []).length > 0 && React.createElement('div', { className: 'mt-2.5 flex flex-wrap gap-1' },
                l.posts.slice(0, 3).map((p: any) => (
                  React.createElement(Link, { key: p.id, to: '/post/' + p.slug, className: 'px-2 py-0.5 text-[11px] rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors' }, p.title)
                )),
                (l.posts || []).length > 3 && React.createElement('span', { className: 'text-[11px] text-gray-400' }, '+' + ((l.posts || []).length - 3))
              )
            )
          ))
        )
      )
    ))
  );
}
