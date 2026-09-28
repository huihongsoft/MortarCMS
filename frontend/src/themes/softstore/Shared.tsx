import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Volume2, AppWindow, List } from 'lucide-react';
import api from '../../lib/api';
import { cdnUrl } from '../../lib/cdn';
import { t } from '../../lib/i18n';
import { postPath } from '../../lib/permalink';

// Dates the way the reference prints them: absolute, zero-padded YYYY-MM-DD
// (its list rows and .post-meta both read "2022-11-15"). toLocaleDateString()
// produced "2026/9/18" — wrong separator and no padding.
export function formatDate(value: unknown): string {
  const d = new Date(String(value || ''));
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// ---- Notice strip (reference #notice): one 34px line at a time inside a
// bordered white bar with a speaker icon, scrolling upward. The reference links
// a handful of recent posts; here the list follows the API's own order, which
// puts pinned (sticky) posts first and then the newest ones — so pinning posts
// decides what the bar advertises, and without any pins it still shows the
// latest instead of rendering nothing.
//
// The reference ships no CSS for this block at all (18 stylesheets, no .notice
// rule), so the bar's look follows its rendered page: full-width white box,
// 1px #dedede border, 5px radius, icon + one line.
export function NoticeBar({ settings: _settings }: { settings: Record<string, string> }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const LINE_H = 34;

  useEffect(() => {
    api.get('/posts?limit=8')
      .then(r => setPosts(r.data?.posts || []))
      .catch(() => {});
  }, []);

  // Commit one step of the slide: advance the offset and drop the transform
  // without a transition, so it cannot slide back.
  const commitSlide = () => {
    setIndex(i => (i + 1) % Math.max(1, posts.length));
    setSliding(false);
  };

  useEffect(() => {
    if (posts.length <= 1) return;
    const iv = setInterval(() => setSliding(true), 3000);
    return () => clearInterval(iv);
  }, [posts.length]);

  // Safety net for the slide: a backgrounded tab does not run CSS transitions, so
  // transitionend never fires and the strip would stay stuck mid-slide until the
  // tab is focused again.
  useEffect(() => {
    if (!sliding) return;
    const t = setTimeout(commitSlide, 900);
    return () => clearTimeout(t);
  }, [sliding]);

  if (posts.length === 0) return null;

  // One extra line is rendered below the visible one so the incoming title slides
  // in from underneath instead of leaving a gap.
  const shown = Math.min(2, posts.length);
  const rows = Array.from({ length: shown }, (_, i) => posts[(index + i) % posts.length]);

  // mt matches the reference page wrapper's top padding (.blog-area pt-20), which
  // is what keeps the bar off the header.
  return React.createElement('div', { className: 'bg-white border border-[#dedede] rounded-[5px] px-[15px] py-[1px] mt-[20px] mb-[15px] flex items-center gap-[10px]' },
    React.createElement(Volume2, { size: 16, className: 'shrink-0 text-primary-600' }),
    React.createElement('div', { className: 'flex-1 min-w-0 overflow-hidden', style: { height: LINE_H } },
      React.createElement('ul', {
        style: {
          transform: sliding ? 'translateY(-' + LINE_H + 'px)' : 'none',
          transition: sliding ? 'transform 500ms linear' : 'none',
        },
        onTransitionEnd: commitSlide,
      },
        rows.map((p: any, i: number) =>
          React.createElement('li', { key: p.id + '-' + i, className: 'truncate', style: { height: LINE_H, lineHeight: LINE_H + 'px' } },
            React.createElement(Link, { to: postPath(p.slug), className: 'text-[15px] text-[#666] hover:text-primary-600' }, p.title)))
      )
    )
  );
}

// ---- Back to top (reference .progress-wrap) ----
// 46px white circle, fixed 50px from the bottom-right, showing a scroll-progress
// ring and a #2c3941 arrow; fades in past 50px of scroll.
//
// Geometry is the reference's own SVG verbatim: a 102-unit viewBox
// ("-1 -1 102 102") holding a r=49 path stroked at width 4 — i.e. 4 * 46/102 ≈
// 1.8px on screen. Drawing the same "width 4" in a 46-unit viewBox made the ring
// more than twice as thick as the reference's. The path starts at the top of the
// circle, so the progress also starts there.
export function BackToTop({ settings }: { settings: Record<string, string> }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const LEN = 2 * Math.PI * 49;

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > 50);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return React.createElement('button', {
    type: 'button',
    'aria-label': t('back to top', settings),
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    className: 'fixed right-[50px] bottom-[50px] w-[46px] h-[46px] rounded-full z-[99] flex items-center justify-center transition-all duration-200',
    style: {
      boxShadow: 'inset 0 0 0 2px rgba(95,58,252,0.2)',
      background: '#fff',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transform: visible ? 'translateY(0)' : 'translateY(15px)',
    },
  },
    React.createElement('svg', { className: 'absolute inset-0', width: '100%', height: '100%', viewBox: '-1 -1 102 102', 'aria-hidden': 'true' },
      React.createElement('path', {
        d: 'M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98',
        fill: 'none', stroke: '#3817E3', strokeWidth: 4,
        strokeDasharray: LEN, strokeDashoffset: LEN * (1 - progress),
        style: { transition: 'stroke-dashoffset 10ms linear' },
      })),
    React.createElement(ArrowUp, { size: 20, style: { color: '#2c3941' } })
  );
}

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

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[15px] pt-[10px] pb-[8px] mb-[15px]' },
    React.createElement('div', {
      ref: trackRef,
      className: 'flex gap-[10px] overflow-x-auto scrollbar-none',
      onMouseEnter: () => { pausedRef.current = true; },
      onMouseLeave: () => { pausedRef.current = false; },
    },
      posts.map((p: any) => {
        const cat = p.categories?.[0];
        // Reference .owl-item: centred, 5px padding; text 14px #999, clipped to one
        // line. On hover the text is replaced by a full-width 30px theme-coloured
        // "download" button (.down-link).
        return React.createElement(Link, { key: p.id, to: postPath(p.slug), className: 'group w-[88px] shrink-0 text-center pt-[5px] px-[5px]' },
          p.featured
            ? React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-20 h-20 rounded-xl object-cover mx-auto bg-gray-100' })
            : React.createElement('div', { className: 'w-20 h-20 rounded-xl bg-[#f1f1f1] flex items-center justify-center text-xl font-bold text-[#bbb] mx-auto' }, (p.title || '?')[0].toUpperCase()),
          React.createElement('div', { className: 'mt-2 group-hover:hidden' },
            React.createElement('p', { className: 'text-[14px] text-[#999] truncate' }, p.title),
            React.createElement('p', { className: 'text-[14px] text-[#999] truncate' }, cat?.name || ''),
          ),
          React.createElement('span', { className: 'hidden group-hover:block mt-[12px] h-[30px] leading-[30px] text-center text-[14px] text-white', style: { background: 'var(--primary-color, #5066e1)' } }, t('download now', settings)),
        );
      })
    )
  );
}

