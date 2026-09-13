#!/usr/bin/env bash
# ============================================================================
#  Mortar CMS — 一键安装脚本
#  A modern WordPress-style CMS with built-in AI assistant & visual builder
#
#  用法:
#     curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash
#     或（已在仓库目录内）:  bash install.sh
#
#  可选参数:
#     bash install.sh --port 8080 --dir /opt/mortar --no-service
#     bash install.sh --upgrade        # 就地升级：更新依赖+重新构建，不新建服务
#
#  环境变量:
#     MORTAR_PORT   监听端口（默认 3001）
#     MORTAR_DIR    安装目录（默认当前目录 / 自动下载）
#     DATABASE_URL  MySQL/PostgreSQL 连接串（默认 SQLite）
# ============================================================================

set -euo pipefail

# ---------- 输出工具 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[Mortar]${NC} $1"; }
ok()    { echo -e "${GREEN}[ ✔ ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[ ! ]${NC} $1"; }
err()   { echo -e "${RED}[ ✘ ]${NC} $1"; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

# ---------- 参数解析 ----------
REPO_URL="https://github.com/huihongsoft/MortarCMS.git"
REPO_TARBALL="https://codeload.github.com/huihongsoft/MortarCMS/tar.gz/refs/heads/main"
PORT="${MORTAR_PORT:-3001}"
INSTALL_DIR="${MORTAR_DIR:-}"
SERVICE=1
UPGRADE=0
SERVICE_NAME="mortar"
# Match package.json "engines": { "node": ">=20" } and the docs.
NODE_MIN=20

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      [ $# -ge 2 ] || err "--port 需要一个端口号"
      PORT="$2"; shift 2 ;;
    --dir)
      [ $# -ge 2 ] || err "--dir 需要一个目录"
      INSTALL_DIR="$2"; shift 2 ;;
    --no-service) SERVICE=0; shift ;;
    --upgrade) UPGRADE=1; shift ;;
    -h|--help)
      echo "用法: $0 [--port 8080] [--dir /opt/mortar] [--no-service] [--upgrade]"; exit 0 ;;
    *) shift ;;
  esac
done

# ---------- 系统 / 包管理器检测 ----------
detect_os() {
  case "$(uname -s)" in
    Linux*)  OS="linux" ;;
    Darwin*) OS="darwin" ;;
    *) err "暂不支持的系统: $(uname -s)（仅支持 Linux / macOS）" ;;
  esac
  ARCH="$(uname -m)"
  [ "$ARCH" = "x86_64" ] && ARCH="amd64"
  [ "$ARCH" = "aarch64" ] && ARCH="arm64"

  # Package manager: drives the "how to install X" hints and best-effort installs.
  PKG=""
  if [ "$OS" = "darwin" ]; then
    have brew && PKG="brew"
  elif have apt-get; then PKG="apt"
  elif have dnf;     then PKG="dnf"
  elif have yum;     then PKG="yum"
  elif have zypper;  then PKG="zypper"
  elif have pacman;  then PKG="pacman"
  elif have apk;     then PKG="apk"
  fi
  if [ -n "$PKG" ]; then
    info "系统: ${OS} / ${ARCH}（包管理器: ${PKG}）"
  else
    info "系统: ${OS} / ${ARCH}"
  fi
}

pkg_hint() {
  case "$PKG" in
    apt)    echo "apt-get install -y $1" ;;
    dnf)    echo "dnf install -y $1" ;;
    yum)    echo "yum install -y $1" ;;
    zypper) echo "zypper install -y $1" ;;
    pacman) echo "pacman -S --noconfirm $1" ;;
    apk)    echo "apk add $1" ;;
    brew)   echo "brew install $1" ;;
    *)      echo "请用系统的包管理器安装 $1（如 yum/dnf/apt-get/brew）" ;;
  esac
}

# Run a command with root privileges (directly when already root).
as_root() {
  if [ "$(id -u)" -eq 0 ]; then "$@"
  elif have sudo; then sudo "$@"
  else err "需要 root 权限：请以 root 运行，或先安装 sudo"
  fi
}

