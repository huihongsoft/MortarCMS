import React, { useEffect, useState } from 'react';
import { Trash2, Download, Send, Search, Users } from 'lucide-react';
import api from '../lib/api';
import { downloadFile } from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Subscriber { id: string; email: string; name: string; status: string; confirmed: number; createdAt: string }
interface Stats { total: number; active: number; unsubscribed: number }

export default function Subscribers() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [testTo, setTestTo] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/subscribers?page=${page}&q=${encodeURIComponent(q)}&status=${statusFilter}`).then(r => {
      setSubs(r.data.subscribers || []);
      setTotal(r.data.total || 0);
      setStats(r.data.stats || { total: 0, active: 0, unsubscribed: 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, [page, q, statusFilter]);

  const remove = async (s: Subscriber) => {
    if (!window.confirm(t('delete subscriber confirm', getLang()))) return;
    try {
      await api.delete('/admin/subscribers/' + s.id);
      toast(t('subscriber deleted', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const exportCsv = async () => {
    const ok = await downloadFile('/admin/subscribers/export', 'subscribers.csv');
    if (!ok) toast(t('failed', getLang()), 'error');
  };

  const testSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim())) { toast(t('enter a valid email address', getLang()), 'error'); return; }
    setSending(true);
    try {
      const r = await api.post('/admin/newsletter/send', { to: testTo.trim() });
      toast(t('test newsletter sent', getLang()));
      if (r.data.error) toast(r.data.error, 'error');
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
    finally { setSending(false); }
  };

  const broadcast = async () => {
    if (!window.confirm(t('broadcast confirm', getLang()) + ' (' + stats.active + ')')) return;
    setSending(true);
    try {
      const r = await api.post('/admin/newsletter/send', {});
      toast(r.data.sent + ' ' + t('emails sent', getLang()));
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
    finally { setSending(false); }
  };

  const pages = Math.max(1, Math.ceil(total / 15));

  return React.createElement('div', null,
    // Header
    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('subscribers', getLang())),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', { onClick: exportCsv, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('export csv', getLang())),
        React.createElement('button', { onClick: broadcast, disabled: sending || stats.active === 0, className: 'btn-primary text-sm' }, React.createElement(Send, { size: 14 }), t('send newsletter', getLang())),
      ),
    ),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('subscribers description', getLang())),

    // Stats
    React.createElement('div', { className: 'grid grid-cols-3 gap-3 mb-6' },
      [['total', stats.total], ['active subscribers', stats.active], ['unsubscribed', stats.unsubscribed]].map(([k, v]) =>
        React.createElement('div', { key: k as string, className: 'card p-4 text-center' },
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, v as number),
          React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, t(k as string, getLang())))),
    ),

    // Search + filter
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('div', { className: 'relative flex-1 max-w-xs' },
        React.createElement(Search, { size: 14, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' }),
        React.createElement('input', { value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setQ(e.target.value); setPage(1); }, placeholder: t('search', getLang()) + '…', className: 'input-field pl-9' }),
      ),
      React.createElement('select', { value: statusFilter, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }, className: 'input-field w-40' },
        React.createElement('option', { value: '' }, t('all', getLang())),
        React.createElement('option', { value: 'subscribed' }, t('subscribed', getLang())),
        React.createElement('option', { value: 'unsubscribed' }, t('unsubscribed', getLang())),
      ),
      // Test send
      React.createElement('div', { className: 'flex items-center gap-1.5 ml-auto' },
        React.createElement('input', { value: testTo, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTestTo(e.target.value), placeholder: t('test send to', getLang()), className: 'input-field w-56' }),
        React.createElement('button', { onClick: testSend, disabled: sending, className: 'btn-secondary text-sm whitespace-nowrap' }, React.createElement(Send, { size: 13 }), t('test send', getLang()))),
    ),

    // List
    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : subs.length === 0
        ? React.createElement('div', { className: 'card p-10 text-center' },
            React.createElement(Users, { size: 32, className: 'mx-auto text-gray-300 mb-2' }),
            React.createElement('p', { className: 'text-sm text-gray-400' }, t('no subscribers yet', getLang())))
        : React.createElement('div', { className: 'card overflow-x-auto' },
            React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('email', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('status', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('subscribed at', getLang())),
                React.createElement('th', { className: 'text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, subs.map(s =>
                React.createElement('tr', { key: s.id, className: 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50' },
                  React.createElement('td', { className: 'px-5 py-3 text-sm text-gray-900 dark:text-gray-100' }, s.email),
                  React.createElement('td', { className: 'px-5 py-3 text-sm text-gray-500' }, s.name || '—'),
                  React.createElement('td', { className: 'px-5 py-3' },
                    React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full font-medium ' + (s.status === 'subscribed' ? (s.confirmed ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300') : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400') },
                      t(s.status === 'subscribed' ? (s.confirmed ? 'subscribed' : 'pending confirm') : 'unsubscribed', getLang()))),
                  React.createElement('td', { className: 'px-5 py-3 text-sm text-gray-500' }, new Date(s.createdAt).toLocaleDateString()),
                  React.createElement('td', { className: 'px-5 py-3 text-right' },
                    React.createElement('button', { onClick: () => remove(s), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 15 }))),
                )
              ))
            ),
            React.createElement('div', { className: 'flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700' },
              React.createElement('span', { className: 'text-sm text-gray-500' }, total + ' ' + t('subscribers', getLang())),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: 'btn-secondary text-xs' }, t('previous', getLang())),
                React.createElement('button', { onClick: () => setPage(p => p + 1), disabled: page * 15 >= total, className: 'btn-secondary text-xs' }, t('next', getLang()))))
          ),
  );
}
