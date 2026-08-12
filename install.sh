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
#
#  环境变量:
#     MORTAR_PORT   监听端口（默认 3001）
#     MORTAR_DIR    安装目录（默认当前目录 / 自动克隆）
#     DATABASE_URL  MySQL/PostgreSQL 连接串（默认 SQLite）
# ============================================================================

set -e

# ---------- 输出工具 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[Mortar]${NC} $1"; }
ok()    { echo -e "${GREEN}[ ✔ ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[ ! ]${NC} $1"; }
err()   { echo -e "${RED}[ ✘ ]${NC} $1"; exit 1; }

# ---------- 参数解析 ----------
REPO_URL="https://github.com/huihongsoft/MortarCMS.git"
PORT="${MORTAR_PORT:-3001}"
INSTALL_DIR="${MORTAR_DIR:-}"
SERVICE=1
NODE_MIN=18

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --dir) INSTALL_DIR="$2"; shift 2 ;;
    --no-service) SERVICE=0; shift ;;
    *) shift ;;
  esac
done

# ---------- 环境检测 ----------
detect_os() {
  case "$(uname -s)" in
    Linux*)  OS="linux" ;;
    Darwin*) OS="darwin" ;;
    *) err "暂不支持的系统: $(uname -s)（仅支持 Linux / macOS）" ;;
  esac
  ARCH="$(uname -m)"
  [ "$ARCH" = "x86_64" ] && ARCH="amd64"
  [ "$ARCH" = "aarch64" ] && ARCH="arm64"
  info "系统: $OS / $ARCH"
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1
}

check_prereq() {
  check_cmd node || err "未检测到 Node.js。请先安装 Node.js ≥ $NODE_MIN（https://nodejs.org）"
  NODE_VER=$(node -v | sed 's/^v//' | cut -d. -f1)
  [ "$NODE_VER" -ge "$NODE_MIN" ] || err "Node.js 版本过低（当前 $(node -v)），需要 ≥ $NODE_MIN"
  check_cmd npm || err "未检测到 npm。请随 Node.js 一起安装"
  check_cmd git || err "未检测到 git。请安装 git（apt install git / brew install git）"
  ok "Node.js $(node -v) + npm $(npm -v) + git"
  # 主题安装需要 unzip
  if ! check_cmd unzip; then
    warn "未检测到 unzip（主题 zip 安装需要）"
    if [ "$OS" = "linux" ]; then
      if check_cmd apt-get; then sudo apt-get install -y unzip >/dev/null 2>&1 && ok "已安装 unzip"
      elif check_cmd yum; then sudo yum install -y unzip >/dev/null 2>&1 && ok "已安装 unzip"
      fi
    elif [ "$OS" = "darwin" ] && check_cmd brew; then
      brew install unzip >/dev/null 2>&1 && ok "已安装 unzip"
    fi
  fi
}

# ---------- 获取代码 ----------
prepare_source() {
  if [ -z "$INSTALL_DIR" ]; then
    if [ -f "./server/package.json" ] && [ -f "./frontend/package.json" ]; then
      INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"
      info "检测到仓库目录: $INSTALL_DIR（就地安装模式）"
    else
      INSTALL_DIR="$(pwd)/mortar"
      info "将克隆仓库到: $INSTALL_DIR"
    fi
  fi
  mkdir -p "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  if [ -f "./server/package.json" ]; then
    ok "源码已存在，跳过克隆"
  else
    info "克隆仓库中..."
    git clone --depth 1 "$REPO_URL" . || err "克隆失败，请检查网络或手动 git clone $REPO_URL"
    ok "源码获取完成"
  fi
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
  # 主题 bundle
  for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen twentytwentyone twentynineteen twentyseventeen; do
    (cd frontend && THEME_NAME=$t npx vite build --config vite.themes.config.ts >/dev/null 2>&1)
    cp frontend/dist/themes/$t.js server/themes/$t/theme.js 2>/dev/null || true
  done
  # 服务端编译
  (cd server && npx tsc) || err "server 编译失败"
  # 前端最终打包（含 esm 产物）
  (cd frontend && npx vite build >/dev/null 2>&1) || true
  ok "构建完成"
}

# ---------- 服务注册 ----------
setup_service() {
  if [ "$SERVICE" = "0" ]; then
    warn "跳过服务注册（--no-service）。可用以下命令手动启动:"
    echo "  cd $INSTALL_DIR/server && NODE_ENV=production node dist/index.js"
    return
  fi
  if [ "$OS" = "linux" ]; then
    if ! check_cmd systemctl; then warn "未检测到 systemd，跳过服务注册"; return; fi
    SVC="/etc/systemd/system/${SERVICE_NAME}.service"
    if [ -f "$SVC" ]; then warn "服务已存在，将覆盖: $SERVICE_NAME"; fi
    info "创建 systemd 服务: $SERVICE_NAME"
    sudo tee "$SVC" >/dev/null <<EOF
[Unit]
Description=Mortar CMS
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR/server
ExecStart=$(command -v node) $INSTALL_DIR/server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME" >/dev/null 2>&1 || true
    sudo systemctl restart "$SERVICE_NAME"
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
    <string>$(command -v node)</string>
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
health_check() {
  info "等待服务启动..."
  for i in $(seq 1 15); do
    if curl -fsS "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
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
if [ "$OS" = "linux" ] && check_cmd systemctl 2>/dev/null; then
  case "\$CMD" in
    start) sudo systemctl start $SERVICE_NAME ;;
    stop) sudo systemctl stop $SERVICE_NAME ;;
    restart) sudo systemctl restart $SERVICE_NAME ;;
    status) sudo systemctl status $SERVICE_NAME ;;
    logs) sudo journalctl -u $SERVICE_NAME -f ;;
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
  prepare_source
  install_deps
  build_all
  write_ctl
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
