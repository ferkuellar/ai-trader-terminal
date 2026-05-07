import { Activity, BarChart3, Loader2 } from "lucide-react";
import WatchlistScoreCard from "./WatchlistScoreCard";

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export default function WatchlistScoringPanel({
  input,
  setInput,
  loading,
  error,
  result,
  saveEnabled,
  setSaveEnabled,
  savedMessage,
  onScore,
}) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/40">
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <div className="text-[11px] tracking-[0.2em] text-zinc-300">WATCHLIST SCORING</div>
          <Activity className="w-3 h-3 text-cyan-400/60 ml-auto" />
        </div>
        <div className="text-[10px] text-zinc-500 mt-1">
          // rankea activos por Composite Crypto Score y señal educativa
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Field label="TOKENS">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="BTC, ETH, SOL, ADA, LINK"
            className="w-full resize-y bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm tabular uppercase focus:outline-none focus:border-cyan-500/50 disabled:text-zinc-600"
          />
        </Field>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={saveEnabled}
              onChange={e => setSaveEnabled(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Guardar snapshot en analyses
          </label>
          <button
            onClick={onScore}
            disabled={loading}
            className={`px-5 py-2.5 text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-2 transition-colors ${
              loading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> SCORING...</>
            ) : (
              <><BarChart3 className="w-4 h-4" /> SCORE WATCHLIST</>
            )}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-sm text-cyan-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Rankeando watchlist...
          </div>
        )}

        {error && (
          <div className="border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {savedMessage && (
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-300">
            {savedMessage}
          </div>
        )}

        {result && <WatchlistScoreCard result={result} />}
      </div>
    </div>
  );
}
