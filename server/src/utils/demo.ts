import fs from 'fs';
import path from 'path';
import db, { cuid } from './db';
import { purgeAllCaches } from './cache';

// Demo / sample data for a fresh install, and the "reset site" routine that
// removes it. Content tables are cleared in dependency order (children first),
// user accounts / roles / system settings / sites are preserved.

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Tables that hold site content — wiped by resetSite()
const CONTENT_TABLES = [
  'PostCategory', 'PostTag', 'PostMeta', 'Revision', 'Comment',
  'Post', 'Category', 'Tag', 'Media', 'Menu', 'Link',
  'AiSession', 'AiTask', 'AiMemory', 'AiAudit', 'AiUsage', 'Activity', 'Visit',
];

// Settings written by the demo data — removed by resetSite() so the site
// returns to the default theme / empty carousel
const DEMO_SETTING_KEYS = ['theme_active', 'carousel_items', 'widgets_active', 'demo_imported'];

function run(sql: string, ...args: any[]): void { db.prepare(sql).run(...args); }

// Generate a small gradient SVG placeholder (no external dependencies) so
// demo posts have real cover images on disk
function demoImage(name: string, color: string, label: string): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + color + '"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs>' +
    '<rect width="400" height="300" fill="url(#g)"/>' +
    '<text x="200" y="165" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="rgba(255,255,255,0.92)" text-anchor="middle">' + label + '</text>' +
    '</svg>';
  const file = 'demo-' + name + '.svg';
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, file), svg);
  return '/uploads/' + file;
}

interface DemoPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categories: string[];
  tags: string[];
  image: [string, string, string]; // [name, color, label]
}

// ---- Demo content ----
const DEMO_CATEGORIES: [string, string, string][] = [
  ['system-tools', '系统工具', '系统优化、卸载清理、磁盘管理'],
  ['network-tools', '网络工具', '抓包分析、下载加速、网络诊断'],
  ['office', '办公软件', '效率工具、笔记文档、截图录屏'],
  ['dev-tools', '开发工具', '接口调试、编辑器、版本管理'],
  ['security', '安全防护', '加密、杀毒、隐私保护'],
  ['media', '媒体影音', '视频录制、直播、音频处理'],
];

const DEMO_TAGS = ['免费', '中文版', '开源', '绿色版', '系统优化', '卸载工具', '接口测试', '网络分析', '截图工具', '录屏直播', '笔记软件', '磁盘加密'];

