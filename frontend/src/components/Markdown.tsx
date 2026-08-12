import React from 'react';

// Lightweight Markdown renderer for AI assistant output (share view etc.).
// Renders to React elements only — no dangerouslySetInnerHTML, so content is
// safe by construction. Supports code fences, headings, lists, tables,
// blockquotes, horizontal rules and inline code/links/bold/italic.

function inlineMd(s: string, key: string | number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // bold **text**
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g);
  parts.forEach((p, i) => {
    if (!p) return;
    if (p.startsWith('**') && p.endsWith('**')) {
      out.push(React.createElement('strong', { key: key + '-' + i }, p.slice(2, -2)));
    } else if (p.startsWith('`') && p.endsWith('`')) {
      out.push(React.createElement('code', { key: key + '-' + i, className: 'bg-gray-100 text-pink-600 rounded px-1 text-[0.85em]' }, p.slice(1, -1)));
    } else if (p.startsWith('[') && p.includes('](')) {
      const m = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (m) {
        const href = /^(https?:)?\/\//.test(m[2]) || m[2].startsWith('/') ? m[2] : '#';
        out.push(React.createElement('a', { key: key + '-' + i, href, target: '_blank', rel: 'noopener noreferrer', className: 'text-primary-600 hover:underline' }, m[1]));
        return;
      }
      out.push(p);
    } else if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
      out.push(React.createElement('em', { key: key + '-' + i }, p.slice(1, -1)));
    } else {
      out.push(p);
    }
  });
  return out;
}

function renderTable(lines: string[], keyStart: number): React.ReactNode {
  const rows = lines.map(l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()));
  const header = rows[0] || [];
  const body = rows.slice(2); // skip the |---|---| separator row
  return React.createElement('table', { key: keyStart, className: 'text-sm my-2 border-collapse w-full' },
    React.createElement('thead', null, React.createElement('tr', null, header.map((h, i) =>
      React.createElement('th', { key: i, className: 'border border-gray-200 px-2 py-1 text-left bg-gray-50' }, inlineMd(h, i))))),
    React.createElement('tbody', null, body.map((r, ri) =>
      React.createElement('tr', { key: ri }, r.map((c, ci) =>
        React.createElement('td', { key: ci, className: 'border border-gray-200 px-2 py-1' }, inlineMd(c, ri + '-' + ci))))))
  );
}

export default function Markdown({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  const parts = String(text || '').split(/(```[\s\S]*?```)/g);
  let key = 0;
  parts.forEach((p) => {
    if (p.startsWith('```')) {
      const code = p.replace(/```/g, '').trim();
      nodes.push(React.createElement('pre', { key: key++, className: 'bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto my-2' },
        React.createElement('code', null, code)));
      return;
    }
    const lines = p.split('\n');
    let inList = false;
    let inOrdered = false;
    let tableBuf: string[] = [];
    const flushTable = () => {
      if (tableBuf.length >= 2) nodes.push(renderTable(tableBuf, key++));
      tableBuf = [];
    };
    lines.forEach((line) => {
      const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
      if (isTableLine) { tableBuf.push(line); return; }
      flushTable();
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        inList = false;
        nodes.push(React.createElement('h' + heading[1].length, { key: key++, className: 'text-sm font-bold my-1.5' }, ...inlineMd(heading[2], key)));
        return;
      }
      if (line.trim().startsWith('>')) {
        inList = false;
        nodes.push(React.createElement('blockquote', { key: key++, className: 'border-l-2 border-gray-300 pl-2 my-1 text-gray-500 text-sm italic' }, ...inlineMd(line.trim().replace(/^>\s?/, ''), key)));
        return;
      }
      if (/^---+$/.test(line.trim())) {
        inList = false;
        nodes.push(React.createElement('hr', { key: key++, className: 'border-gray-200 my-2' }));
        return;
      }
      const isUnordered = /^[-*] /.test(line);
      const isOrdered = /^\d+\. /.test(line);
      if (isUnordered || isOrdered) {
        if (!inList || (isOrdered !== inOrdered)) {
          nodes.push(React.createElement(isOrdered ? 'ol' : 'ul', { key: key++, className: 'list-disc pl-4 my-1 space-y-0.5' + (isOrdered ? ' list-decimal' : '') }));
          inList = true;
          inOrdered = isOrdered;
        }
        const inner = line.replace(/^(\d+\.|[-*]) /, '');
        const listEl = nodes[nodes.length - 1] as React.ReactElement;
        listEl.props.children = [
          ...(listEl.props.children || []),
          React.createElement('li', { key: key++, className: 'text-sm' }, ...inlineMd(inner, key)),
        ];
      } else {
        inList = false;
        if (line.trim()) {
          nodes.push(React.createElement('p', { key: key++, className: 'text-sm leading-relaxed my-1' }, ...inlineMd(line, key)));
        }
      }
    });
    flushTable();
  });
  return React.createElement(React.Fragment, null, nodes);
}
