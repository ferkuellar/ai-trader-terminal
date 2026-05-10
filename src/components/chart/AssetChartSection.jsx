"use client";

import { useMemo, useState } from "react";
import { Brain } from "lucide-react";
import {
  getAssetProfile,
  normalizePair,
  symbolFromPair,
} from "@/lib/chart-data-adapter";
import { formatCurrencyCompact, formatPercent } from "@/lib/asset-formatters";
import useLiveAssetDetail from "@/hooks/useLiveAssetDetail";
import ChartTimeframeSelector from "./ChartTimeframeSelector";
import DynamicPairChart from "./DynamicPairChart";
import AssetLinksPanel from "./AssetLinksPanel";

export default function AssetChartSection({
  selectedMarket,
  marketData,
  symbolPicker,
  onAnalyze,
  quickAnalysis,
}) {
  const pair = normalizePair(selectedMarket?.pair || selectedMarket || "BTCUSDT");
  const [timeframe, setTimeframe] = useState("7D");
  const profile = useMemo(() => getAssetProfile(pair), [pair]);
  const symbol = symbolFromPair(pair);
  const {
    ticker,
    status,
    error,
    lastUpdateAt,
  } = useLiveAssetDetail(pair, timeframe, marketData);
  const price = ticker?.price;
  const change24hPct = ticker?.change24hPct;
  const isLive = status === "ready" || status === "refreshing";
  const updatedLabel = lastUpdateAt
    ? new Date(lastUpdateAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })
    : "waiting";

  return (
    <section className="space-y-4">
      <div className="border border-zinc-800 bg-zinc-950/70">
        <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {symbolPicker}
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  {profile.name} <span className="text-zinc-500">{symbol}</span>
                </h2>
                <div className="mt-1 text-xs tabular text-zinc-500">
                  {pair} · TradingView live chart · Binance public market profile · updated {updatedLabel}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="text-2xl font-bold tabular text-zinc-100">{formatCurrencyCompact(price)}</div>
              <div className={`border px-2 py-1 text-xs tabular ${
                Number(change24hPct) >= 0
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  : "border-red-500/30 bg-red-500/5 text-red-400"
              }`}>
                24h {formatPercent(change24hPct)}
              </div>
              <div className={`border px-2 py-1 text-[10px] tracking-[0.16em] ${
                isLive
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/5 text-amber-300"
              }`}>
                {isLive ? "LIVE DATA" : "LIVE FALLBACK"}
              </div>
              {error ? <div className="text-[10px] text-amber-400">{error}</div> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ChartTimeframeSelector value={timeframe} onChange={setTimeframe} />
            {onAnalyze && (
              <button
                type="button"
                onClick={onAnalyze}
                className="inline-flex items-center gap-1.5 border border-cyan-500/40 px-3 py-1.5 text-[10px] tracking-[0.18em] text-cyan-300 hover:bg-cyan-500/10"
              >
                <Brain className="h-3 w-3" /> ANALIZAR
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <DynamicPairChart pair={pair} timeframe={timeframe} />
        </div>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 [&>*]:h-full">{quickAnalysis}</div>
        <AssetLinksPanel profile={profile} />
      </div>

      <div className="text-[10px] leading-relaxed text-zinc-600">
        Live chart is provided by TradingView for the selected Binance symbol. Price and 24h movement use Binance public market data.
      </div>
    </section>
  );
}
