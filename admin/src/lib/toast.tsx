import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Toast { id: number; message: string; type: 'success' | 'error'; }

const ToastContext = createContext<{ toast: (msg: string, type?: 'success' | 'error') => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: any, type: 'success' | 'error' = 'success') => {
    // Guard against non-string payloads (e.g. a zod error array from a 400):
    // rendering an object as a React child crashes the whole app.
    const text = typeof message === 'string' ? message
      : Array.isArray(message) ? message.map((m: any) => (m && typeof m === 'object' && 'message' in m) ? String(m.message) : String(m)).join('; ')
      : message && typeof message === 'object' ? JSON.stringify(message)
      : String(message ?? '');
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return React.createElement(ToastContext.Provider, { value: { toast: addToast } },
    children,
    // bottom-16 keeps toasts above the footer status bar (StatusBar, ~42px)
    React.createElement('div', { className: 'fixed bottom-16 right-6 z-[100] space-y-2' },
      toasts.map(t => React.createElement('div', {
        key: t.id,
        className: `flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`,
      },
        React.createElement(t.type === 'success' ? CheckCircle : XCircle, { size: 16 }),
        t.message,
        React.createElement('button', {
          onClick: () => setToasts(prev => prev.filter(x => x.id !== t.id)),
          className: 'ml-2 opacity-70 hover:opacity-100',
        }, React.createElement(X, { size: 14 }))
      ))
    )
  );
}

export const useToast = () => useContext(ToastContext);
