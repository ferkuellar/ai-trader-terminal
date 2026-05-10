"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchBinanceMarketRows } from "@/lib/markets-adapter";
import { useRealtimeMarkets } from "@/hooks/useRealtimeMarkets";
import MarketConnectionStatus from "./MarketConnectionStatus";
import MarketsTable from "./MarketsTable";

const DEFAULT_MARKET_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "DOTUSDT",
  "LTCUSDT",
];

export default function MarketsSection({ symbols = DEFAULT_MARKET_SYMBOLS, selectedPair, onSelectSymbol }) {
  const normalizedSymbols = useMemo(
    () => [...new Set((symbols.length ? symbols : DEFAULT_MARKET_SYMBOLS).slice(0, 12))],
    [symbols]
  );
  const symbolsKey = normalizedSymbols.join(",");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const {
    markets,
    connectionStatus,
    lastUpdateAt,
    latencyMs,
    error: realtimeError,
    reconnect,
  } = useRealtimeMarkets(rows, { enabled: status === "live" });

  const reloadMarkets = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setError(null);
      try {
        const nextRows = await fetchBinanceMarketRows(symbolsKey.split(",").filter(Boolean));
        if (cancelled) return;
        setRows(nextRows);
        setUpdatedAt(new Date());
        setStatus("live");
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError);
        setRows([]);
        setStatus("error");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symbolsKey]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border border-zinc-800 bg-zinc-950/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-soft" />
            <h2 className="text-sm font-semibold tracking-[0.22em] text-zinc-100">Markets</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Crypto market overview · Binance REST baseline + public WebSocket ticks
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {status === "live" ? (
            <MarketConnectionStatus
              status={connectionStatus}
              latencyMs={latencyMs}
              lastUpdateAt={lastUpdateAt}
              error={realtimeError}
              onReconnect={reconnect}
            />
          ) : (
            <MarketConnectionStatus
              status={status === "loading" ? "connecting" : "error"}
              error={error}
              onReconnect={reloadMarkets}
            />
          )}
          {updatedAt && (
            <span className="text-[10px] tracking-[0.14em] tabular text-zinc-600">
              REST BASELINE {updatedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="border border-zinc-800 bg-zinc-950/60 p-8 text-center text-sm text-zinc-500">
          Loading market data...
        </div>
      )}

      {status === "error" && (
        <div className="border border-red-500/30 bg-red-500/5 p-8 text-center text-sm text-red-300">
          Unable to load market data.
          {error?.message ? <div className="mt-1 text-xs text-red-400/70">{error.message}</div> : null}
        </div>
      )}

      {status === "live" && (
        <MarketsTable rows={markets} selectedPair={selectedPair} onSelectSymbol={onSelectSymbol} />
      )}
    </section>
  );
}
