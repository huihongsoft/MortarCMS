import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Folder, Tag, Clock, MessageSquare, ChevronLeft } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedPosts from '../../components/RelatedPosts';
import SocialShare from '../../components/SocialShare';
import Toc from '../../components/Toc';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { sanitizeCss } from '../../lib/safeCss';
import { embedContent } from '../../lib/embed';
import { gravatarUrl } from '../../lib/gravatar';
import { timeAgo, readingTime } from '../../lib/time';
import { t } from '../../lib/i18n';
import { useContentImageEnhancer } from '../../lib/imageEnhance';
import DOMPurify from 'dompurify';

// Re-render every minute so relative times stay current without reloading
function useTimeTick(): number {
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(() => {
    const iv = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}



// Default single-post template — WordPress-style layout
export default function PostLayout(props: any) {
  useTimeTick();
  const { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, commentError, slug } = props;
  // WordPress-style multi-page posts: split content on <!--nextpage-->
  const parts = String(post?.content || '').split(/<!--\s*nextpage\s*-->/i);
  const [searchParams] = useSearchParams();
  const pageCount = parts.length;
  const curPage = Math.max(1, Math.min(pageCount, parseInt(searchParams.get('page') || '1', 10) || 1));
  const pageContent = parts[curPage - 1] || '';
  const pageNav = pageCount > 1 && React.createElement('nav', { className: 'flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100' },
    curPage > 1 && React.createElement(Link, { to: '/post/' + slug + (curPage - 1 > 1 ? '?page=' + (curPage - 1) : ''), className: 'text-sm text-gray-500 hover:text-primary-600' }, '← ' + t('previous', settings)),
    React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + curPage + ' / ' + pageCount),
    curPage < pageCount && React.createElement(Link, { to: '/post/' + slug + '?page=' + (curPage + 1), className: 'text-sm text-gray-500 hover:text-primary-600' }, t('next', settings) + ' →')
  );

  const contentRef = useRef<HTMLDivElement>(null);
  useContentImageEnhancer(contentRef, [post?.content]);

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
          React.createElement('p', { className: 'text-xs text-gray-500' }, new Date(c.createdAt).toLocaleDateString()))),
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
  const commentFormEl = React.createElement('form', { onSubmit: submitComment, noValidate: true, className: 'space-y-3 mt-6 p-6 rounded-2xl bg-gray-50' },
    React.createElement('h4', { className: 'text-sm font-semibold text-gray-900' }, t('leave a comment', settings)),
    commentError && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, commentError),
    React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
      React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), 'aria-label': t('name', settings), className: inputCls, autoComplete: 'name' }),
      React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', 'aria-label': t('email', settings), className: inputCls, autoComplete: 'email' })),
    React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', 'aria-label': t('your comment', settings), className: inputCls, rows: 3, required: true }),
    React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-500 cursor-pointer' },
      React.createElement('input', { type: 'checkbox', checked: !!commentForm.notifyMe, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, notifyMe: e.target.checked }), className: 'rounded border-gray-300 text-primary-600' }),
      t('notify me of replies', settings)
    ),
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
        post.format && post.format !== 'standard' ? React.createElement('span', { className: 'block text-xs font-normal text-gray-500 mb-1 uppercase tracking-wider' }, post.format) : null,
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
        // Hero image is the LCP element: load it eagerly at high priority
        loading: 'eager',
        fetchPriority: 'high',
        decoding: 'async',
        sizes: '(min-width: 900px) 768px, 100vw',
        srcSet: post.srcset ? Object.entries(post.srcset).map(([w, u]) => (cdnUrl(u as string, settings) as string) + ' ' + w + 'w').join(', ') : undefined,
      })
    ),

    // Content + table of contents
    post.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(post.meta._visual_css) } }),
    React.createElement(Toc, { containerRef: contentRef, settings }),
    React.createElement('div', { ref: contentRef, className: 'prose prose-gray prose-lg max-w-none mb-12', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(pageContent)), settings) } }),
    pageNav,

    // Tags
    post.tags?.length > 0 && React.createElement('div', { className: 'flex flex-wrap items-center gap-2 mb-10' },
      React.createElement(Tag, { size: 15, className: 'text-gray-500' }),
      post.tags.map((tg: any) => tg.slug ? React.createElement(Link, { key: tg.tagId, to: '/tag/' + tg.slug, className: 'px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors' }, tg.name) : null)
    ),

    // Share + back row (share buttons toggleable in theme settings)
    React.createElement('div', { className: 'flex items-center justify-between py-6 border-t border-gray-100 mb-10' },
      React.createElement(Link, { to: '/', className: 'text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1' }, React.createElement(ChevronLeft, { size: 15 }), t('all posts', settings)),
      settings.theme_show_share_buttons !== '0' && React.createElement(SocialShare, { title: post.title, url: '/post/' + post.slug, siteUrl: settings.site_url })
    ),

    // Author box
    author && React.createElement('div', { className: 'flex items-start gap-4 p-6 rounded-2xl bg-gray-50 mb-10' },
      React.createElement('img', { src: gravatarUrl(author?.email || ''), alt: '', className: 'w-14 h-14 rounded-full flex-shrink-0' }),
      React.createElement('div', null,
        React.createElement('p', { className: 'text-xs text-gray-500 mb-0.5' }, t('written by', settings)),
        React.createElement(Link, { to: '/author/' + author.username, className: 'font-semibold text-gray-900 hover:text-primary-600' }, author.username),
        author.bio && React.createElement('p', { className: 'text-sm text-gray-600 mt-1.5 leading-relaxed' }, author.bio)
      )
    ),

    // Related posts (toggleable in theme settings)
    settings.theme_show_related_posts !== '0' && React.createElement('section', { className: 'mb-12' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, t('related posts', settings)),
      slug && React.createElement(RelatedPosts, { postId: post?.id, slug: slug })
    ),

    // Comments
    React.createElement('section', { className: 'border-t border-gray-100 pt-8' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('comments', settings) + (comments.length ? ' (' + comments.length + ')' : '')),
      comments.length === 0 && !submitted && React.createElement('div', { className: 'text-center py-6 rounded-2xl bg-gray-50 mb-6' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, t('no comments yet', settings) + '. ' + t('be the first to share your thoughts', settings) + '!')),
      commentList,
      submitted && React.createElement('p', { className: 'text-sm text-green-600 mb-4' }, t('comment submitted and pending review', settings)),
      commentFormEl
    )
  );
}
