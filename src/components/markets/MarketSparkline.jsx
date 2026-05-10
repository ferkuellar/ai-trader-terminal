"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export default function MarketSparkline({ values = [], change7dPct = 0 }) {
  const data = values.map((value, index) => ({ index, value }));
  const stroke = Number(change7dPct) >= 0 ? "#34d399" : "#f87171";

  if (!data.length) {
    return <div className="h-9 text-right text-[10px] text-zinc-600">No data</div>;
  }

  return (
    <div className="h-9 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            dot={false}
            stroke={stroke}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
