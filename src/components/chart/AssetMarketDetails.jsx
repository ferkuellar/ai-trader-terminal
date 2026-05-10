"use client";

import {
  formatCurrencyCompact,
  formatNullable,
  formatPercent,
  formatSupply,
} from "@/lib/asset-formatters";

function DetailCard({ label, value }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="text-[10px] tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-semibold tabular text-zinc-100">{value}</div>
    </div>
  );
}

export default function AssetMarketDetails({ details, symbol }) {
  const volMktCap = details?.marketCap ? (details.volume24h / details.marketCap) * 100 : null;

  return (
    <section className="border border-zinc-800 bg-black/40">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-[11px] tracking-[0.2em] text-zinc-300">MARKET DETAILS</h3>
        <p className="mt-1 text-[10px] text-zinc-500">
          {details?.source || "Binance public market data"}
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard label="Market Cap" value={formatNullable(details?.marketCap, formatCurrencyCompact)} />
        <DetailCard label="Volume 24h" value={formatNullable(details?.volume24h, formatCurrencyCompact)} />
        <DetailCard label="Vol/Mkt Cap 24h" value={formatNullable(volMktCap, formatPercent)} />
        <DetailCard label="FDV" value={formatNullable(details?.fdv, formatCurrencyCompact)} />
        <DetailCard label="Total Supply" value={formatSupply(details?.totalSupply, symbol)} />
        <DetailCard label="Max Supply" value={formatSupply(details?.maxSupply, symbol)} />
        <DetailCard label="Circulating Supply" value={formatSupply(details?.circulatingSupply, symbol)} />
        <DetailCard label="Treasury Holdings" value={formatSupply(details?.treasuryHoldings, symbol)} />
      </div>
    </section>
  );
}