// ---- Tag bar (reference .blog__tag): "标签 : a b c" single-line strip ----
// Reference metrics: label 18px bold #666 + 5px right margin; each pill 27px tall
// / 26px line-height, 14px bold, 0 13px padding, 1px #e8e7ec border, 6px radius,
// 8px right / 10px bottom margin, hover filled with the theme colour.
export function TagPill({ tag, shrink = true }: { tag: any; shrink?: boolean }) {
  return React.createElement(Link, {
    to: '/tag/' + tag.slug,
    className: 'inline-block h-[27px] leading-[26px] px-[13px] text-[14px] font-bold text-[#666] border border-[#e8e7ec] rounded-[6px] mr-[8px] mb-[10px] hover:text-white hover:bg-primary-600 hover:border-primary-600 transition-colors' + (shrink ? ' shrink-0' : ''),
  }, tag.name);
}

// Inline flow (reference .blog__tag), not flex: the pills carry a 10px bottom
// margin, and a flex centring aligns their *margin* boxes, which floated the row
// 5px above the "标签 :" label. Inline-block children keep their text baselines
// on the label's, so the label and the pills sit on the same centre line — and
// the clipped overflow gets the reference's ellipsis.
export function TagBar({ settings }: { settings: Record<string, string> }) {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    api.get('/tags?limit=12').then(r => setTags(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);
  if (tags.length === 0) return null;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[15px] pt-[10px] overflow-hidden whitespace-nowrap text-ellipsis' },
    React.createElement('span', { className: 'text-[18px] font-bold text-[#666] mr-[5px]' }, t('tags', settings) + ' :'),
    tags.map((tg: any) => React.createElement(TagPill, { key: tg.id, tag: tg }))
  );
}

