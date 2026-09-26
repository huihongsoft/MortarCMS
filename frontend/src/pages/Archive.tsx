import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { ListSkeleton } from '../components/Skeleton';
import { useTheme } from '../themes';
import { postPath } from '../lib/permalink';
import Pagination from '../components/Pagination';
import { siteOrigin } from '../lib/ssr';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ArchivePage({ settings }: { settings: Record<string, string> }) {
  const { year, month } = useParams();
  const [data, setData] = useState<any>(null);
  // A missing month means the yearly archive (/archive/2026); the pager reuses
  // the same endpoint with ?page=.
  const [page, setPage] = useState(1);
  // Must run unconditionally: hooks cannot be called after an early return
  const theme = useTheme();

  useEffect(() => { setPage(1); }, [year, month]);
  useEffect(() => {
    const perPage = settings.posts_per_page || '10';
    const url = '/posts/archive/' + year + (month ? '/' + month : '') + '?page=' + page + '&limit=' + perPage;
    api.get(url).then(r => setData(r.data)).catch(() => setData({ error: true }));
  }, [year, month, page, settings.posts_per_page]);

  const monthLabel = month ? MONTHS[parseInt(month || '1') - 1] + ' ' + year : year;
  useSEO({
    siteTitle: settings.site_title,
    title: monthLabel + ' ' + t('archive'),
    url: siteOrigin(settings) + '/archive/' + year + (month ? '/' + month : ''),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('home'), item: siteOrigin(settings) + '/' },
          { '@type': 'ListItem', position: 2, name: monthLabel, item: siteOrigin(settings) + '/archive/' + year + (month ? '/' + month : '') },
        ],
      },
      ...(data?.posts?.length ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: data.posts.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: siteOrigin(settings) + postPath(p.slug) })),
      }] : []),
    ],
  });

  if (!data) return React.createElement(ListSkeleton, null);
  if (data.error) return React.createElement('p', { className: 'text-gray-500 p-8' }, t('failed to load archive'));

  const Layout = theme.ArchiveLayout;
  const pagination = React.createElement(Pagination, {
    page, total: data.total || 0, perPage: parseInt(settings.posts_per_page || '10'), onChange: setPage, settings,
  });
  return React.createElement(Layout, { settings, data, year, month, pagination, page, total: data.total, setPage });
}
