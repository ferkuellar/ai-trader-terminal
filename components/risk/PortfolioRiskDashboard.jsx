import { AlertTriangle, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";

const fmt = (value, decimals = 2) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0.00";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const money = (value) => `$${fmt(value, 2)}`;

const statusClass = (status) => {
  if (status === "SAFE") return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
  if (status === "CAUTION") return "text-amber-400 border-amber-500/30 bg-amber-950/20";
  if (status === "DANGER") return "text-red-400 border-red-500/30 bg-red-950/20";
  if (status === "LOCKDOWN") return "text-red-300 border-red-500/50 bg-red-950/40";
  return "text-zinc-400 border-zinc-700 bg-zinc-900";
};

const severityClass = (severity) => {
  if (severity === "lockdown") return "border-red-500/50 bg-red-950/40 text-red-300";
  if (severity === "danger") return "border-red-500/30 bg-red-950/25 text-red-400";
  if (severity === "warning") return "border-amber-500/30 bg-amber-950/20 text-amber-400";
  return "border-cyan-500/25 bg-cyan-950/15 text-cyan-300";
};

const clampPct = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const arcPath = (startAngle, endAngle, radius = 54) => {
  const start = polarToCartesian(70, 70, radius, startAngle);
  const end = polarToCartesian(70, 70, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

function Gauge({ pct }) {
  const segments = 12;
  const activeSegments = Math.ceil((clampPct(pct) / 100) * segments);
  const segmentSize = 180 / segments;

  return (
    <svg viewBox="0 0 140 78" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: segments }).map((_, index) => {
        const start = 180 + index * segmentSize + 1.8;
        const end = 180 + (index + 1) * segmentSize - 1.8;
        const active = index < activeSegments;
        const color = index < 5 ? "#10b981" : index < 9 ? "#facc15" : "#ef4444";

        return (
          <path
            key={index}
            d={arcPath(start, end)}
            fill="none"
            stroke={active ? color : "#27272a"}
            strokeLinecap="round"
            strokeWidth="8"
            opacity={active ? 0.95 : 0.7}
          />
        );
      })}
    </svg>
  );
}

