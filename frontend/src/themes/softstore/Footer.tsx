import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { t } from '../../lib/i18n';

// huirj.cn style footer: light band (grey2-bg #F9F9FB) with three columns —
// about / navigation / newsletter — then a centred copyright bar. The floating
// back-to-top button is owned by the theme entry (SiteLayout renders it), not here.
export default function SoftstoreFooter({ settings = {} }: { settings?: Record<string, string> }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data.slice(0, 5) : [])).catch(() => {});
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === 'sending') return;
    setState('sending');
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  const title = (label: string) => React.createElement('h4', { className: 'text-[22px] font-bold text-[#1d1d1d] mb-[25px]' }, label);

  return React.createElement(React.Fragment, null,
    React.createElement('footer', { className: 'mt-6' },
      // ---- top band (reference .footer-top.grey2-bg) ----
      React.createElement('div', { className: 'bg-[#f9f9fb] pt-[50px] pb-[10px]' },
        React.createElement('div', { className: 'max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10' },
          // 1) about
          React.createElement('div', null,
            React.createElement('div', { className: 'flex items-center gap-2 mb-[30px]' },
              React.createElement('span', { className: 'w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold', style: { background: '#5066e1' } }, (settings.site_title || 'M')[0].toUpperCase()),
              React.createElement('span', { className: 'text-[18px] font-bold text-[#222]' }, settings.site_title || 'Mortar')),
            React.createElement('p', { className: 'text-[14px] leading-[24px] text-[#666]' },
              settings.site_description || settings.footer_text || '')),
          // 2) navigation (reference "网站导航")
          React.createElement('div', { className: 'md:pl-[125px]' },
            title(t('categories', settings)),
            React.createElement('ul', null,
              categories.map((c: any) =>
                React.createElement('li', { key: c.id, className: 'mb-[7px]' },
                  React.createElement(Link, { to: '/category/' + c.slug, className: 'text-[15px] text-[#666] hover:text-[#5066e1] transition-colors' }, c.name))))),
          // 3) newsletter (reference "Newsletter")
          React.createElement('div', null,
            title(t('Newsletter', settings)),
            React.createElement('form', { onSubmit: subscribe, className: 'relative' },
              React.createElement('input', {
                type: 'email', value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
                placeholder: t('your email', settings), 'aria-label': t('your email', settings), required: true,
                className: 'w-full h-[60px] pl-[20px] pr-[50px] text-[14px] text-[#666] bg-white border border-transparent rounded-[5px] outline-none',
              }),
              React.createElement('button', { type: 'submit', disabled: state === 'sending', 'aria-label': t('subscribe', settings), className: 'absolute top-[16px] right-[25px] text-[#5066e1] disabled:opacity-50' },
                React.createElement(ArrowRight, { size: 18 }))),
            state !== 'idle' && React.createElement('p', { className: 'mt-2 text-[13px] ' + (state === 'error' ? 'text-red-600' : 'text-[#666]') },
              state === 'sending' ? t('sending', settings) + '…' : state === 'done' ? t('check your inbox to confirm', settings) : t('subscription failed', settings)))
        )),
      // ---- copyright bar (reference .footer-copyright) ----
      React.createElement('div', { className: 'border-t border-[#f1f1f1] pt-[20px] pb-[15px]' },
        React.createElement('p', { className: 'max-w-6xl mx-auto px-4 text-center text-[16px] text-[#666]' },
          settings.footer_text || ('© ' + new Date().getFullYear() + ' ' + (settings.site_title || 'Mortar') + ' — ' + t('all rights reserved', settings)))
      )
    )
  );
}
