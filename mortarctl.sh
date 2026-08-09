#!/usr/bin/env bash
# Mortar 管理命令: ./mortarctl.sh {start|stop|restart|status|logs}
CMD="$1"
if [ "darwin" = "linux" ] && check_cmd systemctl 2>/dev/null; then
  case "$CMD" in
    start) sudo systemctl start  ;;
    stop) sudo systemctl stop  ;;
    restart) sudo systemctl restart  ;;
    status) sudo systemctl status  ;;
    logs) sudo journalctl -u  -f ;;
    *) echo "用法: $0 {start|stop|restart|status|logs}" ;;
  esac
else
  case "$CMD" in
    start) (cd "/Users/lan/Desktop/WorkSpaces/Claude/Mortar/server" && NODE_ENV=production PORT=3001 node dist/index.js &) ;;
    stop) pkill -f "/Users/lan/Desktop/WorkSpaces/Claude/Mortar/server/dist/index.js" 2>/dev/null || true ;;
    restart) pkill -f "/Users/lan/Desktop/WorkSpaces/Claude/Mortar/server/dist/index.js" 2>/dev/null; sleep 1; (cd "/Users/lan/Desktop/WorkSpaces/Claude/Mortar/server" && NODE_ENV=production PORT=3001 node dist/index.js &) ;;
    status) pgrep -f "/Users/lan/Desktop/WorkSpaces/Claude/Mortar/server/dist/index.js" >/dev/null && echo "运行中" || echo "未运行" ;;
    logs) echo "请在前台启动方式下查看终端输出" ;;
    *) echo "用法: $0 {start|stop|restart|status|logs}" ;;
  esac
fi
