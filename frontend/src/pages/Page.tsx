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
  const [pwdError, setPwdError] = useState(false);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    setPwdError(false);
    api.get('/pages/slug/' + slug).then(r => setPage(r.data)).catch(err => {
      // 403 with { private: true } → truly private page
      if (err.response?.status === 403 && err.response.data?.private) setPage({ private: true, title: err.response.data.title, slug: err.response.data.slug });
      else setPage({ error: true });
    });
  }, [slug]);

  useSEO(page && !page.protected && !page.private ? {
    title: page.title,
    description: page.excerpt || '',
    image: page.featured || undefined,
    url: (settings.site_url || window.location.origin) + '/page/' + page.slug,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.excerpt || undefined,
        url: (settings.site_url || window.location.origin) + '/page/' + page.slug,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('home', settings), item: settings.site_url || window.location.origin },
          { '@type': 'ListItem', position: 2, name: page.title, item: (settings.site_url || window.location.origin) + '/page/' + page.slug },
        ],
      },
    ],
  } : {});

  if (!page) return React.createElement(ContentSkeleton, null);
  if (page.error) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' }, React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)), React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm mt-4 inline-block' }, '\u2190 ' + t('back to home', settings)));

  // Truly private page — staff only
  if (page.private) return React.createElement('div', { className: 'max-w-md mx-auto py-20 text-center' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('this page is private', settings)),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('log in to view this page', settings)),
    React.createElement(Link, { to: '/login', className: 'btn-primary inline-flex' }, t('log in', settings)));

  // Password protected — WordPress style: POST the password, server sets an
  // httpOnly cookie, then we reload so the cookie unlocks the content.
  if (page.protected) return React.createElement('div', { className: 'max-w-md mx-auto py-20 text-center' },
    page.title && React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, page.title),
    React.createElement('h2', { className: 'text-lg font-semibold text-gray-800 mb-2' }, t('password protected', settings)),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('enter the password to view this post', settings)),
    React.createElement('form', { onSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        const p = (document.getElementById('page-pwd') as HTMLInputElement)?.value;
        if (!p || pwdSubmitting) return;
        setPwdSubmitting(true); setPwdError(false);
        api.post('/pages/slug/' + slug + '/password', { password: p })
          .then(() => { window.location.reload(); })
          .catch(() => { setPwdError(true); setPwdSubmitting(false); });
      }, className: 'space-y-4' },
      React.createElement('input', { id: 'page-pwd', type: 'password', placeholder: t('enter password', settings), className: 'input-field text-center', required: true, autoFocus: true }),
      pwdError && React.createElement('p', { className: 'text-sm text-red-600' }, t('wrong password, please try again', settings)),
      React.createElement('button', { type: 'submit', disabled: pwdSubmitting, className: 'btn-primary w-full justify-center' }, pwdSubmitting ? t('checking', settings) + '…' : t('submit', settings))));

  const Layout = useTheme().PageLayout;
  return React.createElement(Layout, { settings, page });
}
