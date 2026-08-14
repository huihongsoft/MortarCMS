import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// huirj.cn style header: WHITE top bar, logo left, centered category nav,
// search box right. Sticky with a subtle shadow on scroll.
export default function SoftstoreHeader({ settings }: { settings: Record<string, string> }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (s) navigate('/search?q=' + encodeURIComponent(s));
  };

  return React.createElement('header', { className: 'sticky top-0 z-40 bg-white border-b border-[#eee] transition-shadow ' + (scrolled ? 'shadow-sm' : '') },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      React.createElement('div', { className: 'flex items-center gap-4 h-[70px]' },
        React.createElement(Link, { to: '/', className: 'flex items-center gap-2 shrink-0' },
          React.createElement('span', { className: 'w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold', style: { background: '#5066e1' } }, (settings.site_title || 'M')[0].toUpperCase()),
          React.createElement('span', { className: 'text-[18px] font-bold text-[#222] truncate max-w-[8rem] sm:max-w-none' }, settings.site_title || 'Mortar')),
        // Center nav (desktop): home + categories
        React.createElement('nav', { className: 'hidden md:flex items-center gap-1 ml-8 flex-1 min-w-0 overflow-x-auto' },
          React.createElement(Link, { to: '/', className: 'px-3.5 py-2 text-[15px] text-[#333] hover:text-[#5066e1] whitespace-nowrap font-medium' }, t('home', settings)),
          categories.map((c: any) =>
            React.createElement(Link, { key: c.id, to: '/category/' + c.slug, className: 'px-3.5 py-2 text-[15px] text-[#555] hover:text-[#5066e1] whitespace-nowrap transition-colors' }, c.name)
          )
        ),
        // Search (desktop)
        React.createElement('form', { onSubmit: submit, className: 'hidden md:flex items-center gap-2 ml-auto bg-[#f5f5f5] rounded px-3 py-2 focus-within:ring-2 focus-within:ring-[#5066e1]/30' },
          React.createElement(Search, { size: 15, className: 'text-[#999]' }),
          React.createElement('input', {
            value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
            placeholder: t('search placeholder', settings),
            className: 'bg-transparent outline-none text-sm text-[#333] placeholder-[#999] w-32 lg:w-44',
          })
        ),
        // Mobile toggle
        React.createElement('button', { onClick: () => setOpen(!open), className: 'md:hidden ml-auto p-2 rounded hover:bg-gray-100 text-[#333]', 'aria-label': t('menu') },
          open ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })),
      ),
      // Mobile panel
      open && React.createElement('div', { className: 'md:hidden pb-4 space-y-3' },
        React.createElement('form', { onSubmit: submit, className: 'flex items-center gap-2 bg-[#f5f5f5] rounded px-3 py-2' },
          React.createElement(Search, { size: 15, className: 'text-[#999]' }),
          React.createElement('input', {
            value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
            placeholder: t('search placeholder', settings),
            className: 'bg-transparent outline-none text-sm text-[#333] placeholder-[#999] flex-1',
          })
        ),
        React.createElement('nav', { className: 'grid grid-cols-2 gap-1' },
          React.createElement(Link, { to: '/', onClick: () => setOpen(false), className: 'px-3 py-2 rounded text-sm text-[#333] hover:bg-gray-100' }, t('home', settings)),
          categories.map((c: any) =>
            React.createElement(Link, { key: c.id, to: '/category/' + c.slug, onClick: () => setOpen(false), className: 'px-3 py-2 rounded text-sm text-[#555] hover:bg-gray-100' }, c.name)
          )
        )
      )
    )
  );
}
