import { BarChart2, Brain, Loader2 } from "lucide-react";
import CompareResultCard from "./CompareResultCard";

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export default function CryptoComparePanel({
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  loading,
  error,
  result,
  saveEnabled,
  setSaveEnabled,
  savedMessage,
  onCompare,
}) {
  const disabled = loading;

  return (
    <div className="border border-zinc-800 bg-zinc-900/40">
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <div className="text-[11px] tracking-[0.2em] text-zinc-300">CRYPTO COMPARE</div>
          <BarChart2 className="w-3 h-3 text-cyan-400/60 ml-auto" />
        </div>
        <div className="text-[10px] text-zinc-500 mt-1">
          // comparación educativa head-to-head usando Composite Crypto Score
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <Field label="TOKEN A">
            <input
              value={tokenA}
              onChange={e => setTokenA(e.target.value)}
              disabled={disabled}
              placeholder="BTC"
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm tabular uppercase focus:outline-none focus:border-cyan-500/50 disabled:text-zinc-600"
            />
          </Field>
          <Field label="TOKEN B">
            <input
              value={tokenB}
              onChange={e => setTokenB(e.target.value)}
              disabled={disabled}
              placeholder="ETH"
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm tabular uppercase focus:outline-none focus:border-cyan-500/50 disabled:text-zinc-600"
            />
          </Field>
          <button
            onClick={onCompare}
            disabled={disabled}
            className={`px-5 py-2.5 text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-2 transition-colors ${
              disabled
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400 text-zinc-950"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> COMPARE</>
            ) : (
              <><BarChart2 className="w-4 h-4" /> COMPARE</>
            )}
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={saveEnabled}
            onChange={e => setSaveEnabled(e.target.checked)}
            className="h-4 w-4 accent-cyan-400"
          />
          Guardar en analyses
        </label>

        {loading && (
          <div className="flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-sm text-cyan-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analizando comparación...
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

        {result && <CompareResultCard result={result} />}
      </div>
    </div>
  );
}
