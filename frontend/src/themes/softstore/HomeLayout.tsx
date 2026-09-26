import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';
import { IconCarousel, TagBar, CategoryTabs, SoftListRow, CategorySection, SideTabs, NoticeBar } from './Shared';

// huirj.cn homepage replica:
//  icon carousel → tag bar → (category-tabbed software list col-9 + sidebar col-3)
//  → two-column second list. Page background is white (the reference has none),
//  so the cards read by their 1px #dedede border rather than by contrast.
export default function SoftstoreHomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError: _loadError, catSlug, categories } = props;

  // The tab bar switches between category panes (like the reference — it has no
  // "all" tab); the first category is shown until one is clicked. Arriving on
  // /category/<slug> starts on that category.
  const [active, setActive] = useState<string | null>(catSlug || null);
  const [tabData, setTabData] = useState<Record<string, any[]>>({});
  const [tabLoading, setTabLoading] = useState(false);
  // A failed tab fetch must not read as "this category has no posts".
  const [tabError, setTabError] = useState(false);

  // The categories the tab bar shows: the theme setting (Appearance) filters the
  // site list; empty = all of them, in category order.
  const selected = (settings.theme_home_tabs_categories || '')
    .split(',').map((s: string) => s.trim()).filter(Boolean);
  const listed = (Array.isArray(categories) ? categories : [])
    .filter((c: any) => selected.length === 0 || selected.includes(c.slug));
  // With no categories at all there is no tab to switch to, so the page falls
  // back to the plain post stream below.
  const activeSlug = (active && listed.some((c: any) => c.slug === active)) ? active : (listed[0]?.slug || null);

  useEffect(() => {
    if (activeSlug === null) return;
    if (tabData[activeSlug]) return;
    let cancelled = false;
    setTabLoading(true);
    api.get('/posts?category=' + encodeURIComponent(activeSlug) + '&limit=10')
      .then(r => { if (!cancelled) { setTabData(d => ({ ...d, [activeSlug]: r.data?.posts || [] })); setTabError(false); } })
      .catch(() => { if (!cancelled) { setTabData(d => ({ ...d, [activeSlug]: [] })); setTabError(true); } })
      .finally(() => { if (!cancelled) setTabLoading(false); });
    return () => { cancelled = true; };
  }, [activeSlug, tabData]);

  const isTab = activeSlug !== null;
  const shown = isTab ? (tabData[activeSlug!] || []) : posts;
  const loading = isTab ? tabLoading : (props.loading);
  const failed = isTab ? tabError : props.loadError;
  const perPage = parseInt(settings.posts_per_page || '10') || 10;

  return React.createElement('div', { className: 'min-h-screen bg-[#fff]' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      // 0) notice strip (reference #notice) — pinned posts, hidden when none
      React.createElement(NoticeBar, { settings }),
      // 1) software icon carousel (reference .top-soft)
      React.createElement('div', null, React.createElement(IconCarousel, { settings })),
      // 2) tag bar (reference .blog__tag)
      React.createElement('div', { className: 'mt-2' }, React.createElement(TagBar, { settings })),
      // 3) main area: col-lg-9 list + col-lg-3 sidebar (reference grid)
      React.createElement('div', { className: 'mt-2 grid grid-cols-1 lg:grid-cols-12 gap-4' },
        React.createElement('div', { className: 'lg:col-span-9 min-w-0' },
          // overflow-hidden: a hard guard so no future tab/row can paint over the
          // sidebar again (the tab bar itself now fits, see CategoryTabs).
          React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] overflow-hidden' },
            // category tabs (reference .soft-top-tabs .hd)
            React.createElement(CategoryTabs, { tabs: listed, active: activeSlug, onSelect: (slug: string) => setActive(slug) }),
            // the list is inset 5px/15px like .soft-top-list
            React.createElement('div', { className: 'mx-[15px]' },
              shown.length === 0 && !loading
                ? React.createElement('div', { className: 'py-16 text-center' },
                    React.createElement('p', { className: 'text-sm text-[#999]' }, failed ? t('failed to load posts', settings) : t('no posts yet', settings)))
                : React.createElement('ul', null, shown.map((p: any) => React.createElement(SoftListRow, { key: p.id, p, settings }))),
              loading && React.createElement('div', { className: 'flex items-center justify-center py-10 text-[#999]' }, React.createElement(Loader2, { size: 20, className: 'animate-spin' })),
              // pagination — only for the plain stream (no categories to tab through)
              !isTab && total > perPage && React.createElement('div', { className: 'flex items-center justify-center gap-2 py-5' },
                page > 1 && React.createElement('button', { onClick: () => setPage(page - 1), className: 'px-4 py-1.5 rounded text-sm border border-[#ddd] text-[#555] hover:border-[#5066e1] hover:text-[#5066e1]' }, t('previous', settings)),
                React.createElement('span', { className: 'text-sm text-[#999]' }, t('page', settings) + ' ' + page + ' / ' + Math.ceil(total / perPage)),
                page < Math.ceil(total / perPage) && React.createElement('button', { onClick: () => setPage(page + 1), className: 'px-4 py-1.5 rounded text-sm border border-[#ddd] text-[#555] hover:border-[#5066e1] hover:text-[#5066e1]' }, t('next', settings))),
              isTab && !tabLoading && shown.length > 0 && React.createElement('div', { className: 'text-center py-4' },
                React.createElement(Link, { to: '/category/' + activeSlug, className: 'text-sm text-[#5066e1] hover:underline' }, t('browse all posts', settings)))
            )
          )
        ),
        // sidebar: hot ranking / latest tabs (reference .arlists col-lg-3).
        // col-span-3 is required: without it the aside falls into a single one of
        // the twelve tracks and the rail is squeezed to ~79px.
        React.createElement('aside', { className: 'lg:col-span-3 min-w-0 space-y-4' },
          React.createElement(SideTabs, { settings })
        )
      ),
      // 4) category block (reference .home-block: its own row below, with its own
      // sidebar), showing the category picked in the theme settings
      React.createElement(CategorySection, { settings, categories })
    )
  );
}
