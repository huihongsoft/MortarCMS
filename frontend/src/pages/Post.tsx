import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Folder, Tag, ArrowLeft, MessageSquare } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import DOMPurify from 'dompurify';
import { cdnUrl, cdnHtml } from '../lib/cdn';
import api from '../lib/api';
import { timeAgo, readingTime } from '../lib/time';
import { embedContent } from '../lib/embed';
import { initLightbox } from '../lib/lightbox';
import { gravatarUrl } from '../lib/gravatar';
import SocialShare from '../components/SocialShare';
import RelatedPosts from '../components/RelatedPosts';
import Breadcrumbs from '../components/Breadcrumbs';
import { t } from '../lib/i18n';

export default function PostPage({ settings }: { settings: Record<string, string> }) {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTimeout(initLightbox, 100);
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

  return React.createElement('article', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Breadcrumbs, { items: [{ label: t('blog', settings), to: '/' }, { label: post.title || t('post', settings) }] }),
    React.createElement('header', { className: 'mb-8' },
      React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-4' },
        post.format && post.format !== 'standard' ? React.createElement('span', { className: 'block text-xs font-normal text-gray-400 mb-1 uppercase tracking-wider' }, post.format) : null,
        post.title),
      React.createElement('div', { className: 'flex flex-wrap items-center gap-4 text-sm text-gray-500' },
        React.createElement('span', { className: 'text-xs text-gray-400' }, readingTime(post.content || '') + ' \u00b7 ' + (post.content || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length + ' ' + t('words', settings)),
        React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 14 }), timeAgo(post.publishedAt || post.createdAt)),
        React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 14 }), post.author?.username),
        post.categories?.length > 0 && React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Folder, { size: 14 }),
          post.categories.map((c: any) => React.createElement(Link, { key: c.categoryId, to: '/category/' + c.slug, className: 'hover:text-primary-600' }, c.name))),
        post.tags?.length > 0 && React.createElement('span', { className: 'flex items-center gap-1 flex-wrap' }, React.createElement(Tag, { size: 14 }),
          post.tags.map((t: any) => React.createElement(Link, { key: t.tagId, to: '/tag/' + t.slug, className: 'px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 hover:bg-primary-100 hover:text-primary-700' }, t.name))))),
    post.featured && React.createElement('img', { src: cdnUrl(post.featured, settings), alt: post.title, className: 'w-full max-h-96 object-cover rounded-lg mb-8', loading: 'lazy', srcSet: post.srcset ? Object.entries(post.srcset).map(([w, u]) => (cdnUrl(u as string, settings) as string) + ' ' + w + 'w').join(', ') : undefined }),
    React.createElement('div', { className: 'prose prose-gray max-w-none mb-12', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(post.content)), settings) } }),
    post?.author && React.createElement('div', { className: 'flex items-start gap-4 mt-12 pt-6 border-t border-gray-200' },
      React.createElement('img', { src: gravatarUrl(post.author?.email || ''), alt: '', className: 'w-12 h-12 rounded-full' }),
      React.createElement('div', null,
        React.createElement('p', { className: 'font-medium text-gray-900' }, post.author?.username),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, post.author?.bio || t('author', settings)))),
    React.createElement('div', { className: 'flex justify-between items-center mt-12 pt-6 border-t border-gray-200' },
      React.createElement(Link, { to: '/', className: 'text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1' }, '\u2190 ' + t('all posts', settings)),
      React.createElement('div', { className: 'flex gap-3 items-center' },
        React.createElement(SocialShare, { title: post.title, url: '/post/' + post.slug, siteUrl: settings.site_url }),
        React.createElement('a', { href: '#comments', className: 'text-sm text-gray-500 hover:text-primary-600' }, t('comments', settings) + ' \u2193'),
        React.createElement(Link, { to: '/search', className: 'text-sm text-gray-500 hover:text-primary-600' }, t('search', settings) + ' \u2192'))),
    React.createElement('section', { className: 'border-t border-gray-200 pt-8 mt-12' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, t('related posts', settings)),
      slug && React.createElement(RelatedPosts, { postId: post?.id, slug: slug })),
    React.createElement('section', { className: 'border-t border-gray-200 pt-8' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, t('comments', settings)),
      comments.length === 0 && !submitted && React.createElement('div', { className: 'text-center py-4' },
        React.createElement('p', { className: 'text-sm text-gray-400' }, t('no comments yet', settings) + '. ' + t('be the first to share your thoughts', settings) + '!')),
      comments.map((c: any) => React.createElement('div', { key: c.id, className: 'mb-4 pb-4 border-b border-gray-100 last:border-0' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
          React.createElement('span', { className: 'font-medium text-sm' }, c.author),
          React.createElement('span', { className: 'text-xs text-gray-400' }, new Date(c.createdAt).toLocaleDateString())),
        React.createElement('p', { className: 'text-sm text-gray-700' }, c.content),
        c.children?.map((child: any) => React.createElement('div', { key: child.id, className: 'ml-6 mt-3 pl-4 border-l-2 border-gray-100' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
            React.createElement('span', { className: 'font-medium text-sm' }, child.author),
            React.createElement('span', { className: 'text-xs text-gray-400' }, new Date(child.createdAt).toLocaleDateString())),
          React.createElement('p', { className: 'text-sm text-gray-700' }, child.content))))),
      submitted && React.createElement('p', { className: 'text-sm text-green-600 mb-4' }, t('comment submitted and pending review', settings)),
      React.createElement('form', { onSubmit: submitComment, className: 'space-y-3 mt-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-900' }, t('leave a comment', settings)),
        React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
          React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), className: 'input-field' }),
          React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', className: 'input-field' })),
        React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', className: 'input-field', rows: 3, required: true }),
        React.createElement('button', { type: 'submit', className: 'btn-primary' }, t('submit comment', settings)))));
}
