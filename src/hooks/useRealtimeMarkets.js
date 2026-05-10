"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBinanceTickerStream } from "@/lib/realtime/binance-market-stream";

const UI_UPDATE_INTERVAL_MS = 250;
const FLASH_DURATION_MS = 800;

function updateLastSparklinePoint(sparkline = [], latestPrice) {
  if (!Array.isArray(sparkline) || !sparkline.length || !Number.isFinite(latestPrice)) {
    return sparkline;
  }

  return [...sparkline.slice(0, -1), latestPrice];
}

function applyTicker(row, ticker, now) {
  const previousPrice = Number(row.price);
  const nextPrice = Number(ticker.price);
  const direction = Number.isFinite(previousPrice) && Number.isFinite(nextPrice)
    ? nextPrice > previousPrice
      ? "up"
      : nextPrice < previousPrice
        ? "down"
        : "flat"
    : "flat";
  const circulatingSupply = row.circulatingSupply;

  return {
    ...row,
    price: nextPrice,
    change24hPct: ticker.change24hPct,
    volume24h: ticker.quoteVolume24h,
    marketCap: circulatingSupply && Number.isFinite(nextPrice)
      ? circulatingSupply * nextPrice
      : row.marketCap,
    sparkline7d: updateLastSparklinePoint(row.sparkline7d, nextPrice),
    lastPriceDirection: direction,
    lastPriceChangedAt: direction === "flat" ? row.lastPriceChangedAt : now,
    lastTickAt: now,
    source: ticker.source,
  };
}

export function useRealtimeMarkets(initialMarkets = [], options = {}) {
  const { enabled = true } = options;
  const [markets, setMarkets] = useState(initialMarkets);
  const [connectionStatus, setConnectionStatus] = useState(enabled ? "connecting" : "disconnected");
  const [lastUpdateAt, setLastUpdateAt] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [error, setError] = useState(null);
  const [uiNow, setUiNow] = useState(Date.now());
  const streamRef = useRef(null);
  const pendingTicksRef = useRef(new Map());
  const pausedRef = useRef(false);

  const symbolsKey = useMemo(
    () => initialMarkets.map(row => row.pair).filter(Boolean).join(","),
    [initialMarkets]
  );

  useEffect(() => {
    setMarkets(initialMarkets);
  }, [initialMarkets]);

  useEffect(() => {
    if (!enabled || !symbolsKey) {
      setConnectionStatus("disconnected");
      return undefined;
    }

    pausedRef.current = false;
    setError(null);

    const pendingTicks = pendingTicksRef.current;

    streamRef.current = createBinanceTickerStream({
      symbols: symbolsKey.split(","),
      onTicker: (ticker) => {
        pendingTicksRef.current.set(ticker.symbol, ticker);
      },
      onStatusChange: setConnectionStatus,
      onError: (nextError) => {
        setError(nextError);
      },
    });

    const flushInterval = setInterval(() => {
      if (pausedRef.current || pendingTicksRef.current.size === 0) return;

      const now = Date.now();
      const ticks = new Map(pendingTicksRef.current);
      pendingTicksRef.current.clear();
      const latestEventTime = Math.max(
        ...Array.from(ticks.values()).map(ticker => ticker.eventTime || now)
      );

      setLatencyMs(Math.max(0, now - latestEventTime));
      setLastUpdateAt(new Date(now));
      setMarkets(currentRows => currentRows.map(row => {
        const ticker = ticks.get(row.pair);
        return ticker ? applyTicker(row, ticker, now) : row;
      }));
    }, UI_UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(flushInterval);
      pendingTicks.clear();
      streamRef.current?.close();
      streamRef.current = null;
    };
  }, [enabled, symbolsKey]);

  useEffect(() => {
    const id = setInterval(() => setUiNow(Date.now()), UI_UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const reconnect = useCallback(() => {
    setError(null);
    streamRef.current?.reconnect();
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const visibleMarkets = useMemo(() => {
    return markets.map(row => ({
      ...row,
      flashActive: row.lastPriceChangedAt
        ? uiNow - row.lastPriceChangedAt < FLASH_DURATION_MS
        : false,
    }));
  }, [markets, uiNow]);

  return {
    markets: visibleMarkets,
    connectionStatus,
    lastUpdateAt,
    latencyMs,
    error,
    reconnect,
    pause,
    resume,
  };
}