const DEMO_POSTS: DemoPost[] = [
  {
    title: '程序卸载工具 Uninstall Tool 3.7 中文版',
    slug: 'uninstall-tool',
    excerpt: '小巧、安全、快速、强大的软件卸载删除工具，支持安装监视与彻底清理残留。',
    categories: ['system-tools'],
    tags: ['免费', '中文版', '卸载工具', '系统优化'],
    image: ['uninstall-tool', '#5066e1', 'UT'],
    content: '<h2>软件简介</h2><p>Uninstall Tool 是一款小巧、安全、快速且功能强大的软件卸载删除工具，它支持在使用软件本身的卸载程序卸载完毕后，再扫描软件残留的注册表项及其它残余文件，将其彻底从系统中删除。</p><h2>主要特性</h2><ul><li>安装监视器：监视每个应用程序的安装过程，记录所有文件与注册表改动</li><li>彻底清理：卸载后自动扫描残留文件与注册表项</li><li>强制卸载：删除损坏或损坏的安装程序</li><li>便携使用：支持绿色便携版，无需安装</li></ul><h2>使用说明</h2><p>下载后解压即可运行，首次启动会自动检测系统中已安装的软件列表。卸载完成后请重启资源管理器以完全释放被占用的文件。</p>',
  },
  {
    title: '接口调试工具 Postman 11 汉化版',
    slug: 'postman',
    excerpt: '全球最流行的 API 调试与测试工具，支持集合管理、环境变量与自动化测试。',
    categories: ['dev-tools', 'network-tools'],
    tags: ['免费', '中文版', '接口测试'],
    image: ['postman', '#ff6c37', 'P'],
    content: '<h2>软件简介</h2><p>Postman 是专为 API 开发设计的图形化调试工具，支持 HTTP 请求的发送、测试与文档化，帮助开发者快速完成接口开发与联调。</p><h2>核心功能</h2><ul><li>请求构造：支持 GET/POST/PUT/DELETE 等全部方法，自动生成代码片段</li><li>集合管理：按项目组织请求，支持导入导出与云端同步</li><li>环境变量：多环境切换，参数化请求</li><li>自动化测试：编写断言脚本，批量运行测试集</li></ul><h2>系统要求</h2><p>支持 Windows 10/11、macOS 与 Linux，汉化版由社区维护，安装后选择简体中文语言即可。</p>',
  },
  {
    title: '网络协议分析工具 Wireshark 4.2 中文免费版',
    slug: 'wireshark',
    excerpt: '世界上最流行的网络协议分析器，实时抓包与离线分析，支持数百种协议。',
    categories: ['network-tools'],
    tags: ['开源', '网络分析', '中文版'],
    image: ['wireshark', '#3f7cd6', 'W'],
    content: '<h2>软件简介</h2><p>Wireshark 是一款开源的网络协议分析器，可以实时检测网络通讯数据，也可以分析抓取的离线数据包文件，是网络管理员与安全研究者的必备工具。</p><h2>主要特性</h2><ul><li>实时抓包：从有线/无线网卡捕获流量</li><li>深度解析：支持 400+ 协议的解码</li><li>过滤语言：强大的显示过滤器，精确定位数据包</li><li>导出分析：支持导出为多种格式，配合命令行工具 tshark</li></ul><h2>注意事项</h2><p>抓包需要管理员权限（Linux 下需要 libpcap），请勿在未授权的网络上使用。</p>',
  },
  {
    title: '截图工具 PicPick 7 绿色中文版',
    slug: 'picpick',
    excerpt: '集截图、图像编辑、取色器、标尺、放大镜于一体的全能截图工具。',
    categories: ['office'],
    tags: ['免费', '绿色版', '截图工具'],
    image: ['picpick', '#2fa84f', 'PP'],
    content: '<h2>软件简介</h2><p>PicPick 是一款功能全面的截图与图像编辑工具，支持全屏、窗口、区域、滚动截图等多种模式，内置丰富的标注与编辑功能。</p><h2>功能亮点</h2><ul><li>多种截图模式：区域、窗口、滚动、固定尺寸、自由手绘</li><li>内置编辑器：箭头、文字、高亮、马赛克等标注工具</li><li>辅助工具：取色器、屏幕标尺、角度测量、放大镜</li><li>自动保存：截图后自动保存或上传，支持快捷键自定义</li></ul><p>绿色版解压即用，无需安装，适合 U 盘随身携带。</p>',
  },
  {
    title: '录屏直播软件 OBS Studio 30 中文版',
    slug: 'obs-studio',
    excerpt: '开源免费的高质量视频录制与直播软件，场景切换、推流、混音一应俱全。',
    categories: ['media'],
    tags: ['开源', '录屏直播', '免费'],
    image: ['obs', '#0f9d58', 'OBS'],
    content: '<h2>软件简介</h2><p>OBS Studio 是一款免费开源的视频录制与直播串流软件，支持 Windows、macOS 与 Linux，广泛用于游戏直播、课程录制与会议录制。</p><h2>核心能力</h2><ul><li>场景与来源：多场景快速切换，窗口/显示器/浏览器源自由组合</li><li>推流直播：一键推送到主流直播平台，支持自定义 RTMP</li><li>高性能编码：支持 H.264/HEVC 硬件编码，低占用高画质</li><li>音频混音：多音轨混音与降噪滤镜</li></ul><h2>推荐配置</h2><p>录制 1080p 视频建议 8GB 内存与支持硬编的显卡，直播建议上行带宽 6Mbps 以上。</p>',
  },
  {
    title: '系统清理工具 HDCleaner 2.0 中文免费版',
    slug: 'hdcleaner',
    excerpt: '集注册表清理、隐私保护、系统优化于一体的系统清理维护工具。',
    categories: ['system-tools'],
    tags: ['免费', '系统优化', '中文版'],
    image: ['hdcleaner', '#f59e0b', 'HD'],
    content: '<h2>软件简介</h2><p>HDCleaner 是一款功能全面的系统清理与优化工具，内置注册表清理、隐私清理、系统优化与文件粉碎等功能。</p><h2>主要功能</h2><ul><li>注册表清理：安全扫描无效项与残留键值</li><li>隐私保护：清理浏览记录、临时文件与使用痕迹</li><li>系统优化：管理启动项、服务与计划任务</li><li>文件工具：重复文件查找、安全粉碎、大文件分析</li></ul><p>建议在清理前先创建系统还原点，首次使用选择"推荐清理"模式即可。</p>',
  },
  {
    title: '开源笔记软件 CherryTree 1.1 中文免费版',
    slug: 'cherrytree',
    excerpt: '支持富文本与代码高亮的树状笔记软件，数据本地存储，安全可靠。',
    categories: ['office'],
    tags: ['开源', '笔记软件', '中文版'],
    image: ['cherrytree', '#7c3aed', 'CT'],
    content: '<h2>软件简介</h2><p>CherryTree 是一款支持层级结构的笔记软件，数据以树状组织，支持富文本、代码块、图片与表格，所有数据保存在本地文件中。</p><h2>功能特点</h2><ul><li>树状层级：无限层级分类，拖拽调整结构</li><li>富文本编辑：支持表格、图片、代码高亮与 LaTeX 公式</li><li>数据安全：支持加密存储与自动备份</li><li>跨平台：Windows、Linux 均可用，数据文件通用</li></ul><p>笔记文件为 .ctb 格式，建议定期将数据目录同步到云盘备份。</p>',
  },
  {
    title: '磁盘加密工具 VeraCrypt 1.26 中文版',
    slug: 'veracrypt',
    excerpt: '开源免费的磁盘加密软件，创建加密容器与加密系统分区，保护隐私数据。',
    categories: ['security'],
    tags: ['开源', '磁盘加密', '免费'],
    image: ['veracrypt', '#0ea5e9', 'VC'],
    content: '<h2>软件简介</h2><p>VeraCrypt 是一款开源免费的磁盘加密工具，可以创建加密文件容器或加密整个磁盘分区，为敏感数据提供高强度保护。</p><h2>主要功能</h2><ul><li>加密容器：创建加密文件，挂载为虚拟磁盘</li><li>全盘加密：加密系统分区或整个硬盘</li><li>隐藏卷：创建隐藏加密卷，抵御胁迫攻击</li><li>多算法：支持 AES、Serpent、Twofish 及组合算法</li></ul><h2>安全提示</h2><p>请务必牢记密码并保存恢复文件，忘记密码将无法恢复数据。</p>',
  },
];

