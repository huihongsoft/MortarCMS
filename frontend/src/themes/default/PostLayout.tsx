import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Folder, Tag, Clock, MessageSquare, ChevronLeft } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedPosts from '../../components/RelatedPosts';
import SocialShare from '../../components/SocialShare';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { gravatarUrl } from '../../lib/gravatar';
import { timeAgo, readingTime } from '../../lib/time';
import { t } from '../../lib/i18n';
import DOMPurify from 'dompurify';

// Default single-post template — WordPress-style layout
export default function PostLayout(props: any) {
  const { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, slug } = props;

  const category = post.categories?.[0];
  const author = post.author;

  const inputCls = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white';

  // ---- Comments list ----
  const commentList = comments.map((c: any) => (
    React.createElement('div', { key: c.id, className: 'mb-5 p-5 rounded-2xl border border-gray-100' },
      React.createElement('div', { className: 'flex items-center gap-2.5 mb-2' },
        React.createElement('img', { src: gravatarUrl(c.email || ''), alt: '', className: 'w-8 h-8 rounded-full' }),
        React.createElement('div', null,
          React.createElement('p', { className: 'font-medium text-sm text-gray-900' }, c.author),
          React.createElement('p', { className: 'text-xs text-gray-400' }, new Date(c.createdAt).toLocaleDateString()))),
      React.createElement('p', { className: 'text-sm text-gray-700 leading-relaxed' }, c.content),
      (c.children || []).map((child: any) => (
        React.createElement('div', { key: child.id, className: 'ml-8 mt-3 pl-4 border-l-2 border-gray-100' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
            React.createElement('img', { src: gravatarUrl(child.email || ''), alt: '', className: 'w-6 h-6 rounded-full' }),
            React.createElement('span', { className: 'font-medium text-sm text-gray-800' }, child.author)),
          React.createElement('p', { className: 'text-sm text-gray-600' }, child.content))
      ))
    )
  ));

  // ---- Comment form ----
  const commentFormEl = React.createElement('form', { onSubmit: submitComment, className: 'space-y-3 mt-6 p-6 rounded-2xl bg-gray-50' },
    React.createElement('h4', { className: 'text-sm font-semibold text-gray-900' }, t('leave a comment', settings)),
    React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
      React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), className: inputCls }),
      React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', className: inputCls })),
    React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', className: inputCls, rows: 3, required: true }),
    React.createElement('button', { type: 'submit', className: 'w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors', style: { background: 'var(--primary-color, #2563eb)' } }, t('submit comment', settings))
  );

  return React.createElement('article', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Breadcrumbs, { items: [{ label: t('blog', settings), to: '/' }, { label: post.title || t('post', settings) }] }),

    // Header: category chip + title + meta
    React.createElement('header', { className: 'mb-8' },
      category && React.createElement(Link, {
        to: '/category/' + category.slug,
        className: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4',
        style: { background: 'color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent)', color: 'var(--primary-color, #2563eb)' },
      }, React.createElement(Folder, { size: 11 }), category.name),
      React.createElement('h1', { className: 'text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4' },
        post.format && post.format !== 'standard' ? React.createElement('span', { className: 'block text-xs font-normal text-gray-400 mb-1 uppercase tracking-wider' }, post.format) : null,
        post.title),
      React.createElement('div', { className: 'flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 border-y border-gray-100 py-3' },
        React.createElement('span', { className: 'flex items-center gap-1.5' },
          React.createElement('img', { src: gravatarUrl(author?.email || ''), alt: '', className: 'w-6 h-6 rounded-full' }),
          React.createElement(Link, { to: '/author/' + (author?.username || ''), className: 'font-medium text-gray-700 hover:text-primary-600' }, author?.username)),
        React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Calendar, { size: 14 }), timeAgo(post.publishedAt || post.createdAt)),
        React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Clock, { size: 14 }), readingTime(post.content || '')),
        post.commentCount > 0 && React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(MessageSquare, { size: 14 }), post.commentCount))
    ),

    // Featured image
    post.featured && React.createElement('div', { className: 'mb-10' },
      React.createElement('img', {
        src: cdnUrl(post.featured, settings),
        alt: post.title,
        className: 'w-full max-h-96 object-cover rounded-2xl shadow-lg',
        loading: 'lazy',
        srcSet: post.srcset ? Object.entries(post.srcset).map(([w, u]) => (cdnUrl(u as string, settings) as string) + ' ' + w + 'w').join(', ') : undefined,
      })
    ),

    // Content
    post.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: post.meta._visual_css } }),
    React.createElement('div', { className: 'prose prose-gray prose-lg max-w-none mb-12', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(post.content)), settings) } }),

    // Tags
    post.tags?.length > 0 && React.createElement('div', { className: 'flex flex-wrap items-center gap-2 mb-10' },
      React.createElement(Tag, { size: 15, className: 'text-gray-400' }),
      post.tags.map((tg: any) => React.createElement(Link, { key: tg.tagId, to: '/tag/' + tg.slug, className: 'px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors' }, tg.name))
    ),

    // Share + back row
    React.createElement('div', { className: 'flex items-center justify-between py-6 border-t border-gray-100 mb-10' },
      React.createElement(Link, { to: '/', className: 'text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1' }, React.createElement(ChevronLeft, { size: 15 }), t('all posts', settings)),
      React.createElement(SocialShare, { title: post.title, url: '/post/' + post.slug, siteUrl: settings.site_url })
    ),

    // Author box
    author && React.createElement('div', { className: 'flex items-start gap-4 p-6 rounded-2xl bg-gray-50 mb-10' },
      React.createElement('img', { src: gravatarUrl(author?.email || ''), alt: '', className: 'w-14 h-14 rounded-full flex-shrink-0' }),
      React.createElement('div', null,
        React.createElement('p', { className: 'text-xs text-gray-400 mb-0.5' }, t('written by', settings)),
        React.createElement(Link, { to: '/author/' + author.username, className: 'font-semibold text-gray-900 hover:text-primary-600' }, author.username),
        author.bio && React.createElement('p', { className: 'text-sm text-gray-600 mt-1.5 leading-relaxed' }, author.bio)
      )
    ),

    // Related posts
    React.createElement('section', { className: 'mb-12' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, t('related posts', settings)),
      slug && React.createElement(RelatedPosts, { postId: post?.id, slug: slug })
    ),

    // Comments
    React.createElement('section', { className: 'border-t border-gray-100 pt-8' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('comments', settings) + (comments.length ? ' (' + comments.length + ')' : '')),
      comments.length === 0 && !submitted && React.createElement('div', { className: 'text-center py-6 rounded-2xl bg-gray-50 mb-6' },
        React.createElement('p', { className: 'text-sm text-gray-400' }, t('no comments yet', settings) + '. ' + t('be the first to share your thoughts', settings) + '!')),
      commentList,
      submitted && React.createElement('p', { className: 'text-sm text-green-600 mb-4' }, t('comment submitted and pending review', settings)),
      commentFormEl
    )
  );
}
