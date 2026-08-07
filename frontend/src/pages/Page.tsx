import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import DOMPurify from 'dompurify';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function PageView({ settings }: { settings: Record<string, string> }) {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);

  useEffect(() => { api.get('/pages/slug/' + slug).then(r => setPage(r.data)).catch(() => setPage({ error: true })); }, [slug]);

  useSEO(page ? { title: page.title, description: page.excerpt || '', image: page.featured || undefined, url: (settings.site_url || window.location.origin) + '/page/' + page.slug } : {});

  if (!page) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' }, React.createElement('p', { className: 'text-gray-500' }, t('loading', settings)));
  if (page.error) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' }, React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)), React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm mt-4 inline-block' }, '\u2190 ' + t('back to home', settings)));

  return React.createElement('article', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Link, { to: '/', className: 'inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6' }, React.createElement(ArrowLeft, { size: 14 }), t('back', settings)),
    React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-6' }, page.title),
    React.createElement('div', { className: 'prose prose-gray max-w-none', dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(page.content) } })
  );
}