// ---- Home category block (reference .home-block > .block-tag + .agf-list2) ----
// The reference's second homepage section: a card holding a 55px title row
// (icon + 24px title + a "更多应用" link) and a tag bar, then a 9:3 row with a
// 2x2 grid of posts and the hot/latest rail.
//
// Two modes, chosen by the theme setting home_section_category: unset shows the
// latest software (the block's previous behaviour), set shows that one category
// with its own tags and a "更多应用" link to its archive.
export function CategorySection({ settings = {}, categories }: { settings?: Record<string, string>; categories: any[] }) {
  const list = Array.isArray(categories) ? categories : [];
  const configured = (settings.theme_home_section_category || '').trim();
  const category = list.find((c: any) => c.slug === configured) || null;
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    // At most 10 posts = 5 rows of two.
    const url = category
      ? '/posts?category=' + encodeURIComponent(category.slug) + '&limit=10'
      : '/posts?limit=10';
    // Clear first: otherwise the previous category's rows sit under the new
    // heading until the response lands.
    setPosts([]);
    api.get(url)
      .then(r => {
        if (cancelled) return;
        // Two columns, so an odd count leaves a half-empty last row whose single
        // item would be the only thing on its line — drop it to the next even
        // number (3 -> 2). A lone post is still shown rather than hiding the block.
        const list = r.data?.posts || [];
        setPosts(list.length >= 3 && list.length % 2 ? list.slice(0, -1) : list);
      })
      .catch(() => { if (!cancelled) setPosts([]); });
    return () => { cancelled = true; };
  }, [category?.slug]);

  if (posts.length === 0) return null;

  // The reference lists the category's own tags; ours come from the posts it
  // shows (deduped, in the order they appear).
  const tags: any[] = [];
  for (const p of posts) for (const tg of (p.tags || [])) {
    if (tg?.slug && !tags.some(x => x.slug === tg.slug)) tags.push(tg);
  }

  return React.createElement(React.Fragment, null,
    // .block-tag: 1px #dedede, 10px radius, 0 15px 10px padding
    React.createElement('div', { className: 'bg-white border border-[#dedede] rounded-[10px] px-[15px] pb-[10px] my-[15px]' },
      // .intitle: 55px, 2px #dadada rule under it
      React.createElement('div', { className: 'h-[55px] border-b-2 border-[#dadada] mb-[20px] flex items-center overflow-hidden' },
        React.createElement(AppWindow, { size: 20, className: 'shrink-0 mr-[9px] text-[#666]' }),
        React.createElement('span', { className: 'text-[24px] text-[#333] leading-[55px] truncate' }, category ? category.name : t('latest software', settings)),
        category && React.createElement(Link, { to: '/category/' + category.slug, className: 'ml-auto shrink-0 text-[16px] text-[#777] leading-[60px] hover:text-primary-600 flex items-center' },
          t('more apps', settings), React.createElement(List, { size: 19, className: 'ml-[6px]' }))),
      tags.length > 0 && React.createElement('div', { className: 'overflow-hidden whitespace-nowrap text-ellipsis' },
        React.createElement('span', { className: 'text-[18px] font-bold text-[#666] mr-[5px]' }, t('tags', settings) + ' :'),
        tags.slice(0, 12).map((tg: any) => React.createElement(TagPill, { key: tg.slug, tag: tg })))
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-4' },
      React.createElement('div', { className: 'lg:col-span-9 min-w-0' },
        // .agf-list2: bordered card, two 400px columns
        React.createElement('div', { className: 'bg-white border border-[#dedede] rounded-[5px] px-[15px] pt-[15px] pb-[10px]' },
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-x-[30px]' },
            posts.map((p: any, i: number) =>
              React.createElement('div', {
                key: p.id,
                // The rule under the last row has nothing beneath it, so it is
                // dropped there (the card's own padding closes the block).
                className: 'flex pt-[15px] pb-[15px] pl-[2px] border-b border-[#dedede] group' + (i >= posts.length - 2 ? ' border-b-0' : ''),
              },
                React.createElement(Link, { to: postPath(p.slug), className: 'mr-[10px]' }, React.createElement(SoftThumb, { p, settings })),
                React.createElement('div', { className: 'min-w-0 flex-1' },
                  React.createElement(Link, { to: postPath(p.slug), className: 'block' },
                    React.createElement('h4', { className: 'text-[15px] font-bold text-[#333] leading-[22px] h-[45px] overflow-hidden text-center group-hover:text-primary-600' }, p.title)),
                  p.excerpt && React.createElement('p', { className: 'text-[14px] leading-[20px] text-[#888] mt-[8px] pt-[10px] border-t border-dashed border-[#dedede] line-clamp-2' }, p.excerpt)))
            )))),
      React.createElement('aside', { className: 'lg:col-span-3 min-w-0' },
        React.createElement(SideTabs, { settings, category: category?.slug }))
    )
  );
}

