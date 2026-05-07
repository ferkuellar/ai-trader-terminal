import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import { fmt, fmtPrice } from "@/lib/score-formatters";
import { symbolToPair } from "@/lib/ai-ui-helpers";

function Panel({ title, subtitle, children, action }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-zinc-300">{title}</div>
          {subtitle && <div className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function AnalysisResultCard({ analysis, onApply, onDelete, metrics, config }) {
  const a = analysis;
  const verdictStyles = {
    TRADE: { bg: "bg-emerald-500/5", border: "border-emerald-500/40", text: "text-emerald-400" },
    WAIT: { bg: "bg-amber-500/5", border: "border-amber-500/40", text: "text-amber-400" },
    PASS: { bg: "bg-zinc-800/40", border: "border-zinc-700", text: "text-zinc-400" },
  };
  const vs = verdictStyles[a.verdict] || verdictStyles.PASS;
  const biasColor = a.bias === "bullish" ? "text-emerald-400"
    : a.bias === "bearish" ? "text-red-400" : "text-zinc-400";
  const setupBlocked = a.setup?.valid && (
    metrics.open.length >= config.maxOpenPositions ||
    (a.setup.stopPct && a.setup.stopPct > 12)
  );

  return (
    <div className="space-y-4">
      <div className={`border ${vs.border} ${vs.bg} p-4`}>
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`text-[10px] tracking-[0.3em] px-2 py-1 border ${vs.border} ${vs.text} font-bold`}>
              {a.verdict}
            </div>
            <div className="text-lg tabular text-zinc-100">{symbolToPair(a.symbol)}</div>
            <div className={`text-xs tracking-wider ${biasColor}`}>
              {a.bias?.toUpperCase()} <span className="text-zinc-500">({a.biasStrength}/10)</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 tabular">
            {new Date(a.timestamp).toLocaleString("es-MX")}
          </div>
        </div>
        <div className="text-sm text-zinc-200 leading-relaxed">{a.summary}</div>
      </div>

      {a.confluence && (
        <Panel title="CONFLUENCIA" subtitle={`Score ${a.confluence.score}/10`}>
          <div className="p-4 space-y-3">
            <div className="relative h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className={`absolute inset-y-0 left-0 ${
                a.confluence.score >= 7 ? "bg-emerald-400"
                  : a.confluence.score >= 4 ? "bg-amber-400" : "bg-red-400"
              }`} style={{ width: `${a.confluence.score * 10}%` }} />
            </div>
            <div className="space-y-1.5 pt-2">
              {a.confluence.factors?.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {f.type === "positive" ? (
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={f.type === "positive" ? "text-zinc-200" : "text-zinc-400"}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {a.setup && (
        <Panel title="SETUP PROPUESTO"
          subtitle={a.setup.valid ? "✓ Cumple filtros del plan" : "✗ No cumple filtros — no operar"}>
          <div className="p-4 space-y-3">
            {!a.setup.valid ? (
              <div className="text-sm text-amber-300">
                {a.setup.rationale || "Setup descartado por el analyst."}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">DIRECCIÓN</div>
                    <div className={`text-sm tabular font-semibold ${
                      a.setup.direction === "long" ? "text-emerald-400" : "text-red-400"
                    }`}>{a.setup.direction?.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">ENTRY</div>
                    <div className="text-sm tabular text-zinc-100">${fmtPrice(a.setup.entry)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">STOP LOSS</div>
                    <div className="text-sm tabular text-red-400">${fmtPrice(a.setup.stopLoss)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">STOP DIST</div>
                    <div className={`text-sm tabular ${
                      (a.setup.stopPct || 0) > 12 ? "text-red-400" : "text-zinc-100"
                    }`}>{fmt(a.setup.stopPct || 0, 2)}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">TP1</div>
                    <div className="text-sm tabular text-emerald-400">
                      {a.setup.tp1 ? `$${fmtPrice(a.setup.tp1)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">TP2</div>
                    <div className="text-sm tabular text-emerald-400/70">
                      {a.setup.tp2 ? `$${fmtPrice(a.setup.tp2)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">R:R TP1</div>
                    <div className={`text-sm tabular ${
                      (a.setup.rrTp1 || 0) >= 1.5 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {a.setup.rrTp1 ? `1:${fmt(a.setup.rrTp1, 2)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">SIZE</div>
                    <div className="text-sm tabular text-amber-400">
                      {a.setup.stopPct
                        ? `$${fmt((metrics.currentCapital * config.riskPctPerTrade / 100) / (a.setup.stopPct / 100), 0)}`
                        : "—"}
                    </div>
                  </div>
                </div>
                {a.setup.rationale && (
                  <div className="pt-3 border-t border-zinc-800 text-sm text-zinc-300 italic leading-relaxed">
                    {a.setup.rationale}
                  </div>
                )}
              </>
            )}
          </div>
        </Panel>
      )}

      {a.risks?.length > 0 && (
        <Panel title="RIESGOS" subtitle="Lo que podría salir mal">
          <div className="p-4 space-y-2">
            {a.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{r}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-3">
        {a.setup?.valid ? (
          <button onClick={onApply} disabled={setupBlocked}
            className={`py-3 text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-2 ${
              setupBlocked
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
            }`}>
            {setupBlocked ? "BLOQUEADO POR PLAN" : "USAR EN NUEVO TRADE"}
          </button>
        ) : (
          <div className="py-3 text-xs tracking-[0.2em] text-zinc-500 text-center border border-zinc-800">
            NO HAY SETUP PARA APLICAR
          </div>
        )}
        <button onClick={onDelete}
          className="py-3 text-xs tracking-[0.2em] border border-zinc-800 hover:border-red-500/40 hover:text-red-400 text-zinc-400 inline-flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" /> ELIMINAR
        </button>
      </div>
    </div>
  );
}
