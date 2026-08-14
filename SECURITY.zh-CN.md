# 安全策略

## 受支持的版本

安全修复只应用于最新版本。建议始终运行最新版本。

## 报告漏洞

**请勿**就安全漏洞公开提交 issue。请私下报告，以便我们在披露前修复。

**报告方式：**

- 在 GitHub 仓库打开**私有安全通告**（`Security` 选项卡 → `Report a vulnerability`），或
- 邮件联系维护者（地址见仓库主页）。

请附上：

1. 受影响的版本
2. 漏洞描述
3. 复现步骤（或 PoC）
4. 影响评估

我们承诺在 **5 个工作日内**响应，并与你协商披露时间线。

## 部署安全最佳实践

- 在 `server/.env` 中设置强 `JWT_SECRET`——否则每次重启都会使会话失效。
- 为所有管理员账号开启 2FA（TOTP）（`/admin` → 用户）。
- 在反向代理处终止 TLS，并转发 `X-Forwarded-Proto`。
- 在带安全响应头的反向代理后面运行（应用自身会设置
  `X-Frame-Options`、`nosniff`、`Referrer-Policy` 与 `Permissions-Policy` 作为基线）。
- 不要将 `server/.env` 纳入版本控制，并限制文件权限（`chmod 600`）。
- 定期备份（后台 → 系统信息 → 备份）并异地存放。
- 使用内置的**安全审计**页面（`/admin/security`）检查你的安装。

## 内置安全特性

| 领域 | 防护 |
|------|------|
| 认证 | JWT（HS256，显式算法）、服务端登出（令牌黑名单） |
| 登录 | 2FA 挑战（TOTP）、账号锁定（5 次失败 / 15 分钟）、限流 |
| 密码 | bcrypt（cost 12）、强度策略（8 位以上，含字母与数字） |
| 上传 | 扩展名 + MIME 白名单、图片内容校验（sharp） |
| 输出 | 用户内容过 DOMPurify、CDN 地址校验、链接协议检查 |
| 响应头 | X-Frame-Options DENY、nosniff、Referrer-Policy、Permissions-Policy |
| 安装器 | 禁止匿名重置——仅管理员（见 `/api/install/reset`） |
| 隐私 | GDPR 数据导出与擦除 |
