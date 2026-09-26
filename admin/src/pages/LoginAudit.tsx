import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import Select from '../components/Select';

// Login audit: who signed in, who tried and failed, and from where.
//
// Failed attempts used to be invisible — they only fired a hook, and the
// activity log that does record successful logins sits behind developer mode.
// This screen is always available to `manage_system`.
const KINDS = ['login', 'login_failed', '2fa_failed', 'login_recovery_code', 'logout_all', 'password_changed'];

export default function LoginAudit() {
  const [events, setEvents] = useState<any[]>([]);
  const [failures, setFailures] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (kind) params.set('kind', kind);
    if (q.trim()) params.set('q', q.trim());
    api.get('/security/auth-log?' + params.toString())
      .then((r) => { setEvents(r.data.events || []); setTotal(r.data.total || 0); setFailures(r.data.recentFailures || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  const kindStyle = (action: string) => {
    if (action === 'login_failed' || action === '2fa_failed') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    if (action === 'login_recovery_code') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    if (action === 'logout_all' || action === 'password_changed') return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  };

  // `detail` is a compact `email=… ip=… reason=…` string written by the server.
  // Split it for display; anything without a key is shown as-is.
  function detailParts(detail: string): { key: string; value: string }[] {
    return String(detail || '').split(' ').filter(Boolean).map((part) => {
      const i = part.indexOf('=');
      return i > 0 ? { key: part.slice(0, i), value: part.slice(i + 1) } : { key: '', value: part };
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / 30));

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6 flex-wrap gap-3' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(ShieldAlert, { size: 22, className: 'text-primary-500' }), t('login audit', getLang())),
      React.createElement('div', { className: 'flex items-stretch gap-2' },
        React.createElement('input', { value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') { setPage(1); load(); } }, placeholder: t('filter by account or address', getLang()), className: 'input-field text-sm w-56' }),
        React.createElement(Select, { value: kind, onChange: (v: string) => { setKind(v); setPage(1); }, className: 'input-field text-sm w-44' },
          React.createElement('option', { value: '' }, t('all events', getLang())),
          KINDS.map((k) => React.createElement('option', { key: k, value: k }, t('auth event ' + k, getLang())))),
        React.createElement('button', { onClick: () => { setPage(1); load(); }, className: 'btn-secondary text-sm h-auto' }, React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang())))),

    failures.length > 0 && React.createElement('div', { className: 'card p-4 mb-4' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2' }, t('failures in the last 24 hours', getLang())),
      React.createElement('div', { className: 'flex flex-wrap gap-2' },
        failures.map((f: any, i: number) => React.createElement('span', { key: i, className: 'px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-mono' }, f.detail + ' × ' + f.c)))),

    React.createElement('div', { className: 'card overflow-hidden' },
      loading && events.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('loading', getLang()) + '…')
        : events.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('no auth events yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800 text-left' },
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('time', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('event', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('account', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('details', getLang())))),
              React.createElement('tbody', null, events.map((e: any) =>
                React.createElement('tr', { key: e.id, className: 'border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap' }, new Date(e.createdAt).toLocaleString()),
                  React.createElement('td', { className: 'px-4 py-2.5' },
                    React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded font-medium whitespace-nowrap ' + kindStyle(e.action) }, t('auth event ' + e.action, getLang()))),
                  React.createElement('td', { className: 'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200' }, e.username || '—'),
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-mono break-all' },
                    detailParts(e.detail).map((p, i) => React.createElement('span', { key: i, className: 'mr-3 whitespace-nowrap' }, (p.key ? p.key + ':' : '') + p.value))))))),
      total > 30 && React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700' },
        React.createElement('span', { className: 'text-xs text-gray-400' }, total + ' ' + t('entries', getLang())),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page <= 1, className: 'btn-secondary text-xs disabled:opacity-40' }, React.createElement(ChevronLeft, { size: 13 })),
          React.createElement('span', { className: 'text-xs text-gray-500' }, page + ' / ' + totalPages),
          React.createElement('button', { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page >= totalPages, className: 'btn-secondary text-xs disabled:opacity-40' }, React.createElement(ChevronRight, { size: 13 })))))
  );
}
