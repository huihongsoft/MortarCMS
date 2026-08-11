import React, { useEffect, useState } from 'react';
import { Code, Play, Clock, ChevronRight, Search } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

interface Endpoint {
  method: string;
  path: string;
  desc?: string;
  auth?: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function ApiDocs() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Endpoint | null>(null);
  const [pathVals, setPathVals] = useState<Record<string, string>>({});
  const [queryVals, setQueryVals] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState('');
  const [resp, setResp] = useState<{ status: number; ms: number; data: any } | null>(null);
  const [history, setHistory] = useState<{ method: string; path: string; status: number; ms: number; time: string }[]>([]);

  useEffect(() => { api.get('/schema').then(r => { setEndpoints(r.data?.endpoints || []); }).catch(() => {}); }, []);

  const filtered = filter
    ? endpoints.filter(e => (e.path + ' ' + (e.desc || '')).toLowerCase().includes(filter.toLowerCase()))
    : endpoints;

  const select = (e: Endpoint) => {
    setSelected(e);
    setResp(null);
    // Prefill path/query params and body from the schema
    const pv: Record<string, string> = {};
    const qv: Record<string, string> = {};
    (e.path.match(/:(\w+)/g) || []).forEach(p => { pv[p.slice(1)] = ''; });
    Object.keys(e.query || {}).forEach(k => { qv[k] = (e.query as any)[k] || ''; });
    setPathVals(pv); setQueryVals(qv);
    setBodyText(e.body ? JSON.stringify(e.body, null, 2) : '');
  };

  const send = async () => {
    if (!selected) return;
    let url = selected.path.replace('/api', '');
    (selected.path.match(/:(\w+)/g) || []).forEach(p => { url = url.replace(p, pathVals[p.slice(1)] || ''); });
    const qs = Object.entries(queryVals).filter(([, v]) => v !== '').map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
    if (qs) url += '?' + qs;
    let data: any = undefined;
    if (bodyText.trim()) { try { data = JSON.parse(bodyText); } catch { setResp({ status: 0, ms: 0, data: { error: 'Invalid JSON body' } }); return; } }
    const t0 = performance.now();
    try {
      const r = await api.request({ method: selected.method, url, data });
      const ms = Math.round(performance.now() - t0);
      setResp({ status: r.status, ms, data: r.data });
      setHistory(h => [{ method: selected.method, path: url, status: r.status, ms, time: new Date().toLocaleTimeString() }, ...h].slice(0, 10));
    } catch (e: any) {
      const ms = Math.round(performance.now() - t0);
      setResp({ status: e.response?.status || 0, ms, data: e.response?.data || { error: e.message } });
      setHistory(h => [{ method: selected.method, path: url, status: e.response?.status || 0, ms, time: new Date().toLocaleTimeString() }, ...h].slice(0, 10));
    }
  };

