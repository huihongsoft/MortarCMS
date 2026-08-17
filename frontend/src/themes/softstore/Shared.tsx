import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { cdnUrl } from '../../lib/cdn';
import { t } from '../../lib/i18n';

// huirj.cn precise replica tokens
const PRIMARY = '#5066e1';

// ---- Software icon carousel (huirj .owl-carousel, 11 items, autoplay 3.5s) ----
export function IconCarousel({ settings }: { settings: Record<string, string> }) {
  const [posts, setPosts] = useState<any[]>([]);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);

  useEffect(() => {
    api.get('/posts/popular?limit=11').then(r => setPosts(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (posts.length <= 1) return;
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      // loop: when scrolled to the end, jump back to the start
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) { el.scrollTo({ left: 0, behavior: 'smooth' }); return; }
      el.scrollBy({ left: 210, behavior: 'smooth' });
    }, 3500);
    return () => clearInterval(iv);
  }, [posts.length]);

  if (posts.length === 0) return null;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-4 pt-4 pb-4' },
    React.createElement('div', {
      ref: trackRef,
      className: 'flex gap-[10px] overflow-x-auto scrollbar-none',
      onMouseEnter: () => { pausedRef.current = true; },
      onMouseLeave: () => { pausedRef.current = false; },
    },
      posts.map((p: any) => {
        const cat = p.categories?.[0];
        return React.createElement(Link, { key: p.id, to: '/post/' + p.slug, className: 'group w-[88px] shrink-0 text-center py-2' },
          p.featured
            ? React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-20 h-20 rounded-xl object-cover mx-auto bg-gray-100' })
            : React.createElement('div', { className: 'w-20 h-20 rounded-xl bg-[#f1f1f1] flex items-center justify-center text-xl font-bold text-[#bbb] mx-auto' }, (p.title || '?')[0].toUpperCase()),
          React.createElement('div', { className: 'mt-2' },
            React.createElement('p', { className: 'text-[13px] text-[#999] truncate group-hover:hidden' }, p.title),
            React.createElement('p', { className: 'text-[13px] text-[#999] hidden group-hover:block truncate' }, cat?.name || ''),
            React.createElement('span', { className: 'hidden group-hover:block mt-1 mx-auto w-[72px] h-[26px] leading-[26px] text-center text-xs text-white rounded-sm', style: { background: PRIMARY } }, t('download now', settings)),
          )
        );
      })
    )
  );
}

// ---- Tag bar (huirj .blog__tag): "标签 : a b c" single-line strip ----
export function TagBar({ settings }: { settings: Record<string, string> }) {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    api.get('/tags?limit=12').then(r => setTags(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);
  if (tags.length === 0) return null;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-4 py-3 flex items-center gap-2 overflow-hidden whitespace-nowrap' },
    React.createElement('span', { className: 'text-[15px] font-bold text-[#666] shrink-0' }, t('tags', settings) + ' : '),
    tags.map((tg: any) =>
      React.createElement(Link, { key: tg.id, to: '/tag/' + tg.slug, className: 'px-2 py-0.5 rounded text-[13px] text-[#666] hover:text-white transition-colors shrink-0', style: { border: '1px solid #ddd' } },
        tg.name, React.createElement('span', { className: 'hover:bg-transparent' }))
    )
  );
}

// ---- Category tab bar (huirj .soft-top-tabs .hd): 156px tabs, active gets
// a 3px theme-colored bottom border, separators between tabs ----
export function CategoryTabs({ categories, active, onSelect, settings }: { categories: any[]; active: null | string; onSelect: (slug: null | string) => void; settings: Record<string, string> }) {
  const tabs = [null, ...(Array.isArray(categories) ? categories : [])].slice(0, 7);
  return React.createElement('div', { className: 'h-[53px] leading-[50px] border-b-2 border-[#dadada] flex text-[16px] text-[#555]' },
    tabs.map((c: any) => {
      const key = c ? c.slug : '';
      // 'all' (key '') is active while no category tab is selected
      const isOn = active === null ? key === '' : active === key;
      return React.createElement('button', {
        key: key || 'all',
        onClick: () => onSelect(key),
        className: 'relative w-[156px] shrink-0 text-center transition-colors ' + (isOn ? 'font-bold' : 'hover:text-[#5066e1]'),
        style: isOn ? { color: PRIMARY, borderBottom: '3px solid ' + PRIMARY, background: '#fff' } : undefined,
      },
        c ? c.name : t('all', settings),
        // right separator line between tabs (except the last)
        React.createElement('span', { className: 'absolute top-[15px] right-0 w-[5px] h-[18px] border-r border-[#888]' })
      );
    })
  );
}

