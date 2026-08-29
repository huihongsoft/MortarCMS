import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useToast } from '../lib/toast';
import VisualEditor from '../components/VisualEditor';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

// Homepage visual editor — build the site front page with the same GrapesJS
// canvas as posts/pages, saving HTML + CSS to the site settings (used by the
// frontend when show_on_front === 'custom').
export default function HomeEditor() {
  const navigate = useNavigate();
  const toast = useToast();
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(r => {
      setHtml(r.data.homepage_html || '');
      setCss(r.data.homepage_css || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Warn before the tab is closed / refreshed with unsaved changes
  useEffect(() => {
    if (saveState !== 'dirty') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  async function save() {
    setSaveState('saving');
    try {
      await api.put('/settings', { homepage_html: html, homepage_css: css });
      setSaveState('saved');
      toast.toast(t('homepage saved', getLang()));
    } catch (e: any) {
      setSaveState('dirty');
      toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error');
    }
  }

  // Back leaves via the editor's own header button — confirm before discarding
  // unsaved changes. No separate back button here to avoid a duplicated one.
  function goBack() {
    if (saveState === 'dirty' && !window.confirm(t('unsaved changes', getLang()))) return;
    navigate('/settings', { state: { tab: 'reading' } });
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('edit homepage', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-500' }, t('homepage editor hint', getLang())),
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', { onClick: save, disabled: saveState === 'saving', className: 'btn-primary' }, React.createElement(Save, { size: 16 }), t('save homepage', getLang())),
      ),
    ),
    React.createElement('div', { className: 'relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900' },
      loading
        ? React.createElement('div', { className: 'flex items-center justify-center py-24 text-gray-400' }, t('loading', getLang()) + '…')
        : React.createElement(VisualEditor, {
            content: html,
            css,
            onChange: (h: string, c: string) => { setHtml(h); setCss(c); setSaveState('dirty'); },
            height: 'calc(100vh - 140px)',
            onBack: goBack,
            saveState,
            onSaveShortcut: () => { if (saveState !== 'saving') save(); },
          }),
    ),
  );
}
