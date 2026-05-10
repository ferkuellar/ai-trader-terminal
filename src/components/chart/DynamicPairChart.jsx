"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

const TIMEFRAME_TO_INTERVAL = {
  "1H": "60",
  "24H": "60",
  "7D": "240",
  "30D": "D",
  "90D": "D",
};

function loadTradingViewScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("TradingView requires browser runtime"));
  if (window.TradingView?.widget) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load TradingView")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load TradingView"));
    document.head.appendChild(script);
  });
}

export default function DynamicPairChart({ pair, timeframe }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const symbol = useMemo(() => `BINANCE:${String(pair || "BTCUSDT").replace("/", "").toUpperCase()}`, [pair]);
  const interval = TIMEFRAME_TO_INTERVAL[timeframe] || "240";

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    const containerId = `tradingview_${String(pair || "BTCUSDT").toLowerCase()}_${String(timeframe || "7D").toLowerCase()}`;

    if (!container) return undefined;
    setStatus("loading");
    container.innerHTML = "";
    container.id = containerId;

    loadTradingViewScript()
      .then(() => {
        if (cancelled || !window.TradingView?.widget) return;
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          details: true,
          calendar: false,
          studies: ["Volume@tv-basicstudies"],
          container_id: containerId,
        });
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error.message || "Unable to load TradingView");
      });

    return () => {
      cancelled = true;
      if (container) container.innerHTML = "";
    };
  }, [symbol, interval, pair, timeframe]);

  return (
    <div className="overflow-hidden border border-slate-800 bg-[#0b1220]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-3 py-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">TradingView Live Chart</div>
          <div className="mt-1 text-sm font-semibold tabular text-slate-100">{symbol}</div>
        </div>
        <div className={`border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
          status === "ready"
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/5 text-amber-300"
        }`}>
          {status === "ready" ? "Live TradingView" : status}
        </div>
      </div>
      <div className="relative h-[520px] min-h-[420px] w-full sm:h-[620px]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