// ---- Category tab bar (huirj .soft-top-tabs .hd): 156px tabs, active gets
// a 3px theme-colored bottom border, separators between tabs ----
//
// The bar never overflows: the tabs used to be a fixed 7-wide row (7 × 156px)
// inside a ~736px column, so it painted straight over the sidebar. It now
// measures its own width and drops the tabs that do not fit.
export function CategoryTabs({ tabs: listed, active, onSelect }: { tabs: any[]; active: null | string; onSelect: (slug: string) => void }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  // { width, max }: tab width and how many tabs fit at that width.
  const [fit, setFit] = React.useState({ width: 156, max: 4 });

  // Layout effect: the first paint must already show the right number of tabs,
  // otherwise a narrow screen briefly renders the wider default selection.
  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      // Narrow screens get narrower tabs, so the bar still shows a few.
      const width = w < 640 ? 110 : 156;
      setFit({ width, max: Math.max(1, Math.floor(w / width)) });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The reference bar has no "all" tab: it lists categories only, and the tab
  // that is on switches the pane. Categories that do not fit are dropped.
  const tabs = (Array.isArray(listed) ? listed : []).slice(0, fit.max);

  // Hover switches the pane (the reference drives its tabs with superSlide, whose
  // default trigger is mouseover); a brief delay keeps a quick sweep of the bar
  // from firing a request per tab. Click stays for touch and keyboard.
  const hoverTimer = React.useRef<number | null>(null);
  const hoverSwitch = (slug: string) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => onSelect(slug), 120);
  };
  const cancelHover = () => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } };
  React.useEffect(() => cancelHover, []);

  return React.createElement('div', {
    ref: wrapRef,
    // The bar's grey rule is an inset shadow, not a border: the reference draws
    // it inside the 53px row (.hd height 53 with border-bottom 2) while the tabs
    // are a full 53px tall, so the active tab's 3px blue border lands ON the grey
    // line. As a real border it pushed the tabs up and the two lines sat stacked.
    className: 'h-[53px] leading-[50px] mx-[15px] mt-[5px] flex overflow-hidden text-[16px] text-[#555]',
    style: { boxShadow: 'inset 0 -2px 0 #dadada' },
  },
    tabs.map((c: any, i: number) => {
      const key = c.slug;
      const isOn = active === key;
      return React.createElement('button', {
        key: key,
        onClick: () => onSelect(key),
        onMouseEnter: () => hoverSwitch(key),
        onMouseLeave: cancelHover,
        className: 'relative shrink-0 text-center truncate px-2 transition-colors ' + (isOn ? 'font-bold' : 'hover:text-primary-600'),
        style: isOn ? { width: fit.width, color: 'var(--primary-color, #5066e1)', borderBottom: '3px solid var(--primary-color, #5066e1)', background: '#fff' } : { width: fit.width },
        // a truncated tag still shows its full name on hover
        title: c.name,
      },
        c.name,
        // right separator line between tabs (reference .hd ul li i) — the last one
        // has none (its `i.nbr` drops the border)
        i < tabs.length - 1 && React.createElement('span', { className: 'absolute top-[15px] right-0 w-[5px] h-[18px] border-r border-[#888]' })
      );
    })
  );
}

