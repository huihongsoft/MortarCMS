<p align="center">
  <img src="docs/logo.svg" alt="Mortar" width="120" />
  <h1 align="center">Mortar</h1>
  <p align="center">AI 驱动的现代化开源 CMS · 内置 AI 助理 / 可视化拖拽建站 / RBAC 权限体系 / 插件与主题生态</p>
  <p align="center">
    <a href="https://github.com/huihongsoft/MortarCMS"><img src="https://img.shields.io/github/stars/huihongsoft/MortarCMS?style=social" alt="GitHub stars" /></a>
    <a href="https://github.com/huihongsoft/MortarCMS/fork"><img src="https://img.shields.io/github/forks/huihongsoft/MortarCMS?style=social" alt="GitHub forks" /></a>
    <a href="https://github.com/huihongsoft/MortarCMS/issues"><img src="https://img.shields.io/github/issues/huihongsoft/MortarCMS" alt="GitHub issues" /></a>
    <a href="https://github.com/huihongsoft/MortarCMS/releases"><img src="https://img.shields.io/github/v/release/huihongsoft/MortarCMS?label=release" alt="Release" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-orange.svg" alt="License" /></a>
    <a href="https://github.com/huihongsoft/MortarCMS/actions"><img src="https://img.shields.io/github/actions/workflow/status/huihongsoft/MortarCMS/ci.yml?label=CI" alt="CI" /></a>
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6.svg" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-4.x-259dff.svg" alt="Express" />
    <img src="https://img.shields.io/badge/React-18-61dafb.svg" alt="React" />
    <img src="https://img.shields.io/badge/SQLite%20%7C%20MySQL%20%7C%20PostgreSQL-supported-brightgreen.svg" alt="Databases" />
  </p>
  <p align="center"><a href="README.md">English</a> | <strong>简体中文</strong></p>
</p>

---

**Mortar** 是一个受 WordPress 与 Halo 启发的自托管内容管理系统——内置 **AI 助理**、**可视化拖拽建站**、**RBAC 权限体系**、插件与主题生态、多站点支持，全部使用 TypeScript 构建。

## 🚀 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash
```

自动完成：环境检测 → 拉取代码 → 安装依赖 → 构建 → 注册系统服务（systemd / launchd）→ 健康检查。

安装后访问 `http://localhost:3001/install` 完成向导，再到 **AI 设置** 配置模型服务商即可使用 AI 助理。

> 支持 Linux / macOS；数据库默认 SQLite，也可通过 `DATABASE_URL` 使用 MySQL / PostgreSQL。
> 管理命令：`./mortarctl.sh {start|stop|restart|status|logs}`（由安装脚本生成）

## 📸 界面预览

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="管理后台首页" width="640" />
  <br /><em>仪表盘 — 统计、PV/UV 图表、快捷写作、动态流</em>
</p>

<p align="center">
  <img src="docs/screenshots/posts.png" alt="文章列表" width="640" />
  <br /><em>文章 — 批量操作、筛选、AI 批量翻译</em>
</p>

<p align="center">
  <img src="docs/screenshots/visual-editor.png" alt="可视化编辑器" width="640" />
  <br /><em>拖拽式可视化建站 — 23 个区块、实时 CMS 数据、真实站点样式</em>
</p>

<p align="center">
  <img src="docs/screenshots/ai-chat.png" alt="AI 助理" width="640" />
  <br /><em>AI 助理 — 流式对话、工具调用、异步任务、斜杠命令</em>
</p>

<p align="center">
  <img src="docs/screenshots/ai-settings.png" alt="AI 设置" width="640" />
  <br /><em>AI 设置 — 8 家模型服务商、工具权限、用量统计</em>
</p>

<p align="center">
  <img src="docs/screenshots/roles.png" alt="角色与权限" width="640" />
  <br /><em>角色与权限 — 5 大类 35 项能力，含 AI 助理</em>
</p>

<p align="center">
  <img src="docs/screenshots/appearance.png" alt="外观" width="640" />
  <br /><em>外观 — 主题、自定义 CSS、可视化主题区块</em>
