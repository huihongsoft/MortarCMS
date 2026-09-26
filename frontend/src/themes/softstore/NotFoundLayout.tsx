import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';

// Softstore's 404: same white card / thin grey border language as its post list,
// so a missing page no longer falls back to the generic centred layout.
export default function NotFoundLayout({ settings }: { settings?: Record<string, string> }) {
  return React.createElement('div', { className: 'min-h-[60vh] bg-[#fff]' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-16' },
      React.createElement('div', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[25px] py-20 text-center' },
        React.createElement('p', { className: 'text-[64px] leading-none font-bold text-[#e6e6e6]' }, '404'),
        React.createElement('h1', { className: 'text-[20px] font-bold text-[#1d1d1d] mt-[15px] mb-[8px]' }, t('page not found', settings)),
        React.createElement('p', { className: 'text-sm text-[#999] mb-[20px]' }, t('the page you are looking for might have been removed or is temporarily unavailable', settings)),
        React.createElement(Link, {
          to: '/',
          className: 'inline-block px-[22px] py-[9px] rounded-[4px] text-white text-sm transition-opacity hover:opacity-90',
          style: { background: '#5066e1' },
        }, t('back to home', settings))
      )
    )
  );
}
