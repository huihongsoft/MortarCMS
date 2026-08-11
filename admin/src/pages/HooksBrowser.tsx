import React, { useEffect, useState } from 'react';
import { Zap, Filter, RefreshCw, Hash } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

type HookKind = 'actions' | 'filters';

interface ListenerInfo { source: string; priority: number }
interface HookInfo { name: string; canonical: boolean; listeners: ListenerInfo[] }

export default function HooksBrowser() {
  const [hooks, setHooks] = useState<{ actions: HookInfo[]; filters: HookInfo[] }>({ actions: [], filters: [] });
  const [tab, setTab] = useState<HookKind>('actions');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/system/hooks').then(r => { setHooks(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const list = tab === 'actions' ? hooks.actions : hooks.filters;

  const sourceColor: Record<string, string> = {
    core: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    admin: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };

  return React.createElement('div', null,
    // Header with refresh
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('hooks browser', getLang())),
      React.createElement('button', { onClick: load, className: 'btn-secondary text-sm' },
        React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang()))
    ),
    // Tab bar
    React.createElement('div', { className: 'flex gap-2 mb-6' },
      (['actions', 'filters'] as HookKind[]).map(k =>
        React.createElement('button', {
          key: k,
          onClick: () => setTab(k),
          className: 'px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors ' +
            (tab === k ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
        }, React.createElement(k === 'actions' ? Zap : Filter, { size: 14 }), t(k === 'actions' ? 'hook actions' : 'hook filters', getLang()))
      )
    ),
    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : list.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no hooks found', getLang()))
        : React.createElement('div', { className: 'space-y-4' },
            list.map((h: HookInfo) =>
              React.createElement('div', { key: h.name, className: 'card p-5' },
                React.createElement('div', { className: 'flex items-center gap-2 mb-3 flex-wrap' },
                  React.createElement('code', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded' }, h.name),
                  h.canonical && React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-medium' }, t('canonical', getLang())),
                  React.createElement('span', { className: 'text-xs text-gray-400 flex items-center gap-1 ml-auto' },
                    React.createElement(Hash, { size: 12 }), h.listeners.length + ' ' + t('listeners', getLang()))
                ),
                h.listeners.length === 0
                  ? React.createElement('p', { className: 'text-xs text-gray-400 italic' }, t('not registered', getLang()))
                  : React.createElement('table', { className: 'w-full' },
                      React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-100 dark:border-gray-700' },
                        React.createElement('th', { className: 'text-left py-1.5 pr-3 text-[11px] uppercase text-gray-400 font-medium' }, t('source', getLang())),
                        React.createElement('th', { className: 'text-left py-1.5 text-[11px] uppercase text-gray-400 font-medium' }, t('priority', getLang())),
                      )),
                      React.createElement('tbody', null, h.listeners.map((l, i) =>
                        React.createElement('tr', { key: i, className: 'border-b border-gray-50 dark:border-gray-800 last:border-0' },
                          React.createElement('td', { className: 'py-1.5 pr-3' },
                            React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full font-medium ' + (sourceColor[l.source] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300') }, l.source)),
                          React.createElement('td', { className: 'py-1.5 text-sm text-gray-600 dark:text-gray-300' }, l.priority)
                        )
                      ))
                    )
              )
            )
          )
  );
}
