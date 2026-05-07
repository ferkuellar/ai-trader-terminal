import { watchlistSignalClass } from "@/lib/signal-formatters";

export default function SignalBadge({ signal, className = "" }) {
  return (
    <span className={`tabular font-semibold ${watchlistSignalClass(signal)} ${className}`}>
      {signal || "-"}
    </span>
  );
}
