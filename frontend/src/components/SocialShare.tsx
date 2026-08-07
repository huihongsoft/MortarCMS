import React from 'react';
import { Link2 } from 'lucide-react';
import { t } from '../lib/i18n';

interface Props { title: string; url: string; siteUrl?: string; }

export default function SocialShare({ title, url, siteUrl }: Props) {
  const fullUrl = (siteUrl || window.location.origin) + url;
  const encoded = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert(t('link copied to clipboard'));
    } catch { window.prompt(t('copy link'), fullUrl); }
  }

  const icon = (d: string) => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor' }, React.createElement('path', { d }));

  return React.createElement('div', { className: 'flex items-center gap-2' },
    React.createElement('span', { className: 'text-xs text-gray-400 mr-1' }, t('share') + ':'),
    React.createElement('a', { href: 'https://twitter.com/intent/tweet?url=' + encoded + '&text=' + encodedTitle, target: '_blank', rel: 'noopener', className: 'p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors', title: 'Twitter' }, icon('M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z')),
    React.createElement('a', { href: 'https://www.facebook.com/sharer/sharer.php?u=' + encoded, target: '_blank', rel: 'noopener', className: 'p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors', title: 'Facebook' }, icon('M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z')),
    React.createElement('a', { href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encoded, target: '_blank', rel: 'noopener', className: 'p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors', title: 'LinkedIn' }, icon('M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z')),
    React.createElement('button', { onClick: copyLink, className: 'p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors', title: t('copy link') }, React.createElement(Link2, { size: 14 }))
  );
}
