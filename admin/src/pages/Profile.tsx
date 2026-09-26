import React, { useEffect, useState } from 'react';
import { formatDateTime, formatDate } from '../lib/format';
import { UserCircle2, Shield, ShieldCheck, Copy, Check, KeyRound, Trash2, LogOut } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { dialog } from '../lib/dialog';
import { useToast } from '../lib/toast';
import Select from '../components/Select';

// Self-service account page ("my profile"): the logged-in user's own bio,
// avatar, password, 2FA and application passwords. Everything here talks to the
// /auth/me family, which acts on the caller — so it works for every role, not
// just admins (the user table on the Users page is admin-only, and its profile
// card wrote through PUT /users/:id, which only admins may call).
export default function Profile() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pwd, setPwd] = useState({ old: '', next: '' });
  const [pwdScore, setPwdScore] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => { setBio(r.data?.bio || ''); setAvatarUrl(r.data?.avatar || ''); }).catch(() => {});
  }, []);

  function checkPwdStrength(v: string) {
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    setPwdScore(s);
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put('/auth/me', { bio, avatar: avatarUrl });
      toast.toast(t('profile updated', getLang()));
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('update failed', getLang())); }
    finally { setSavingProfile(false); }
  }

  async function changePassword() {
    if (!pwd.old || !pwd.next) { dialog.alert(t('fill all fields', getLang())); return; }
    try {
      await api.put('/auth/me/password', { oldPassword: pwd.old, newPassword: pwd.next });
      // The server bumps the session version, so this session is dead too —
      // say so instead of letting the next request fail with a bare 401.
      await dialog.alert(t('password changed - please log in again', getLang()));
      localStorage.removeItem('mortar_token');
      window.location.href = '/admin/login';
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('update failed', getLang())); }
  }

  // ---- 2FA (self-service: the API acts on the logged-in user) ----
  const [twoFa, setTwoFa] = useState<null | { enabled: boolean; secret?: string; otpauth?: string; recoveryCodesRemaining?: number }>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  // Shown once, right after they are minted — only the hashes are stored.
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (twoFa?.otpauth && !twoFa.enabled) {
      QRCode.toDataURL(twoFa.otpauth, { width: 176, margin: 1, color: { dark: '#111827', light: '#ffffff' } })
        .then(u => { if (!cancelled) setQrUrl(u); })
        .catch(() => { if (!cancelled) setQrUrl(''); });
    } else { setQrUrl(''); }
    return () => { cancelled = true; };
  }, [twoFa]);

  async function open2fa() {
    try {
      const status = await api.get('/auth/2fa/status');
      if (status.data?.enabled) {
        setTwoFa({ enabled: true, recoveryCodesRemaining: status.data.recoveryCodesRemaining });
        return;
      }
      const s = await api.post('/auth/2fa/setup');
      setTwoFa({ enabled: false, secret: s.data.secret, otpauth: s.data.otpauth });
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('2fa setup failed', getLang())); }
  }

  async function enable2fa() {
    if (!twoFaCode.trim()) return;
    setTwoFaBusy(true);
    try {
      await api.post('/auth/2fa/enable', { code: twoFaCode.trim() });
      setTwoFa({ enabled: true, recoveryCodesRemaining: 0 });
      setTwoFaCode('');
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('invalid 2fa code', getLang())); }
    finally { setTwoFaBusy(false); }
  }

  async function disable2fa() {
    if (!(await dialog.confirm(t('disable 2fa?', getLang()), { danger: true }))) return;
    const password = await dialog.prompt({ message: t('enter your password to disable 2fa', getLang()), password: true });
    if (!password) return;
    try {
      await api.post('/auth/2fa/disable', { password });
      setTwoFa(null);
      setRecoveryCodes([]);
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('2fa disable failed', getLang())); }
  }

  // Minting a new set invalidates the old one, so re-authentication is required
  // (the API enforces it too — the dialog is not the control).
  async function issueRecoveryCodes() {
    const password = await dialog.prompt({ message: t('enter your password to get recovery codes', getLang()), password: true });
    if (!password) return;
    setTwoFaBusy(true);
    try {
      const r = await api.post('/auth/2fa/recovery-codes', { password });
      const codes: string[] = Array.isArray(r.data?.codes) ? r.data.codes : [];
      setRecoveryCodes(codes);
      setTwoFa({ enabled: true, recoveryCodesRemaining: codes.length });
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('recovery codes failed', getLang())); }
    finally { setTwoFaBusy(false); }
  }

  function copyText(v: string) {
    navigator.clipboard?.writeText(v).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }

  // ---- Application passwords (API credentials) ----
  // The plaintext token is returned exactly once, so it is shown in a panel the
  // user has to dismiss rather than in a toast that scrolls away.
  const [appPw, setAppPw] = useState<any[]>([]);
  const [pwForm, setPwForm] = useState({ name: '', scope: 'full', days: '' });
  const [createdToken, setCreatedToken] = useState('');

  const loadAppPw = () => api.get('/app-passwords').then(r => setAppPw(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  useEffect(() => { loadAppPw(); }, []);

  async function createAppPw() {
    if (!pwForm.name.trim()) { dialog.alert(t('fill all fields', getLang())); return; }
    try {
      const r = await api.post('/app-passwords', { name: pwForm.name.trim(), scope: pwForm.scope, expiresInDays: pwForm.days || undefined });
      setCreatedToken(r.data?.token || '');
      setPwForm({ name: '', scope: pwForm.scope, days: pwForm.days });
      loadAppPw();
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('create failed', getLang())); }
  }

  async function revokeAppPw(id: string) {
    if (!(await dialog.confirm(t('revoke this application password?', getLang()), { danger: true }))) return;
    try { await api.post('/app-passwords/' + id + '/revoke'); loadAppPw(); }
    catch (e: any) { dialog.alert(e.response?.data?.error || t('update failed', getLang())); }
  }

  async function deleteAppPw(id: string) {
    if (!(await dialog.confirm(t('delete this application password?', getLang()), { danger: true }))) return;
    try { await api.delete('/app-passwords/' + id); loadAppPw(); }
    catch (e: any) { dialog.alert(e.response?.data?.error || t('delete failed', getLang())); }
  }

  const fmt = (v: any) => (v ? formatDateTime(v) : '—');

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6' }, t('my profile', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'space-y-6' },
        // Account summary
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2' }, React.createElement(UserCircle2, { size: 16, className: 'text-primary-500' }), t('account', getLang())),
          React.createElement('div', { className: 'space-y-2 text-sm' },
            React.createElement('div', { className: 'flex justify-between gap-3' }, React.createElement('span', { className: 'text-gray-500' }, t('username', getLang())), React.createElement('span', { className: 'font-medium text-gray-900 dark:text-gray-100 break-all text-right' }, currentUser?.username || '—')),
            React.createElement('div', { className: 'flex justify-between gap-3' }, React.createElement('span', { className: 'text-gray-500' }, t('email', getLang())), React.createElement('span', { className: 'font-medium text-gray-900 dark:text-gray-100 break-all text-right' }, currentUser?.email || '—')),
            React.createElement('div', { className: 'flex justify-between gap-3' }, React.createElement('span', { className: 'text-gray-500' }, t('role', getLang())), React.createElement('span', { className: 'font-medium text-gray-900 dark:text-gray-100' }, t(currentUser?.role || '', getLang()))),
            currentUser?.createdAt && React.createElement('div', { className: 'flex justify-between gap-3' }, React.createElement('span', { className: 'text-gray-500' }, t('registered', getLang())), React.createElement('span', { className: 'text-gray-600 dark:text-gray-300' }, formatDate(currentUser.createdAt)))
          )
        ),
        // Profile (bio + avatar)
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2' }, React.createElement(UserCircle2, { size: 16, className: 'text-primary-500' }), t('profile', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              avatarUrl ? React.createElement('img', { src: avatarUrl, alt: 'avatar', className: 'w-12 h-12 rounded-full object-cover' }) : React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium' }, (currentUser?.username || '?')[0].toUpperCase()),
              React.createElement('input', { type: 'text', value: avatarUrl, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value), placeholder: t('avatar url', getLang()), className: 'input-field text-sm flex-1' })
            ),
            React.createElement('textarea', { value: bio, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value), className: 'input-field', rows: 3, placeholder: t('tell us about yourself...', getLang()), maxLength: 500 }),
            React.createElement('button', { onClick: saveProfile, disabled: savingProfile, className: 'btn-secondary w-full justify-center text-sm disabled:opacity-50' }, t('update profile', getLang()))
          )
        ),
        // Sessions
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2' }, React.createElement(LogOut, { size: 16, className: 'text-primary-500' }), t('sessions', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('log out everywhere hint', getLang())),
          React.createElement('button', {
            onClick: async () => {
              if (!(await dialog.confirm(t('log out everywhere?', getLang()), { danger: true }))) return;
              await api.post('/auth/logout-all');
              await dialog.alert(t('logged out everywhere', getLang()));
              localStorage.removeItem('mortar_token');
              window.location.href = '/admin/login';
            },
            className: 'btn-danger w-full justify-center text-sm',
          }, t('log out everywhere', getLang()))
        )
      ),
      React.createElement('div', { className: 'space-y-6 lg:col-span-2' },
        // Security: password + 2FA
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2' }, React.createElement(Shield, { size: 16, className: 'text-primary-500' }), t('change password', getLang())),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
            React.createElement('input', { type: 'password', value: pwd.old, autoComplete: 'current-password', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPwd({ ...pwd, old: e.target.value }), placeholder: t('current password', getLang()), className: 'input-field' }),
            React.createElement('input', { type: 'password', value: pwd.next, autoComplete: 'new-password', onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setPwd({ ...pwd, next: e.target.value }); checkPwdStrength(e.target.value); }, placeholder: t('new password', getLang()), className: 'input-field' })
          ),
          pwdScore > 0 && React.createElement('div', { className: 'flex items-center gap-2 mt-3' },
            React.createElement('div', { className: 'flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden' },
              React.createElement('div', { className: 'h-full rounded-full transition-all ' + (pwdScore >= 4 ? 'bg-green-500' : pwdScore >= 3 ? 'bg-yellow-500' : 'bg-red-500'), style: { width: (pwdScore / 5) * 100 + '%' } })),
            React.createElement('span', { className: 'text-[10px] text-gray-500' }, t('password strength', getLang()) + ': ' + pwdScore + '/5')),
          React.createElement('button', { onClick: changePassword, className: 'btn-primary w-full justify-center text-sm mt-4' }, t('change password', getLang()))
        ),
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2' }, React.createElement(Shield, { size: 16, className: 'text-primary-500' }), t('two-factor authentication', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('2fa hint', getLang())),
          React.createElement('button', { onClick: open2fa, className: 'btn-secondary w-full justify-center text-sm' }, React.createElement(ShieldCheck, { size: 14 }), t('manage 2fa', getLang()))
        ),
        // Application passwords
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2' }, React.createElement(KeyRound, { size: 16, className: 'text-primary-500' }), t('application passwords', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('application passwords hint', getLang())),
          createdToken && React.createElement('div', { className: 'p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 mb-4' },
            React.createElement('p', { className: 'text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2' }, t('copy this token now - it will not be shown again', getLang())),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('code', { className: 'flex-1 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-mono break-all' }, createdToken),
              React.createElement('button', { onClick: () => copyText(createdToken), className: 'btn-secondary text-xs shrink-0' }, copied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), copied ? t('copied', getLang()) : t('copy', getLang())),
              React.createElement('button', { onClick: () => setCreatedToken(''), className: 'btn-secondary text-xs shrink-0' }, t('done', getLang()))
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-2 mb-4' },
            React.createElement('input', { value: pwForm.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPwForm({ ...pwForm, name: e.target.value }), placeholder: t('name', getLang()), className: 'input-field md:col-span-2' }),
            React.createElement(Select, { value: pwForm.scope, onChange: (v: string) => setPwForm({ ...pwForm, scope: v }), className: 'input-field' },
              React.createElement('option', { value: 'full' }, t('read & write', getLang())),
              React.createElement('option', { value: 'read' }, t('read only', getLang()))
            ),
            React.createElement('input', { type: 'number', min: 1, max: 3650, value: pwForm.days, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPwForm({ ...pwForm, days: e.target.value }), placeholder: t('expires in days', getLang()), className: 'input-field' })
          ),
          React.createElement('button', { onClick: createAppPw, className: 'btn-primary w-full justify-center text-sm mb-4' }, React.createElement(KeyRound, { size: 14 }), t('create application password', getLang())),
          appPw.length === 0
            ? React.createElement('p', { className: 'text-xs text-gray-400' }, t('no application passwords yet', getLang()))
            : React.createElement('div', { className: 'overflow-x-auto' },
                React.createElement('table', { className: 'w-full min-w-[560px]' },
                  React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' },
                    React.createElement('th', { className: 'text-left px-3 py-2' }, t('name', getLang())),
                    React.createElement('th', { className: 'text-left px-3 py-2' }, t('scope', getLang())),
                    React.createElement('th', { className: 'text-left px-3 py-2' }, t('last used', getLang())),
                    React.createElement('th', { className: 'text-left px-3 py-2' }, t('expires', getLang())),
                    React.createElement('th', { className: 'text-right px-3 py-2' }, t('actions', getLang()))
                  )),
                  React.createElement('tbody', null, appPw.map((p: any) =>
                    React.createElement('tr', { key: p.id, className: 'border-b border-gray-100 dark:border-gray-700' },
                      React.createElement('td', { className: 'px-3 py-2 text-sm' }, p.name, p.revoked ? React.createElement('span', { className: 'ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }, t('revoked', getLang())) : null),
                      React.createElement('td', { className: 'px-3 py-2 text-xs text-gray-500' }, p.scope === 'read' ? t('read only', getLang()) : t('read & write', getLang())),
                      React.createElement('td', { className: 'px-3 py-2 text-xs text-gray-500' }, fmt(p.lastUsedAt)),
                      React.createElement('td', { className: 'px-3 py-2 text-xs text-gray-500' }, p.expiresAt ? fmt(p.expiresAt) : t('never', getLang())),
                      React.createElement('td', { className: 'px-3 py-2 text-right whitespace-nowrap' },
                        !p.revoked && React.createElement('button', { onClick: () => revokeAppPw(p.id), className: 'text-xs text-amber-600 hover:text-amber-700 mr-3' }, t('revoke', getLang())),
                        React.createElement('button', { onClick: () => deleteAppPw(p.id), className: 'text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1' }, React.createElement(Trash2, { size: 12 }), t('delete', getLang()))
                      )
                    )
                  ))
                )
              )
        )
      )
    ),
    // 2FA setup modal
    twoFa && React.createElement('div', { className: 'fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4', onClick: () => setTwoFa(null) },
      React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5', onClick: (e: React.MouseEvent) => e.stopPropagation() },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2' }, React.createElement(Shield, { size: 16, className: 'text-primary-500' }), t('two-factor authentication', getLang())),
        twoFa.enabled
          ? React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm mb-4 flex items-center gap-2' }, React.createElement(ShieldCheck, { size: 16 }), t('2fa enabled hint', getLang())),
              // Recovery codes: the way back in when the authenticator is lost.
              // Shown in full exactly once; afterwards only the count.
              recoveryCodes.length > 0
                ? React.createElement('div', { className: 'p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 mb-4' },
                    React.createElement('p', { className: 'text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2' }, t('copy these codes now - each works once', getLang())),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-1 mb-2' },
                      recoveryCodes.map((c: string) => React.createElement('code', { key: c, className: 'px-2 py-1 bg-white dark:bg-gray-900 rounded text-[11px] font-mono' }, c))),
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('button', { onClick: () => copyText(recoveryCodes.join('\n')), className: 'btn-secondary text-xs' }, copied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), copied ? t('copied', getLang()) : t('copy', getLang())),
                      React.createElement('button', { onClick: () => setRecoveryCodes([]), className: 'btn-secondary text-xs' }, t('done', getLang()))))
                : React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-3' },
                    (twoFa.recoveryCodesRemaining ?? 0) > 0
                      ? t('recovery codes remaining', getLang()) + ': ' + twoFa.recoveryCodesRemaining
                      : t('no recovery codes yet', getLang())),
              React.createElement('button', { onClick: issueRecoveryCodes, disabled: twoFaBusy, className: 'btn-secondary w-full justify-center text-sm mb-2 disabled:opacity-50' }, t('generate recovery codes', getLang())),
              React.createElement('button', { onClick: disable2fa, className: 'btn-danger w-full justify-center text-sm' }, t('disable 2fa', getLang())))
          : React.createElement(React.Fragment, null,
              React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-3' }, t('scan the qr or enter the secret', getLang())),
              qrUrl && React.createElement('div', { className: 'flex justify-center mb-3' },
                React.createElement('img', { src: qrUrl, alt: '2FA QR code', className: 'w-44 h-44 rounded-lg border border-gray-200 dark:border-gray-600' })),
              React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
                React.createElement('code', { className: 'flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono break-all' }, twoFa.secret),
                React.createElement('button', { onClick: () => copyText(twoFa.otpauth || twoFa.secret || ''), className: 'btn-secondary text-xs shrink-0' }, copied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), copied ? t('copied', getLang()) : t('copy', getLang()))
              ),
              twoFa.otpauth && React.createElement('a', { href: twoFa.otpauth, className: 'text-xs text-primary-600 dark:text-primary-400 break-all hover:underline' }, twoFa.otpauth),
              React.createElement('input', { type: 'text', value: twoFaCode, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTwoFaCode(e.target.value), placeholder: t('enter 2fa code', getLang()), maxLength: 6, className: 'input-field text-center text-lg tracking-widest mt-3' }),
              React.createElement('button', { onClick: enable2fa, disabled: twoFaBusy || twoFaCode.length < 6, className: 'btn-primary w-full justify-center text-sm mt-3 disabled:opacity-50' }, t('verify and enable', getLang()))
            )
      )
    )
  );
}
