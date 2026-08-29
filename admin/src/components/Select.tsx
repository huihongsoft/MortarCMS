import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// A fully custom <select> replacement. The native dropdown list panel is
// browser-controlled (its colors never match the theme no matter the
// color-scheme), so this renders a themed popover instead — same look/feel
// across light & dark, rounded corners, shadow, theme-colored highlight.
//
// API mirrors <select>: pass `value`, `onChange`, and `<option>` children
// (with optional `disabled`). A `placeholder` shows when value is empty.
interface SelectProps {
  value: string | number;
  onChange: (v: string) => void;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  id?: string;
}

interface Opt { value: string; label: React.ReactNode; disabled?: boolean; }

function extractOptions(children: React.ReactNode): Opt[] {
  const out: Opt[] = [];
  const walk = (node: React.ReactNode) => {
    if (node == null || typeof node === 'boolean') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (React.isValidElement(node)) {
      if (node.type === 'option') {
        const props = node.props as any;
        out.push({ value: String(props.value ?? ''), label: props.children ?? props.value ?? '', disabled: !!props.disabled });
      } else {
        // e.g. a <optgroup> or fragment with options inside
        walk((node.props as any)?.children);
      }
    }
  };
  walk(children);
  return out;
}

export default function Select({ value, onChange, children, className = '', placeholder, disabled, title, style, id }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = extractOptions(children);
  const current = options.find(o => o.value === value);
  const showPlaceholder = (value === '' || value == null) && placeholder;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return React.createElement('div', { ref, className: 'relative', title },
    // Trigger: styled like .input-field. The caller's className (width, text
    // size, etc.) goes on the button — putting a full .input-field on the
    // wrapper would add a second border and look nested.
    React.createElement('button', {
      type: 'button',
      disabled,
      id,
      onClick: () => setOpen(o => !o),
      className: 'w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-left transition-all duration-200 outline-none focus:border-primary-500 focus:box-shadow-[0_0_0_4px_var(--admin-primary,2563eb)_1a] disabled:opacity-50 cursor-pointer ' +
        (open ? 'border-primary-500' : 'hover:border-gray-300') + ' ' + className,
      style: { boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)', ...style },
    },
      React.createElement('span', { className: 'truncate ' + (showPlaceholder || (current && current.value === '') ? 'text-gray-400' : 'text-gray-900') },
        showPlaceholder ? placeholder : (current ? current.label : '')),
      React.createElement(ChevronDown, { size: 16, className: 'ml-2 shrink-0 text-gray-400 transition-transform ' + (open ? 'rotate-180' : '') }),
    ),
    // Popover list
    open && React.createElement('div', { className: 'absolute z-50 mt-1 w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 max-h-60 overflow-auto' },
      options.map((o, i) =>
        React.createElement('button', {
          type: 'button',
          key: i,
          disabled: o.disabled,
          onClick: () => { onChange(o.value); setOpen(false); },
          className: 'w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ' +
            (o.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer ') +
            (o.value === value ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 font-medium' : 'text-gray-700 dark:text-gray-200'),
        },
          React.createElement('span', { className: 'truncate' }, o.label),
          o.value === value && React.createElement('span', { className: 'ml-2 text-primary-500 shrink-0' }, '\u2713'),
        )
      ),
    ),
  );
}