</p>

## ✨ 功能特性

### 内容管理
- 文章与页面，支持分类、标签、自定义文章类型
- 三模式编辑器：**富文本（TipTap）/ Markdown / HTML**，内置块模板与自定义 HTML 块
- **拖拽式可视化建站**（GrapesJS）：23 个区块（布局/内容/区块组/实时 CMS 数据）、属性面板（排版、间距、布局、特效）、画布缩放、区块搜索、模板、真实站点样式预览
- 修订历史（并排 Diff）、回收站与批量操作、置顶、定时发布、私密与密码保护文章
- 短代码体系（`[gallery]`、`[audio]`、`[video]`、可扩展）与插件 API、灯箱相册
- 文章级 **SEO 面板**，Google 风格搜索预览（标题 / 描述 / JSON-LD）

### AI 助理
- **对话**：多会话流式对话，Markdown 渲染、语音输入、提示词库、斜杠命令（`/stats`、`/posts`、`/draft 主题` …）、复制 / 重新生成 / 停止、暗色模式
- **Agent 工具**（15 个）：站点统计、文章增删改查、全站内容检索（RAG）、联网搜索、图片生成、图片理解、评论审核、翻译、草稿补全、长期记忆
- **异步任务**：后台 Agent 运行、步骤追踪、取消 / 重试、完成通知、定时任务（间隔 / 每日 / 每周）
- **8 家模型服务商**：OpenAI、Anthropic Claude、DeepSeek、通义千问、智谱 GLM、Kimi、Ollama、自定义——支持连通性测试、模型对比、用量统计
- **微信 / 钉钉绑定**：用户给机器人发消息 → AI 以用户身份与权限通过 Webhook 执行操作
- **沙箱化**：每次工具调用均审计、AI 生成的 HTML 经过净化、防提示注入、按角色分配工具权限

### 角色与权限（RBAC）
- 角色管理：内置（admin / editor / author / subscriber）+ 自定义角色
- **5 大类 35 项能力**：内容 / 媒体 / 外观 / 系统 / **AI 助理**——基于数据库角色表服务端强制校验
- 按用户分配角色；admin 锁定为全部权限

### 平台能力
- **插件系统**：钩子（动作/过滤器）、生命周期（启用/停用/卸载）、本地市场 + 远程仓库安装
- **主题系统**：主题目录（`server/themes/`）、一键切换、主题独立设置、自定义 CSS 编辑器、CSS 变量主题化、**可视化主题区块**（拖拽区块注入页头/页脚钩子）、一键重建主题包
- **多站点**：按域名解析站点、站点独立设置、菜单与小部件、内容隔离

### 媒体与性能
- 媒体库：缩略图、响应式图片（srcset）、sharp 转换 WebP/AVIF
- CDN 地址改写、懒加载、HTTP 缓存、数据库索引、代码分包

### SEO 与国际化
- 页面级 SEO（标题/描述/OG/Twitter/canonical）、站点地图、robots.txt、JSON-LD 结构化数据（Article、BreadcrumbList）
- 完整**中英双语**界面（后台与前台）

### 管理后台
- WordPress 风格布局：分组侧栏、顶部工具条、亮/暗模式、主题色跟随
- 仪表盘：PV/UV 统计、热门文章、快捷写作、动态流
- 安全审计（Site Health 风格）、系统信息、全量备份与恢复
- 分类/标签/友链管理、评论审核、WXR 导入导出

### 安全
- JWT 认证 + 服务端登出（令牌黑名单）、两步验证 2FA（TOTP）登录挑战
- **生产环境强制要求 JWT_SECRET**（启动即失败）——密钥永不入库，备份无法伪造会话
- 登录锁定 + 限流、密码强度策略、bcrypt cost 12
- 上传扩展名↔MIME 一致性校验（防类型伪装）、SVG 净化、文件内容魔数验证
- SSRF 防护（插件安装、AI 图片分析）、CORS 白名单、TRUST_PROXY 支持、AI 每日用量硬上限、SMTP TLS 校验
- 安全响应头、GDPR 导出/擦除（含内容归属转移）
- 安装向导可选数据库——匿名重置被禁止（仅管理员）

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18
- npm ≥ 9

