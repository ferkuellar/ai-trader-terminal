"use client";

import { useState, useEffect } from "react";
import {
  Brain, ChevronDown, ChevronRight, FileSearch, Loader2, Sparkles,
} from "lucide-react";
import { fmt, fmtPrice, fmtVolume, sign } from "@/lib/score-formatters";
import { makeId, symbolToPair } from "@/lib/ai-ui-helpers";
import {
  normalizeUiToken,
  parseWatchlistInput,
} from "@/lib/signal-formatters";
import AnalystErrorState from "./AnalystErrorState";
import AnalystLoadingState from "./AnalystLoadingState";
import AnalysisResultCard from "./AnalysisResultCard";
import CryptoComparePanel from "./CryptoComparePanel";
import WatchlistScoringPanel from "./WatchlistScoringPanel";

const ALL_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT', 'MATICUSDT',
  'NEARUSDT', 'ATOMUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT',
  'SUIUSDT', 'APTUSDT', 'LTCUSDT', 'TRXUSDT', 'DOGEUSDT',
  'TONUSDT', 'FILUSDT', 'AAVEUSDT', 'MKRUSDT', 'TIAUSDT'
];

const normalizeCompareToken = normalizeUiToken;

const computeEMA = (data, period, srcKey = 'close', destKey) => {
  const k = 2 / (period + 1);
  let ema = null;
  return data.map((d, i) => {
    const value = d[srcKey];
    if (i === 0) ema = value;
    else if (i < period) {
      const slice = data.slice(0, i + 1).map(x => x[srcKey]);
      ema = slice.reduce((s, x) => s + x, 0) / slice.length;
    } else if (i === period) {
      ema = data.slice(0, period).reduce((s, x) => s + x[srcKey], 0) / period;
    } else {
      ema = (value - ema) * k + ema;
    }
    return { ...d, [destKey]: ema };
  });
};

function useLiveTickers(symbols, intervalMs = 10000) {
  const [tickers, setTickers] = useState({});

  useEffect(() => {
    if (!symbols.length) return;
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const param = JSON.stringify(symbols);
        const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(param)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (cancelled) return;
        const map = {};
        data.forEach(t => { map[t.symbol] = t; });
        setTickers(map);
      } catch (e) {
        if (!cancelled) setTickers({});
      }
    };

    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [symbols.join(','), intervalMs]);

  return { tickers };
}

