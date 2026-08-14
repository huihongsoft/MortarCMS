import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// huirj.cn style footer: light-gray top area (grey2-bg), four columns
// (about / quick links / categories / tag cloud) + copyright bar.
export default function SoftstoreFooter({ settings }: { settings: Record<string, string> }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data.slice(0, 8) : [])).catch(() => {});
    api.get('/tags?limit=14').then(r => setTags(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const title = (label: string) => React.createElement('h4', { className: 'text-[15px] font-medium text-[#222] mb-4' }, label);

  return React.createElement('footer', { className: 'bg-[#f5f5f5] border-t border-[#e5e5e5] mt-6' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4 pt-12 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8' },
      React.createElement('div', null,
        React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
          React.createElement('span', { className: 'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold', style: { background: '#5066e1' } }, (settings.site_title || 'M')[0].toUpperCase()),
          React.createElement('span', { className: 'text-[17px] font-bold text-[#222]' }, settings.site_title || 'Mortar')),
        settings.site_description && React.createElement('p', { className: 'text-[13px] text-[#777] leading-relaxed' }, settings.site_description),
      ),
      React.createElement('div', null,
        title(t('categories', settings)),
        React.createElement('ul', { className: 'space-y-2' },
          categories.map((c: any) =>
            React.createElement('li', { key: c.id },
              React.createElement(Link, { to: '/category/' + c.slug, className: 'text-[13px] text-[#777] hover:text-[#5066e1] transition-colors' }, c.name))
          )
        )
      ),
      React.createElement('div', null,
        title(t('tag cloud', settings)),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          tags.map((tg: any) =>
            React.createElement(Link, { key: tg.id, to: '/tag/' + tg.slug, className: 'px-2.5 py-1 bg-white border border-[#e5e5e5] rounded text-xs text-[#666] hover:border-[#5066e1] hover:text-[#5066e1] transition-colors' }, tg.name))
        )
      ),
      React.createElement('div', null,
        title(t('quick links', settings)),
        React.createElement('ul', { className: 'space-y-2' },
          React.createElement('li', null, React.createElement(Link, { to: '/', className: 'text-[13px] text-[#777] hover:text-[#5066e1] transition-colors' }, t('home', settings))),
          React.createElement('li', null, React.createElement(Link, { to: '/search', className: 'text-[13px] text-[#777] hover:text-[#5066e1] transition-colors' }, t('search', settings))),
          React.createElement('li', null, React.createElement('a', { href: '/api/feed/rss', className: 'text-[13px] text-[#777] hover:text-[#5066e1] transition-colors' }, t('rss feed', settings))),
        )
      )
    ),
    React.createElement('div', { className: 'border-t border-[#e5e5e5]' },
      React.createElement('p', { className: 'max-w-6xl mx-auto px-4 py-4 text-xs text-[#999]' },
        '© ' + new Date().getFullYear() + ' ' + (settings.site_title || 'Mortar') + ' — ' + t('all rights reserved', settings)),
    )
  );
}