  const jsonPretty = (d: any) => {
    try { return JSON.stringify(d, null, 2); } catch { return String(d); }
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(Code, { size: 22, className: 'text-primary-500' }), t('api docs & test center', getLang())),
      React.createElement('span', { className: 'text-xs text-gray-400' }, endpoints.length + ' ' + t('endpoints', getLang()))
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-5 gap-6' },
      // Endpoint list
      React.createElement('div', { className: 'lg:col-span-2' },
        React.createElement('div', { className: 'relative mb-3' },
          React.createElement(Search, { size: 14, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' }),
          React.createElement('input', { value: filter, onChange: e => setFilter(e.target.value), placeholder: t('filter endpoints', getLang()), className: 'input-field text-sm', style: { paddingLeft: '2.25rem' } })
        ),
        filtered.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-4' }, t('no endpoints found', getLang()))
          : React.createElement('div', { className: 'space-y-1 max-h-[70vh] overflow-y-auto pr-1' },
              filtered.map((e, i) =>
                React.createElement('button', {
                  key: i,
                  onClick: () => select(e),
                  className: 'w-full text-left px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors ' +
                    (selected === e ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'),
                },
                  React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded font-bold ' + (METHOD_COLORS[e.method] || 'bg-gray-100 text-gray-600') }, e.method),
                  React.createElement('code', { className: 'text-xs text-gray-700 dark:text-gray-200 truncate flex-1' }, e.path.replace('/api', '')),
                  e.auth && React.createElement('span', { className: 'text-[10px] text-amber-600 dark:text-amber-400 shrink-0' }, t('auth required', getLang())),
                  React.createElement(ChevronRight, { size: 13, className: 'text-gray-300 shrink-0' })
                )
              )
            )
      ),
      // Detail + test panel
      React.createElement('div', { className: 'lg:col-span-3 space-y-4' },
        selected
          ? React.createElement('div', { className: 'card p-5' },
              React.createElement('div', { className: 'flex items-center gap-2 mb-2 flex-wrap' },
                React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded font-bold ' + (METHOD_COLORS[selected.method] || 'bg-gray-100 text-gray-600') }, selected.method),
                React.createElement('code', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, selected.path.replace('/api', '')),
                selected.auth && React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800' }, t('auth required', getLang())),
              ),
              selected.desc && React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, selected.desc),
              // Path params
              Object.keys(pathVals).length > 0 && React.createElement('div', { className: 'mb-3' },
                React.createElement('p', { className: 'text-[10px] uppercase text-gray-400 mb-1' }, t('path params', getLang())),
                React.createElement('div', { className: 'flex flex-wrap gap-2' },
                  Object.keys(pathVals).map(k =>
                    React.createElement('input', { key: k, value: pathVals[k], onChange: e => setPathVals({ ...pathVals, [k]: e.target.value }), placeholder: ':' + k, className: 'input-field w-40 text-sm' })
                  )
                )
              ),
              // Query params
              Object.keys(queryVals).length > 0 && React.createElement('div', { className: 'mb-3' },
                React.createElement('p', { className: 'text-[10px] uppercase text-gray-400 mb-1' }, t('query params', getLang())),
                React.createElement('div', { className: 'flex flex-wrap gap-2' },
                  Object.keys(queryVals).map(k =>
                    React.createElement('div', { key: k, className: 'flex items-center gap-1' },
                      React.createElement('span', { className: 'text-xs text-gray-400' }, k + '='),
                      React.createElement('input', { value: queryVals[k], onChange: e => setQueryVals({ ...queryVals, [k]: e.target.value }), className: 'input-field w-32 text-sm' })
                    )
                  )
                )
              ),
              // Body
              React.createElement('div', { className: 'mb-3' },
                React.createElement('p', { className: 'text-[10px] uppercase text-gray-400 mb-1' }, t('request body', getLang())),
                React.createElement('textarea', { value: bodyText, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setBodyText(e.target.value), rows: 6, className: 'input-field font-mono text-xs w-full', placeholder: '{ "title": "..." }' })
              ),
              React.createElement('button', { onClick: send, className: 'btn-primary text-sm' }, React.createElement(Play, { size: 14 }), t('send request', getLang()))
            )
          : React.createElement('div', { className: 'card p-10 text-center' },
              React.createElement(Code, { size: 36, className: 'mx-auto mb-3 text-gray-300' }),
              React.createElement('p', { className: 'text-sm text-gray-400' }, t('select an endpoint to inspect and test it', getLang()))
            ),
        // Response
        resp && React.createElement('div', { className: 'card p-5' },
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('span', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, t('response', getLang())),
            React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded font-bold ' + (resp.status >= 200 && resp.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') }, resp.status || 'ERR'),
            React.createElement('span', { className: 'text-xs text-gray-400 flex items-center gap-1' }, React.createElement(Clock, { size: 12 }), resp.ms + 'ms')
          ),
          React.createElement('pre', { className: 'bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-700 dark:text-gray-200 overflow-x-auto max-h-80' }, jsonPretty(resp.data))
        ),
        // History
        history.length > 0 && React.createElement('div', { className: 'card p-5' },
          React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('request history', getLang())),
          React.createElement('div', { className: 'space-y-1' },
            history.map((h, i) =>
              React.createElement('div', { key: i, className: 'flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300' },
                React.createElement('span', { className: 'px-1.5 py-0.5 rounded font-bold text-[10px] ' + (METHOD_COLORS[h.method] || 'bg-gray-100') }, h.method),
                React.createElement('code', { className: 'flex-1 truncate' }, h.path),
                React.createElement('span', { className: 'font-bold ' + (h.status >= 200 && h.status < 300 ? 'text-green-600' : 'text-red-600') }, h.status),
                React.createElement('span', { className: 'text-gray-400' }, h.ms + 'ms'),
                React.createElement('span', { className: 'text-gray-400' }, h.time)
              )
            )
          )
        )
      )
    )
  );
}
