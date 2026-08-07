import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function ArchiveWidget() {
  const [months, setMonths] = useState<any[]>([]);

  useEffect(() => { api.get('/posts/archives').then(r => setMonths(r.data)).catch(() => {}); }, []);

  if (months.length === 0) return null;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('archives')),
    React.createElement('ul', { className: 'space-y-1' },
      months.map((m: any) => {
        const [y, mo] = m.month.split('-');
        return React.createElement('li', { key: m.month },
          React.createElement(Link, { to: '/archive/' + y + '/' + mo, className: 'text-sm text-gray-600 hover:text-primary-600' },
            monthNames[parseInt(mo) - 1] + ' ' + y + ' (' + m.count + ')'
          )
        );
      })
    )
  );
}
