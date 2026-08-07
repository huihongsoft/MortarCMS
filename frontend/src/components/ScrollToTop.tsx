import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { t } from '../lib/i18n';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;
  return React.createElement('button', {
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    className: 'fixed bottom-6 right-6 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all z-50',
    title: t('back to top')
  }, React.createElement(ChevronUp, { size: 20 }));
}
