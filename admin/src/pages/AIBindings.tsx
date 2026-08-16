import React, { useEffect, useState } from 'react';
import { Plus, Trash2, MessageCircle, Bell, Copy, KeyRound, Send, Clock, CalendarClock } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Binding {
  id: string;
  platform: string;
  label: string;
  token: string;
  wechatToken?: string;
  ddWebhook?: string;
  ddSecret?: string;
  ddToken?: string;
  ddAesKey?: string;
  ddAppKey?: string;
  ddAppSecret?: string;
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
  // DingTalk config fields (enterprise bot callback + group robot outbound)
  const [dd, setDd] = useState({ ddWebhook: '', ddSecret: '', ddToken: '', ddAesKey: '', ddAppKey: '', ddAppSecret: '' });
  // Schedules
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schName, setSchName] = useState('');
  const [schPrompt, setSchPrompt] = useState('');
  const [schType, setSchType] = useState('interval');
  const [schInterval, setSchInterval] = useState(60);
  const [schTime, setSchTime] = useState('09:00');
  const [schWeekday, setSchWeekday] = useState(1);

  useEffect(() => {
    api.get('/ai/bindings').then(r => setBindings(r.data.bindings || [])).catch(() => {});
    api.get('/users').then(r => setUsers(r.data || [])).catch(() => {});
    api.get('/ai/schedules').then(r => setSchedules(r.data.schedules || [])).catch(() => {});
  }, []);

  async function create() {
    try {
      const r = await api.post('/ai/bindings', { platform, userId, label, ...(platform === 'dingtalk' ? dd : {}) });
      setBindings([...bindings, r.data.binding]);
      setPlatform('wechat'); setUserId(''); setLabel(''); setDd({ ddWebhook: '', ddSecret: '', ddToken: '', ddAesKey: '', ddAppKey: '', ddAppSecret: '' });
      toast.toast(t('binding created', getLang()));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  // Test-push to the DingTalk group custom robot
  const [groupTesting, setGroupTesting] = useState<string | null>(null);
  const [groupMsg, setGroupMsg] = useState('');
  async function testGroup(b: Binding) {
    if (!groupMsg.trim()) { toast.toast(t('enter test message', getLang()), 'error'); return; }
    setGroupTesting(b.id);
    try {
      const r = await api.post('/ai/bindings/' + b.id + '/test-group', { message: groupMsg });
      if (r.data?.success) toast.toast(t('group message sent', getLang()));
      else toast.toast(r.data?.error || t('send failed', getLang()), 'error');
    } catch (e: any) { toast.toast(e.response?.data?.error || t('send failed', getLang()), 'error'); }
    finally { setGroupTesting(null); }
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

  async function addSchedule() {
    if (!schName.trim() || !schPrompt.trim()) return;
    try {
      await api.post('/ai/schedules', { name: schName, prompt: schPrompt, type: schType, intervalMinutes: schInterval, time: schTime, weekday: schWeekday });
      setSchName(''); setSchPrompt('');
      api.get('/ai/schedules').then(r => setSchedules(r.data.schedules || [])).catch(() => {});
    } catch (e: any) { alert(e.response?.data?.error || '创建失败'); }
  }

  async function delSchedule(id: string) {
    await api.delete('/ai/schedules/' + id);
    setSchedules(schedules.filter(x => x.id !== id));
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
      ),
      platform === 'dingtalk' && React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3 mt-3' },
        ['ddWebhook', 'ddSecret', 'ddToken', 'ddAesKey', 'ddAppKey', 'ddAppSecret'].map(k => {
          const labels: Record<string, string> = {
            ddWebhook: t('dingtalk group webhook', getLang()),
            ddSecret: t('dingtalk group secret', getLang()),
            ddToken: t('dingtalk callback token', getLang()),
            ddAesKey: t('dingtalk callback aes key', getLang()),
            ddAppKey: t('dingtalk app key', getLang()),
            ddAppSecret: t('dingtalk app secret', getLang()),
          };
          return React.createElement('div', { key: k },
            React.createElement('label', { className: 'block text-[11px] text-gray-400 mb-1' }, labels[k]),
            React.createElement('input', { value: (dd as any)[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDd({ ...dd, [k]: e.target.value }), placeholder: labels[k], className: 'input-field text-sm', type: k === 'ddAppSecret' || k === 'ddSecret' ? 'password' : 'text' }));
        })
      ),
      platform === 'dingtalk' && React.createElement('p', { className: 'text-[11px] text-gray-400 mt-2 leading-relaxed' }, t('dingtalk config hint', getLang()))
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
            // Webhook URL (generic JSON endpoint; WeChat bindings get the
            // WeChat protocol endpoint + the developer Token for the MP console)
            React.createElement('div', { className: 'mt-3 flex items-center gap-2' },
              React.createElement(KeyRound, { size: 13, className: 'text-gray-400 flex-shrink-0' }),
              React.createElement('code', { className: 'text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 truncate flex-1' }, window.location.origin + (b.platform === 'wechat' ? '/api/ai/webhook/wechat/' : '/api/ai/webhook/') + b.token),
              React.createElement('button', { onClick: () => copy(window.location.origin + (b.platform === 'wechat' ? '/api/ai/webhook/wechat/' : '/api/ai/webhook/') + b.token), className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Copy, { size: 14 }))
            ),
            b.platform === 'wechat' && b.wechatToken && React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'mt-2 flex items-center gap-2' },
                React.createElement(KeyRound, { size: 13, className: 'text-gray-400 flex-shrink-0' }),
                React.createElement('code', { className: 'text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 truncate flex-1' }, b.wechatToken),
                React.createElement('button', { onClick: () => copy(b.wechatToken || ''), className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Copy, { size: 14 }))
              ),
              React.createElement('p', { className: 'text-[11px] text-gray-400 mt-2 leading-relaxed' }, t('wechat setup hint', getLang()))
            ),
            // Test panel
            React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2' },
              React.createElement('input', { value: testMsg, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTestMsg(e.target.value), placeholder: t('test message placeholder', getLang()), className: 'input-field flex-1 text-sm' }),
              React.createElement('button', { onClick: () => test(b), disabled: testing === b.id, className: 'btn-secondary text-xs flex-shrink-0' },
                React.createElement(Send, { size: 13 }), testing === b.id ? t('processing', getLang()) + '...' : t('simulate send', getLang()))
            ),
            testReply && React.createElement('div', { className: 'mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap' },
              React.createElement('p', { className: 'text-[10px] text-gray-400 mb-1 uppercase' }, t('ai reply', getLang())),
              testReply),
            b.platform === 'dingtalk' && React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2' },
              React.createElement('input', { value: groupMsg, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGroupMsg(e.target.value), placeholder: t('group push message placeholder', getLang()), className: 'input-field flex-1 text-sm' }),
              React.createElement('button', { onClick: () => testGroup(b), disabled: groupTesting === b.id || !b.ddWebhook, className: 'btn-secondary text-xs flex-shrink-0 disabled:opacity-40', title: b.ddWebhook ? '' : t('dingtalk group webhook missing', getLang()) },
                React.createElement(Bell, { size: 13 }), groupTesting === b.id ? t('sending', getLang()) + '...' : t('push to group', getLang())))
          )
        )),

    // ---- Scheduled AI tasks ----
    React.createElement('div', { className: 'card p-6 mt-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5' },
        React.createElement(CalendarClock, { size: 15, className: 'text-primary-600' }), t('scheduled ai tasks', getLang())),
      React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('schedules hint', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3 mb-4' },
        React.createElement('input', { value: schName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSchName(e.target.value), placeholder: t('schedule name', getLang()), className: 'input-field text-sm' }),
        React.createElement('input', { value: schPrompt, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSchPrompt(e.target.value), placeholder: t('schedule prompt', getLang()), className: 'input-field text-sm' })),
      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
        React.createElement('select', { value: schType, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSchType(e.target.value), className: 'input-field w-32 text-sm' },
          React.createElement('option', { value: 'interval' }, t('every n minutes', getLang())),
          React.createElement('option', { value: 'daily' }, t('daily at', getLang())),
          React.createElement('option', { value: 'weekly' }, t('weekly on', getLang()))),
        schType === 'interval'
          ? React.createElement('input', { type: 'number', min: 5, value: schInterval, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSchInterval(parseInt(e.target.value) || 60), className: 'input-field w-24 text-sm' }, null)
          : React.createElement('input', { type: 'time', value: schTime, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSchTime(e.target.value), className: 'input-field w-32 text-sm' }, null),
        schType === 'weekly' && React.createElement('select', { value: schWeekday, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSchWeekday(parseInt(e.target.value)), className: 'input-field w-32 text-sm' },
          [['1', '周一'], ['2', '周二'], ['3', '周三'], ['4', '周四'], ['5', '周五'], ['6', '周六'], ['0', '周日']].map(([v, l]) => React.createElement('option', { key: v, value: v }, l))),
        React.createElement('button', { onClick: addSchedule, disabled: !schName.trim() || !schPrompt.trim(), className: 'btn-primary text-sm' }, React.createElement(Plus, { size: 15 }), t('create', getLang()))),
      schedules.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no schedules yet', getLang()))
        : React.createElement('div', { className: 'space-y-2' },
            schedules.map(sch => React.createElement('div', { key: sch.id, className: 'flex items-center gap-3 p-3 rounded-lg border border-gray-100' },
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: 'text-sm text-gray-800 font-medium truncate' }, sch.name),
                React.createElement('p', { className: 'text-[11px] text-gray-400 truncate' }, sch.prompt),
                React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' },
                  sch.type === 'interval' ? t('every n minutes', getLang()) + ': ' + sch.intervalMinutes
                    : sch.type === 'weekly' ? t('weekly on', getLang()) + ' ' + ['日', '一', '二', '三', '四', '五', '六'][sch.weekday] + ' ' + sch.time
                    : t('daily at', getLang()) + ' ' + sch.time,
                  sch.lastRun ? ' · ' + t('last run', getLang()) + ': ' + new Date(sch.lastRun).toLocaleString() : '')),
              React.createElement('button', { onClick: () => delSchedule(sch.id), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 })))
            ))
    )
  );
}
