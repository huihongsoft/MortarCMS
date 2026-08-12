import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { cdnUrl } from '../lib/cdn';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { ContentSkeleton } from '../components/Skeleton';
import { useTheme } from '../themes';

// WordPress-style password form: POST the password, server sets an httpOnly
// cookie, then reload so the cookie unlocks the content.
function PasswordForm({ title, slug, settings }: { title?: string; slug?: string; settings: Record<string, string> }) {
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  return React.createElement('div', { className: 'max-w-md mx-auto py-20 text-center' },
    title && React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, title),
    React.createElement('h2', { className: 'text-lg font-semibold text-gray-800 mb-2' }, t('password protected', settings)),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('enter the password to view this post', settings)),
    React.createElement('form', { onSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        const p = (document.getElementById('post-pwd') as HTMLInputElement)?.value;
        if (!p || busy) return;
        setBusy(true); setErr(false);
        api.post('/posts/slug/' + slug + '/password', { password: p })
          .then(() => { window.location.reload(); })
          .catch(() => { setErr(true); setBusy(false); });
      }, className: 'space-y-4' },
      React.createElement('input', { id: 'post-pwd', type: 'password', placeholder: t('enter password', settings), className: 'input-field text-center', required: true, autoFocus: true }),
      err && React.createElement('p', { className: 'text-sm text-red-600' }, t('wrong password, please try again', settings)),
      React.createElement('button', { type: 'submit', disabled: busy, className: 'btn-primary w-full justify-center' }, busy ? t('checking', settings) + '…' : t('submit', settings))));
}

export default function PostPage({ settings }: { settings: Record<string, string> }) {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '', notifyMe: false });
  const [commentError, setCommentError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Remember commenter name/email locally so returning visitors are pre-filled
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mortar_commenter');
      if (saved) {
        const p = JSON.parse(saved);
        setCommentForm(f => ({ ...f, author: p.author || '', email: p.email || '' }));
      }
    } catch {}
  }, []);

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
    setCommentError('');
    if (!commentForm.content) return;
    if (!commentForm.author || !commentForm.email) { setCommentError(t('name and email are required to comment', settings)); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(commentForm.email)) { setCommentError(t('enter a valid email address', settings)); return; }
    // Honeypot: silently drop submissions where bots filled the hidden field
    if ((document.querySelector('[name="website_url"]') as HTMLInputElement)?.value) return;
    try {
      await api.post('/comments', { ...commentForm, subscribe: commentForm.notifyMe, postId: post.id });
      // Remember the commenter for next time (privacy-friendly: name + email only)
      try { localStorage.setItem('mortar_commenter', JSON.stringify({ author: commentForm.author, email: commentForm.email })); } catch {}
      setSubmitted(true);
      setCommentForm({ author: commentForm.author, email: commentForm.email, content: '', notifyMe: false });
      // Refresh the visible comments (approval may be instant)
      api.get('/comments/post/' + post.id).then(cr => setComments(cr.data)).catch(() => {});
    } catch (err: any) {
      // Show the error inline and keep the form content so the user can retry
      setCommentError(err.response?.data?.error || t('comment failed', settings));
    }
  }

  const seoTitle = post?.meta?._seo_title || post?.title;
  const seoDesc = post?.meta?._seo_desc || post?.excerpt || '';
  const ogImage = post?.meta?._seo_og_image || post?.featured;
  useSEO(post ? {
    siteTitle: settings.site_title,
    title: seoTitle,
    description: seoDesc,
    image: cdnUrl(ogImage, settings),
    url: (settings.site_url || window.location.origin) + '/post/' + post.slug,
    type: 'article',
    noindex: post.meta?._seo_noindex === '1',
    canonical: post.meta?._seo_canonical || undefined,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seoTitle,
        description: seoDesc || undefined,
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

  if (!post) return React.createElement(ContentSkeleton, null);

  if (post.error) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)),
    React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm mt-4 inline-block' }, t('back to home', settings)));

  if (post.protected) return React.createElement(PasswordForm, { title: post.title, slug, settings });

  const Layout = useTheme().PostLayout;
  return React.createElement(Layout, { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, commentError, slug });
}