function useKlines(symbol, interval = '1d', limit = 200) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('klines error');
        const raw = await res.json();
        let parsed = raw.map(k => ({
          time: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]),
          low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5]),
        }));
        parsed = computeEMA(parsed, 50, 'close', 'ema50');
        parsed = computeEMA(parsed, 200, 'close', 'ema200');
        if (!cancelled) setData(parsed);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error loading klines');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [symbol, interval, limit]);

  return { data, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ANALYST — Análisis con IA usando Claude API
// ═══════════════════════════════════════════════════════════════════════════
export default function AnalystView({ selectedSymbol, setSelectedSymbol, watchlist, config,
                       metrics, analyses, saveAnalyses, setTradePrefill, setTab }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [compareTokenA, setCompareTokenA] = useState('BTC');
  const [compareTokenB, setCompareTokenB] = useState('ETH');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [compareSaveEnabled, setCompareSaveEnabled] = useState(true);
  const [compareSavedMessage, setCompareSavedMessage] = useState('');
  const [watchlistInput, setWatchlistInput] = useState(
    Array.isArray(watchlist)
      ? watchlist.map(normalizeUiToken).filter(Boolean).join(', ')
      : 'BTC, ETH, SOL, ADA'
  );
  const [watchlistScoringLoading, setWatchlistScoringLoading] = useState(false);
  const [watchlistScoringError, setWatchlistScoringError] = useState('');
  const [watchlistScoringResult, setWatchlistScoringResult] = useState(null);
  const [watchlistSaveEnabled, setWatchlistSaveEnabled] = useState(true);
  const [watchlistSavedMessage, setWatchlistSavedMessage] = useState('');

  // Live price + klines for context
  const { tickers } = useLiveTickers([selectedSymbol], 10000);
  const ticker = tickers[selectedSymbol];
  const { data: klines } = useKlines(selectedSymbol, '1d', 60);

  // Build market context for the AI
  const buildContext = () => {
    if (!ticker || !klines.length) return null;
    const last = klines[klines.length - 1];
    const price = parseFloat(ticker.lastPrice);
    const change24h = parseFloat(ticker.priceChangePercent);
    const high30 = Math.max(...klines.map(k => k.high));
    const low30  = Math.min(...klines.map(k => k.low));
    const closes = klines.map(k => k.close);
    const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i] * 100);
    const volatility = returns.length
      ? Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length)
      : 0;
    return {
      symbol: selectedSymbol,
      price,
      change24h,
      ema50: last.ema50,
      ema200: last.ema200,
      aboveEma50: price > last.ema50,
      aboveEma200: price > last.ema200,
      goldenCross: last.ema50 > last.ema200,
      high30, low30,
      volatility,
      volume24h: parseFloat(ticker.quoteVolume),
      recentCloses: closes.slice(-10).map(c => parseFloat(c.toFixed(c >= 100 ? 2 : 4))),
    };
  };

  const runAnalysis = async () => {
    const ctx = buildContext();
    if (!ctx) {
      setError('Datos de mercado no disponibles aún. Esperá unos segundos.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setActiveAnalysis(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ctx,
          metrics: {
            currentCapital: metrics.currentCapital,
            openCount: metrics.open.length,
          },
          config: {
            riskPctPerTrade: config.riskPctPerTrade,
            maxOpenPositions: config.maxOpenPositions,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `API ${response.status}`);
      }

      const data = await response.json();
      const parsed = data.analysis;

      const analysis = {
        id: makeId(),
        symbol: ctx.symbol,
        timestamp: new Date().toISOString(),
        contextSnapshot: ctx,
        ...parsed,
      };

      const updated = [analysis, ...analyses].slice(0, 50); // Keep last 50
      await saveAnalyses(updated);
      setActiveAnalysis(analysis);
    } catch (e) {
      setError(`Error: ${e.message}. Reintentá en unos segundos.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const runCryptoCompare = async () => {
    const tokenA = normalizeCompareToken(compareTokenA);
    const tokenB = normalizeCompareToken(compareTokenB);

    if (!tokenA || !tokenB) {
      setCompareError('Debes capturar ambos tokens.');
      return;
    }

    if (tokenA === tokenB) {
      setCompareError('Los tokens deben ser diferentes.');
      return;
    }

    setCompareTokenA(tokenA);
    setCompareTokenB(tokenB);
    setCompareLoading(true);
    setCompareError('');
    setCompareSavedMessage('');

    try {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenA,
          tokenB,
          context: {
            source: 'analyst-tab',
            mode: 'crypto-compare',
            educationalOnly: true,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo generar la comparación.');
      }

      if (!data?.comparison) {
        throw new Error('La API no devolvió una comparación válida.');
      }

      setCompareResult(data.comparison);
      setActiveAnalysis(null);

      if (compareSaveEnabled) {
        const savedAnalysis = {
          id: makeId(),
          type: 'crypto_compare',
          title: `${tokenA} vs ${tokenB}`,
          tokenA,
          tokenB,
          createdAt: new Date().toISOString(),
          result: data.comparison,
        };
        const updated = [savedAnalysis, ...analyses].slice(0, 50);
        await saveAnalyses(updated);
        setCompareSavedMessage('Comparación guardada en analyses.');
      }
    } catch (e) {
      setCompareError(e.message || 'Error desconocido.');
    } finally {
      setCompareLoading(false);
    }
  };

  const runWatchlistScoring = async () => {
    const rawTokens = String(watchlistInput || '')
      .split(/[,\n ]+/)
      .map(normalizeUiToken)
      .filter(Boolean);
    const tokens = parseWatchlistInput(watchlistInput);

    if (tokens.length < 2) {
      setWatchlistScoringError('Agrega al menos 2 tokens para rankear la watchlist.');
      return;
    }

    if (rawTokens.length !== tokens.length) {
      setWatchlistScoringError('Elimina tokens duplicados antes de rankear la watchlist.');
      return;
    }

    if (tokens.length > 25) {
      setWatchlistScoringError('Máximo 25 tokens por corrida para mantener el análisis estable.');
      return;
    }

    setWatchlistInput(tokens.join(', '));
    setWatchlistScoringLoading(true);
    setWatchlistScoringError('');
    setWatchlistSavedMessage('');

    try {
      const response = await fetch('/api/ai/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens,
          context: {
            source: 'watchlist-scoring-ui',
            mode: 'crypto-watchlist',
            educationalOnly: true,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo generar el scoring de la watchlist.');
      }

      if (!data?.watchlist?.assets?.length) {
        throw new Error('La API no devolvió activos rankeados.');
      }

      const sortedWatchlist = {
        ...data.watchlist,
        assets: [...data.watchlist.assets].sort(
          (a, b) => Number(b.compositeScore || 0) - Number(a.compositeScore || 0)
        ),
      };

      setWatchlistScoringResult(sortedWatchlist);
      setActiveAnalysis(null);

      if (watchlistSaveEnabled) {
        const savedSnapshot = {
          id: makeId(),
          type: 'crypto_watchlist_snapshot',
          title: `Watchlist Score — ${tokens.length} assets`,
          tokens,
          createdAt: new Date().toISOString(),
          result: sortedWatchlist,
        };
        const updated = [savedSnapshot, ...analyses].slice(0, 50);
        await saveAnalyses(updated);
        setWatchlistSavedMessage('Snapshot guardado en analyses.');
      }
    } catch (e) {
      setWatchlistScoringError(e.message || 'Error desconocido.');
    } finally {
      setWatchlistScoringLoading(false);
    }
  };

  const applyToTrade = (analysis) => {
    if (!analysis.setup?.valid) return;
    setTradePrefill({
      id: analysis.id,
      pair: analysis.symbol,
      direction: analysis.setup.direction,
      setup: `[AI] ${analysis.setup.rationale?.slice(0, 80) || analysis.summary?.slice(0, 80)}`,
      entry: analysis.setup.entry,
      stopLoss: analysis.setup.stopLoss,
      tp1: analysis.setup.tp1,
      tp2: analysis.setup.tp2,
      notes: `Análisis IA · ${new Date(analysis.timestamp).toLocaleString('es-MX')} · Confluencia ${analysis.confluence?.score}/10`,
    });
    setTab('new');
  };

  const deleteAnalysis = (id) => {
    if (!confirm('¿Eliminar este análisis?')) return;
    saveAnalyses(analyses.filter(a => a.id !== id));
    if (activeAnalysis?.id === id) setActiveAnalysis(null);
  };

  const openHistoryItem = (analysis) => {
    if (analysis.type === 'crypto_compare') {
      setActiveAnalysis(null);
      setCompareResult(analysis.result);
      setWatchlistScoringResult(null);
      setCompareTokenA(analysis.tokenA || analysis.result?.tokenA || 'BTC');
      setCompareTokenB(analysis.tokenB || analysis.result?.tokenB || 'ETH');
      setCompareError('');
      setCompareSavedMessage('');
      return;
    }
    if (analysis.type === 'crypto_watchlist_snapshot') {
      setActiveAnalysis(null);
      setCompareResult(null);
      setWatchlistScoringResult(analysis.result);
      setWatchlistInput(Array.isArray(analysis.tokens) ? analysis.tokens.join(', ') : watchlistInput);
      setWatchlistScoringError('');
      setWatchlistSavedMessage('');
      return;
    }
    setWatchlistScoringResult(null);
    setCompareResult(null);
    setActiveAnalysis(analysis);
  };

  // Show history of analyses for current symbol on top
  const symbolAnalyses = analyses.filter(a => a.symbol === selectedSymbol);
  const allWatchSymbols = [...new Set([...watchlist, ...ALL_PAIRS])];

  return (
    <div className="space-y-4">
      {/* Header / picker */}
      <div className="border border-zinc-800 bg-zinc-900/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <div className="text-[11px] tracking-[0.2em] text-zinc-300">AI ANALYST</div>
            <Sparkles className="w-3 h-3 text-cyan-400/60 ml-auto" />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            // análisis estructurado por Claude · alineado con tu plan · context-aware
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedSymbol}
              onChange={e => { setSelectedSymbol(e.target.value); setActiveAnalysis(null); }}
              className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm tabular focus:outline-none focus:border-cyan-500/50">
              {allWatchSymbols.map(s => (
                <option key={s} value={s}>{symbolToPair(s)}</option>
              ))}
            </select>
            <button onClick={runAnalysis} disabled={analyzing}
              className={`px-5 py-2.5 text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-2 transition-colors ${
                analyzing
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
              }`}>
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> ANALIZANDO...</>
              ) : (
                <><Brain className="w-4 h-4" /> ANALIZAR {symbolToPair(selectedSymbol)}</>
              )}
            </button>
          </div>

          {ticker && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                <div className="text-[9px] tracking-wider text-zinc-500">PRECIO</div>
                <div className="tabular text-zinc-100">${fmtPrice(ticker.lastPrice)}</div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                <div className="text-[9px] tracking-wider text-zinc-500">24H</div>
                <div className={`tabular ${parseFloat(ticker.priceChangePercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sign(parseFloat(ticker.priceChangePercent))}{fmt(ticker.priceChangePercent, 2)}%
                </div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                <div className="text-[9px] tracking-wider text-zinc-500">VOL 24H</div>
                <div className="tabular text-zinc-300">${fmtVolume(ticker.quoteVolume)}</div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                <div className="text-[9px] tracking-wider text-zinc-500">ANÁLISIS PREV</div>
                <div className="tabular text-zinc-300">{symbolAnalyses.length}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CryptoComparePanel
        tokenA={compareTokenA}
        tokenB={compareTokenB}
        setTokenA={setCompareTokenA}
        setTokenB={setCompareTokenB}
        loading={compareLoading}
        error={compareError}
        result={compareResult}
        saveEnabled={compareSaveEnabled}
        setSaveEnabled={setCompareSaveEnabled}
        savedMessage={compareSavedMessage}
        onCompare={runCryptoCompare}
      />

      <WatchlistScoringPanel
        input={watchlistInput}
        setInput={setWatchlistInput}
        loading={watchlistScoringLoading}
        error={watchlistScoringError}
        result={watchlistScoringResult}
        saveEnabled={watchlistSaveEnabled}
        setSaveEnabled={setWatchlistSaveEnabled}
        savedMessage={watchlistSavedMessage}
        onScore={runWatchlistScoring}
      />

      {/* Error */}
      <AnalystErrorState error={error} />

      {/* Loading */}
      {analyzing && <AnalystLoadingState />}

      {/* Active analysis */}
      {activeAnalysis && !analyzing && (
        <AnalysisResultCard
          analysis={activeAnalysis}
          onApply={() => applyToTrade(activeAnalysis)}
          onDelete={() => deleteAnalysis(activeAnalysis.id)}
          metrics={metrics}
          config={config}
        />
      )}

      {/* Empty state */}
      {!activeAnalysis && !compareResult && !watchlistScoringResult && !analyzing && !error && (
        <div className="border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <FileSearch className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <div className="text-zinc-300 text-sm mb-1">Sin análisis activo</div>
          <div className="text-zinc-500 text-xs">
            El analyst evalúa los filtros de tu plan y te propone un setup
            válido (o te dice por qué pasar).
          </div>
        </div>
      )}

      {/* History */}
      {analyses.length > 0 && (
        <div className="border border-zinc-800 bg-zinc-900/40">
          <button onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-left hover:bg-zinc-900/60">
            <div>
              <div className="text-[11px] tracking-[0.2em] text-zinc-300">HISTORIAL</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{analyses.length} análisis guardados</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          {showHistory && (
            <div className="divide-y divide-zinc-800">
              {analyses.map(a => (
                <button key={a.id}
                  onClick={() => openHistoryItem(a)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[10px] tracking-wider px-1.5 py-0.5 border whitespace-nowrap ${
                      a.type === 'crypto_watchlist_snapshot' ? 'border-violet-500/40 text-violet-300'
                      : a.type === 'crypto_compare' ? 'border-cyan-500/40 text-cyan-400'
                      : a.verdict === 'TRADE' ? 'border-emerald-500/40 text-emerald-400'
                      : a.verdict === 'WAIT' ? 'border-amber-500/40 text-amber-400'
                      : 'border-zinc-700 text-zinc-500'
                    }`}>
                      {a.type === 'crypto_watchlist_snapshot' ? 'WATCHLIST'
                        : a.type === 'crypto_compare' ? 'COMPARE' : a.verdict}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm tabular truncate">
                        {a.type === 'crypto_watchlist_snapshot' ? (a.title || 'Watchlist Score')
                          : a.type === 'crypto_compare' ? (a.title || `${a.tokenA} vs ${a.tokenB}`)
                          : symbolToPair(a.symbol)}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {new Date(a.timestamp || a.createdAt).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {a.type === 'crypto_watchlist_snapshot'
                          ? `${a.result?.assets?.length || 0} assets`
                          : a.type === 'crypto_compare'
                          ? `${a.result?.composite?.winner || 'Tie'} winner`
                          : `${a.bias} (${a.biasStrength}/10)`}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


