import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

// Full visit statistics page: PV/UV series with common time ranges
// (7d / 14d / 30d / this month / this year), totals and top posts.
// Labels resolve at render time so the language toggle takes effect.
const RANGES = ['7d', '14d', '30d', 'month', 'year'];
const RANGE_KEYS: Record<string, string> = { '7d': 'last 7 days', '14d': 'last 14 days', '30d': 'last 30 days', month: 'this month', year: 'this year' };

export default function Stats() {
  const navigate = useNavigate();
  const [range, setRange] = useState('14d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cancel guard: switching ranges quickly must not let a slow earlier
    // response overwrite the newer one
    let cancelled = false;
    setLoading(true);
    api.get('/stats?range=' + range)
      .then(r => { if (!cancelled) { setData(r.data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range]);

  const rangeLabel = t(RANGE_KEYS[range] || 'last 14 days', getLang());
  // Year view aggregates by month, the other ranges by day
  const avgLabel = range === 'year' ? t('avg monthly views', getLang()) : t('avg daily views', getLang());

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6 flex-wrap gap-3' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' },
        React.createElement(BarChart3, { size: 22, className: 'text-primary-500' }), t('visit stats', getLang())),
      React.createElement('div', { className: 'flex items-center gap-1.5 flex-wrap' },
        RANGES.map(r =>
          React.createElement('button', {
            key: r,
            onClick: () => setRange(r),
            className: 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' +
              (range === r ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'),
          }, t(RANGE_KEYS[r], getLang()))
        ),
      ),
    ),

    // Totals
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6' },
      React.createElement('div', { className: 'card p-5 flex items-center gap-4' },
        React.createElement('div', { className: 'w-11 h-11 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0' }, React.createElement(Eye, { size: 20 })),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900 leading-tight' }, data ? data.total.pv : '—'),
          React.createElement('p', { className: 'text-xs text-gray-500' }, t('page views', getLang()) + ' · ' + rangeLabel)
        )
      ),
      React.createElement('div', { className: 'card p-5 flex items-center gap-4' },
        React.createElement('div', { className: 'w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0' }, React.createElement(Users, { size: 20 })),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900 leading-tight' }, data ? data.total.uv : '—'),
          React.createElement('p', { className: 'text-xs text-gray-500' }, t('unique visitors', getLang()) + ' · ' + rangeLabel)
        )
      ),
      React.createElement('div', { className: 'card p-5 flex items-center gap-4' },
        React.createElement('div', { className: 'w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0' }, React.createElement(TrendingUp, { size: 20 })),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900 leading-tight' },
            data && data.series && data.series.length
              ? Math.round(data.total.pv / data.series.length)
              : '—'),
          React.createElement('p', { className: 'text-xs text-gray-500' }, avgLabel)
        )
      ),
    ),

    // Chart
    React.createElement('div', { className: 'card p-5 mb-6' },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('visit stats', getLang()) + ' · ' + rangeLabel),
        React.createElement('div', { className: 'flex gap-4 text-xs text-gray-500' },
          React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-primary-500 mr-1' }), 'PV'),
          React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-green-500 mr-1' }), 'UV'),
        ),
      ),
      loading
        ? React.createElement('p', { className: 'text-sm text-gray-400 py-16 text-center' }, t('loading', getLang()) + '…')
        : !data
          ? React.createElement('p', { className: 'text-sm text-gray-400 py-16 text-center' }, t('failed to load', getLang()))
          : React.createElement('div', { className: 'flex items-end gap-1 h-40' },
            data.series.map((d: any) => {
              const max = Math.max(...data.series.map((x: any) => x.pv), 1);
              const h = Math.round((d.pv / max) * 100);
              return React.createElement('div', { key: d.date, className: 'flex-1 flex flex-col items-center justify-end gap-1 min-w-0' },
                React.createElement('div', { className: 'flex items-end gap-0.5 w-full justify-center' },
                  React.createElement('div', { title: 'PV ' + d.pv, className: 'w-2 rounded-t bg-primary-500', style: { height: Math.max(2, Math.round(h * 0.8)) + 'px' } }),
                  React.createElement('div', { title: 'UV ' + d.uv, className: 'w-2 rounded-t bg-green-500', style: { height: Math.max(2, Math.round(h * 0.5)) + 'px' } }),
                ),
                React.createElement('span', { className: 'text-[10px] text-gray-500 truncate w-full text-center' }, d.date.slice(5)),
              );
            })
          ),
    ),

    // Top posts
    React.createElement('div', { className: 'card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('top posts', getLang())),
      data && data.top.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no posts yet', getLang()))
        : React.createElement('div', { className: 'space-y-2' }, (data?.top || []).map((p: any, i: number) =>
            React.createElement('button', {
              key: p.slug,
              onClick: () => window.open('/post/' + p.slug, '_blank'),
              className: 'w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left',
            },
              React.createElement('span', { className: 'text-xs text-gray-400 w-4' }, i + 1),
              React.createElement('span', { className: 'flex-1 text-sm text-gray-700 truncate' }, p.title),
              React.createElement('span', { className: 'text-xs text-gray-400' }, p.views + ' ' + t('views', getLang()))
            )
          ))
    ),
  );
}
