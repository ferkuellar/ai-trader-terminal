"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizePair } from "@/lib/chart-data-adapter";
import { fetchLiveTicker } from "@/lib/live-asset-adapter";

const REFRESH_MS = 30000;

export default function useLiveAssetDetail(pair, timeframe, marketData) {
  const normalizedPair = normalizePair(pair);
  const [ticker, setTicker] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [lastUpdateAt, setLastUpdateAt] = useState(null);
  const fallbackMarketDataRef = useRef(marketData);
  const tickerRef = useRef(null);

  useEffect(() => {
    fallbackMarketDataRef.current = marketData;
  }, [marketData]);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    async function load() {
      try {
        setStatus((current) => current === "ready" ? "refreshing" : "connecting");
        const nextTicker = await fetchLiveTicker(normalizedPair);
        if (cancelled) return;

        tickerRef.current = nextTicker;
        setTicker(nextTicker);
        setLastUpdateAt(Date.now());
        setStatus("ready");
        setError(null);
      } catch (nextError) {
        if (cancelled) return;
        const fallbackMarketData = fallbackMarketDataRef.current;
        const fallbackTicker = fallbackMarketData?.price ? {
          pair: normalizedPair,
          price: fallbackMarketData.price,
          change24hPct: fallbackMarketData.change24hPct,
          high24h: fallbackMarketData.high24h,
          low24h: fallbackMarketData.low24h,
          volume24h: fallbackMarketData.volume24h,
          source: "Binance public ticker fallback",
        } : tickerRef.current;

        tickerRef.current = fallbackTicker;
        setTicker(fallbackTicker);
        setStatus("degraded");
        setError(nextError.message || "Unable to load live asset data");
      }
    }

    load();
    intervalId = window.setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [normalizedPair, timeframe]);

  useEffect(() => {
    if (!marketData?.price) return;
    setTicker((current) => ({
      ...current,
      pair: normalizedPair,
      price: marketData.price,
      change24hPct: marketData.change24hPct ?? current?.change24hPct,
      high24h: marketData.high24h ?? current?.high24h,
      low24h: marketData.low24h ?? current?.low24h,
      volume24h: marketData.volume24h ?? current?.volume24h,
      source: "Binance public live ticker",
    }));
    tickerRef.current = {
      ...tickerRef.current,
      pair: normalizedPair,
      price: marketData.price,
      change24hPct: marketData.change24hPct ?? tickerRef.current?.change24hPct,
      high24h: marketData.high24h ?? tickerRef.current?.high24h,
      low24h: marketData.low24h ?? tickerRef.current?.low24h,
      volume24h: marketData.volume24h ?? tickerRef.current?.volume24h,
      source: "Binance public live ticker",
    };
    setLastUpdateAt(Date.now());
  }, [marketData?.price, marketData?.change24hPct, marketData?.high24h, marketData?.low24h, marketData?.volume24h, normalizedPair]);

  const liveTicker = useMemo(() => ticker || marketData || {}, [ticker, marketData]);

  return {
    ticker: liveTicker,
    status,
    error,
    lastUpdateAt,
  };
}
