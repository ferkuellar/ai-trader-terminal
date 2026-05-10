"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

function sentimentTone(bullishPct) {
  if (bullishPct >= 60) return { label: "Bullish", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" };
  if (bullishPct <= 40) return { label: "Bearish", className: "text-red-400 border-red-500/30 bg-red-500/5" };
  return { label: "Neutral", className: "text-amber-400 border-amber-500/30 bg-amber-500/5" };
}

export default function CommunitySentimentGraph({ sentiment }) {
  if (!sentiment) {
    return <div className="border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">Community sentiment unavailable.</div>;
  }

  const tone = sentimentTone(sentiment.bullishPct);
  const updatedLabel = sentiment.updatedAt
    ? new Date(sentiment.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "live";

  return (
    <section className="border border-zinc-800 bg-zinc-950/60">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="text-[11px] tracking-[0.2em] text-zinc-300">COMMUNITY SENTIMENT</h3>
          <p className="mt-1 text-[10px] text-zinc-500">{sentiment.source || "Public live sentiment proxy"} · {updatedLabel}</p>
        </div>
        <span className={`border px-2 py-1 text-[10px] tracking-[0.16em] ${tone.className}`}>{tone.label}</span>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400">Bullish {sentiment.bullishPct}%</span>
          <span className="text-red-400">Bearish {sentiment.bearishPct}%</span>
        </div>
        <div className="h-2 overflow-hidden border border-zinc-800 bg-zinc-900">
          <div className="h-full bg-emerald-400" style={{ width: `${sentiment.bullishPct}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-zinc-800 bg-black/30 p-3">
            <div className="text-[10px] tracking-[0.18em] text-zinc-500">SOCIAL SCORE</div>
            <div className="mt-1 text-xl font-bold tabular text-cyan-300">{sentiment.socialScore}</div>
          </div>
          <div className="border border-zinc-800 bg-black/30 p-3">
            <div className="text-[10px] tracking-[0.18em] text-zinc-500">FEAR/GREED</div>
            <div className="mt-1 text-xl font-bold tabular text-amber-300">{sentiment.fearGreedLabel}</div>
          </div>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentiment.sentimentTrend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", border: "1px solid #3f3f46", borderRadius: 0, fontSize: 11 }}
              />
              <Area type="monotone" dataKey="bullish" stroke="#34d399" fill="#34d399" fillOpacity={0.12} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="bearish" stroke="#f87171" fill="#f87171" fillOpacity={0.08} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
