import React, { useEffect, useRef, useState } from 'react';
import { t, getLang } from './i18n';

// Project-styled replacement for window.alert / confirm / prompt.
//
// The native dialogs block the tab, cannot be styled or translated consistently,
// and (in the case of prompt) render the raw string with no validation. This is a
// small imperative wrapper so a call site stays a single expression:
//
//   if (!(await dialog.confirm(msg))) return;
//   await dialog.alert(msg);
//   const value = await dialog.prompt({ title, label, defaultValue });
//
// It is NOT window.confirm: those calls returned synchronously, so any handler
// using them has to be async. TypeScript enforces that (`await` outside an async
// function is an error), which is why the conversion could be done mechanically.
type Kind = 'alert' | 'confirm' | 'prompt';

interface Request {
  kind: Kind;
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  danger?: boolean;
  okLabel?: string;
  /** prompt only: pass through the browser's password masking */
  password?: boolean;
  resolve: (value: any) => void;
}

// One dialog at a time; a second request queues behind the first so two
// overlapping asks cannot render on top of each other.
let current: Request | null = null;
let queue: Request[] = [];
const listeners = new Set<(req: Request | null) => void>();

function emit(): void {
  for (const l of listeners) l(current);
}

function enqueue(req: Request): void {
  if (current) queue.push(req);
  else { current = req; emit(); }
}

function settle(value: any): void {
  const done = current;
  current = queue.shift() || null;
  done?.resolve(value);
  emit();
}

export const dialog = {
  alert(message: any, opts: { title?: string; danger?: boolean } = {}): Promise<void> {
    return new Promise<void>(resolve => enqueue({ kind: 'alert', message: String(message ?? ''), resolve: () => resolve(), ...opts }));
  },
  confirm(message: any, opts: { title?: string; danger?: boolean; okLabel?: string } = {}): Promise<boolean> {
    return new Promise<boolean>(resolve => enqueue({ kind: 'confirm', message: String(message ?? ''), resolve, ...opts }));
  },
  // Accepts a bare string like the native prompt() did (used as the message), or
  // an options object when the caller wants a label/default/password field.
  prompt(opts: string | { title?: string; message?: string; label?: string; defaultValue?: string; placeholder?: string; password?: boolean }): Promise<string | null> {
    const o = typeof opts === 'string' ? { message: opts } : opts;
    return new Promise<string | null>(resolve => enqueue({ kind: 'prompt', resolve, ...o }));
  },
};

export function useDialogState(): { req: Request | null } {
  const [req, setReq] = useState<Request | null>(current);
  useEffect(() => {
    const l = (r: Request | null) => setReq(r ? { ...r } : null);
    listeners.add(l);
    l(current);
    return () => { listeners.delete(l); };
  }, []);
  return { req };
}

// Mounted once (see main.tsx). Renders the pending request, if any.
export function DialogHost(): React.ReactElement | null {
  const { req } = useDialogState();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (req?.kind === 'prompt') {
      setValue(req.defaultValue || '');
      // Focus after paint; select so the default can be replaced by typing.
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  }, [req]);

  // Escape cancels, Enter submits — the keys the native dialogs honoured.
  useEffect(() => {
    if (!req) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); settle(req.kind === 'prompt' ? null : req.kind === 'confirm' ? false : undefined); }
      else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!req) return null;

  function submit(): void {
    if (!req) return;
    if (req.kind === 'prompt') settle(value);
    else if (req.kind === 'confirm') settle(true);
    else settle(undefined);
  }
  function cancel(): void {
    if (!req) return;
    settle(req.kind === 'prompt' ? null : req.kind === 'confirm' ? false : undefined);
  }

  const title = req.title || (req.kind === 'confirm' ? t('please confirm', getLang())
    : req.kind === 'prompt' ? t('input required', getLang()) : t('notice', getLang()));

  return React.createElement('div', {
    className: 'fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4',
    onClick: cancel,
  },
    React.createElement('div', {
      className: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5',
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      role: 'dialog', 'aria-modal': 'true',
    },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-2' }, title),
      req.message && React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words' }, req.message),
      req.kind === 'prompt' && React.createElement('div', { className: 'mt-3' },
        req.label && React.createElement('label', { className: 'block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1' }, req.label),
        React.createElement('input', {
          ref: inputRef,
          type: req.password ? 'password' : 'text',
          value,
          placeholder: req.placeholder || '',
          autoComplete: req.password ? 'current-password' : 'off',
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
          className: 'input-field text-sm',
        })),
      React.createElement('div', { className: 'flex justify-end gap-2 mt-5' },
        req.kind !== 'alert' && React.createElement('button', { onClick: cancel, className: 'btn-secondary text-sm' }, t('cancel', getLang())),
        React.createElement('button', {
          onClick: submit,
          className: (req.danger ? 'btn-danger' : 'btn-primary') + ' text-sm',
        }, req.okLabel || (req.kind === 'alert' ? t('ok', getLang()) : req.kind === 'confirm' ? t('confirm', getLang()) : t('ok', getLang())))))
  );
}