### 方式 A：一键安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash
```

自动完成：环境检测 → 拉取代码 → 安装依赖 → 构建 → 注册系统服务（systemd / launchd）→ 健康检查。
安装后访问 `http://localhost:3001/install` 完成向导即可使用。

### 方式 B：手动安装

```bash
# 1. 获取代码
git clone https://github.com/huihongsoft/MortarCMS.git && cd mortar

# 2. 安装依赖（三个工作区）
(cd server   && npm install --no-audit --no-fund)
(cd admin    && npm install --no-audit --no-fund)
(cd frontend && npm install --no-audit --no-fund)

# 3. 构建并启动
./build.sh
# Admin:  http://localhost:3001/admin
# Site:   http://localhost:3001
```

### 开发模式

```bash
npm run dev            # 开发模式：server (3001) + admin (3002) + frontend (3000)
# 或生产模式（需先构建）
(cd server && NODE_ENV=production node dist/index.js)
```

### 首次运行 — 安装向导

首次访问 `http://localhost:3001/install`：

1. 选择数据库 — **SQLite**（默认，零配置）/ **MySQL/MariaDB** / **PostgreSQL**
2. 填写站点标题与管理员账号
3. 完成 — 在 `/admin` 登录

之后可在后台（系统信息 → 切换数据库）更换数据库。

## 🗄️ 数据库

| 引擎 | 支持 | 说明 |
|------|------|------|
| SQLite | ✅ 默认 | 单文件 `server/data/mortar.db` |
| MySQL / MariaDB | ✅ | 自动建库（utf8mb4），内置方言翻译层 |
| PostgreSQL | ✅ | 完整方言支持 |

通过 `DATABASE_URL` 环境变量或安装向导配置。详见 [docs/deployment.md](docs/deployment.md)。

## 🧱 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Node.js, Express, better-sqlite3 / mysql2 / pg, zod, JWT, sharp |
| 前端 | React 18, React Router, Vite, Tailwind CSS, TipTap, markdown-it, GrapesJS（可视化建站） |
| 工程化 | TypeScript 5, tsx, ESLint, Vitest, GitHub Actions |

## 📚 文档

- [架构](docs/architecture.md) — 目录结构 & 数据模型
- [API 概览](docs/api.md) — 路由地图 & 认证
- [插件](docs/plugins.md) — 钩子、生命周期、市场
- [主题](docs/themes.md) — 主题结构与设置
- [部署](docs/deployment.md) — 环境、代理、备份
- [开发](docs/development.md) — 本地环境与贡献流程

### AI 配置

1. 打开 **AI 设置**（`/admin/ai/settings`），选择服务商（DeepSeek / 通义千问 / 智谱有免费额度），粘贴 API Key，点击**测试**，再**设为默认**
2. 打开 **AI 对话**（`/admin/ai`）试试：*"写一篇关于内存涨价历史的文章并保存为草稿"*
3. 在**角色与权限**（`/admin/roles`）中按角色授予 AI 使用权限（能力 `ai_use`）

## 🤝 参与贡献

欢迎贡献！请先阅读 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md) 与[贡献者公约](CODE_OF_CONDUCT.zh-CN.md)。
English contributors: see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🔒 安全

发现漏洞？请参阅 [SECURITY.zh-CN.md](SECURITY.zh-CN.md) 了解负责任披露流程。

## 📄 许可证

[Mortar](LICENSE) 采用 **知识共享 署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)**。

- **非商业性使用**：本项目不得用于商业用途。
  商用需单独授权——请联系维护者。
- **相同方式共享**：衍生作品必须以相同许可证发布。
- **署名**：分享或改编时须注明原作者。

商业授权咨询请通过 GitHub issue 联系。
