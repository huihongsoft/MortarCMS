import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';
import { navWidthClass } from '../navWidth';

// huirj.cn style header: WHITE top bar, logo left, centered category nav, and on
// the right a bordered call-to-action button plus the hamburger that opens the
// side drawer (the drawer holds the search form — the reference has no search box
// in the bar itself). Sticky with a subtle shadow on scroll.
export default function SoftstoreHeader({ settings = {} }: { settings?: Record<string, string> }) {
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

  // The drawer covers the page, so freeze the scroll behind it while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    setOpen(false);
    navigate('/search?q=' + encodeURIComponent(s));
  };

  // The call to action is theme-settable (Appearance → theme settings); the
  // defaults mirror the reference, whose button links at "/".
  const ctaLabel = settings.theme_header_btn_label || '加入';
  const ctaUrl = settings.theme_header_btn_url || '/';

  const searchForm = React.createElement('form', { onSubmit: submit, className: 'relative' },
    React.createElement('input', {
      value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
      placeholder: t('search placeholder', settings),
      'aria-label': t('search', settings),
      className: 'w-full h-[55px] pl-[15px] pr-[35px] text-[14px] text-[#666] bg-white border border-[#edeef2] rounded-[5px] outline-none',
    }),
    React.createElement('button', { type: 'submit', 'aria-label': t('search', settings), className: 'absolute top-1/2 right-[15px] -translate-y-1/2 text-[#5066e1]' },
      React.createElement(Search, { size: 16 }))
  );

  return React.createElement('header', { className: 'sticky top-0 z-40 bg-white border-b border-[#eee] transition-shadow ' + (scrolled ? 'shadow-sm' : '') },
    React.createElement('div', { className: navWidthClass(settings.nav_width, 'max-w-6xl') + ' mx-auto px-4' },
      // No fixed height: the reference gets it from the nav links' own 32px
      // vertical padding (.main-menu ul li a), which makes the bar ~82px.
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement(Link, { to: '/', className: 'flex items-center gap-2 shrink-0' },
          React.createElement('span', { className: 'w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold', style: { background: '#5066e1' } }, (settings.site_title || 'M')[0].toUpperCase()),
          React.createElement('span', { className: 'text-[18px] font-bold text-[#222] truncate max-w-[8rem] sm:max-w-none' }, settings.site_title || 'Mortar')),
        // Center nav (desktop): home + categories. Reference .main-menu ul li a:
        // 18px medium #1D1D1D, 32px vertical padding, items 18px apart.
        React.createElement('nav', { className: 'hidden md:flex items-center ml-8 flex-1 min-w-0 overflow-x-auto' },
          React.createElement(Link, { to: '/', className: 'mx-[18px] first:ml-0 py-[32px] text-[18px] font-medium text-[#1d1d1d] hover:text-[#5066e1] whitespace-nowrap' }, t('home', settings)),
          categories.map((c: any) =>
            React.createElement(Link, { key: c.id, to: '/category/' + c.slug, className: 'mx-[18px] py-[32px] text-[18px] font-medium text-[#1d1d1d] hover:text-[#5066e1] whitespace-nowrap transition-colors' }, c.name)
          )
        ),
        // Right: CTA + hamburger (reference .duheader-btn + .side-toggle).
        // That button is 40px tall with a 40px line-height, 0 28px padding,
        // 1px theme-coloured border, 15px radius and a 0.3s ease-out transition
        // that fills it with the theme colour on hover.
        React.createElement('div', { className: 'flex items-center ml-auto' },
          React.createElement('a', {
            href: ctaUrl,
            className: 'hidden sm:inline-block h-[40px] leading-[40px] px-[28px] text-[15px] font-medium text-[#5066e1] border border-[#5066e1] rounded-[15px] transition-all duration-300 ease-out hover:bg-[#5066e1] hover:text-white whitespace-nowrap',
          }, ctaLabel),
          React.createElement('button', {
            type: 'button', onClick: () => setOpen(true),
            'aria-label': t('menu', settings),
            className: 'ml-[30px] p-1 text-[#1d1d1d]',
          }, React.createElement('span', { className: 'flex flex-col gap-[5px] w-[22px]' },
            React.createElement('span', { className: 'h-[2px] bg-current' }),
            React.createElement('span', { className: 'h-[2px] bg-current' }),
            React.createElement('span', { className: 'h-[2px] bg-current' })))
        )
      )
    ),
    // ---- Side drawer (reference .side-info): overlay + 365px panel ----
    React.createElement('div', {
      onClick: () => setOpen(false),
      'aria-hidden': 'true',
      className: 'fixed inset-0 bg-black z-[1000] transition-opacity duration-300 ' + (open ? 'opacity-30 visible' : 'opacity-0 invisible'),
    }),
    React.createElement('aside', {
      'aria-hidden': !open,
      className: 'fixed top-0 h-full w-[365px] max-w-[85vw] bg-[#f5f5f5] z-[1001] overflow-y-auto p-[45px] max-sm:w-[300px] max-sm:p-[25px_15px] transition-[right] duration-[600ms]',
      style: { right: open ? 0 : -380 },
    },
      React.createElement('div', { className: 'flex items-start justify-between mb-8' },
        React.createElement(Link, { to: '/', onClick: () => setOpen(false), className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold', style: { background: '#5066e1' } }, (settings.site_title || 'M')[0].toUpperCase()),
          React.createElement('span', { className: 'text-[17px] font-bold text-[#222]' }, settings.site_title || 'Mortar')),
        React.createElement('button', { type: 'button', onClick: () => setOpen(false), 'aria-label': t('close', settings), className: 'text-[#1d1d1d] p-1' },
          React.createElement(X, { size: 20 }))),
      React.createElement('div', { className: 'mb-8' }, searchForm),
      // The reference's drawer repeats the primary nav (its mobile menu)
      React.createElement('nav', { className: 'mb-8' },
        React.createElement(Link, { to: '/', onClick: () => setOpen(false), className: 'block py-2 text-[16px] text-[#333] hover:text-[#5066e1]' }, t('home', settings)),
        categories.map((c: any) =>
          React.createElement(Link, { key: c.id, to: '/category/' + c.slug, onClick: () => setOpen(false), className: 'block py-2 text-[16px] text-[#555] hover:text-[#5066e1]' }, c.name))),
      settings.site_description && React.createElement('p', { className: 'text-[14px] leading-[24px] text-[#777] mb-8' }, settings.site_description),
      React.createElement('a', {
        href: ctaUrl,
        className: 'inline-block h-[35px] leading-[35px] px-[8px] rounded-[5px] text-[14px] font-light text-white whitespace-nowrap',
        style: { background: '#5066e1' },
      }, ctaLabel)
    )
  );
}
