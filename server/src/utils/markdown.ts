// Compact Markdown → HTML converter + frontmatter parser (dependency-free).
// Supports the common subset: headings, lists, blockquotes, tables, code
// fences (with language), inline formatting, links/images, horizontal rules.
export function parseFrontmatter(raw: string): { meta: Record<string, any>; body: string } {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return { meta: {}, body: raw };
  const fm = raw.slice(4, end).trim();
  const body = raw.slice(end + 4).trimStart();
  const meta: Record<string, any> = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let val: any = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (m[1] === 'tags' || m[1] === 'categories') {
      val = val.replace(/^\[|\]$/g, '').split(',').map((s: string) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    }
    meta[m[1]] = val;
  }
  return { meta, body };
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const isTableRow = (line: string): boolean => /^\s*\|.+\|\s*$/.test(line);
const isTableSep = (line: string): boolean => /^\s*\|?\s*:?-{1,}\s*(?:\|\s*:?-{1,}\s*)*\|?\s*$/.test(line);
const parseTableRow = (line: string): string[] => line.trim().replace(/^\||\|$/g, '').split('|').map((c: string) => c.trim());

export function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listBuf: string[] = [];
  let inQuote = false;
  let quoteBuf: string[] = [];

  const flushList = () => {
    if (inList) {
      out.push(inList === 'ul' ? '<ul>' + listBuf.join('') + '</ul>' : '<ol>' + listBuf.join('') + '</ol>');
      inList = null; listBuf = [];
    }
  };
  const flushQuote = () => {
    if (inQuote) { out.push('<blockquote>' + quoteBuf.join('') + '</blockquote>'); inQuote = false; quoteBuf = []; }
  };

  const inline = (s: string): string => {
    let t = esc(s);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g, (_f, alt: string, url: string, title: string) => '<img src="' + url + '" alt="' + alt + '"' + (title ? ' title="' + title + '"' : '') + ' loading="lazy">');
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g, (_f, text: string, url: string, title: string) => '<a href="' + url + '"' + (title ? ' title="' + title + '"' : '') + '>' + text + '</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Table: header row + separator row, then body rows until a non-row line
    if (!inCode && isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flushList(); flushQuote();
      const header = parseTableRow(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) { body.push(parseTableRow(lines[i])); i++; }
      out.push('<table><thead><tr>' + header.map((c: string) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>' +
        (body.length ? '<tbody>' + body.map((r: string[]) => '<tr>' + r.map((c: string) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody>' : '') + '</table>');
      continue;
    }

    const fence = line.trim().match(/^```(\w*)\s*$/);
    if (fence) {
      if (inCode) {
        out.push('<pre><code' + (codeLang ? ' class="language-' + codeLang + '"' : '') + '>' + codeBuf.join('\n') + '</code></pre>');
        inCode = false; codeBuf = [];
      } else { inCode = true; codeLang = fence[1]; }
      i++; continue;
    }
    if (inCode) { codeBuf.push(esc(line)); i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushList(); flushQuote(); out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'); i++; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      flushQuote();
      if (inList !== 'ul') { flushList(); inList = 'ul'; }
      listBuf.push('<li>' + inline(line.replace(/^\s*[-*]\s+/, '')) + '</li>'); i++; continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushQuote();
      if (inList !== 'ol') { flushList(); inList = 'ol'; }
      listBuf.push('<li>' + inline(line.replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; continue;
    }
    if (line.trim().startsWith('>')) {
      flushList();
      if (!inQuote) inQuote = true;
      quoteBuf.push('<p>' + inline(line.trim().replace(/^>\s?/, '')) + '</p>');
      i++; continue;
    }
    if (/^\s*---\s*$/.test(line)) { flushList(); flushQuote(); out.push('<hr>'); i++; continue; }

    flushList(); flushQuote();
    if (line.trim() === '') { i++; continue; }
    out.push('<p>' + inline(line) + '</p>');
    i++;
  }
  if (inCode) out.push('<pre><code' + (codeLang ? ' class="language-' + codeLang + '"' : '') + '>' + codeBuf.join('\n') + '</code></pre>');
  flushList();
  flushQuote();
  return out.join('\n');
}

// Slug from a title (keeps CJK characters)
export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '').slice(0, 80) || 'post-' + Date.now().toString(36);
}
