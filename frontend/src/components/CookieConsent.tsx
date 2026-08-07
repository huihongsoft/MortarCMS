import React, { useState } from 'react';
import { t } from '../lib/i18n';

export default function CookieConsent() {
  const [hidden, setHidden] = useState(localStorage.getItem('cookie_consent') === '1');
  if (hidden) return null;

  return React.createElement('div', { className: 'fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm' },
    React.createElement('p', { className: 'text-center' }, t('this site uses cookies to improve your experience')),
    React.createElement('button', {
      onClick: () => { localStorage.setItem('cookie_consent', '1'); setHidden(true); },
      className: 'px-4 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium whitespace-nowrap'
    }, t('accept')),
    React.createElement('a', { href: '/page/privacy-policy', className: 'text-gray-400 hover:text-white underline whitespace-nowrap' }, t('privacy policy'))
  );
}
