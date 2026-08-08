import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { ContentSkeleton } from '../components/Skeleton';
import { useTheme } from '../themes';

export default function PageView({ settings }: { settings: Record<string, string> }) {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);

  useEffect(() => { api.get('/pages/slug/' + slug).then(r => setPage(r.data)).catch(() => setPage({ error: true })); }, [slug]);

  useSEO(page ? { title: page.title, description: page.excerpt || '', image: page.featured || undefined, url: (settings.site_url || window.location.origin) + '/page/' + page.slug } : {});

  if (!page) return React.createElement(ContentSkeleton, null);
  if (page.error) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' }, React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)), React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm mt-4 inline-block' }, '\u2190 ' + t('back to home', settings)));

  const Layout = useTheme().PageLayout;
  return React.createElement(Layout, { settings, page });
}
