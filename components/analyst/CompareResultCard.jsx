import ScoreBadge from "./ScoreBadge";
import { fmt, scoreValue } from "@/lib/score-formatters";
import { riskClass, signalAccent } from "@/lib/signal-formatters";

function RiskNote({ label, value }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="text-[10px] tracking-wider text-zinc-500 mb-1">{label.toUpperCase()}</div>
      <div className="text-xs text-zinc-300 leading-relaxed">{value || "No disponible."}</div>
    </div>
  );
}

export default function CompareResultCard({ result }) {
  const tokenA = result?.tokenA || "TOKEN A";
  const tokenB = result?.tokenB || "TOKEN B";
  const verdict = result?.executiveVerdict || {};
  const composite = result?.composite || {};
  const scores = result?.scores || {};
  const riskMatrix = result?.riskMatrix || {};
  const biggestRisks = result?.biggestRisks || {};
  const dataQuality = result?.dataQuality || {};
  const scoreRows = [
    ["On-Chain Health", scores.onChainHealth],
    ["Tokenomics Quality", scores.tokenomicsQuality],
    ["Sentiment & Momentum", scores.sentimentMomentum],
    ["Technical Setup", scores.technicalSetup],
    ["Fundamental Strength", scores.fundamentalStrength],
  ];
  const riskRows = [
    ["Volatility", riskMatrix.volatilityRisk],
    ["Liquidity", riskMatrix.liquidityRisk],
    ["Dilution / Unlock", riskMatrix.dilutionUnlockRisk],
    ["Regulatory", riskMatrix.regulatoryRisk],
    ["Smart Contract", riskMatrix.smartContractRisk],
    ["Narrative", riskMatrix.narrativeRisk],
    ["Centralization", riskMatrix.centralizationRisk],
    ["Drawdown", riskMatrix.drawdownRisk],
  ];

  return (
    <div className="space-y-4 pt-1">
      <section className="border border-cyan-500/30 bg-cyan-500/5 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <h4 className="text-[11px] tracking-[0.2em] text-cyan-300">EXECUTIVE VERDICT</h4>
            <div className="text-[10px] text-zinc-500 mt-0.5">Resultado educativo, no asesoría financiera.</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-wider text-zinc-500">WINNER</div>
            <div className="text-lg tabular text-cyan-300 font-semibold">{verdict.winner || composite.winner || "Tie"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mb-3">
          <ScoreBadge label="Confidence" value={verdict.confidence} accent="cyan" />
          <ScoreBadge label="Long-Term" value={verdict.betterLongTermThesis} />
          <ScoreBadge label="Short-Term" value={verdict.betterShortTermSetup} />
          <ScoreBadge label="Risk-Adjusted" value={verdict.betterRiskAdjustedProfile} />
          <ScoreBadge label={`${tokenA} Signal`} value={verdict.signalA} accent={signalAccent(verdict.signalA)} />
          <ScoreBadge label={`${tokenB} Signal`} value={verdict.signalB} accent={signalAccent(verdict.signalB)} />
          <ScoreBadge label={`${tokenA} Grade`} value={composite.gradeA} />
          <ScoreBadge label={`${tokenB} Grade`} value={composite.gradeB} />
        </div>

        {verdict.summary && (
          <div className="border-t border-cyan-500/20 pt-3 text-sm text-zinc-200 leading-relaxed">
            {verdict.summary}
          </div>
        )}
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">COMPOSITE SCORE</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Dimension</th>
                <th className="text-right px-4 py-2 font-medium">{tokenA}</th>
                <th className="text-right px-4 py-2 font-medium">{tokenB}</th>
                <th className="text-left px-4 py-2 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {scoreRows.map(([label, row]) => (
                <tr key={label}>
                  <td className="px-4 py-2 text-zinc-300">{label}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100">{scoreValue(row?.tokenA)}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100">{scoreValue(row?.tokenB)}</td>
                  <td className="px-4 py-2 tabular text-cyan-300">{row?.winner || "-"}</td>
                </tr>
              ))}
              <tr className="bg-zinc-900/40">
                <td className="px-4 py-2 text-zinc-100 font-semibold">Composite</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(composite.tokenA)}</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(composite.tokenB)}</td>
                <td className="px-4 py-2 tabular text-cyan-300 font-semibold">{composite.winner || "-"}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-100 font-semibold">Grade</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{composite.gradeA || "-"}</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{composite.gradeB || "-"}</td>
                <td className="px-4 py-2 tabular text-cyan-300">{composite.winner || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 p-4 border-t border-zinc-800">
          {scoreRows.map(([label, row]) => row?.reason && (
            <div key={label} className="border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-[10px] tracking-wider text-zinc-500 mb-1">{label.toUpperCase()}</div>
              <div className="text-xs text-zinc-300 leading-relaxed">{row.reason}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">RISK MATRIX</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Risk Factor</th>
                <th className="text-left px-4 py-2 font-medium">{tokenA}</th>
                <th className="text-left px-4 py-2 font-medium">{tokenB}</th>
                <th className="text-left px-4 py-2 font-medium">Higher Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {riskRows.map(([label, row]) => (
                <tr key={label}>
                  <td className="px-4 py-2 text-zinc-300">{label}</td>
                  <td className={`px-4 py-2 tabular ${riskClass(row?.tokenA)}`}>{row?.tokenA || "-"}</td>
                  <td className={`px-4 py-2 tabular ${riskClass(row?.tokenB)}`}>{row?.tokenB || "-"}</td>
                  <td className="px-4 py-2 tabular text-zinc-200">{row?.higherRisk || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 p-4 border-t border-zinc-800">
          <RiskNote label={`Biggest Risk ${tokenA}`} value={biggestRisks[tokenA]} />
          <RiskNote label={`Biggest Risk ${tokenB}`} value={biggestRisks[tokenB]} />
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-[11px] tracking-[0.2em] text-zinc-300 mb-3">DATA QUALITY</h4>
        <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
          <ScoreBadge label="Freshness" value={dataQuality.freshness} accent={dataQuality.freshness === "High" ? "emerald" : dataQuality.freshness === "Medium" ? "amber" : "red"} />
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
