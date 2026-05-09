import {
  calculateTradeHealth,
  getTradeHealthDisplayState,
} from "@/lib/trade-health";

const fmt = (value, decimals = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const segmentClass = (zone, activeZone) => {
  const off = "bg-slate-700/60";
  if (activeZone === "gray") return "bg-slate-500/40";
  if (zone !== activeZone) return off;
  if (zone === "red") return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]";
  if (zone === "yellow") return "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.30)]";
  if (zone === "green") return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.30)]";
  return off;
};

export default function TradeHealthBar({
  trade,
  size = "compact",
  showLabel = false,
  showTooltip = true,
}) {
  const health = calculateTradeHealth(trade);
  const display = getTradeHealthDisplayState(health);
  const widthClass = size === "compact" ? "w-16 sm:w-20" : "w-24";
  const heightClass = size === "compact" ? "h-1.5" : "h-2";
  const title = `${display.label} · ${
    health.riskConsumedPct === null ? "riesgo N/A" : `${fmt(health.riskConsumedPct)}% riesgo consumido`
  }. ${health.message}`;

  return (
    <div className="flex min-w-0 items-center justify-center gap-2" title={showTooltip ? title : undefined}>
      <div
        className={`grid ${widthClass} grid-cols-3 gap-1`}
        aria-label={title}
      >
        {["red", "yellow", "green"].map((zone) => (
          <span
            key={zone}
            className={`${heightClass} rounded-full transition-colors ${segmentClass(zone, display.activeZone)}`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`hidden truncate text-[10px] font-semibold tracking-[0.12em] sm:inline ${display.colorClass.split(" ")[0]}`}>
          {display.label}
        </span>
      )}
    </div>
  );
}
