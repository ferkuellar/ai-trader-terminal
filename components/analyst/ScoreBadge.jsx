export function ScoreBadge({ label, value, accent = "zinc" }) {
  const accentClass = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    cyan: "text-cyan-300",
    zinc: "text-zinc-100",
  }[accent] || "text-zinc-100";

  return (
    <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2 min-w-0">
      <div className="text-[9px] tracking-wider text-zinc-500 truncate">{label.toUpperCase()}</div>
      <div className={`text-sm tabular font-semibold truncate ${accentClass}`}>{value ?? "-"}</div>
    </div>
  );
}

export default ScoreBadge;
