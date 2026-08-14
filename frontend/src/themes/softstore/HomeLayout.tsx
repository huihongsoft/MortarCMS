import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';
import { IconCarousel, TagBar, CategoryTabs, SoftListRow, SecondGrid, SideTabs } from './Shared';

// huirj.cn homepage precise replica:
//  icon carousel → tag bar → (tabbed software list + hot/latest sidebar)
//  → two-column second list
export default function SoftstoreHomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories } = props;

  // Category tabs: 'all' shows the main stream, a tab fetches that category
  // lazily (cached once loaded).
  const [active, setActive] = useState<null | string>(null);
  const [tabData, setTabData] = useState<Record<string, any[]>>({});
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (active === null) return;
    if (tabData[active]) return;
    let cancelled = false;
    setTabLoading(true);
    api.get('/posts?category=' + encodeURIComponent(active) + '&limit=10')
      .then(r => { if (!cancelled) setTabData(d => ({ ...d, [active]: r.data?.posts || [] })); })
      .catch(() => { if (!cancelled) setTabData(d => ({ ...d, [active]: [] })); })
      .finally(() => { if (!cancelled) setTabLoading(false); });
    return () => { cancelled = true; };
  }, [active, tabData]);

  const isTab = active !== null;
  const shown = isTab ? (tabData[active] || []) : posts;
  const loading = isTab ? tabLoading : (props.loading);
  const perPage = parseInt(settings.posts_per_page || '10') || 10;

  return React.createElement('div', { className: 'bg-[#f5f5f5] min-h-screen' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      // 1) software icon carousel
      React.createElement('div', { className: 'pt-4' }, React.createElement(IconCarousel, { settings })),
      // 2) tag bar
      React.createElement('div', { className: 'mt-2' }, React.createElement(TagBar, { settings })),
      // 3) main area: tabbed list (col-9) + sidebar (col-3)
      React.createElement('div', { className: 'mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4' },
        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede]' },
            // category tabs (huirj .soft-top-tabs .hd)
            React.createElement(CategoryTabs, { categories, active, onSelect: setActive, settings }),
            React.createElement('div', { className: 'px-4' },
              shown.length === 0 && !loading
                ? React.createElement('div', { className: 'py-16 text-center' },
                    React.createElement('p', { className: 'text-sm text-[#999]' }, loadError ? t('failed to load posts', settings) : t('no posts yet', settings)))
                : React.createElement('ul', null, shown.map((p: any) => React.createElement(SoftListRow, { key: p.id, p, settings }))),
              loading && React.createElement('div', { className: 'flex items-center justify-center py-10 text-[#999]' }, React.createElement(Loader2, { size: 20, className: 'animate-spin' })),
              // pagination (main stream only)
              !isTab && total > perPage && React.createElement('div', { className: 'flex items-center justify-center gap-2 py-5' },
                page > 1 && React.createElement('button', { onClick: () => setPage(page - 1), className: 'px-4 py-1.5 rounded text-sm border border-[#ddd] text-[#555] hover:border-[#5066e1] hover:text-[#5066e1]' }, t('previous', settings)),
                React.createElement('span', { className: 'text-sm text-[#999]' }, t('page', settings) + ' ' + page + ' / ' + Math.ceil(total / perPage)),
                page < Math.ceil(total / perPage) && React.createElement('button', { onClick: () => setPage(page + 1), className: 'px-4 py-1.5 rounded text-sm border border-[#ddd] text-[#555] hover:border-[#5066e1] hover:text-[#5066e1]' }, t('next', settings))),
              isTab && !tabLoading && (tabData[active] || []).length > 0 && React.createElement('div', { className: 'text-center py-4' },
                React.createElement(Link, { to: '/category/' + active, className: 'text-sm text-[#5066e1] hover:underline' }, t('browse all posts', settings)))
            )
          ),
          // 4) two-column second list
          React.createElement(SecondGrid, { settings }),
        ),
        // sidebar: hot ranking / latest tabs
        React.createElement('aside', { className: 'space-y-4' },
          React.createElement(SideTabs, { settings })
        )
      )
    )
  );
}
