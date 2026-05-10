"use client";

import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSupply,
  getPercentTone,
} from "@/lib/market-formatters";
import MarketSparkline from "./MarketSparkline";

function PercentCell({ value }) {
  return (
    <td className={`px-4 py-3 text-right tabular text-xs font-semibold ${getPercentTone(value)}`}>
      {formatPercent(value)}
    </td>
  );
}

function priceFlashClass(row) {
  if (!row.flashActive) return "text-zinc-100";
  if (row.lastPriceDirection === "up") {
    return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20";
  }
  if (row.lastPriceDirection === "down") {
    return "bg-red-500/10 text-red-300 ring-1 ring-red-400/20";
  }
  return "text-zinc-100";
}

function rowFlashClass(row) {
  if (!row.flashActive) return "";
  if (row.lastPriceDirection === "up") return "bg-emerald-500/[0.035]";
  if (row.lastPriceDirection === "down") return "bg-red-500/[0.035]";
  return "";
}

export default function MarketsTable({ rows = [], selectedPair, onSelectSymbol }) {
  if (!rows.length) {
    return (
      <div className="border border-zinc-800 bg-zinc-950/60 p-8 text-center text-sm text-zinc-500">
        No market data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-800 bg-black/40">
      <table className="w-full min-w-[1120px] text-left">
        <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-right">#</th>
            <th className="px-4 py-3">Pair</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">1h %</th>
            <th className="px-4 py-3 text-right">24h %</th>
            <th className="px-4 py-3 text-right">7d %</th>
            <th className="px-4 py-3 text-right">Market Cap</th>
            <th className="px-4 py-3 text-right">Volume 24h</th>
            <th className="px-4 py-3 text-right">Circulating Supply</th>
            <th className="px-4 py-3 text-right">Last 7 Days</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {rows.map(row => (
            <tr
              key={row.pair}
              onClick={() => onSelectSymbol?.(row.pair)}
              className={`cursor-pointer transition-colors duration-300 hover:bg-zinc-900/60 ${
                selectedPair === row.pair ? "bg-cyan-500/10 shadow-[inset_2px_0_0_rgba(34,211,238,0.75)]" : ""
              } ${rowFlashClass(row)}`}
            >
              <td className="px-4 py-3 text-right text-xs tabular text-zinc-500">{row.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 border border-zinc-800 bg-zinc-950 text-center text-[10px] font-bold leading-7 text-zinc-300">
                    {row.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold tabular text-zinc-100">{row.pair}</div>
                    <div className="text-[10px] text-zinc-500">{row.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex min-w-28 justify-end px-2 py-1 text-sm tabular transition-colors duration-300 ${priceFlashClass(row)}`}>
                  {formatCurrency(row.price)}
                </span>
              </td>
              <PercentCell value={row.change1hPct} />
              <PercentCell value={row.change24hPct} />
              <PercentCell value={row.change7dPct} />
              <td className="px-4 py-3 text-right text-xs tabular text-zinc-300">{formatCompactCurrency(row.marketCap)}</td>
              <td className="px-4 py-3 text-right text-xs tabular text-zinc-300">{formatCompactCurrency(row.volume24h)}</td>
              <td className="px-4 py-3 text-right text-xs tabular text-zinc-300">{formatSupply(row.circulatingSupply, row.supplySymbol)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <MarketSparkline values={row.sparkline7d} change7dPct={row.change7dPct} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
