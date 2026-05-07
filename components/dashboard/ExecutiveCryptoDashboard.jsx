import {
  AlertTriangle,
  BarChart3,
  Brain,
  ChevronRight,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { fmt, scoreValue } from "@/lib/score-formatters";
import { riskClass, watchlistSignalClass } from "@/lib/signal-formatters";

function snapshotTime(item) {
  return new Date(item?.createdAt || item?.timestamp || item?.result?.generatedAt || 0).getTime();
}

function sortRecent(items) {
  return [...items].sort((a, b) => snapshotTime(b) - snapshotTime(a));
}

function trendTone(delta) {
  if (delta > 0) return "text-emerald-400";
  if (delta < 0) return "text-red-400";
  return "text-zinc-400";
}

function trendLabel(delta) {
  if (delta >= 3) return "Improving";
  if (delta <= -3) return "Weakening";
  if (delta !== null && delta !== undefined) return "Stable";
  return "Insufficient history";
}

function collectLatestWatchlistRows(watchlistSnapshots) {
  const [latest, previous] = sortRecent(watchlistSnapshots);
  const latestAssets = latest?.result?.assets || [];
  const previousAssets = previous?.result?.assets || [];
  const previousBySymbol = new Map(previousAssets.map(asset => [asset.symbol, asset]));

  return latestAssets
    .map((asset, index) => {
      const previousAsset = previousBySymbol.get(asset.symbol);
      const currentScore = Number(asset.compositeScore || 0);
      const previousScore = previousAsset ? Number(previousAsset.compositeScore || 0) : null;
      const currentRank = Number(asset.rank || index + 1);
      const previousRank = previousAsset ? Number(previousAsset.rank || 0) : null;
      return {
        ...asset,
        currentRank,
        previousRank,
        previousScore,
        scoreDelta: previousScore === null ? null : currentScore - previousScore,
        rankDelta: previousRank === null ? null : previousRank - currentRank,
        snapshotAt: latest?.createdAt || latest?.result?.generatedAt,
      };
    })
    .sort((a, b) => Number(a.currentRank || 0) - Number(b.currentRank || 0));
}

function collectCompareRows(compareSnapshots) {
  return sortRecent(compareSnapshots).slice(0, 6).map(item => {
    const result = item.result || {};
    const composite = result.composite || {};
    const verdict = result.executiveVerdict || {};
    return {
      id: item.id,
      title: item.title || `${item.tokenA || result.tokenA} vs ${item.tokenB || result.tokenB}`,
      tokenA: item.tokenA || result.tokenA,
      tokenB: item.tokenB || result.tokenB,
      scoreA: composite.tokenA,
      scoreB: composite.tokenB,
      winner: composite.winner || verdict.winner || "Tie",
      signalA: verdict.signalA,
      signalB: verdict.signalB,
      createdAt: item.createdAt || item.timestamp,
    };
  });
}

function buildAlerts(rows, watchlistSnapshots) {
  const alerts = [];

  if (!watchlistSnapshots.length) {
    alerts.push({ tone: "amber", text: "No watchlist scoring snapshot found yet. Run Watchlist Scoring in ANALYST." });
    return alerts;
  }

  if (watchlistSnapshots.length < 2) {
    alerts.push({ tone: "cyan", text: "Insufficient history for score deltas. One more snapshot enables change tracking." });
  }

  rows.forEach(row => {
    if (row.scoreDelta >= 5) {
      alerts.push({ tone: "emerald", text: `${row.symbol} improved +${fmt(row.scoreDelta, 0)} composite score since last snapshot.` });
    }
    if (row.scoreDelta <= -5) {
      alerts.push({ tone: "red", text: `${row.symbol} dropped ${fmt(row.scoreDelta, 0)} composite score since last snapshot.` });
    }
    if (row.rankDelta >= 2) {
      alerts.push({ tone: "emerald", text: `${row.symbol} entered momentum: +${row.rankDelta} ranking positions.` });
    }
    if (row.rankDelta <= -2) {
      alerts.push({ tone: "amber", text: `${row.symbol} lost ${Math.abs(row.rankDelta)} ranking positions.` });
    }
    if (Number(row.compositeScore || 0) >= 75 && row.riskLevel === "High") {
      alerts.push({ tone: "amber", text: `${row.symbol} has a high score but also high risk. Review risk notes before acting.` });
    }
  });

  return alerts.slice(0, 6);
}

function MiniMetric({ label, value, tone = "zinc" }) {
  const toneClass = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    cyan: "text-cyan-300",
    zinc: "text-zinc-100",
  }[tone];

  return (
    <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2">
      <div className="text-[9px] tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`text-sm tabular font-semibold truncate ${toneClass}`}>{value}</div>
    </div>
  );
}