// ---- Software list row (reference .soft-list li) ----
// Thumbnail: 148x148 box (1px #dedede, 5px radius) with a 100x100 image (12px
// radius) centred inside, 10px right margin — not a bare 80px icon.
export function SoftThumb({ p, settings, size = 148, inner = 100 }: { p: any; settings: Record<string, string>; size?: number; inner?: number }) {
  const box = { width: size, height: size };
  return React.createElement('div', { className: 'shrink-0 border border-[#dedede] rounded-[5px] flex items-center justify-center bg-white', style: box },
    p.featured
      ? React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'object-cover bg-gray-100', style: { width: inner, height: inner, borderRadius: inner >= 100 ? 12 : 8 } })
      : React.createElement('div', { className: 'bg-[#f1f1f1] flex items-center justify-center text-2xl font-bold text-[#bbb]', style: { width: inner, height: inner, borderRadius: inner >= 100 ? 12 : 8 } }, (p.title || '?')[0].toUpperCase()));
}

export function SoftListRow({ p, settings }: { p: any; settings: Record<string, string> }) {
  return React.createElement('li', { className: 'relative flex items-center pt-[17px] pb-[17px] pl-[2px] mt-[17px] border-b border-[#dedede] first:mt-0' },
    React.createElement(Link, { to: postPath(p.slug), className: 'mr-[10px]' }, React.createElement(SoftThumb, { p, settings })),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement(Link, { to: postPath(p.slug), className: 'block' },
        React.createElement('h4', { className: 'text-[18px] font-bold text-[#333] leading-[35px] h-[36px] truncate hover:text-primary-600' }, p.title)),
      // reference .auth: 14px, 31px box. Date then comment count — the count is
      // printed even at 0, as the reference does.
      React.createElement('p', { className: 'text-[14px] text-[#666] h-[31px] leading-[29px]' },
        (p.author?.username ? t('author', settings) + '：' + p.author.username + '  ' : '') +
        t('date', settings) + '：' + formatDate(p.publishedAt || p.createdAt) + '  ' +
        t('comments', settings) + '：' + (p.commentCount || 0) + t('pieces', settings)),
      p.excerpt && React.createElement('p', { className: 'text-[14px] leading-[20px] text-[#888] border-t border-dashed border-[#dedede] pt-[6px] mt-0 line-clamp-2' }, p.excerpt),
    ),
    // Action button: always visible, theme-colored on row hover (reference .down-link)
    React.createElement(Link, {
      to: postPath(p.slug),
      className: 'absolute bottom-[15px] right-[6px] w-[90px] h-[26px] leading-[26px] text-center text-[12px] tracking-wider text-[#666] bg-white border border-[#ddd] rounded-sm transition-colors group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600',
    }, t('read more', settings)),
  );
}

