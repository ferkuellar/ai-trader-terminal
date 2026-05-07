import ScoreBadge from "./ScoreBadge";
import SignalBadge from "./SignalBadge";
import { scoreValue } from "@/lib/score-formatters";
import { riskClass } from "@/lib/signal-formatters";

function WatchlistAssetScoreCard({ asset }) {
  const rows = [
    ["On-Chain", asset?.scores?.onChainHealth],
    ["Tokenomics", asset?.scores?.tokenomicsQuality],
    ["Sentiment", asset?.scores?.sentimentMomentum],
    ["Technical", asset?.scores?.technicalSetup],
    ["Fundamental", asset?.scores?.fundamentalStrength],
  ];

  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm tabular text-zinc-100 font-semibold">{asset?.symbol || "-"}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{asset?.summary || "Sin resumen disponible."}</div>
        </div>
        <SignalBadge signal={asset?.signal} className="text-xs" />
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[92px_1fr_36px] items-center gap-2">
            <div className="text-[10px] text-zinc-500">{label}</div>
            <div className="h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full ${Number(value || 0) >= 70 ? "bg-emerald-400" : Number(value || 0) >= 45 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }}
              />
            </div>
            <div className="text-right text-[10px] tabular text-zinc-300">{scoreValue(value)}</div>
          </div>
        ))}
      </div>
      {asset?.invalidation && (
        <div className="mt-3 border-t border-zinc-800 pt-2 text-[10px] text-amber-300 leading-relaxed">
          Invalidation: {asset.invalidation}
        </div>
      )}
    </div>
  );
}

export default function WatchlistScoreCard({ result }) {
  const assets = Array.isArray(result?.assets)
    ? [...result.assets].sort((a, b) => Number(b.compositeScore || 0) - Number(a.compositeScore || 0))
    : [];
  const summary = result?.summary || {};
  const dataQuality = result?.dataQuality || {};

  return (
    <div className="space-y-4 pt-1">
      <section className="border border-cyan-500/30 bg-cyan-500/5 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h4 className="text-[11px] tracking-[0.2em] text-cyan-300">EXECUTIVE DASHBOARD</h4>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Snapshot generado {result?.generatedAt ? new Date(result.generatedAt).toLocaleString("es-MX") : "ahora"}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 tabular">{assets.length} assets</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          <ScoreBadge label="Best Overall" value={summary.bestOverall || "N/A"} accent="cyan" />
          <ScoreBadge label="Best Momentum" value={summary.bestMomentum || "N/A"} accent="emerald" />
          <ScoreBadge label="Lowest Risk" value={summary.lowestRisk || "N/A"} accent="emerald" />
          <ScoreBadge label="Highest Risk" value={summary.highestRisk || "N/A"} accent="red" />
          <ScoreBadge label="Freshness" value={dataQuality.freshness || "N/A"} accent={dataQuality.freshness === "High" ? "emerald" : dataQuality.freshness === "Medium" ? "amber" : "red"} />
        </div>
        {summary.marketRegimeNote && (
          <div className="mt-3 border-t border-cyan-500/20 pt-3 text-sm text-zinc-200 leading-relaxed">
            {summary.marketRegimeNote}
          </div>
        )}
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">RANKING TABLE</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-right px-4 py-2 font-medium">Rank</th>
                <th className="text-left px-4 py-2 font-medium">Asset</th>
                <th className="text-right px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium">Grade</th>
                <th className="text-left px-4 py-2 font-medium">Signal</th>
                <th className="text-left px-4 py-2 font-medium">Risk</th>
                <th className="text-left px-4 py-2 font-medium">Confidence</th>
                <th className="text-left px-4 py-2 font-medium">Key Strength</th>
                <th className="text-left px-4 py-2 font-medium">Key Weakness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {assets.map((asset, index) => (
                <tr key={asset.symbol || index}>
                  <td className="px-4 py-2 text-right tabular text-zinc-400">{asset.rank || index + 1}</td>
                  <td className="px-4 py-2 tabular text-zinc-100 font-semibold">{asset.symbol || "-"}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(asset.compositeScore)}</td>
                  <td className="px-4 py-2 tabular text-cyan-300">{asset.grade || "-"}</td>
                  <td className="px-4 py-2"><SignalBadge signal={asset.signal} /></td>
                  <td className={`px-4 py-2 tabular ${riskClass(asset.riskLevel)}`}>{asset.riskLevel || "-"}</td>
                  <td className="px-4 py-2 tabular text-zinc-200">{asset.confidence || "-"}</td>
                  <td className="px-4 py-2 text-zinc-300 max-w-[220px]">{asset.keyStrength || "-"}</td>
                  <td className="px-4 py-2 text-zinc-400 max-w-[220px]">{asset.keyWeakness || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">SCORE BREAKDOWN</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3 p-4">
          {assets.map((asset, index) => (
            <WatchlistAssetScoreCard key={asset.symbol || index} asset={asset} />
          ))}
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-[11px] tracking-[0.2em] text-zinc-300 mb-3">DATA QUALITY</h4>
        <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
          <ScoreBadge label="Freshness" value={dataQuality.freshness || "N/A"} accent={dataQuality.freshness === "High" ? "emerald" : dataQuality.freshness === "Medium" ? "amber" : "red"} />
          <ScoreBadge label="Missing Data" value={Array.isArray(dataQuality.missingData) ? dataQuality.missingData.length : 0} />
          <ScoreBadge label="Disclaimer" value="Visible" accent="cyan" />
        </div>
        {Array.isArray(dataQuality.missingData) && dataQuality.missingData.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] tracking-wider text-zinc-500 mb-1">MISSING DATA</div>
            <div className="flex flex-wrap gap-1.5">
              {dataQuality.missingData.map((item, i) => (
                <span key={`${item}-${i}`} className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[10px] text-amber-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {dataQuality.uncertaintyNote && (
          <div className="text-xs text-zinc-300 leading-relaxed mb-3">{dataQuality.uncertaintyNote}</div>
        )}
        <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200 leading-relaxed">
          {result.disclaimer || "Educational analysis only. This is not financial advice."}
        </div>
      </section>
    </div>
  );
}