const DEMO_COMMENTS: { postSlug: string; author: string; content: string; children?: { author: string; content: string }[] }[] = [
  { postSlug: 'uninstall-tool', author: '访客小明', content: '用了两年了，卸载残留确实干净，配合优化工具很顺手。', children: [{ author: 'admin', content: '感谢支持，新版还加了安装监视功能，可以试试。' }] },
  { postSlug: 'wireshark', author: '网络工程师', content: '抓包分析神器，配合过滤表达式效率很高。' },
  { postSlug: 'obs-studio', author: '主播阿伟', content: '开源免费还支持硬件编码，比收费软件都稳。' },
];

// Insert the demo dataset (idempotent: clears content tables first)
export function importDemoData(): { posts: number; categories: number; tags: number; comments: number; menus: number; links: number } {
  clearContentTables();
  const now = new Date().toISOString();
  const admin = db.prepare("SELECT id FROM User WHERE role = 'admin' ORDER BY createdAt ASC LIMIT 1").get() as any;
  const authorId = admin?.id || '';
  const today = new Date();
  const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString();

  // Categories
  const catIds: Record<string, string> = {};
  for (const [slug, name, desc] of DEMO_CATEGORIES) {
    const id = cuid();
    catIds[slug] = id;
    run('INSERT INTO Category (id, name, slug, description) VALUES (?, ?, ?, ?)', id, name, slug, desc);
  }

  // Tags
  const tagIds: Record<string, string> = {};
  for (const name of DEMO_TAGS) {
    const id = cuid();
    tagIds[name] = id;
    run('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)', id, name, name.toLowerCase().replace(/\s+/g, '-'));
  }

  // Posts (+ images, categories, tags)
  const postSlugs: Record<string, string> = {};
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const p = DEMO_POSTS[i];
    const id = cuid();
    postSlugs[p.slug] = id;
    const featured = demoImage(p.image[0], p.image[1], p.image[2]);
    run('INSERT INTO Post (id, title, slug, content, excerpt, status, type, featured, authorId, createdAt, updatedAt, publishedAt, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, p.title, p.slug, p.content, p.excerpt, 'published', 'post', featured, authorId, daysAgo(DEMO_POSTS.length - i), now, daysAgo(DEMO_POSTS.length - i), Math.floor(Math.random() * 500) + 30);
    for (const cs of p.categories) run('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)', id, catIds[cs]);
    for (const tg of p.tags) run('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)', id, tagIds[tg]);
  }

  // Comments (with one reply)
  let comments = 0;
  for (const c of DEMO_COMMENTS) {
    const postId = postSlugs[c.postSlug];
    if (!postId) continue;
    const cid = cuid();
    run('INSERT INTO Comment (id, content, author, status, postId, createdAt) VALUES (?, ?, ?, ?, ?, ?)', cid, c.content, c.author, 'approved', postId, daysAgo(3));
    comments++;
    for (const ch of c.children || []) {
      run('INSERT INTO Comment (id, content, author, status, postId, parentId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', cuid(), ch.content, ch.author, 'approved', postId, cid, daysAgo(2));
      comments++;
    }
  }

  // Primary menu: home + categories + one post
  const menuItems = [
    { label: '首页', url: '/' },
    ...DEMO_CATEGORIES.slice(0, 4).map(([slug, name]) => ({ label: name, url: '/category/' + slug })),
    { label: DEMO_POSTS[0].title.slice(0, 12) + '…', url: '/post/' + DEMO_POSTS[0].slug },
  ];
  run('INSERT INTO Menu (id, name, location, items) VALUES (?, ?, ?, ?)', cuid(), '主菜单', 'primary', JSON.stringify(menuItems));

  // Friend links
  for (const [name, url, desc] of [['软件烩', 'https://huirj.cn/', '汇集精品软件'], ['开源中国', 'https://www.oschina.net/', '开源技术社区'], ['GitHub', 'https://github.com/', '全球最大的代码托管平台']] as [string, string, string][]) {
    run('INSERT INTO Link (id, name, url, description) VALUES (?, ?, ?, ?)', cuid(), name, url, desc);
  }

  // Settings: activate the softstore theme for the demo look + carousel
  const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  upsert.run(cuid(), 'theme_active', 'softstore');
  upsert.run(cuid(), 'demo_imported', '1');
  const carousel = DEMO_POSTS.slice(0, 4).map(p => {
    const img = fs.existsSync(path.join(uploadsDir, 'demo-' + p.image[0] + '.svg')) ? '/uploads/demo-' + p.image[0] + '.svg' : '';
    return { image: img, title: p.title, link: '/post/' + p.slug };
  });
  upsert.run(cuid(), 'carousel_items', JSON.stringify(carousel));
  // Default layout widgets are empty → softstore sidebar works out of the box

  purgeAllCaches();
  return { posts: DEMO_POSTS.length, categories: DEMO_CATEGORIES.length, tags: DEMO_TAGS.length, comments, menus: 1, links: 3 };
}

// Wipe every content table (dependency order) and remove demo settings —
// user accounts, roles, system settings and site structure are preserved.
export function resetSite(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const t of CONTENT_TABLES) {
    try { stats[t] = (db.prepare('DELETE FROM "' + t + '"').run() as any).changes || 0; } catch { stats[t] = 0; }
  }
  // Drop settings written by the demo data
  for (const key of DEMO_SETTING_KEYS) db.prepare('DELETE FROM Setting WHERE key = ?').run(key);
  // Clear uploaded media files (keep the directory + .gitkeep)
  try {
    if (fs.existsSync(uploadsDir)) {
      for (const f of fs.readdirSync(uploadsDir)) {
        if (f === '.gitkeep' || f === 'thumbs' || f === 'import-tmp') continue;
        const p = path.join(uploadsDir, f);
        try { if (fs.statSync(p).isFile()) fs.unlinkSync(p); } catch {}
      }
    }
  } catch {}
  purgeAllCaches();
  return stats;
}

function clearContentTables(): void {
  for (const t of CONTENT_TABLES) {
    try { db.prepare('DELETE FROM "' + t + '"').run(); } catch {}
  }
}
