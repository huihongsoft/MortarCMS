// Unit tests for fixHtmlTags + sanitizeHtml + prepareAiContent/mdToHtml:
// run with `npx tsx scripts/fix-test.ts`
import { fixHtmlTags, sanitizeHtml, prepareAiContent } from '../src/utils/aiTools';
import { mdToHtml } from '../src/utils/markdown';

let pass = 0, fail = 0;
function t(name: string, input: string, expected: string) {
  const got = fixHtmlTags(input);
  if (got === expected) { pass++; console.log('PASS | ' + name); }
  else { fail++; console.log('FAIL | ' + name + '\n  in:  ' + input + '\n  got: ' + got + '\n  exp: ' + expected); }
}

t('clean content untouched', '<p>Hello <b>world</b>!</p><h2>Title</h2>', '<p>Hello <b>world</b>!</p><h2>Title</h2>');
t('unclosed p siblings', '<p>first<p>second', '<p>first</p><p>second</p>');
t('unclosed b siblings', '<b>bold<b>more</b>', '<b>bold</b><b>more</b>');
t('unclosed h2 siblings', '<h2>One<h2>Two', '<h2>One</h2><h2>Two</h2>');
t('unclosed li siblings', '<ul><li>a<li>b<li>c</ul>', '<ul><li>a</li><li>b</li><li>c</li></ul>');
t('unclosed ul at end', '<ul><li>a<li>b', '<ul><li>a</li><li>b</li></ul>');
t('nested li with inner ul', '<ul><li>a<ul><li>b</ul></li></ul>', '<ul><li>a<ul><li>b</li></ul></li></ul>');
t('nested blockquote kept', '<blockquote>a<blockquote>b</blockquote></blockquote>', '<blockquote>a<blockquote>b</blockquote></blockquote>');
t('stray closing tags dropped', '<p>a</p></p><p>b</p>', '<p>a</p><p>b</p>');
t('mixed p+ul garbage', '<p>Intro<ul><li>one<li>two</ul><p>Outro', '<p>Intro<ul><li>one</li><li>two</li></ul></p><p>Outro</p>');
t('void tags pass through', '<p>a<br><img src="x.png"><hr></p>', '<p>a<br><img src="x.png"><hr></p>');
t('mismatched close dropped', '<p>a</div>', '<p>a</p>');
t('nested table preserved', '<table><tr><td>a<table><tr><td>b</td></tr></table></td></tr></table>', '<table><tr><td>a<table><tr><td>b</td></tr></table></td></tr></table>');
t('direct table repeat closed', '<table><table><tr><td>x</td></tr>', '<table></table><table><tr><td>x</td></tr></table>');
t('li after inline content', '<ul><li><b>x<li>y</ul>', '<ul><li><b>x</b></li><li>y</li></ul>');
t('td after span content', '<table><tr><td><span>a<td>b</tr></table>', '<table><tr><td><span>a</span></td><td>b</td></tr></table>');
t('list close typo before heading', '<ul><li>a<li>b<li>c<ul>\n<h2>Next</h2>', '<ul><li>a</li><li>b</li><li>c</li></ul>\n<h2>Next</h2>');
t('list close typo with bold items', '<p>t<p>\n<ul>\n<li><b>one<b>——x<li>\n<li><b>two<b>——y<li>\n<ul>\n\n<h2>Next</h2>', '<p>t</p>\n<ul>\n<li><b>one</b><b>——x</b></li>\n<li><b>two</b><b>——y</b></li>\n</ul>\n\n<h2>Next</h2>');
t('real new list after typo-close list', '<ul><li>a<li>b<ul>\n<h2>H</h2>\n<ul><li>c<li>d</ul>', '<ul><li>a</li><li>b</li></ul>\n<h2>H</h2>\n<ul><li>c</li><li>d</li></ul>');

// --- sanitizeHtml ---
function s(name: string, input: string, expected: string) {
  const got = sanitizeHtml(input);
  if (got === expected) { pass++; console.log('PASS | ' + name); }
  else { fail++; console.log('FAIL | ' + name + '\n  in:  ' + input + '\n  got: ' + got + '\n  exp: ' + expected); }
}
s('sanitize keeps closing tags', '<p>a</p><h2>b</h2><ul><li>x</li></ul><b>c</b>', '<p>a</p><h2>b</h2><ul><li>x</li></ul><b>c</b>');
s('sanitize keeps attributes', '<a href="https://x.com" target="_blank" onclick="bad()">link</a>', '<a href="https://x.com" target="_blank">link</a>');
s('sanitize strips scripts', '<p>ok</p><script>alert(1)</script><p>end</p>', '<p>ok</p><p>end</p>');
s('sanitize drops disallowed tags (keeps content)', '<p>a</p><marquee>nope</marquee><span>keep</span>', '<p>a</p>nope<span>keep</span>');
s('full pipeline roundtrip', sanitizeHtml(fixHtmlTags('<p>t<p>\n<ul>\n<li><b>one<b>x<li>\n<ul>\n<h2>H</h2>')),
  '<p>t</p>\n<ul>\n<li><b>one</b><b>x</b></li>\n</ul>\n<h2>H</h2>');