function SummaryCard({ label, value, tone = "text-zinc-100", meter = 0, status = "TRACK" }) {
  const meterPct = clampPct(meter);

  return (
    <div className="flex min-h-[148px] flex-col justify-between border border-zinc-800 bg-zinc-950/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[9px] tracking-[0.18em] text-zinc-500">{label}</div>
        <div className={`border border-zinc-800 px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] ${tone}`}>
          {status}
        </div>
      </div>

      <div className="relative mx-auto mt-2 h-20 w-full max-w-[170px] overflow-hidden">
        <Gauge pct={meterPct} />
      </div>

      <div className={`mt-1 text-center tabular text-xl font-bold leading-none ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function DirectionCard({ title, data }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] tracking-[0.18em] text-zinc-500">{title}</div>
        <div className="text-xs tabular text-zinc-300">{data?.trades || 0} trades</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-zinc-500">Risk</div>
          <div className="tabular text-amber-300">{money(data?.openRiskAmount)} · {fmt(data?.openRiskPct)}%</div>
        </div>
        <div>
          <div className="text-zinc-500">Notional</div>
          <div className="tabular text-cyan-300">{money(data?.notionalExposure)} · {fmt(data?.notionalExposurePct)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioRiskDashboard({ dashboard }) {
  if (!dashboard) {
    return (
      <section className="border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span className="text-sm">Portfolio Risk Dashboard unavailable.</span>
        </div>
      </section>
    );
  }

  const summary = dashboard.summary || {};
  const daily = dashboard.dailyState || {};
  const drawdown = dashboard.drawdownState || {};
  const byDirection = dashboard.byDirection || {};
  const bySymbol = dashboard.bySymbol || [];
  const dataQuality = dashboard.dataQuality || {};
  const hasOpenPositions = (summary.openPositionsCount || 0) > 0;
  const openRiskUsagePct = summary.maxPortfolioRiskPct
    ? (summary.totalOpenRiskPct / summary.maxPortfolioRiskPct) * 100
    : 0;
  const positionUsagePct = summary.maxOpenPositions
    ? ((summary.openPositionsCount || 0) / summary.maxOpenPositions) * 100
    : 0;
  const drawdownUsagePct = drawdown.maxTotalDrawdownPct
    ? (drawdown.totalDrawdownPct / drawdown.maxTotalDrawdownPct) * 100
    : drawdown.totalDrawdownPct;

  return (
    <section className="border border-zinc-800 bg-black/40">
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Portfolio Risk Dashboard</h3>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Exposición abierta, daily stop, drawdown y alertas de preservación de capital.
            </p>
          </div>
          <div className={`inline-flex items-center justify-center border px-3 py-2 text-xs font-bold tracking-[0.18em] ${statusClass(dashboard.status)}`}>
            {dashboard.status}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-10">
          <SummaryCard
            label="OPEN RISK"
            value={money(summary.totalOpenRiskAmount)}
            sub={`${fmt(summary.totalOpenRiskPct)}% of capital · limit ${fmt(summary.maxPortfolioRiskPct)}%`}
            tone={summary.totalOpenRiskPct >= summary.maxPortfolioRiskPct ? "text-red-400" : "text-amber-300"}
            meter={openRiskUsagePct}
            status={summary.totalOpenRiskPct >= summary.maxPortfolioRiskPct ? "LIMIT" : "OPEN"}
          />
          <SummaryCard
            label="RISK CAPACITY"
            value={`${fmt(summary.riskCapacityRemainingPct)}%`}
            sub={`${money(summary.riskCapacityRemainingAmount)} remaining`}
            tone={summary.riskCapacityRemainingPct <= 0 ? "text-red-400" : "text-emerald-400"}
            meter={100 - summary.riskCapacityRemainingPct}
            status={summary.riskCapacityRemainingPct <= 0 ? "FULL" : "ROOM"}
          />
          <SummaryCard
            label="NOTIONAL"
            value={money(summary.totalNotionalExposure)}
            sub={`${fmt(summary.totalNotionalExposurePct)}% exposure`}
            tone="text-cyan-300"
            meter={summary.totalNotionalExposurePct}
            status={summary.totalNotionalExposurePct > 0 ? "LIVE" : "FLAT"}
          />
          <SummaryCard
            label="OPEN POSITIONS"
            value={`${summary.openPositionsCount || 0}/${summary.maxOpenPositions || 0}`}
            sub="current / max"
            tone={summary.openPositionsCount >= summary.maxOpenPositions ? "text-red-400" : "text-zinc-100"}
            meter={positionUsagePct}
            status={summary.openPositionsCount >= summary.maxOpenPositions ? "MAX" : "SLOTS"}
          />
          <SummaryCard
            label="DAILY STOP"
            value={`${fmt(daily.dailyStopUsedPct)}% used`}
            sub={`${fmt(daily.dailyStopRemainingPct)}% remaining`}
            tone={daily.status === "LOCKDOWN" ? "text-red-400" : daily.status === "CAUTION" ? "text-amber-400" : "text-emerald-400"}
            meter={daily.dailyStopUsedPct}
            status={daily.status || "SAFE"}
          />
          <SummaryCard
            label="DRAWDOWN"
            value={`${fmt(drawdown.totalDrawdownPct)}%`}
            sub={drawdown.maxTotalDrawdownPct ? `limit ${fmt(drawdown.maxTotalDrawdownPct)}%` : "no hard limit"}
            tone={drawdown.status === "LOCKDOWN" || drawdown.status === "DANGER" ? "text-red-400" : "text-zinc-100"}
            meter={drawdownUsagePct}
            status={drawdown.status || "TRACK"}
          />
          <div className="border border-zinc-800 bg-zinc-950/50 p-3 sm:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <div className="text-[10px] tracking-[0.18em] text-zinc-500">CAPITAL PRESERVATION ALERTS</div>
            </div>
            {dashboard.alerts?.length ? (
              <div className="space-y-2">
                {dashboard.alerts.map((item) => (
                  <div key={`${item.id}-${item.message}`} className={`border p-2 ${severityClass(item.severity)}`}>
                    <div className="text-xs font-semibold text-zinc-100">{item.title}</div>
                    <div className="mt-1 text-[11px] text-zinc-300">{item.message}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">{item.recommendation}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-500">No active preservation alerts.</div>
            )}
          </div>
          <div className="border border-zinc-800 bg-zinc-950/50 p-3 sm:col-span-2">
            <div className="mb-2 text-[10px] tracking-[0.18em] text-zinc-500">DATA QUALITY</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-zinc-500">Measurable</div>
                <div className="tabular text-emerald-400">{dataQuality.measurableTrades || 0}</div>
              </div>
              <div>
                <div className="text-zinc-500">Unmeasurable</div>
                <div className="tabular text-red-400">{dataQuality.unmeasurableTrades || 0}</div>
              </div>
              <div>
                <div className="text-zinc-500">Missing SL</div>
                <div className="tabular text-red-400">{dataQuality.missingStopLoss || 0}</div>
              </div>
              <div>
                <div className="text-zinc-500">Missing Size</div>
                <div className="tabular text-amber-400">{dataQuality.missingPositionSize || 0}</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-[11px] text-zinc-500">
              {(dataQuality.notes || []).map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
            <div className="mt-3 border-t border-zinc-800 pt-2 text-[11px] text-zinc-600">
              {dashboard.disclaimer}
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="border border-zinc-800 bg-zinc-950/50">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
              <div className="text-[10px] tracking-[0.18em] text-zinc-500">RISK BY SYMBOL</div>
            </div>
            {!hasOpenPositions ? (
              <div className="p-4 text-sm text-zinc-500">No open positions. Portfolio risk is currently flat.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-zinc-950 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Symbol</th>
                      <th className="px-3 py-2 text-right">Open</th>
                      <th className="px-3 py-2 text-right">Long</th>
                      <th className="px-3 py-2 text-right">Short</th>
                      <th className="px-3 py-2 text-right">Open Risk</th>
                      <th className="px-3 py-2 text-right">Risk %</th>
                      <th className="px-3 py-2 text-right">Notional</th>
                      <th className="px-3 py-2 text-right">Exposure %</th>
                      <th className="px-3 py-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bySymbol.map((row) => (
                      <tr key={row.symbol} className="border-t border-zinc-800">
                        <td className="px-3 py-2 font-semibold text-zinc-100">{row.symbol}</td>
                        <td className="px-3 py-2 text-right tabular text-zinc-300">{row.openTrades}</td>
                        <td className="px-3 py-2 text-right tabular text-emerald-300">{row.longTrades}</td>
                        <td className="px-3 py-2 text-right tabular text-red-300">{row.shortTrades}</td>
                        <td className="px-3 py-2 text-right tabular text-amber-300">{money(row.openRiskAmount)}</td>
                        <td className="px-3 py-2 text-right tabular text-amber-300">{fmt(row.openRiskPct)}%</td>
                        <td className="px-3 py-2 text-right tabular text-cyan-300">{money(row.notionalExposure)}</td>
                        <td className="px-3 py-2 text-right tabular text-cyan-300">{fmt(row.notionalExposurePct)}%</td>
                        <td className={`px-3 py-2 text-[10px] tracking-[0.14em] ${row.missingRiskData ? "text-red-400" : "text-emerald-400"}`}>
                          {row.missingRiskData ? "INCOMPLETE" : "OK"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <DirectionCard title="LONG EXPOSURE" data={byDirection.long} />
            <DirectionCard title="SHORT EXPOSURE" data={byDirection.short} />

        </div>
        </div>
      </div>
    </section>
  );
}
