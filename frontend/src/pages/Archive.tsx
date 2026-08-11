import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { ListSkeleton } from '../components/Skeleton';
import { useTheme } from '../themes';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ArchivePage({ settings }: { settings: Record<string, string> }) {
  const { year, month } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/posts/archive/' + year + '/' + month).then(r => setData(r.data)).catch(() => setData({ error: true }));
  }, [year, month]);

  const monthLabel = MONTHS[parseInt(month || '1') - 1] + ' ' + year;
  useSEO({
    title: monthLabel + ' ' + t('archive'),
    url: window.location.origin + '/archive/' + year + '/' + month,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('home'), item: window.location.origin + '/' },
          { '@type': 'ListItem', position: 2, name: monthLabel, item: window.location.origin + '/archive/' + year + '/' + month },
        ],
      },
      ...(data?.posts?.length ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: data.posts.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: window.location.origin + '/post/' + p.slug })),
      }] : []),
    ],
  });

  if (!data) return React.createElement(ListSkeleton, null);
  if (data.error) return React.createElement('p', { className: 'text-gray-500 p-8' }, t('failed to load archive'));

  const Layout = useTheme().ArchiveLayout;
  return React.createElement(Layout, { data, year, month });
}
