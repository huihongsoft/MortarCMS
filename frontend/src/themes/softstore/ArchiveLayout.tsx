import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';
import { postPath } from '../../lib/permalink';
import { NoticeBar, TagPill, formatDate } from './Shared';

// huirj.cn archive pages (category `col-lg-8` cards, tag and search the same):
//   notice strip → [ blog cards | sidebar: search, 最近更新, 热门文章,
//   分类目录, 热门标签 ].
// The reference renders no page heading on these lists, so only the pages it has
// no equivalent for (date archive, author, search) pass one.

const PAGE_BTN = 'inline-block w-[44px] h-[44px] leading-[44px] text-center text-[20px] rounded-[5px] transition-colors';

// ---- One post card (reference .blog__item) ----
function BlogCard({ p, settings }: { p: any; settings: Record<string, string> }) {
  return React.createElement('article', { className: 'bg-white rounded-[5px] border border-[#dedede] mb-[15px] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]' },
    React.createElement('div', { className: 'px-[25px] py-[20px]' },
      React.createElement('h3', { className: 'text-[24px] leading-[34px] font-bold text-[#1d1d1d] mb-[10px]' },
        React.createElement(Link, { to: postPath(p.slug), className: 'hover:text-primary-600' }, p.title)),
      // reference .post-meta: 15px/500 #666 with a dashed rule under it, showing
      // date, author, views and comment count — the last two even at 0.
      React.createElement('div', { className: 'flex flex-wrap items-center gap-x-[10px] text-[15px] font-medium text-[#666] border-b border-dashed border-[#dedede] pb-[6px] mb-[8px]' },
        React.createElement('span', null, formatDate(p.publishedAt || p.createdAt)),
        p.author?.username && React.createElement('span', null,
          React.createElement(Link, { to: '/author/' + p.author.username, className: 'hover:text-primary-600' }, p.author.username)),
        React.createElement('span', { className: 'inline-flex items-center gap-1' }, React.createElement(Eye, { size: 15 }), String(p.views || 0)),
        React.createElement('span', { className: 'inline-flex items-center gap-1' }, React.createElement(MessageSquare, { size: 15 }), String(p.commentCount || 0))),
      p.excerpt && React.createElement('div', { className: 'pt-[12px] text-[15px] leading-[26px] text-[#666]' }, p.excerpt),
      // inline flow (reference .blog__tag), so the label and pills share a baseline
      p.tags?.length > 0 && React.createElement('div', { className: 'mt-[10px]' },
        React.createElement('span', { className: 'text-[18px] font-bold text-[#666] mr-[5px]' }, t('tags', settings) + ' :'),
        p.tags.map((tg: any) => tg.slug ? React.createElement(TagPill, { key: tg.tagId, tag: tg, shrink: false }) : null))
    )
  );
}

// ---- Sidebar widget shell (reference .sidebar__widget: 18px title + 72px rule) ----
function Widget({ title, children }: { title: string; children?: React.ReactNode }) {
  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] mb-[15px] px-[15px] pb-[15px]' },
    React.createElement('h4', { className: 'relative text-[18px] font-medium text-[#1d1d1d] pt-[15px] pb-[12px] mb-[15px]' }, title,
      React.createElement('span', { className: 'absolute left-0 bottom-0 w-[72px] h-[1px] bg-[#1d1d1d]' })),
    children
  );
}

// ---- Search widget (reference .sidebar__search: 50px input) ----
// The reference styles this card's border #f6f6f8, which is all but invisible
// next to the #dedede every other card uses — the same border here instead.
function SidebarSearch({ settings }: { settings: Record<string, string> }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] mb-[15px] p-[15px]' },
    React.createElement('form', {
      onSubmit: (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) navigate('/search?q=' + encodeURIComponent(q.trim())); },
      className: 'relative',
    },
      React.createElement('input', {
        value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
        placeholder: t('search', settings), 'aria-label': t('search', settings),
        className: 'w-full h-[50px] pl-[15px] pr-[40px] text-[14px] text-[#666] bg-white border border-[#dedede] rounded-[5px] outline-none placeholder-[#8f8f9a]',
      }),
      React.createElement('button', { type: 'submit', 'aria-label': t('search', settings), className: 'absolute top-0 right-0 w-[50px] h-[50px] text-[#1d1d1d]' },
        React.createElement(Search, { size: 16 })))
  );
}

// ---- Plain link list widget (recent / popular; reference .sidebar-list rows) ----
function TitleList({ posts }: { posts: any[] }) {
  if (posts.length === 0) return React.createElement('p', { className: 'text-sm text-[#999]' }, '—');
  return React.createElement('ul', null,
    posts.map((p: any) =>
      React.createElement('li', { key: p.id, className: 'border-b border-dashed border-[#ccc] last:border-b-0 mb-[8px] last:mb-0 pb-[5px]' },
        React.createElement(Link, { to: postPath(p.slug), className: 'block text-[14px] leading-[1.4] text-[#666] truncate hover:text-primary-600' }, p.title))));
}