export default function ExecutiveCryptoDashboard({ analyses = [], watchlist = [], setTab }) {
  const compareSnapshots = analyses.filter(item => item.type === "crypto_compare");
  const watchlistSnapshots = analyses.filter(item => item.type === "crypto_watchlist_snapshot");
  const rows = collectLatestWatchlistRows(watchlistSnapshots);
  const compareRows = collectCompareRows(compareSnapshots);
  const alerts = buildAlerts(rows, watchlistSnapshots);
  const latestSnapshot = sortRecent(watchlistSnapshots)[0];
  const signalCounts = rows.reduce((acc, row) => {
    const key = row.signal || "NO DATA";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const highRiskCount = rows.filter(row => row.riskLevel === "High").length;

  return (
    <section className="border border-cyan-500/25 bg-cyan-500/5">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[11px] tracking-[0.22em] text-cyan-300">EXECUTIVE CRYPTO DASHBOARD</h3>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Inteligencia descriptiva desde snapshots AI. No es asesoría financiera.
          </div>
        </div>
        <button
          onClick={() => setTab("analyst")}
          className="px-3 py-1.5 text-[10px] tracking-[0.18em] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 inline-flex items-center gap-1.5"
        >
          ANALYST <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <MiniMetric label="Watchlist Snapshots" value={watchlistSnapshots.length} tone="cyan" />
          <MiniMetric label="Compare Snapshots" value={compareSnapshots.length} tone="cyan" />
          <MiniMetric label="Tracked Assets" value={rows.length || watchlist.length} tone="zinc" />
          <MiniMetric label="High Risk" value={highRiskCount} tone={highRiskCount ? "amber" : "emerald"} />
          <MiniMetric
            label="Last Update"
            value={latestSnapshot ? new Date(latestSnapshot.createdAt || latestSnapshot.result?.generatedAt).toLocaleDateString("es-MX") : "No data"}
            tone={latestSnapshot ? "emerald" : "amber"}
          />
        </div>

        {!rows.length && !compareRows.length && (
          <div className="border border-zinc-800 bg-zinc-950/60 p-5 text-center">
            <BarChart3 className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
            <div className="text-sm text-zinc-300">Sin snapshots AI todavía</div>
            <div className="text-xs text-zinc-500 mt-1">
              Ejecuta Crypto Compare o Watchlist Scoring en ANALYST para activar este dashboard.
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="border border-zinc-800 bg-zinc-950/50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <div className="text-[11px] tracking-[0.2em] text-zinc-300">COMPOSITE SCORE TREND</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-xs">
                  <thead className="text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Token</th>
                      <th className="text-right px-4 py-2 font-medium">Score actual</th>
                      <th className="text-right px-4 py-2 font-medium">Score anterior</th>
                      <th className="text-right px-4 py-2 font-medium">Cambio</th>
                      <th className="text-left px-4 py-2 font-medium">Tendencia</th>
                      <th className="text-left px-4 py-2 font-medium">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {rows.map(row => (
                      <tr key={row.symbol}>
                        <td className="px-4 py-2 tabular text-zinc-100 font-semibold">{row.symbol}</td>
                        <td className="px-4 py-2 text-right tabular text-zinc-100">{scoreValue(row.compositeScore)}</td>
                        <td className="px-4 py-2 text-right tabular text-zinc-400">{row.previousScore === null ? "N/A" : scoreValue(row.previousScore)}</td>
                        <td className={`px-4 py-2 text-right tabular ${trendTone(row.scoreDelta || 0)}`}>
                          {row.scoreDelta === null ? "N/A" : `${row.scoreDelta > 0 ? "+" : ""}${fmt(row.scoreDelta, 0)}`}
                        </td>
                        <td className="px-4 py-2 text-zinc-300">{trendLabel(row.scoreDelta)}</td>
                        <td className={`px-4 py-2 tabular font-semibold ${watchlistSignalClass(row.signal)}`}>{row.signal || "NO DATA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950/50">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <div className="text-[11px] tracking-[0.2em] text-zinc-300">HISTORICAL RANKING</div>
                </div>
                <div className="divide-y divide-zinc-800">
                  {rows.slice(0, 8).map(row => (
                    <div key={row.symbol} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm tabular text-zinc-100">
                          #{row.currentRank} {row.symbol}
                          <span className={`ml-2 ${watchlistSignalClass(row.signal)}`}>{row.signal || "NO DATA"}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {row.rankDelta === null
                            ? "Insufficient history"
                            : row.rankDelta === 0
                              ? "No ranking change"
                              : `${row.rankDelta > 0 ? "+" : ""}${row.rankDelta} positions`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm tabular text-cyan-300">{scoreValue(row.compositeScore)}</div>
                        <div className={riskClass(row.riskLevel)}>{row.riskLevel || "No Risk"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-950/50">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <div className="text-[11px] tracking-[0.2em] text-zinc-300">SIGNAL DISTRIBUTION</div>
                </div>
                <div className="p-4 space-y-3">
                  {["BUY", "ACCUMULATE", "HOLD", "WATCH", "AVOID", "NO DATA"].map(signal => {
                    const count = signalCounts[signal] || 0;
                    const pct = rows.length ? (count / rows.length) * 100 : 0;
                    return (
                      <div key={signal}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={watchlistSignalClass(signal)}>{signal}</span>
                          <span className="tabular text-zinc-400">{count}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {compareRows.length > 0 && (
          <div className="border border-zinc-800 bg-zinc-950/50">
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-[11px] tracking-[0.2em] text-zinc-300">RECENT COMPARE SNAPSHOTS</div>
            </div>
            <div className="divide-y divide-zinc-800">
              {compareRows.map(row => (
                <div key={row.id || row.title} className="px-4 py-3 grid sm:grid-cols-[1fr_auto] gap-3">
                  <div>
                    <div className="text-sm tabular text-zinc-100">{row.title}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {row.createdAt ? new Date(row.createdAt).toLocaleString("es-MX") : "No timestamp"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-right">
                    <div>
                      <div className="text-zinc-500">{row.tokenA}</div>
                      <div className="tabular text-zinc-100">{scoreValue(row.scoreA)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">{row.tokenB}</div>
                      <div className="tabular text-zinc-100">{scoreValue(row.scoreB)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Winner</div>
                      <div className="tabular text-cyan-300">{row.winner}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border border-zinc-800 bg-zinc-950/50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <div className="text-[11px] tracking-[0.2em] text-zinc-300">CHANGE ALERTS</div>
          </div>
          <div className="divide-y divide-zinc-800">
            {alerts.map((alert, index) => {
              const Icon = alert.tone === "emerald" ? TrendingUp : alert.tone === "red" ? TrendingDown : AlertTriangle;
              const color = alert.tone === "emerald" ? "text-emerald-400" : alert.tone === "red" ? "text-red-400" : alert.tone === "cyan" ? "text-cyan-300" : "text-amber-400";
              return (
                <div key={`${alert.text}-${index}`} className="px-4 py-3 flex items-start gap-2 text-sm">
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                  <span className="text-zinc-300">{alert.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
