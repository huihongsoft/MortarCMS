import React, { useEffect, useState } from 'react';
import { Plus, Trash2, MessageCircle, Bell, Copy, KeyRound, Send, Clock } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Binding {
  id: string;
  platform: string;
  label: string;
  token: string;
  userId: string;
  username: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function AIBindings() {
  const toast = useToast();
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [platform, setPlatform] = useState('wechat');
  const [userId, setUserId] = useState('');
  const [label, setLabel] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    api.get('/ai/bindings').then(r => setBindings(r.data.bindings || [])).catch(() => {});
    api.get('/users').then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  async function create() {
    try {
      const r = await api.post('/ai/bindings', { platform, userId, label });
      setBindings([...bindings, r.data.binding]);
      setPlatform('wechat'); setUserId(''); setLabel('');
      toast.toast(t('binding created', getLang()));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  async function del(id: string) {
    await api.delete('/ai/bindings/' + id);
    setBindings(bindings.filter(b => b.id !== id));
  }

  async function test(b: Binding) {
    if (!testMsg.trim()) { toast.toast(t('enter test message', getLang()), 'error'); return; }
    setTesting(b.id);
    setTestReply('');
    try {
      const r = await api.post('/ai/webhook/' + b.token, { message: testMsg });
      setTestReply(r.data.reply || '');
    } catch (e: any) {
      setTestReply(e.response?.data?.error || 'error');
    } finally { setTesting(null); }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.toast(t('copied', getLang()));
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, t('ai bindings', getLang())),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6 max-w-2xl' }, t('bindings hint', getLang())),

    // Create binding
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, t('create binding', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-3' },
        React.createElement('select', { value: platform, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value), className: 'input-field' },
          React.createElement('option', { value: 'wechat' }, '微信 WeChat'),
          React.createElement('option', { value: 'dingtalk' }, '钉钉 DingTalk')),
        React.createElement('select', { value: userId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setUserId(e.target.value), className: 'input-field' },
          React.createElement('option', { value: '' }, t('select user', getLang())),
          users.map(u => React.createElement('option', { key: u.id, value: u.id }, u.username + ' (' + u.role + ')'))),
        React.createElement('input', { value: label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value), placeholder: t('binding label', getLang()), className: 'input-field' }),
        React.createElement('button', { onClick: create, disabled: !userId, className: 'btn-primary' }, React.createElement(Plus, { size: 16 }), t('create', getLang()))
      )
    ),

    // Binding list
    bindings.length === 0
      ? React.createElement('p', { className: 'text-gray-400 text-sm' }, t('no bindings yet', getLang()))
      : React.createElement('div', { className: 'space-y-4' }, bindings.map(b =>
          React.createElement('div', { key: b.id, className: 'card p-5' },
            React.createElement('div', { className: 'flex items-start justify-between gap-4 flex-wrap' },
              React.createElement('div', { className: 'flex items-start gap-3 min-w-0' },
                React.createElement('div', { className: 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' + (b.platform === 'wechat' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600') },
                  React.createElement(b.platform === 'wechat' ? MessageCircle : Bell, { size: 18 })),
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('p', { className: 'font-medium text-gray-900 text-sm' }, b.label + ' (' + (b.platform === 'wechat' ? '微信' : '钉钉') + ')'),
                  React.createElement('p', { className: 'text-xs text-gray-400 mt-0.5' }, t('bound user', getLang()) + ': ' + b.username),
                  React.createElement('div', { className: 'flex items-center gap-1 text-[11px] text-gray-400 mt-1' },
                    React.createElement(Clock, { size: 11 }), b.lastUsedAt ? t('last used', getLang()) + ': ' + new Date(b.lastUsedAt).toLocaleString() : t('never used', getLang())),
                )
              ),
              React.createElement('button', { onClick: () => del(b.id), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 15 }))
            ),
            // Webhook URL
            React.createElement('div', { className: 'mt-3 flex items-center gap-2' },
              React.createElement('KeyRound', { size: 13, className: 'text-gray-400 flex-shrink-0' }),
              React.createElement('code', { className: 'text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 truncate flex-1' }, window.location.origin + '/api/ai/webhook/' + b.token),
              React.createElement('button', { onClick: () => copy(window.location.origin + '/api/ai/webhook/' + b.token), className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Copy, { size: 14 }))
            ),
            // Test panel
            React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2' },
              React.createElement('input', { value: testMsg, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTestMsg(e.target.value), placeholder: t('test message placeholder', getLang()), className: 'input-field flex-1 text-sm' }),
              React.createElement('button', { onClick: () => test(b), disabled: testing === b.id, className: 'btn-secondary text-xs flex-shrink-0' },
                React.createElement(Send, { size: 13 }), testing === b.id ? t('processing', getLang()) + '...' : t('simulate send', getLang()))
            ),
            testReply && React.createElement('div', { className: 'mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap' },
              React.createElement('p', { className: 'text-[10px] text-gray-400 mb-1 uppercase' }, t('ai reply', getLang())),
              testReply)
          )
        ))
  );
}
