"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";

const STATUS_CLASS = {
  connecting: "text-amber-400",
  connected: "text-emerald-400",
  reconnecting: "text-amber-400",
  disconnected: "text-zinc-500",
  error: "text-red-400",
};

const STATUS_LABEL = {
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Error",
};

function secondsAgo(date) {
  if (!date) return "no ticks yet";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds <= 1) return "updated now";
  return `updated ${seconds}s ago`;
}

export default function MarketConnectionStatus({
  status,
  latencyMs,
  lastUpdateAt,
  error,
  onReconnect,
}) {
  const tone = STATUS_CLASS[status] || STATUS_CLASS.disconnected;
  const Icon = status === "connected" ? Wifi : status === "error" || status === "disconnected" ? WifiOff : RefreshCw;

  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.14em] text-zinc-500">
      <span className={`inline-flex items-center gap-1.5 ${tone}`}>
        <Icon className={`h-3 w-3 ${status === "connecting" || status === "reconnecting" ? "animate-spin" : ""}`} />
        {STATUS_LABEL[status] || "Disconnected"} · Binance public WebSocket
      </span>
      {typeof latencyMs === "number" && (
        <span className="tabular text-zinc-400">{latencyMs}ms</span>
      )}
      <span className="tabular text-zinc-600">{secondsAgo(lastUpdateAt)}</span>
      {(status === "disconnected" || status === "error") && (
        <button
          type="button"
          onClick={onReconnect}
          className="border border-zinc-800 px-2 py-1 text-[9px] tracking-[0.14em] text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-300"
        >
          RECONNECT
        </button>
      )}
      {error?.message && (
        <span className="max-w-[280px] truncate text-red-400/70">{error.message}</span>
      )}
    </div>
  );
}
