"use client";

import { CHART_TIMEFRAMES } from "@/lib/chart-data-adapter";

export default function ChartTimeframeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {CHART_TIMEFRAMES.map(timeframe => (
        <button
          key={timeframe}
          type="button"
          onClick={() => onChange?.(timeframe)}
          className={`border px-3 py-1.5 text-[10px] tracking-[0.18em] transition-colors ${
            value === timeframe
              ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
              : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
          }`}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