# Best-effort package install; never fatal (caller falls back to a warning).
try_pkg_install() {
  local pkg="$1"
  [ -n "$PKG" ] || return 1
  case "$PKG" in
    apt)    as_root apt-get update -qq >/dev/null 2>&1 || true; as_root apt-get install -y "$pkg" >/dev/null 2>&1 ;;
    dnf|yum) as_root "$PKG" install -y "$pkg" >/dev/null 2>&1 ;;
    zypper) as_root zypper -n install "$pkg" >/dev/null 2>&1 ;;
    pacman) as_root pacman -S --noconfirm "$pkg" >/dev/null 2>&1 ;;
    apk)    as_root apk add "$pkg" >/dev/null 2>&1 ;;
    brew)   brew install "$pkg" >/dev/null 2>&1 ;;
    *)      return 1 ;;
  esac
}

# ---------- 环境检测 ----------
check_prereq() {
  if ! have node; then
    err "未检测到 Node.js。请安装 Node.js ≥ ${NODE_MIN}（$(pkg_hint nodejs) 或 https://nodejs.org）"
  fi
  NODE_VER=$(node -v | sed 's/^v//' | cut -d. -f1)
  [ "$NODE_VER" -ge "$NODE_MIN" ] || err "Node.js 版本过低（当前 $(node -v)），需要 ≥ $NODE_MIN"
  have npm || err "未检测到 npm。请随 Node.js 一起安装"

  # git is only needed to clone the repo — the tarball fallback works without it.
  if ! have git; then
    warn "未检测到 git（将改用源码压缩包下载，无需 git）"
    warn "如需 git，可执行: $(pkg_hint git)"
  fi

  # Optional helpers used later; try to install, otherwise warn.
  for tool in tar unzip curl; do
    if ! have "$tool"; then
      if try_pkg_install "$tool"; then ok "已安装 $tool"
      else warn "未检测到 ${tool}（可能影响主题安装/下载）: $(pkg_hint "$tool")"
      fi
    fi
  done

  ok "Node.js $(node -v) + npm $(npm -v)$(have git && echo ' + git')"
}

# ---------- 获取代码 ----------
download_source() {
  local dest="$1"
  local url="${MORTAR_TARBALL_URL:-$REPO_TARBALL}"
  info "下载源码压缩包..."
  if have curl; then
    curl -fsSL "$url" | tar -xz --strip-components=1 -C "$dest" || return 1
  elif have wget; then
    wget -qO- "$url" | tar -xz --strip-components=1 -C "$dest" || return 1
  elif have node; then
    # Last resort: fetch + extract without curl/wget.
    node -e '
      const { get } = require("https");
      const zlib = require("zlib");
      const tar = require("child_process").spawn("tar", ["-xz", "--strip-components=1", "-C", process.argv[1]]);
      get(process.argv[2], res => res.pipe(zlib.createGunzip()).pipe(tar.stdin));
      tar.on("close", c => process.exit(c || 0));
    ' "$dest" "$url" || return 1
  else
    return 1
  fi
}

prepare_source() {
  if [ -z "$INSTALL_DIR" ]; then
    if [ -f "./server/package.json" ] && [ -f "./frontend/package.json" ]; then
      INSTALL_DIR="$(pwd)"
      info "检测到仓库目录: ${INSTALL_DIR}（就地安装模式）"
    else
      INSTALL_DIR="$(pwd)/mortar"
      info "将安装到: $INSTALL_DIR"
    fi
  fi
  mkdir -p "$INSTALL_DIR"
  cd "$INSTALL_DIR"

  if [ -f "./server/package.json" ] && [ -f "./frontend/package.json" ]; then
    ok "源码已存在，跳过下载"
    return
  fi
  # Refuse to clone into a non-empty directory (git would fail confusingly).
  if [ -n "$(ls -A . 2>/dev/null)" ]; then
    err "目录非空且不是 Mortar 源码: ${INSTALL_DIR}（请换一个空目录，或用 --dir 指定）"
  fi

  if have git; then
    info "克隆仓库中..."
    git clone --depth 1 "$REPO_URL" . || { warn "git clone 失败，改为下载压缩包..."; download_source "$INSTALL_DIR" || err "源码下载失败，请检查网络"; }
  else
    download_source "$INSTALL_DIR" || err "源码下载失败，请检查网络（或安装 git 后重试）"
  fi
  [ -f "./server/package.json" ] || err "源码不完整：缺少 server/package.json"
  ok "源码获取完成"
}

