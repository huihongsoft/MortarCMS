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

  // Translate a check field (label/detail/advice are i18n keys) and fill any
  // {0} placeholders with the args the server attached
  const tr = (key: string, args?: Record<string, string | number>) => {
    let s = t(key, getLang());
    if (args) for (const [k, v] of Object.entries(args)) s = s.replace('{' + k + '}', String(v));
    return s;
  };

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
            // Summary banner: score with a segmented level (color + label +
            // suggestion) and a color-dot legend in the top-right corner
            (() => {
              const score = data.summary.score;
              const level = score >= 80
                ? { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', label: t('good', getLang()), hint: t('security good hint', getLang()) }
                : score >= 60
                  ? { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: t('needs improvement', getLang()), hint: t('security improve hint', getLang()) }
                  : { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: t('at risk', getLang()), hint: t('security risk hint', getLang()) };
              return React.createElement('div', { className: 'card p-6 mb-6 relative' },
                // Legend dot + label, top-right corner
                React.createElement('div', { className: 'absolute top-4 right-4 flex items-center gap-1.5' },
                  React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full ' + level.dot }),
                  React.createElement('span', { className: 'text-xs font-medium ' + level.text }, level.label)),
                React.createElement('div', { className: 'flex items-center gap-6 flex-wrap' },
                  React.createElement('div', { className: 'flex items-center gap-3' },
                    React.createElement('div', { className: 'w-16 h-16 rounded-2xl flex items-center justify-center ' + level.bg + ' ' + level.text },
                      React.createElement('span', { className: 'text-2xl font-bold' }, score)),
                    React.createElement('div', null,
                      React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, t('security score', getLang())),
                      React.createElement('p', { className: 'text-xs font-medium ' + level.text }, level.label + ' — ' + level.hint),
                      React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, data.summary.ok + ' ' + t('passed', getLang()) + ' · ' + data.summary.warn + ' ' + t('warning', getLang()) + ' · ' + data.summary.fail + ' ' + t('failed', getLang()) + ' · ' + data.summary.info + ' ' + t('info', getLang())),
                    )
                  ),
                  React.createElement('div', { className: 'flex-1 min-w-[200px]' },
                    React.createElement('div', { className: 'h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden' },
                      React.createElement('div', { className: 'h-full rounded-full transition-all ' + level.dot, style: { width: score + '%' } })
                    ),
                    React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('security summary hint', getLang())),
                  ),
                )
              );
            })(),
            // Checks list
            React.createElement('div', { className: 'space-y-3' },
              data.checks.map((c: any) => {
                const s = statusIcons[c.status] || statusIcons.info;
                return React.createElement('div', { key: c.id, className: 'card p-4 flex items-start gap-4' },
                  React.createElement('div', { className: 'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' + s.cls }, React.createElement(s.icon, { size: 16 })),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
                      React.createElement('p', { className: 'font-medium text-gray-900 dark:text-gray-100 text-sm' }, tr(c.label)),
                      React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded-full ' + s.cls }, s.label),
                    ),
                    React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mt-1' }, tr(c.detail, c.args)),
                    c.advice && React.createElement('p', { className: 'text-xs text-gray-400 mt-1 flex items-start gap-1' }, React.createElement(Lock, { size: 11, className: 'mt-0.5 shrink-0' }), tr(c.advice, c.args)),
                  )
                );
              })
            ),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-4' }, t('audit generated at', getLang()) + ' ' + new Date(data.generatedAt).toLocaleString())
          )
  );
}
