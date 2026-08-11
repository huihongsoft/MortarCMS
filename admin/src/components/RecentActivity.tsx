import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { t, getLang } from "../lib/i18n";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("just now", getLang());
  if (mins < 60) return mins + t("m ago", getLang());
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + t("h ago", getLang());
  return Math.floor(hours / 24) + t("d ago", getLang());
}

export default function RecentActivity() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api.get("/activity?limit=8").then(r => setLogs(r.data?.logs || r.data)).catch(() => {}); }, []);
  if (logs.length === 0) return React.createElement("p", { className: "text-sm text-gray-400 py-2" }, t("no recent activity", getLang()));
  return React.createElement("div", { className: "space-y-2" },
    logs.map((l: any) => React.createElement("div", { key: l.id, className: "flex items-center gap-2 text-xs text-gray-600 py-1" },
      React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" }),
      React.createElement("span", { className: "font-medium" }, l.username || t("system", getLang())),
      React.createElement("span", { className: "text-gray-400" }, l.action),
      React.createElement("span", { className: "text-gray-400 ml-auto" }, timeAgo(l.createdAt))
    ))
  );
}