# ---------- 安装依赖 ----------
# npm 默认缓存可能因权限问题失败（如 ~/.npm 被 root 占用），自动回退到临时缓存
npm_install() {
  local dir="$1" label="$2"
  info "安装 $label 依赖..."
  if (cd "$dir" && npm install --no-audit --no-fund); then return 0; fi
  warn "$label 使用默认 npm 缓存失败，改用临时缓存重试..."
  local tmpcache
  tmpcache="$(mktemp -d /tmp/npm-cache-XXXXXX)"
  (cd "$dir" && npm install --no-audit --no-fund --cache "$tmpcache") || { rm -rf "$tmpcache"; return 1; }
  rm -rf "$tmpcache"
}

install_deps() {
  info "安装依赖（可能需要几分钟）..."
  npm_install server   "server"   || err "server 依赖安装失败"
  npm_install admin    "admin"    || err "admin 依赖安装失败"
  npm_install frontend "frontend" || err "frontend 依赖安装失败"
  ok "依赖安装完成"
}

# ---------- 构建 ----------
build_all() {
  info "构建 admin / frontend / themes..."
  (cd admin    && npx vite build) || err "admin 构建失败"
  (cd frontend && npx vite build) || err "frontend 构建失败"
  # React ESM 共享（importmap 单实例）
  (cd frontend && npx esbuild esm/react.js --bundle --format=esm --minify --define:process.env.NODE_ENV=\"production\" --outfile=public/esm-react.js) || err "esm-react 构建失败"
  (cd frontend && npx esbuild esm/router.js --bundle --format=esm --external:react --external:react-dom --outfile=public/esm-router.js) || err "esm-router 构建失败"
  # 主题 bundle（frontend/src/themes/<name>/index.ts 对应的主题）
  local theme_failed=0
  for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen softstore; do
    if (cd frontend && THEME_NAME=$t npx vite build --config vite.themes.config.ts >/dev/null 2>&1); then
      cp frontend/dist/themes/$t.js server/themes/$t/theme.js 2>/dev/null || true
    else
      theme_failed=$((theme_failed + 1)); warn "主题 $t 构建失败（已跳过）"
    fi
  done
  [ "$theme_failed" -eq 0 ] || warn "$theme_failed 个主题构建失败，其余功能不受影响"
  # 服务端编译
  (cd server && npx tsc) || err "server 编译失败"
  # 前端最终打包（含 esm 产物）
  (cd frontend && npx vite build) || err "frontend 最终打包失败"
  ok "构建完成"
}

# ---------- 环境变量 ----------
# The server loads server/.env at startup (see server/src/utils/loadEnv.ts).
# Production refuses to start without JWT_SECRET, so generate one if the file
# doesn't already define it — otherwise the service would crash-loop.
setup_env() {
  local env_file="$INSTALL_DIR/server/.env"
  if [ -f "$env_file" ] && grep -qE '^\s*JWT_SECRET=' "$env_file"; then
    ok "已存在 server/.env（含 JWT_SECRET），保持不变"
    return
  fi
  local secret
  if have node; then
    secret="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  else
    secret="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  fi
  {
    [ -f "$env_file" ] || echo "# Generated by install.sh — loaded automatically at startup."
    echo "JWT_SECRET=$secret"
    echo "PORT=$PORT"
    echo "# Set to 1 only when running behind a reverse proxy that sets X-Forwarded-*:"
    echo "# TRUST_PROXY=1"
  } >> "$env_file"
  chmod 600 "$env_file" 2>/dev/null || true
  ok "已写入 server/.env（生成 JWT_SECRET）"
}

# ---------- 服务注册 ----------
setup_service() {
  if [ "$SERVICE" = "0" ]; then
    warn "跳过服务注册（--no-service）。可用以下命令手动启动:"
    echo "  cd $INSTALL_DIR/server && NODE_ENV=production node dist/index.js"
    return
  fi
  local node_bin; node_bin="$(command -v node)"
  if [ "$OS" = "linux" ]; then
    if ! have systemctl; then warn "未检测到 systemd，跳过服务注册"; return; fi
    SVC="/etc/systemd/system/${SERVICE_NAME}.service"
    if [ -f "$SVC" ]; then warn "服务已存在，将覆盖: $SERVICE_NAME"; fi
    info "创建 systemd 服务: $SERVICE_NAME"
    as_root tee "$SVC" >/dev/null <<EOF
[Unit]
Description=Mortar CMS
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR/server
ExecStart=$node_bin $INSTALL_DIR/server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$PORT
EnvironmentFile=-$INSTALL_DIR/server/.env

[Install]
WantedBy=multi-user.target
EOF
    as_root systemctl daemon-reload
    as_root systemctl enable "$SERVICE_NAME" >/dev/null 2>&1 || true
    as_root systemctl restart "$SERVICE_NAME"
    ok "服务已启动（systemd）"
  elif [ "$OS" = "darwin" ]; then
    PLIST="$HOME/Library/LaunchAgents/com.mortar.cms.plist"
    mkdir -p "$HOME/Library/LaunchAgents"
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.mortar.cms</string>
  <key>ProgramArguments</key>
  <array>
    <string>$node_bin</string>
    <string>$INSTALL_DIR/server/dist/index.js</string>
  </array>
  <key>WorkingDirectory</key><string>$INSTALL_DIR/server</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key><string>production</string>
    <key>PORT</key><string>$PORT</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
EOF
    launchctl unload "$PLIST" >/dev/null 2>&1 || true
    launchctl load "$PLIST" >/dev/null 2>&1 && ok "服务已启动（launchd）" || warn "launchd 加载失败，请检查 $PLIST"
  fi
}

# ---------- 健康检查 ----------
# Uses the public install-status endpoint: /api/health returns 503 until the
# install wizard has run, which would look like a failure on a fresh install.
http_ok() {
  local url="$1"
  if have curl; then
    curl -fsS -o /dev/null "$url" >/dev/null 2>&1
  else
    # node is guaranteed to be present — avoids depending on curl.
    node -e "fetch(process.argv[1]).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" "$url" >/dev/null 2>&1
  fi
}

health_check() {
  info "等待服务启动..."
  for _ in $(seq 1 20); do
    if http_ok "http://127.0.0.1:${PORT}/api/install/status"; then
      ok "服务健康检查通过"
      return
    fi
    sleep 1
  done
  warn "健康检查超时——请查看日志: journalctl -u $SERVICE_NAME -f（Linux）/ 控制台输出（macOS）"
}

# ---------- 常用命令封装 ----------
write_ctl() {
  cat > "$INSTALL_DIR/mortarctl.sh" <<EOF
#!/usr/bin/env bash
# Mortar 管理命令: ./mortarctl.sh {start|stop|restart|status|logs}
CMD="\$1"
if [ "$OS" = "linux" ] && command -v systemctl >/dev/null 2>&1; then
  SUDO=""; [ "\$(id -u)" -eq 0 ] || SUDO="sudo"
  case "\$CMD" in
    start) \$SUDO systemctl start $SERVICE_NAME ;;
    stop) \$SUDO systemctl stop $SERVICE_NAME ;;
    restart) \$SUDO systemctl restart $SERVICE_NAME ;;
    status) \$SUDO systemctl status $SERVICE_NAME ;;
    logs) \$SUDO journalctl -u $SERVICE_NAME -f ;;
    *) echo "用法: \$0 {start|stop|restart|status|logs}" ;;
  esac