// ---- Category list with counts (reference 分类目录) ----
function CategoryList({ categories }: { categories: any[] }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    api.get('/categories').then(r => {
      const map: Record<string, number> = {};
      for (const c of (Array.isArray(r.data) ? r.data : [])) map[c.slug] = c._count?.posts || 0;
      setCounts(map);
    }).catch(() => {});
  }, []);
  return React.createElement('ul', null,
    categories.map((c: any) =>
      React.createElement('li', { key: c.id, className: 'mb-[8px] last:mb-0 flex items-center justify-between' },
        React.createElement(Link, { to: '/category/' + c.slug, className: 'text-[15px] text-[#666] hover:text-primary-600' }, c.name),
        React.createElement('span', { className: 'text-[15px] text-[#999]' }, String(counts[c.slug] ?? '')))));
}

// ---- Archives sidebar: the reference's five widgets (used by ArchiveView only) ----
function ArchiveSidebar({ settings, categories }: { settings: Record<string, string>; categories: any[] }) {
  const [recent, setRecent] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    api.get('/posts?limit=5').then(r => setRecent(r.data?.posts || [])).catch(() => {});
    api.get('/posts/popular?limit=5').then(r => setPopular(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/tags?limit=24').then(r => setTags(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  return React.createElement('aside', { className: 'lg:col-span-4 min-w-0' },
    React.createElement(SidebarSearch, { settings }),
    React.createElement(Widget, { title: t('recent updates', settings) }, React.createElement(TitleList, { posts: recent })),
    React.createElement(Widget, { title: t('hot posts', settings) }, React.createElement(TitleList, { posts: popular })),
    categories.length > 0 && React.createElement(Widget, { title: t('categories', settings) }, React.createElement(CategoryList, { categories })),
    tags.length > 0 && React.createElement(Widget, { title: t('hot tags', settings) },
      React.createElement('div', { className: 'flex flex-wrap' }, tags.map((tg: any) => React.createElement(TagPill, { key: tg.id, tag: tg, shrink: false }))))
  );
}

// ---- Pagination (reference .basic-pagination: 44px squares) ----
function Pager({ page, total, perPage, setPage }: { page: number; total: number; perPage: number; setPage: (n: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const nums: number[] = [];
  for (let i = 1; i <= pages; i++) { if (i <= 2 || i > pages - 2 || Math.abs(i - page) <= 1) nums.push(i); }
  const uniq = [...new Set(nums)].sort((a, b) => a - b);

  return React.createElement('div', { className: 'mb-[15px]' },
    React.createElement('ul', { className: 'flex flex-wrap items-center gap-[10px]' },
      uniq.map((n, i) => React.createElement(React.Fragment, { key: n },
        i > 0 && n - uniq[i - 1] > 1 ? React.createElement('li', null, React.createElement('span', { className: PAGE_BTN + ' bg-[#f1f1f1] text-[#1d1d1d]' }, '…')) : null,
        React.createElement('li', null,
          n === page
            ? React.createElement('span', { className: PAGE_BTN + ' bg-primary-600 text-white' }, String(n))
            : React.createElement('button', { type: 'button', onClick: () => setPage(n), className: PAGE_BTN + ' bg-[#f1f1f1] text-[#1d1d1d] hover:bg-primary-600 hover:text-white' }, String(n)))))));
}

// ---- The archive page itself ----
// `settings` defaults to {} because the layout contract varies per route
// (Archive/Author/Search hand over their own props): reading through it must
// never throw, or the page renders blank.
export default function ArchiveView(props: {
  settings?: Record<string, string>;
  posts: any[];
  total?: number;
  page?: number;
  setPage?: (n: number) => void;
  categories?: any[];
  heading?: string | null;
  loading?: boolean;
  error?: boolean;
  pagination?: any;
  author?: { username?: string; bio?: string; avatar?: string };
}) {
  const { settings = {}, posts = [], total = 0, page = 1, setPage, categories = [], heading, loading, error, pagination } = props;
  const perPage = parseInt(settings.posts_per_page || '10') || 10;

  return React.createElement('div', { className: 'min-h-screen bg-[#fff]' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      React.createElement(NoticeBar, { settings }),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-4' },
        React.createElement('div', { className: 'lg:col-span-8 min-w-0' },
          heading && React.createElement('div', { className: 'mb-[15px]' },
            React.createElement('h1', { className: 'text-[24px] leading-[34px] font-bold text-[#1d1d1d]' }, heading),
            props.author?.bio && React.createElement('p', { className: 'text-sm text-[#666] mt-1' }, props.author.bio)),
          loading && posts.length === 0
            ? React.createElement('p', { className: 'py-10 text-sm text-[#999]' }, t('loading', settings) + '…')
            : posts.length === 0
              ? React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[25px] py-16 text-center' },
                  React.createElement('p', { className: 'text-sm text-[#999]' }, error ? t('failed to load posts', settings) : t('no posts yet', settings)))
              : React.createElement('div', null, posts.map((p: any) => React.createElement(BlogCard, { key: p.id, p, settings }))),
          // The page supplies a ready-made pager (archive/author/search); the
          // homepage paths still pass page/setPage and use the theme's own.
          pagination || (setPage && React.createElement(Pager, { page, total, perPage, setPage }))),
        React.createElement(ArchiveSidebar, { settings, categories })
      )
    )
  );
}
