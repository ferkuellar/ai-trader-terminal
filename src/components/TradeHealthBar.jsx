import { calculateTradeHealth, getTradeHealthColorClass } from "@/lib/trade-health";

const fmt = (value, decimals = 1) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const segmentClass = (segment) => {
  if (!segment.active) return "bg-zinc-800/70";
  if (segment.level === "safe") return "bg-emerald-400";
  if (segment.level === "warning") return "bg-amber-400";
  if (segment.level === "danger") return "bg-red-500";
  return "bg-zinc-700";
};

export default function TradeHealthBar({ trade }) {
  const health = calculateTradeHealth(trade);
  const toneClass = getTradeHealthColorClass(health);
  const riskLabel = health.riskConsumedPct === null
    ? "riesgo N/A"
    : `${fmt(health.riskConsumedPct)}% riesgo consumido`;

  return (
    <div className="mt-3 border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
          SALUD DEL TRADE
        </div>
        <div className={`inline-flex w-fit border px-2 py-1 text-[10px] font-bold tracking-[0.16em] ${toneClass}`}>
          {health.label} · {riskLabel}
        </div>
      </div>

      <div
        className="grid grid-cols-8 gap-1"
        title={health.message}
        aria-label={`Salud del trade: ${health.label}. ${health.message}`}
      >
        {health.segments.map((segment) => (
          <div
            key={segment.id}
            className={`h-2 rounded-sm transition-colors ${segmentClass(segment)}`}
          />
        ))}
      </div>

      <div className="mt-2 grid gap-2 text-[11px] text-zinc-500 sm:grid-cols-3">
        <div>
          <span className="text-zinc-600">Stop a </span>
          <span className={health.status === "UNKNOWN" ? "text-zinc-500" : "text-zinc-300"}>
            {health.distanceToStopPct === null ? "N/A" : `${fmt(health.distanceToStopPct, 2)}%`}
          </span>
        </div>
        <div>
          <span className="text-zinc-600">TP1 </span>
          <span className={health.progressToTp1Pct === null ? "text-zinc-500" : "text-cyan-300"}>
            {health.progressToTp1Pct === null ? "N/A" : `${fmt(health.progressToTp1Pct, 1)}%`}
          </span>
        </div>
        <div className="truncate" title={health.message}>{health.message}</div>
      </div>

      {health.warnings?.length > 0 && (
        <div className="mt-2 text-[11px] text-amber-400">
          {health.warnings.join(" · ")}
        </div>
      )}
    </div>
  );
}