// ---- Software list row (huirj .soft-list li) ----
export function SoftListRow({ p, settings }: { p: any; settings: Record<string, string> }) {
  return React.createElement('li', { className: 'relative flex items-center gap-4 pt-[17px] pb-[17px] border-b border-[#dedede] last:border-b-0' },
    p.featured
      ? React.createElement(Link, { to: '/post/' + p.slug, className: 'shrink-0' },
          React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-20 h-20 rounded-xl object-cover bg-gray-100' }))
      : React.createElement('div', { className: 'w-20 h-20 rounded-xl bg-[#f1f1f1] flex items-center justify-center text-2xl font-bold text-[#bbb] shrink-0' }, (p.title || '?')[0].toUpperCase()),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement(Link, { to: '/post/' + p.slug, className: 'block' },
        React.createElement('h4', { className: 'text-[18px] font-bold text-[#333] leading-[35px] h-[35px] truncate hover:text-[#5066e1]' }, p.title)),
      React.createElement('p', { className: 'text-[14px] text-[#666] h-[29px] leading-[29px]' },
        (p.author?.username ? t('author', settings) + '：' + p.author.username + '  ' : '') +
        t('date', settings) + '：' + new Date(p.publishedAt || p.createdAt).toLocaleDateString() +
        (p.commentCount > 0 ? '  ' + t('comments', settings) + '：' + p.commentCount + t('pieces', settings) : '')),
      p.excerpt && React.createElement('p', { className: 'text-[14px] leading-[20px] text-[#888] border-t border-dashed border-[#dedede] pt-[6px] mt-0 line-clamp-2' }, p.excerpt),
    ),
    // Action button: always visible, theme-colored on row hover (huirj .down-link)
    React.createElement(Link, {
      to: '/post/' + p.slug,
      className: 'absolute bottom-[15px] right-[6px] w-[90px] h-[26px] leading-[26px] text-center text-[12px] tracking-wider text-[#666] bg-white border border-[#ddd] rounded-sm transition-colors group-hover:bg-[#5066e1] group-hover:text-white group-hover:border-[#5066e1]',
    }, t('read more', settings)),
  );
}

// ---- Ranking rows (huirj .rank_box .rank_li): left title + right category tag ----
export function RankRow({ p, settings }: { p: any; settings: Record<string, string> }) {
  const cat = p.categories?.[0];
  return React.createElement('li', { className: 'h-[35px] leading-[35px] border-b border-dashed border-[#ccc] last:border-b-0' },
    React.createElement(Link, { to: '/post/' + p.slug, className: 'flex items-center gap-2 text-[14px]' },
      React.createElement('span', { className: 'flex-1 truncate text-[#555] hover:text-[#5066e1] hover:underline' }, p.title),
      cat && React.createElement('span', { className: 'shrink-0 text-right text-[#858585]' }, cat.name))
  );
}

// ---- Sidebar: "hot ranking / latest" tabs with ranking rows (huirj .arlists) ----
export function SideTabs({ settings }: { settings: Record<string, string> }) {
  const [tab, setTab] = useState<'hot' | 'latest'>('hot');
  const [hot, setHot] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let done = 0;
    api.get('/posts/popular?limit=10').then(r => setHot(r.data || [])).catch(() => {}).finally(() => { if (++done === 2) setLoaded(true); });
    api.get('/posts?limit=10').then(r => setLatest(r.data?.posts || [])).catch(() => {}).finally(() => { if (++done === 2) setLoaded(true); });
  }, []);

  const rows = tab === 'hot' ? hot : latest;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede]' },
    // tab bar (huirj .tabs__widets-default-menu-link)
    React.createElement('div', { className: 'flex border-b border-[#e5e5e5]' },
      ['hot', 'latest'].map(k => React.createElement('button', {
        key: k,
        onClick: () => setTab(k as 'hot' | 'latest'),
        className: 'px-4 py-2 text-[15px] font-medium transition-colors ' + (tab === k ? 'text-[#333] border-b-2' : 'text-[#666] hover:text-[#5066e1] border-b-2 border-transparent'),
        style: tab === k ? { borderBottomColor: PRIMARY } : undefined,
      }, k === 'hot' ? t('hot ranking', settings) : t('latest posts', settings)))
    ),
    React.createElement('ul', { className: 'px-4 pt-2 pb-2' },
      rows.length === 0
        ? React.createElement('p', { className: 'py-4 text-sm text-[#999] text-center' }, loaded ? t('no data', settings) : t('loading', settings))
        : rows.map((p: any) => React.createElement(RankRow, { key: p.id, p, settings }))
    )
  );
}

// ---- Second list (huirj .agf-list2): two-column grid, no meta, no button ----
export function SecondGrid({ settings }: { settings: Record<string, string> }) {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    api.get('/posts?limit=6').then(r => setPosts(r.data?.posts || [])).catch(() => {});
  }, []);
  if (posts.length === 0) return null;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] p-4 mt-4' },
    React.createElement('h3', { className: 'text-[16px] font-bold text-[#333] pb-3 border-b-2 border-[#dadada] mb-3' }, t('latest software', settings)),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4' },
      posts.map((p: any) =>
        React.createElement(Link, { key: p.id, to: '/post/' + p.slug, className: 'flex items-center gap-3 pb-3 border-b border-[#dedede] group' },
          p.featured
            ? React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-[74px] h-[74px] rounded-[5px] border border-[#dedede] object-cover shrink-0' })
            : React.createElement('div', { className: 'w-[74px] h-[74px] rounded-[5px] border border-[#dedede] flex items-center justify-center text-xl font-bold text-[#bbb] shrink-0' }, (p.title || '?')[0].toUpperCase()),
          React.createElement('div', { className: 'min-w-0' },
            React.createElement('h4', { className: 'text-[15px] font-bold text-[#333] leading-[22px] line-clamp-2 group-hover:text-[#5066e1]' }, p.title),
            p.excerpt && React.createElement('p', { className: 'text-[13px] text-[#888] leading-[20px] line-clamp-2 mt-1' }, p.excerpt))
        )
      )
    )
  );
}
