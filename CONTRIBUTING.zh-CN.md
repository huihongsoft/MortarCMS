# 参与贡献 Mortar

感谢你对 Mortar 的关注！本指南介绍如何搭建开发环境并提交改动。

## 开发环境搭建

```bash
# 1. 克隆并安装依赖
git clone <你的 fork 地址> mortar
cd mortar
cd server && npm install && cd ..
cd admin && npm install && cd ..
cd frontend && npm install && cd ..

# 2. 以监视模式运行全部三个服务
npm run dev
#   服务端:   http://localhost:3001
#   前台:     http://localhost:3000
#   后台:     http://localhost:3002
```

开发模式下，服务端会将 `/api` 与 `/uploads` 代理到 `localhost:3001`（对两个前端均生效）。

## 项目结构

```
server/      Express API、数据层、插件、主题、市场
admin/       管理后台 SPA（React + Vite + Tailwind）
frontend/    公开站点 SPA（React + Vite + Tailwind）
docs/        文档
```

## 提交前检查

1. **类型检查、Lint 与测试** — 每项都必须通过：

   ```bash
   # 根目录
   npm run lint                        # ESLint（0 error；warning 不阻塞）
   # server
   cd server && npx tsc --noEmit && npm test   # vitest 单元测试
   # admin / frontend
   cd admin && npx tsc -b && npx vite build
   cd frontend && npx tsc -b && npx vite build
   ```

2. **以 SQLite（默认）验证** — 所有改动必须保证默认路径可用。若改动了数据层，有条件时请用 MySQL/PostgreSQL 连接验证（`DATABASE_URL=...`）。

3. **保持界面中英双语** — 新增界面文案必须走 `t('key', getLang())` / `t('key', settings)`，且 key 必须存在于 `admin/src/lib/i18n.ts` 或 `frontend/src/lib/i18n.ts` 字典中（英文为 key，中文为值）。

4. **默认安全** — 新接口默认要求认证，除非刻意公开（并经过评审）。切勿记录密钥或令牌日志。

## 提交规范

- 写清晰、聚焦的提交信息，说明**为什么**（而不只是做了什么）。
- 保持 PR 小而可评审；一个 PR 对应一个功能或修复。
- 在描述中关联相关 issue。

## 代码风格

- 服务端已启用 TypeScript strict 模式。
- React 组件统一使用 `React.createElement`（不用 JSX）——请与现有风格保持一致。
- 遵循现有命名：函数/变量用 `camelCase`，组件用 `PascalCase`。

## 报告问题

使用 GitHub issue 模板，并包含：

- Mortar 版本与安装方式
- 复现步骤
- 预期行为与实际行为
- 服务端日志（如适用）

感谢你让 Mortar 变得更好！🚀
