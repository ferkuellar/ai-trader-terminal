import { AlertTriangle } from "lucide-react";

export default function AnalystErrorState({ error }) {
  if (!error) return null;

  return (
    <div className="border border-red-500/40 bg-red-500/5 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-red-300">{error}</div>
    </div>
  );
}
