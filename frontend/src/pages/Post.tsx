import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { cdnUrl } from '../lib/cdn';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';

export default function PostPage({ settings }: { settings: Record<string, string> }) {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/posts/slug/' + slug).then(r => {
      if (cancelled) return;
      setPost(r.data);
      api.get('/comments/post/' + r.data.id).then(cr => { if (!cancelled) setComments(cr.data); }).catch(() => {});
    }).catch(() => { if (!cancelled) setPost({ error: true }); });
    return () => { cancelled = true; };
  }, [slug]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentForm.content) return;
    // Honeypot: silently drop submissions where bots filled the hidden field
    if ((document.querySelector('[name="website_url"]') as HTMLInputElement)?.value) return;
    await api.post('/comments', { ...commentForm, postId: post.id });
    setSubmitted(true);
    setCommentForm({ author: '', email: '', content: '' });
  }

  useSEO(post ? {
    title: post.title,
    description: post.excerpt || '',
    image: cdnUrl(post.featured, settings),
    url: (settings.site_url || window.location.origin) + '/post/' + post.slug,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || undefined,
        image: cdnUrl(post.featured, settings),
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: { '@type': 'Person', name: post.author?.username || 'Anonymous' },
        mainEntityOfPage: (settings.site_url || window.location.origin) + '/post/' + post.slug,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: settings.site_url || window.location.origin },
          { '@type': 'ListItem', position: 2, name: post.title, item: (settings.site_url || window.location.origin) + '/post/' + post.slug },
        ],
      },
    ],
  } : {});

  if (!post) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' },
    React.createElement('p', { className: 'text-gray-500' }, t('loading', settings)));

  if (post.error) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)),
    React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm mt-4 inline-block' }, t('back to home', settings)));

  if (post.protected) return React.createElement('div', { className: 'max-w-md mx-auto py-20 text-center' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('password protected', settings)),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('enter the password to view this post', settings)),
    React.createElement('form', { onSubmit: (e: React.FormEvent) => { e.preventDefault(); const p = (document.getElementById('post-pwd') as HTMLInputElement)?.value; if (p) window.location.search = '?pwd=' + encodeURIComponent(p); }, className: 'space-y-4' },
      React.createElement('input', { id: 'post-pwd', type: 'password', placeholder: t('enter password', settings), className: 'input-field text-center', required: true }),
      React.createElement('button', { type: 'submit', className: 'btn-primary w-full justify-center' }, t('submit', settings))));

  const Layout = useTheme().PostLayout;
  return React.createElement(Layout, { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, slug });
}