else
  case "\$CMD" in
    start) (cd "$INSTALL_DIR/server" && NODE_ENV=production PORT=$PORT node dist/index.js &) ;;
    stop) pkill -f "$INSTALL_DIR/server/dist/index.js" 2>/dev/null || true ;;
    restart) pkill -f "$INSTALL_DIR/server/dist/index.js" 2>/dev/null; sleep 1; (cd "$INSTALL_DIR/server" && NODE_ENV=production PORT=$PORT node dist/index.js &) ;;
    status) pgrep -f "$INSTALL_DIR/server/dist/index.js" >/dev/null && echo "运行中" || echo "未运行" ;;
    logs) echo "请在前台启动方式下查看终端输出" ;;
    *) echo "用法: \$0 {start|stop|restart|status|logs}" ;;
  esac
fi
EOF
  chmod +x "$INSTALL_DIR/mortarctl.sh"
  ok "管理命令已生成: $INSTALL_DIR/mortarctl.sh"
}

# ---------- 升级模式 ----------
# In-place upgrade: update dependencies + rebuild, then restart the EXISTING
# service. Never creates a new systemd unit, so it is safe on a server that
# already runs Mortar (BT panel / manual / docker).
upgrade_restart() {
  if [ "$OS" = "linux" ] && have systemctl && as_root systemctl cat "$SERVICE_NAME" >/dev/null 2>&1; then
    info "重启 systemd 服务: $SERVICE_NAME"
    as_root systemctl restart "$SERVICE_NAME"
    health_check
    return
  fi
  warn "未发现 systemd 服务「${SERVICE_NAME}」，未自动重启。请用你现有的方式重启："
  echo "  宝塔/面板 Node 项目：在面板点“重启”，或手动执行："
  echo "    pkill -f '${INSTALL_DIR}/server'; cd ${INSTALL_DIR}/server && npm run dev"
  echo "  生产模式（构建产物）："
  echo "    pkill -f '${INSTALL_DIR}/server/dist'; cd ${INSTALL_DIR}/server && NODE_ENV=production PORT=${PORT} node dist/index.js"
}