// ---- Ranking rows (reference .rank_box .rank_li): title left, category right ----
// Row 35px / dashed #ccc / 4px gap; inner .title is 29px tall at 14px, offset 3px,
// with the category floated right at 28% width.
export function RankRow({ p, settings: _settings }: { p: any; settings: Record<string, string> }) {
  const cat = p.categories?.[0];
  return React.createElement('li', { className: 'h-[35px] leading-[35px] border-b border-dashed border-[#ccc] mb-[4px] last:border-b-0 last:mb-0' },
    React.createElement(Link, { to: postPath(p.slug), className: 'relative left-[3px] flex items-center h-[29px] leading-[29px] text-[14px] overflow-hidden' },
      React.createElement('span', { className: 'flex-1 truncate text-[#555] hover:text-primary-600 hover:underline' }, p.title),
      cat && React.createElement('span', { className: 'shrink-0 w-[28%] text-right text-[#858585] truncate' }, cat.name))
  );
}

// ---- Sidebar: "hot ranking / latest" tabs with ranking rows (huirj .arlists) ----
export function SideTabs({ settings, fill, category }: { settings: Record<string, string>; fill?: boolean; category?: string | null }) {
  const [tab, setTab] = useState<'hot' | 'latest'>('hot');
  const [hot, setHot] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  // `category` scopes both tabs: the rail inside a category block lists that
  // category's hottest/newest, the way the reference's does (every row of its
  // rail carries the block's category tag).
  useEffect(() => {
    let done = 0;
    // Guarded: without this a slow response from a previously selected category
    // could land after a newer one and leave the rail showing the wrong list.
    let cancelled = false;
    const scope = category ? '&category=' + encodeURIComponent(category) : '';
    setLoaded(false);
    setHot([]); setLatest([]);
    const settle = () => { if (!cancelled && ++done === 2) setLoaded(true); };
    api.get('/posts/popular?limit=10' + scope).then(r => { if (!cancelled) setHot(r.data || []); }).catch(() => { if (!cancelled) setHot([]); }).finally(settle);
    api.get('/posts?limit=10' + scope).then(r => { if (!cancelled) setLatest(r.data?.posts || []); }).catch(() => { if (!cancelled) setLatest([]); }).finally(settle);
    return () => { cancelled = true; };
  }, [category]);

  const rows = tab === 'hot' ? hot : latest;

  return React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede]' + (fill ? ' h-full' : '') },
    // tab bar (reference .arlists-tabs: 4px/15px margins, tabs centred). Same
    // arrangement as the category bar: the grey rule is an inset shadow so the
    // active tab's blue border sits exactly on it, and hovering switches.
    React.createElement('div', {
      className: 'flex justify-center mx-[15px] mt-[4px] mb-[10px]',
      style: { boxShadow: 'inset 0 -1px 0 #f1f1f1' },
    },
      ['hot', 'latest'].map(k => React.createElement('button', {
        key: k,
        onClick: () => setTab(k as 'hot' | 'latest'),
        onMouseEnter: () => setTab(k as 'hot' | 'latest'),
        className: 'px-[23px] py-2 text-[15px] font-medium transition-colors ' + (tab === k ? 'text-[#1d1d1d] border-b-2' : 'text-[#666] hover:text-primary-600 border-b-2 border-transparent'),
        style: tab === k ? { borderBottomColor: 'var(--primary-color, #5066e1)' } : undefined,
      }, k === 'hot' ? t('hot ranking', settings) : t('latest posts', settings)))
    ),
    React.createElement('ul', { className: 'px-[15px] pt-[13px] pb-[15px]' },
      rows.length === 0
        ? React.createElement('p', { className: 'py-4 text-sm text-[#999] text-center' }, loaded ? t('no data', settings) : t('loading', settings))
        : rows.map((p: any) => React.createElement(RankRow, { key: p.id, p, settings }))
    )
  );
}

