import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, MessageSquare, Folder, Tag as TagIcon  } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedPosts from '../../components/RelatedPosts';
import SocialShare from '../../components/SocialShare';
import Toc from '../../components/Toc';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import { timeAgo, readingTime, useTimeTick } from '../../lib/time';
import { gravatarUrl } from '../../lib/gravatar';
import { t } from '../../lib/i18n';
import DOMPurify from 'dompurify';



// Aurora post: centered, large type, editorial prose
export default function PostLayout(props: any) {
  useTimeTick();
  const { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, commentError, slug } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const author = post.author;
  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-sm transition-shadow';
  const pageContent = post.content || '';

  const commentList = comments.map((c: any) => (
    React.createElement('div', { key: c.id, className: 'py-6 border-b border-gray-100 last:border-0' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
        React.createElement('div', { className: 'w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-medium' }, (c.author || '?')[0].toUpperCase()),
        React.createElement('div', null,
          React.createElement('p', { className: 'font-medium text-sm text-gray-900' }, c.author),
          React.createElement('p', { className: 'text-xs text-gray-500' }, new Date(c.createdAt).toLocaleDateString())),
      ),
      React.createElement('p', { className: 'text-sm text-gray-600 leading-relaxed' }, c.content),
      c.children && c.children.map((child: any) => (
        React.createElement('div', { key: child.id, className: 'ml-10 mt-4 p-4 rounded-xl bg-gray-50/70' },
          React.createElement('p', { className: 'font-medium text-sm text-gray-900 mb-1' }, child.author),
          React.createElement('p', { className: 'text-sm text-gray-600' }, child.content))
      ))
    )
  ));

  const commentFormEl = React.createElement('form', { onSubmit: submitComment, noValidate: true, className: 'space-y-4 mt-8 p-8 rounded-2xl bg-gray-50/70 border border-gray-100' },
    React.createElement('h4', { className: 'text-base font-semibold text-gray-900' }, t('leave a comment', settings)),
    commentError && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, commentError),
    React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), 'aria-label': t('name', settings), className: inputCls, autoComplete: 'name' }),
      React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', 'aria-label': t('email', settings), className: inputCls, autoComplete: 'email' })),
    React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', 'aria-label': t('your comment', settings), className: inputCls, rows: 4, required: true }),
    React.createElement('button', { type: 'submit', className: 'w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 shadow-lg shadow-indigo-500/20', style: { background: 'var(--primary-color, #6366f1)' } }, t('submit comment', settings))
  );

  return React.createElement('div', { className: 'max-w-5xl mx-auto px-6 py-14' },
    React.createElement(Breadcrumbs, { items: [{ label: t('blog', settings), to: '/' }, { label: post.title || t('post', settings) }] }),
    React.createElement('article', null,
      post.format && post.format !== 'standard' && React.createElement('span', { className: 'inline-block text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-4' }, post.format),
      React.createElement('h1', { className: 'font-bold tracking-tight text-gray-900 leading-tight mb-6', style: { fontSize: 'var(--heading-max-size, 36px)' } }, post.title),
      React.createElement('div', { className: 'flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 py-5 border-y border-gray-900/[0.06] mb-10' },
        React.createElement('span', { className: 'flex items-center gap-2' }, React.createElement(User, { size: 15 }), React.createElement(Link, { to: '/author/' + (author?.username || ''), className: 'font-medium text-gray-700 hover:text-gray-900 transition-colors' }, author?.username)),
        React.createElement('span', { className: 'flex items-center gap-2' }, React.createElement(Calendar, { size: 15 }), timeAgo(post.publishedAt || post.createdAt)),
        post.categories?.[0] && React.createElement('span', { className: 'flex items-center gap-2' },
          React.createElement(Folder, { size: 15 }),
          React.createElement(Link, { to: '/category/' + post.categories[0].slug, className: 'hover:text-gray-900 transition-colors' }, post.categories[0].name)),
        React.createElement('span', { className: 'flex items-center gap-2' }, React.createElement(Clock, { size: 15 }), readingTime(pageContent)),
        post.commentCount > 0 && React.createElement('span', { className: 'flex items-center gap-2' }, React.createElement(MessageSquare, { size: 15 }), post.commentCount),
      ),
      post.featured && React.createElement('img', { src: cdnUrl(post.featured, settings), alt: post.title, className: 'w-full rounded-2xl mb-10 shadow-xl shadow-gray-900/5', loading: 'eager', fetchPriority: 'high', decoding: 'async' }),
      post.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(post.meta._visual_css) } }),
      React.createElement(Toc, { containerRef: contentRef, settings }),
      React.createElement('div', { ref: contentRef, className: 'prose prose-gray prose-lg max-w-none mb-14', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(pageContent)), settings) } }),
      post.tags?.length > 0 && React.createElement('div', { className: 'flex flex-wrap items-center gap-2 mb-12' },
        React.createElement(TagIcon, { size: 15, className: 'text-gray-400' }),
        post.tags.map((tg: any) => tg.slug ? React.createElement(Link, { key: tg.tagId, to: '/tag/' + tg.slug, className: 'px-3.5 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors' }, tg.name) : null),
      ),
      author && React.createElement('div', { className: 'flex items-center gap-4 p-6 rounded-2xl bg-gray-50/70 border border-gray-100 mb-12' },
        React.createElement('img', { src: gravatarUrl(author?.email || ''), alt: '', className: 'w-12 h-12 rounded-full' }),
        React.createElement('div', null,
          React.createElement(Link, { to: '/author/' + author.username, className: 'font-semibold text-gray-900 hover:text-indigo-600 transition-colors' }, author.username),
          author.bio && React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, author.bio),
        ),
      ),
      settings.theme_show_share_buttons !== '0' && React.createElement(SocialShare, { title: post.title, url: '/post/' + post.slug, siteUrl: settings.site_url }),
    ),
    React.createElement('section', { className: 'mt-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('comments', settings), post.commentCount > 0 ? ' (' + post.commentCount + ')' : ''),
      commentList.length > 0 && React.createElement('div', null, commentList),
      submitted ? React.createElement('p', { className: 'text-sm text-green-600 mt-6' }, t('comment submitted for moderation', settings))
        : commentFormEl,
    ),
  );
}