run_upgrade() {
  detect_os
  check_prereq
  if [ -z "$INSTALL_DIR" ]; then
    if [ -f "./server/package.json" ]; then INSTALL_DIR="$(pwd)"; else
      err "--upgrade 需要在 Mortar 源码目录运行，或加 --dir 指定目录"
    fi
  fi
  cd "$INSTALL_DIR"
  [ -f "./server/package.json" ] || err "未找到 Mortar 源码: ${INSTALL_DIR}"
  info "升级模式：更新依赖并重新构建（不会新建/覆盖服务）"
  install_deps
  build_all
  setup_env
  upgrade_restart
  echo ""
  ok "升级完成（目录: ${INSTALL_DIR}）"
  warn "如页面仍是旧版，请强制刷新浏览器缓存（Ctrl/Cmd+Shift+R）。"
}

# ---------- 主流程 ----------
main() {
  echo ""
  echo "  ███╗   ███╗ ██████╗ ██████╗ ████████╗ █████╗ ██████╗ "
  echo "  ████╗ ████║██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗"
  echo "  ██╔████╔██║██║   ██║██████╔╝   ██║   ███████║██████╔╝"
  echo "  ██║╚██╔╝██║██║   ██║██╔══██╗   ██║   ██╔══██║██╔══██╗"
  echo "  ██║ ╚═╝ ██║╚██████╔╝██║  ██║   ██║   ██║  ██║██║  ██║"
  echo "  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝"
  echo "  ====================================================="
  echo "  Mortar CMS — 一键安装（AI 助理 / 可视化构建器 / RBAC）"
  echo "  ====================================================="
  echo ""

  detect_os
  check_prereq
  if [ "$UPGRADE" = "1" ]; then run_upgrade; return; fi
  prepare_source
  install_deps
  build_all
  write_ctl
  setup_env
  setup_service
  health_check

  echo ""
  echo "  ┌─────────────────────────────────────────────────────────┐"
  echo "  │  ✅ 安装完成！                                          │"
  echo "  │                                                         │"
  echo "  │  后台管理:  http://localhost:${PORT}/admin              │"
  echo "  │  网站首页:  http://localhost:${PORT}                    │"
  echo "  │  安装向导:  http://localhost:${PORT}/install （首次）   │"
  echo "  │                                                         │"
  echo "  │  管理命令:  ${INSTALL_DIR}/mortarctl.sh {start|stop|restart|status|logs}"
  echo "  │  数据库:    SQLite（默认，零配置）                      │"
  echo "  │             其他: export DATABASE_URL=mysql://...       │"
  echo "  └─────────────────────────────────────────────────────────┘"
  echo ""
  warn "提示：首次访问 /install 完成向导后，到【AI 设置】配置模型服务商即可使用 AI 助理。"
}

main
