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
  // Monotonic id: the host may receive a copy of the request (a clone keeps the
  // resolve function but breaks `===`), so identity is checked by id.
  id: number;
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

let nextId = 1;

function enqueue(req: Omit<Request, 'id'>): void {
  const full: Request = { ...req, id: nextId++ };
  if (current) queue.push(full);
  else { current = full; emit(); }
}

function settle(value: any): void {
  const done = current;
  current = queue.shift() || null;
  done?.resolve(value);
  emit();
}

// The overlay stays mounted for one render after settle, so a second Enter (key
// repeat) or a click can arrive with the OLD request still in the closure — it
// would settle whichever dialog is next in line. Each entry point therefore
// checks that the request it is acting on is still the current one.
function settleIfCurrent(req: Request, value: any): void {
  if (!current || current.id !== req.id) return;
  settle(value);
}

// Resolve everything still waiting, as if the user cancelled. Called when the
// host unmounts (an error boundary above it, an HMR swap): without it the
// promises never settle and every later dialog queues behind a dead one.
function cancelAllPending(): void {
  const pending = [current, ...queue].filter(Boolean) as Request[];
  current = null; queue = [];
  for (const r of pending) r.resolve(r.kind === 'prompt' ? null : r.kind === 'confirm' ? false : undefined);
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
    const l = (r: Request | null) => setReq(r ? { ...r } : null); // copy is fine: identity is the id
    listeners.add(l);
    l(current);
    return () => { listeners.delete(l); };
  }, []);

  // Unmounting (an error boundary, an HMR swap) must not leave promises pending
  // — but a StrictMode/HMR remount re-subscribes immediately, and cancelling a
  // dialog that is about to be rendered again would silently dismiss it. So the
  // cancel is deferred and skipped if a listener came back.
  useEffect(() => () => {
    setTimeout(() => { if (listeners.size === 0) cancelAllPending(); }, 0);
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
      if (e.key === 'Escape') { e.preventDefault(); settleIfCurrent(req, req.kind === 'prompt' ? null : req.kind === 'confirm' ? false : undefined); }
      else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!req) return null;
  // Narrowed copy: the guards below live in closures, where TS cannot keep the
  // narrowing from the early return.
  const active: Request = req;

  function submit(): void {
    if (active.kind === 'prompt') settleIfCurrent(active, value);
    else if (active.kind === 'confirm') settleIfCurrent(active, true);
    else settleIfCurrent(active, undefined);
  }
  function cancel(): void {
    settleIfCurrent(active, active.kind === 'prompt' ? null : active.kind === 'confirm' ? false : undefined);
  }

  const titleId = 'dlg-title';
  const title = req.title || (req.kind === 'confirm' ? t('please confirm', getLang())
    : req.kind === 'prompt' ? t('input required', getLang()) : t('notice', getLang()));

  return React.createElement('div', {
    className: 'fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4',
    onClick: cancel,
  },
    React.createElement('div', {
      className: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5 max-h-[80vh] overflow-y-auto',
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId,
    },
      React.createElement('h3', { id: titleId, className: 'text-sm font-semibold text-gray-900 dark:text-white mb-2 break-words' }, title),
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
