import { registerTool } from '../../src/utils/aiTools';
import db from '../../src/utils/db';
import { slugify } from '../../src/utils/slug';

// AI tool: suggest tags for a post. The model calls it with {title, content};
// the plugin matches the text against the existing tag vocabulary and pulls
// 2-4 character keyword shingles out of the title, capped at 5 suggestions.
// The returned array is a suggestion — the model decides what to apply.

function existingTags(): string[] {
  try { return (db.prepare('SELECT name FROM Tag ORDER BY name').all() as any[]).map((t: any) => String(t.name)); } catch { return []; }
}

function suggest(title: string, content: string): string[] {
  const text = ((title || '') + ' ' + (content || '')).toLowerCase();
  const out: string[] = [];

  // 1) Tags already in the vocabulary that appear in the text
  for (const tag of existingTags()) {
    const t = tag.toLowerCase();
    if (t.length >= 2 && text.includes(t)) out.push(tag);
    if (out.length >= 5) break;
  }

  // 2) Keyword shingles from the title (2-4 CJK chars) not already covered
  if (out.length < 5 && title) {
    const zh = String(title).replace(/[^\u4e00-\u9fff]/g, '');
    for (let n = 4; n >= 2 && out.length < 5; n--) {
      for (let i = 0; i + n <= zh.length && out.length < 5; i++) {
        const shingle = zh.slice(i, i + n);
        if (!out.some(o => o.toLowerCase() === shingle.toLowerCase()) && !out.some(o => o.includes(shingle))) {
          out.push(shingle);
        }
      }
    }
  }
  return out.slice(0, 5);
}

export function register() {
  registerTool(
    'suggest_tags',
    '为文章推荐合适的标签：输入文章标题与正文，返回最多 5 个标签（优先复用站内已有标签）。适合回答"这篇文章该打什么标签"',
    {
      type: 'object',
      properties: {
        title: { type: 'string', description: '文章标题' },
        content: { type: 'string', description: '文章正文或摘要' },
      },
      required: ['title'],
    },
    async (args: any) => {
      const tags = suggest(String(args.title || ''), String(args.content || ''));
      return { tags, note: tags.length ? '可调用更新文章接口写入这些标签（tagNames）' : '未能从标题与正文中提炼出标签，可换更长的正文重试' };
    }
  );
}