// --- mdToHtml (markdown.ts) ---
function m(name: string, input: string, expected: string) {
  const got = mdToHtml(input);
  if (got === expected) { pass++; console.log('PASS | ' + name); }
  else { fail++; console.log('FAIL | ' + name + '\n  in:  ' + JSON.stringify(input) + '\n  got: ' + JSON.stringify(got) + '\n  exp: ' + JSON.stringify(expected)); }
}
m('md headings+lists', '# 标题\n\n## 小节\n- a\n- b\n\n1. one\n2. two', '<h1>标题</h1>\n<h2>小节</h2>\n<ul><li>a</li><li>b</li></ul>\n<ol><li>one</li><li>two</li></ol>');
m('md bold+inline', '**粗体** 与 *斜体* 和 `code` 与 [链接](https://x.com)', '<p><strong>粗体</strong> 与 <em>斜体</em> 和 <code>code</code> 与 <a href="https://x.com">链接</a></p>');
m('md table', '| 名称 | 用途 |\n| --- | --- |\n| AI | 写作 |\n| CMS | 管理 |', '<table><thead><tr><th>名称</th><th>用途</th></tr></thead><tbody><tr><td>AI</td><td>写作</td></tr><tr><td>CMS</td><td>管理</td></tr></tbody></table>');
m('md multi-line quote', '> 第一行引用\n> 第二行引用\n\n正文', '<blockquote><p>第一行引用</p><p>第二行引用</p></blockquote>\n<p>正文</p>');
m('md code fence with lang', '```js\nconst a = 1;\n```', '<pre><code class="language-js">const a = 1;</code></pre>');
m('md image+link title', '![图](/img.png "说明")', '<p><img src="/img.png" alt="图" title="说明" loading="lazy"></p>');
m('md hr+del', '---\n\n~~删除~~', '<hr>\n<p><del>删除</del></p>');
m('md escapes html', '<script>alert(1)</script>\n\n**安全**', '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n<p><strong>安全</strong></p>');
m('md empty input', '', '');
m('md plain text only', '只是一段普通文字，没有语法', '<p>只是一段普通文字，没有语法</p>');
m('md nested list does not crash', '- 外层\n  - 内层\n- 第三项', '<ul><li>外层</li><li>内层</li><li>第三项</li></ul>');
m('md code fence unterminated', '```js\nconst a = 1;', '<pre><code class="language-js">const a = 1;</code></pre>');

// --- prepareAiContent ---
function p(name: string, input: string, expected: string) {
  const got = prepareAiContent(input);
  if (got === expected) { pass++; console.log('PASS | ' + name); }
  else { fail++; console.log('FAIL | ' + name + '\n  in:  ' + JSON.stringify(input) + '\n  got: ' + JSON.stringify(got) + '\n  exp: ' + JSON.stringify(expected)); }
}
p('prepare: markdown article -> html (h1 kept)', '# 标题\n\n## 小节\n- 要点一\n- 要点二', '<h1>标题</h1>\n<h2>小节</h2>\n<ul><li>要点一</li><li>要点二</li></ul>');
p('prepare: markdown with table -> html table', '| A | B |\n| - | - |\n| 1 | 2 |', '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>');
p('prepare: html passes through fixed', '<p>a<p>b</p>', '<p>a</p><p>b</p>');
p('prepare: plain text wrapped in p', '第一段\n\n第二段', '<p>第一段</p><p>第二段</p>');
p('prepare: frontmatter stripped', '---\ntitle: 测试\n---\n\n## 正文', '<h2>正文</h2>');
p('prepare: script escaped in markdown', '# 标题\n\n<script>alert(1)</script>', '<h1>标题</h1>\n<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
p('prepare: translate-style output', '# 翻译标题\n\n正文段落', '<h1>翻译标题</h1>\n<p>正文段落</p>');
p('prepare: html h1 kept semantically', '<h1>主标题</h1><h2>小节</h2><p>正文</p>', '<h1>主标题</h1><h2>小节</h2><p>正文</p>');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
