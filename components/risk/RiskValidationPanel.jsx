import { AlertTriangle, CheckCircle, ShieldCheck, XCircle } from "lucide-react";

const fmt = (value, decimals = 2) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const statusStyles = {
  APPROVED: {
    icon: CheckCircle,
    label: "APPROVED",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
  },
  WARNING: {
    icon: AlertTriangle,
    label: "WARNING",
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
  },
  BLOCKED: {
    icon: XCircle,
    label: "BLOCKED",
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    text: "text-red-400",
  },
};

const checkClass = (status) => {
  if (status === "pass") return "text-emerald-400";
  if (status === "warning") return "text-amber-400";
  if (status === "fail") return "text-red-400";
  return "text-zinc-400";
};

function Metric({ label, value, tone = "text-zinc-200" }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/70 p-2">
      <div className="text-[10px] tracking-[0.16em] text-zinc-500">{label}</div>
      <div className={`mt-1 tabular text-sm font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function ListBlock({ title, items, tone }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`mb-1 text-[10px] tracking-[0.18em] ${tone}`}>{title}</div>
      <ul className="space-y-1 text-xs text-zinc-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2">
            <span className={tone}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RiskValidationPanel({ validation }) {
  if (!validation) {
    return (
      <div className="border border-zinc-800 bg-zinc-950/70 p-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-zinc-300">
              RISK VALIDATION
            </div>
            <div className="text-xs text-zinc-500">
              Captura entry, stop loss y setup para validar el riesgo.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const style = statusStyles[validation.status] || statusStyles.WARNING;
  const StatusIcon = style.icon;
  const metrics = validation.metrics || {};

  return (
    <div className={`border ${style.border} ${style.bg} p-3 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${style.text}`} />
          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-zinc-300">
              RISK VALIDATION
            </div>
            <div className={`text-sm font-bold tracking-[0.16em] ${style.text}`}>
              {style.label} · SCORE {fmt(validation.score, 0)}
            </div>
          </div>
        </div>
        <div className="max-w-xs text-right text-xs text-zinc-400">{validation.summary}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="RIESGO PERMITIDO" value={`$${fmt(metrics.allowedRiskAmount)}`} tone="text-cyan-300" />
        <Metric label="RIESGO REAL" value={`$${fmt(metrics.actualRiskAmount)} · ${fmt(metrics.actualRiskPct)}%`} tone={metrics.actualRiskPct > 0 ? "text-amber-300" : "text-zinc-400"} />
        <Metric label="STOP DIST" value={`${fmt(metrics.stopDistancePct)}%`} tone={metrics.stopDistancePct > 12 ? "text-red-400" : "text-zinc-200"} />
        <Metric label="R:R TP1" value={metrics.rrTp1 ? `1:${fmt(metrics.rrTp1)}` : "N/A"} tone={metrics.rrTp1 >= 1.5 ? "text-emerald-400" : "text-amber-400"} />
        <Metric label="RIESGO ABIERTO" value={`${fmt(metrics.openPortfolioRiskPct)}%`} />
        <Metric label="RIESGO PROY." value={`${fmt(metrics.projectedPortfolioRiskPct)}%`} tone={metrics.projectedPortfolioRiskPct > 6 ? "text-red-400" : "text-zinc-200"} />
        <Metric label="POSICIONES" value={String(metrics.openPositions || 0)} />
        <Metric label="DAILY STOP" value={`${fmt(metrics.dailyLossPct)}% usado`} />
        <Metric label="DRAWDOWN" value={`${fmt(metrics.totalDrawdownPct)}%`} />
        <Metric label="SIZE SUG." value={`${fmt(metrics.suggestedPositionSize, 6)} units`} tone="text-cyan-300" />
        <Metric label="NOCIONAL" value={`$${fmt(metrics.notionalValue)}`} tone="text-cyan-300" />
      </div>

      <div className="max-h-56 overflow-y-auto border border-zinc-800 bg-zinc-950/60">
        {(validation.checks || []).map((check) => (
          <div key={check.id} className="flex items-start justify-between gap-3 border-b border-zinc-800 px-3 py-2 last:border-b-0">
            <div>
              <div className="text-xs font-medium text-zinc-200">{check.label}</div>
              <div className="text-[11px] text-zinc-500">{check.message}</div>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${checkClass(check.status)}`}>
              {check.status}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ListBlock title="BLOCKERS" items={validation.blockers} tone="text-red-400" />
        <ListBlock title="WARNINGS" items={validation.warnings} tone="text-amber-400" />
        <ListBlock title="RECOMMENDATIONS" items={validation.recommendations} tone="text-cyan-400" />
      </div>
    </div>
  );
}
