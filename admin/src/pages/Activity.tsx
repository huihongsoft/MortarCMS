import React, { useEffect, useState } from 'react';
import { History, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import { describeActivity } from '../lib/activity';

// Audit trail: every authenticated content mutation + security events
export default function Activity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function fetchLogs() {
    setLoading(true);
    api.get('/activity?page=' + page + '&limit=40' + (q ? '&q=' + encodeURIComponent(q) : ''))
      .then(r => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  const methodColor = (action: string) => {
    if (action.startsWith('DELETE')) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    if (action.startsWith('POST')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (action.startsWith('PUT')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  };

  const totalPages = Math.max(1, Math.ceil(total / 40));

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6 flex-wrap gap-3' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(History, { size: 22, className: 'text-primary-500' }), t('activity log', getLang())),
      React.createElement('div', { className: 'flex items-stretch gap-2' },
        React.createElement('div', { className: 'relative shrink-0' },
          React.createElement(Search, { size: 14, className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' }),
          React.createElement('input', { value: q, onChange: e => setQ(e.target.value), onKeyDown: e => { if (e.key === 'Enter') { setPage(1); fetchLogs(); } }, placeholder: t('filter by action', getLang()), className: 'input-field h-full text-sm w-56', style: { paddingLeft: '2.5rem' } })
        ),
        React.createElement('button', { onClick: () => { setPage(1); fetchLogs(); }, className: 'btn-secondary text-sm h-auto' }, React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang()))
      )
    ),
    React.createElement('div', { className: 'card overflow-hidden' },
      loading && logs.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('loading', getLang()) + '…')
        : logs.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('no activity yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800 text-left' },
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('time', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('user', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('action', getLang())),
              )),
              React.createElement('tbody', null, logs.map((l: any) =>
                React.createElement('tr', { key: l.id, className: 'border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap' }, new Date(l.createdAt).toLocaleString()),
                  React.createElement('td', { className: 'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200' }, l.username || l.userId || '—'),
                  React.createElement('td', { className: 'px-4 py-2.5' },
                    React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
                      React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded font-bold ' + methodColor(l.action) }, l.action.split(' ')[0]),
                      React.createElement('code', { className: 'text-xs text-gray-600 dark:text-gray-300' }, describeActivity(l.action, getLang()) + (l.detail ? '「' + l.detail + '」' : ''))
                    )
                  )
                )
              ))
            ),
      total > 40 && React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700' },
        React.createElement('span', { className: 'text-xs text-gray-400' }, total + ' ' + t('entries', getLang())),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page <= 1, className: 'btn-secondary text-xs disabled:opacity-40' }, React.createElement(ChevronLeft, { size: 13 })),
          React.createElement('span', { className: 'text-xs text-gray-500' }, page + ' / ' + totalPages),
          React.createElement('button', { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page >= totalPages, className: 'btn-secondary text-xs disabled:opacity-40' }, React.createElement(ChevronRight, { size: 13 }))
        )
      )
    )
  );
}
