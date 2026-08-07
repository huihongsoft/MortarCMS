import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw, Lock } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';

const statusIcons: Record<string, any> = {
  ok: { icon: CheckCircle2, cls: 'text-green-600 bg-green-50 dark:bg-green-900/30', label: t('passed', getLang()) },
  warn: { icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', label: t('warning', getLang()) },
  fail: { icon: XCircle, cls: 'text-red-600 bg-red-50 dark:bg-red-900/30', label: t('failed', getLang()) },
  info: { icon: Info, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', label: t('info', getLang()) },
};

export default function Security() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get('/security/audit').then(r => { setData(r.data); setLoading(false); }).catch(() => { setLoading(false); });
  }
  useEffect(load, []);

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' }, React.createElement(ShieldCheck, { size: 24, className: 'text-primary-500' }), t('security audit', getLang())),
      React.createElement('button', { onClick: load, className: 'btn-secondary text-sm' }, React.createElement(RefreshCw, { size: 14 }), t('re-run', getLang()))
    ),
    loading
      ? React.createElement('p', { className: 'text-gray-500' }, t('running audit...', getLang()))
      : !data
        ? React.createElement('p', { className: 'text-gray-500' }, t('audit failed', getLang()))
        : React.createElement('div', null,
            // Summary banner
            React.createElement('div', { className: 'card p-6 mb-6 flex items-center gap-6 flex-wrap' },
              React.createElement('div', { className: 'flex items-center gap-3' },
                React.createElement('div', { className: 'w-16 h-16 rounded-2xl flex items-center justify-center ' + (data.summary.score >= 80 ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : data.summary.score >= 60 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600') },
                  React.createElement('span', { className: 'text-2xl font-bold' }, data.summary.score)),
                React.createElement('div', null,
                  React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, t('security score', getLang())),
                  React.createElement('p', { className: 'text-xs text-gray-500' }, data.summary.ok + ' ' + t('passed', getLang()) + ' · ' + data.summary.warn + ' ' + t('warning', getLang()) + ' · ' + data.summary.fail + ' ' + t('failed', getLang()) + ' · ' + data.summary.info + ' ' + t('info', getLang())),
                )
              ),
              React.createElement('div', { className: 'flex-1 min-w-[200px]' },
                React.createElement('div', { className: 'h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden' },
                  React.createElement('div', { className: 'h-full rounded-full transition-all ' + (data.summary.score >= 80 ? 'bg-green-500' : data.summary.score >= 60 ? 'bg-amber-500' : 'bg-red-500'), style: { width: data.summary.score + '%' } })
                ),
                React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('security summary hint', getLang())),
              ),
            ),
            // Checks list
            React.createElement('div', { className: 'space-y-3' },
              data.checks.map((c: any) => {
                const s = statusIcons[c.status] || statusIcons.info;
                return React.createElement('div', { key: c.id, className: 'card p-4 flex items-start gap-4' },
                  React.createElement('div', { className: 'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' + s.cls }, React.createElement(s.icon, { size: 16 })),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
                      React.createElement('p', { className: 'font-medium text-gray-900 dark:text-gray-100 text-sm' }, c.label),
                      React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded-full ' + s.cls }, s.label),
                    ),
                    React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mt-1' }, c.detail),
                    c.advice && React.createElement('p', { className: 'text-xs text-gray-400 mt-1 flex items-start gap-1' }, React.createElement(Lock, { size: 11, className: 'mt-0.5 shrink-0' }), c.advice),
                  )
                );
              })
            ),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-4' }, t('audit generated at', getLang()) + ' ' + new Date(data.generatedAt).toLocaleString())
          )
  );
}
