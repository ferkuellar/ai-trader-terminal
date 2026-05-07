"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import { localApiStorage } from "@/lib/storage-client";
import {
  TrendingUp, TrendingDown, Plus, AlertTriangle, Check, X, Trash2,
  Settings as SettingsIcon, BarChart3, FileText, Wallet, Target,
  Activity, ArrowUp, ArrowDown, Zap, Edit3, ChevronRight, Info,
  Calculator, Power, LineChart as LineIcon, Search, Wifi, WifiOff,
  Upload, Download, RefreshCw, Star, StarOff, Brain, Sparkles,
  Loader2, FileSearch, ChevronDown, BarChart2, Award, Skull,
  Flame, Clock, Trophy, Medal, Lock, Unlock, PlayCircle, PauseCircle,
  CheckCircle, XCircle, Calendar
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, ReferenceLine, CartesianGrid, ComposedChart, Bar,
  BarChart, Cell
} from "recharts";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  initialCapital: 1000,
  goalCapital: 5000,
  riskPctPerTrade: 1.5,
  maxOpenPositions: 3,
  maxPortfolioRiskPct: 6,
  dailyStopPct: 3,
  startDate: new Date().toISOString(),
};

const DEFAULT_WATCHLIST = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'ARBUSDT', 'OPUSDT'
];

const ALL_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT', 'MATICUSDT',
  'NEARUSDT', 'ATOMUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT',
  'SUIUSDT', 'APTUSDT', 'LTCUSDT', 'TRXUSDT', 'DOGEUSDT',
  'TONUSDT', 'FILUSDT', 'AAVEUSDT', 'MKRUSDT', 'TIAUSDT'
];

const TICKER_BAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

const EMOTIONS = [
  { id: 'calm',    label: 'CALMADO',  classes: 'border-emerald-500/40 text-emerald-400' },
  { id: 'focused', label: 'ENFOCADO', classes: 'border-cyan-500/40 text-cyan-400' },
  { id: 'doubt',   label: 'DUDOSO',   classes: 'border-amber-500/40 text-amber-400' },
  { id: 'fomo',    label: 'FOMO',     classes: 'border-red-500/40 text-red-400' },
  { id: 'revenge', label: 'REVENGE',  classes: 'border-red-600/60 text-red-500' },
];

const CHECKLIST = [
  'Tendencia daily alineada con mi dirección',
  'Trigger de entrada confirmado en 4H',
  'Stop loss en nivel técnico válido (no arbitrario)',
  'R:R mínimo a TP1 es ≥ 1.5',
  'Posición me deja bajo 6% de exposición total',
  'Trade documentado antes de ejecutar',
  'Buen estado mental (no FOMO, no revenge, no cansado)',
];

const CHALLENGE_TEMPLATES = [
  {
    id: 'personal_1k_5k',
    name: 'Personal $1k → $5k',
    description: 'Tu objetivo actual, swing trading conservador.',
    badge: 'PERSONAL',
    category: 'capital',
    difficulty: 'MEDIO',
    skill: 'Gestión de capital',
    config: { startCapital: 1000, targetPct: 400,
              maxDailyDDPct: 5, maxTotalDDPct: 15,
              minDays: 0, maxDays: 180 }
  },
  {
    id: 'ftmo_10k',
    name: 'FTMO Style 10K',
    description: '+8% target, -5% daily DD, -10% total. Min 4 días.',
    badge: 'PROP STYLE',
    category: 'prop',
    difficulty: 'MEDIO',
    skill: 'Reglas prop firm',
    config: { startCapital: 10000, targetPct: 8,
              maxDailyDDPct: 5, maxTotalDDPct: 10,
              minDays: 4, maxDays: 30 }
  },
  {
    id: 'fundednext',
    name: 'FundedNext Stellar 1-step',
    description: '+9% target, -5% daily, -10% total. 30 días.',
    badge: 'PROP STYLE',
    category: 'prop',
    difficulty: 'MEDIO',
    skill: 'Consistencia bajo límite',
    config: { startCapital: 10000, targetPct: 9,
              maxDailyDDPct: 5, maxTotalDDPct: 10,
              minDays: 0, maxDays: 30 }
  },
  {
    id: 'conservative',
    name: 'Crecimiento Conservador',
    description: '+25% en 90 días, max DD -5%. Slow & steady.',
    badge: 'EASY',
    category: 'capital',
    difficulty: 'FÁCIL',
    skill: 'Paciencia y drawdown',
    config: { startCapital: 1000, targetPct: 25,
              maxDailyDDPct: 2, maxTotalDDPct: 5,
              minDays: 20, maxDays: 90 }
  },
  {
    id: 'aggressive',
    name: 'Sprint Agresivo',
    description: '+50% en 30 días. Tolerancia DD alta. Riesgoso.',
    badge: 'HARD',
    category: 'capital',
    difficulty: 'DIFÍCIL',
    skill: 'Control bajo presión',
    config: { startCapital: 1000, targetPct: 50,
              maxDailyDDPct: 8, maxTotalDDPct: 20,
              minDays: 0, maxDays: 30 }
  },
  {
    id: 'discipline_10',
    name: '10 Trades con Plan',
    description: 'Cerrá 10 trades con mínimo 90% de cumplimiento del plan. P&L secundario.',
    badge: 'TRAINING',
    category: 'disciplina',
    difficulty: 'FÁCIL',
    skill: 'Ejecución sin improvisar',
    config: { startCapital: 1000, targetPct: 0,
              maxDailyDDPct: 3, maxTotalDDPct: 8,
              minDays: 0, maxDays: 30,
              objectiveType: 'plan_compliance', minTrades: 10,
              requiredPlanCompliancePct: 90 }
  },
  {
    id: 'risk_fixed_20',
    name: '20 Trades Riesgo Fijo',
    description: 'Entrenamiento para no subir tamaño por emoción. 20 trades, max DD -6%.',
    badge: 'TRAINING',
    category: 'riesgo',
    difficulty: 'MEDIO',
    skill: 'Riesgo constante',
    config: { startCapital: 1000, targetPct: 0,
              maxDailyDDPct: 2.5, maxTotalDDPct: 6,
              minDays: 0, maxDays: 45,
              objectiveType: 'trade_count', minTrades: 20,
              requiredPlanCompliancePct: 80 }
  },
  {
    id: 'revenge_control_7d',
    name: '7 Días Sin Revenge',
    description: 'Reto psicológico: operar solo setups documentados durante 7 días.',
    badge: 'MINDSET',
    category: 'psicologia',
    difficulty: 'MEDIO',
    skill: 'Control emocional',
    config: { startCapital: 1000, targetPct: 0,
              maxDailyDDPct: 2, maxTotalDDPct: 5,
              minDays: 7, maxDays: 7,
              objectiveType: 'safe_days', minTrades: 3,
              requiredPlanCompliancePct: 85 }
  },
  {
    id: 'a_plus_only',
    name: 'Solo Setups A+',
    description: '15 trades documentados, sin forzar entradas. Mide calidad del proceso.',
    badge: 'TRAINING',
    category: 'consistencia',
    difficulty: 'DIFÍCIL',
    skill: 'Selección de setups',
    config: { startCapital: 1000, targetPct: 0,
              maxDailyDDPct: 2.5, maxTotalDDPct: 7,
              minDays: 10, maxDays: 45,
              objectiveType: 'plan_compliance', minTrades: 15,
              requiredPlanCompliancePct: 95 }
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Configurá cada regla a tu medida.',
    badge: 'CUSTOM',
    category: 'custom',
    difficulty: 'CUSTOM',
    skill: 'Diseño propio',
    config: null,
  }
];

const ACHIEVEMENTS = [
  { id: 'first_trade',     name: 'Primer Trade',          desc: 'Cerraste tu primer trade' },
  { id: 'first_win',       name: 'Primera Victoria',      desc: 'Cerraste tu primer trade ganador' },
  { id: 'plan_compliance_5', name: 'Disciplina',           desc: '5 trades seguidos según plan' },
  { id: 'plan_compliance_10', name: 'Soldado',             desc: '10 trades seguidos según plan' },
  { id: 'r3_trade',        name: 'Runner Hunter',         desc: 'Trade cerrado con +3R o más' },
  { id: 'first_challenge', name: 'Reto Iniciado',         desc: 'Empezaste tu primer reto' },
  { id: 'challenge_passed', name: 'Reto Superado',        desc: 'Pasaste un reto completo' },
  { id: 'challenge_passed_3', name: 'Hat-trick',          desc: 'Pasaste 3 retos' },
  { id: 'no_violation_30', name: 'Acero',                  desc: '30 días sin violación de reglas' },
];

const INTERVALS = [
  { id: '1h',  label: '1H'  },
  { id: '4h',  label: '4H'  },
  { id: '1d',  label: '1D'  },
  { id: '1w',  label: '1W'  },
];

const I18N = {
  es: {
    loadingTerminal: '// INICIANDO TERMINAL...',
    connectingBinance: '// CONECTANDO A BINANCE PUBLIC API...',
    currentCapital: 'CAPITAL ACTUAL',
    goal: 'META',
    completed: 'completado',
    dashboard: 'DASH',
    markets: 'MARKETS',
    chart: 'CHART',
    analyst: 'ANALYST',
    challenges: 'RETOS',
    newTrade: 'NUEVO',
    journal: 'JOURNAL',
    stats: 'STATS',
    settings: 'CONFIG',
    activeChallenge: 'RETO ACTIVO',
    progress: 'PROGRESO',
    dailyDd: 'DAILY DD',
    totalDd: 'TOTAL DD',
    used: 'usado',
    achievements: 'LOGROS',
    noTradesTitle: '// SISTEMA INICIADO',
    noTradesBody: 'No tenés trades registrados todavía.',
    currentRiskPerTrade: 'Tu riesgo por trade actual es',
    exploreMarkets: 'EXPLORAR MARKETS',
    guardrailViolated: '// GUARDRAIL VIOLADO',
    exposedRisk: 'Riesgo expuesto',
    limit: 'límite',
    openPositions: 'posiciones abiertas',
    max: 'máximo',
    performanceTerminal: 'PERFORMANCE TERMINAL',
    totalTrades: 'TOTAL TRADES',
    closed: 'cerrados',
    open: 'abiertos',
    winRate: 'WIN RATE',
    noSample: 'sin muestra',
    profitFactor: 'PROFIT FACTOR',
    grossRatio: 'gross win / gross loss',
    avgR: 'R PROMEDIO',
    perClosedTrade: 'por trade cerrado',
    totalPnl: 'P&L TOTAL',
    equity: 'equity',
    openRisk: 'RIESGO ABIERTO',
    capitalPct: 'del capital',
    planCompliance: 'CUMPL. PLAN',
    operatingDiscipline: 'disciplina operativa',
    remainingGoal: 'META RESTANTE',
    pending: 'pendiente',
    equityCurve: 'EQUITY CURVE',
    equityCurveSub: 'Capital a lo largo del tiempo',
    openPositionsPanel: 'POSICIONES ABIERTAS',
    lastClosedTrades: 'ÚLTIMOS TRADES CERRADOS',
    trainingCommandCenter: 'TRAINING COMMAND CENTER',
    processDisciplineAction: 'Proceso, disciplina y siguiente acción',
    seeChallenges: 'VER RETOS',
    readinessScore: 'READINESS SCORE',
    disciplineLevel: 'DISCIPLINE LEVEL',
    mistakeTax: 'MISTAKE TAX',
    nextBestChallenge: 'NEXT BEST CHALLENGE',
    riskRemainingToday: 'RISK REMAINING TODAY',
    dailyBudget: 'Daily budget',
    planComplianceCheck: 'Plan compliance',
    riskRoomToday: 'Risk room today',
    openRiskWithinLimit: 'Open risk within limit',
    activeChallengeSafe: 'Active challenge safe',
    enoughProcessData: 'Enough process data',
    noTrade: 'NO TRADE',
    caution: 'CAUTION',
    ready: 'READY',
    confidenceRegistro: 'Registro',
    confidenceDisciplina: 'Disciplina',
    confidenceRiesgo: 'Riesgo',
    confidenceConsistencia: 'Consistencia',
    confidenceEscalamiento: 'Escalamiento',
    noData: 'Sin muestra',
    nextDiscipline10Name: '10 Trades con Plan',
    nextDiscipline10ReasonLowSample: 'Necesitás muestra y hábito de registro.',
    nextDiscipline10ReasonCompliance: 'Tu cuello de botella es disciplina de ejecución.',
    nextRiskFixed20Name: '20 Trades Riesgo Fijo',
    nextRiskFixed20Reason: 'Hay fuga de riesgo o costo por errores.',
    nextNoRevenge7Name: '7 Días Sin Revenge',
    nextNoRevenge7Reason: 'Se detectaron emociones de alto riesgo.',
    nextAPlusOnlyName: 'Solo Setups A+',
    nextAPlusOnlyReason: 'Ya toca subir calidad, no cantidad.',
  },
  en: {
    loadingTerminal: '// STARTING TERMINAL...',
    connectingBinance: '// CONNECTING TO BINANCE PUBLIC API...',
    currentCapital: 'CURRENT CAPITAL',
    goal: 'GOAL',
    completed: 'completed',
    dashboard: 'DASH',
    markets: 'MARKETS',
    chart: 'CHART',
    analyst: 'ANALYST',
    challenges: 'CHALLENGES',
    newTrade: 'NEW',
    journal: 'JOURNAL',
    stats: 'STATS',
    settings: 'CONFIG',
    activeChallenge: 'ACTIVE CHALLENGE',
    progress: 'PROGRESS',
    dailyDd: 'DAILY DD',
    totalDd: 'TOTAL DD',
    used: 'used',
    achievements: 'ACHIEVEMENTS',
    noTradesTitle: '// SYSTEM ONLINE',
    noTradesBody: 'You do not have registered trades yet.',
    currentRiskPerTrade: 'Your current risk per trade is',
    exploreMarkets: 'EXPLORE MARKETS',
    guardrailViolated: '// GUARDRAIL VIOLATED',
    exposedRisk: 'Exposed risk',
    limit: 'limit',
    openPositions: 'open positions',
    max: 'max',
    performanceTerminal: 'PERFORMANCE TERMINAL',
    totalTrades: 'TOTAL TRADES',
    closed: 'closed',
    open: 'open',
    winRate: 'WIN RATE',
    noSample: 'no sample',
    profitFactor: 'PROFIT FACTOR',
    grossRatio: 'gross win / gross loss',
    avgR: 'AVG R',
    perClosedTrade: 'per closed trade',
    totalPnl: 'TOTAL P&L',
    equity: 'equity',
    openRisk: 'OPEN RISK',
    capitalPct: 'of capital',
    planCompliance: 'PLAN COMPLIANCE',
    operatingDiscipline: 'operating discipline',
    remainingGoal: 'REMAINING GOAL',
    pending: 'pending',
    equityCurve: 'EQUITY CURVE',
    equityCurveSub: 'Capital over time',
    openPositionsPanel: 'OPEN POSITIONS',
    lastClosedTrades: 'LAST CLOSED TRADES',
    trainingCommandCenter: 'TRAINING COMMAND CENTER',
    processDisciplineAction: 'Process, discipline, and next action',
    seeChallenges: 'SEE CHALLENGES',
    readinessScore: 'READINESS SCORE',
    disciplineLevel: 'DISCIPLINE LEVEL',
    mistakeTax: 'MISTAKE TAX',
    nextBestChallenge: 'NEXT BEST CHALLENGE',
    riskRemainingToday: 'RISK REMAINING TODAY',
    dailyBudget: 'Daily budget',
    planComplianceCheck: 'Plan compliance',
    riskRoomToday: 'Risk room today',
    openRiskWithinLimit: 'Open risk within limit',
    activeChallengeSafe: 'Active challenge safe',
    enoughProcessData: 'Enough process data',
    noTrade: 'NO TRADE',
    caution: 'CAUTION',
    ready: 'READY',
    confidenceRegistro: 'Logging',
    confidenceDisciplina: 'Discipline',
    confidenceRiesgo: 'Risk',
    confidenceConsistencia: 'Consistency',
    confidenceEscalamiento: 'Scaling',
    noData: 'No sample',
    nextDiscipline10Name: '10 Trades with Plan',
    nextDiscipline10ReasonLowSample: 'You need sample size and a logging habit.',
    nextDiscipline10ReasonCompliance: 'Your bottleneck is execution discipline.',
    nextRiskFixed20Name: '20 Trades Fixed Risk',
    nextRiskFixed20Reason: 'There is risk leakage or cost from mistakes.',
    nextNoRevenge7Name: '7 Days No Revenge',
    nextNoRevenge7Reason: 'High-risk emotions were detected.',
    nextAPlusOnlyName: 'A+ Setups Only',
    nextAPlusOnlyReason: 'Time to raise quality, not quantity.',
  },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
const fmt = (n, d = 2) =>
  Number(n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: d, maximumFractionDigits: d
  });

const fmtUsd = (n, d = 2) => `$${fmt(n, d)}`;

const fmtPrice = (n) => {
  const v = Number(n);
  if (v >= 1000) return fmt(v, 2);
  if (v >= 1) return fmt(v, 4);
  return fmt(v, 6);
};

const fmtVolume = (n) => {
  const v = Number(n);
  if (v >= 1e9) return `${fmt(v / 1e9, 2)}B`;
  if (v >= 1e6) return `${fmt(v / 1e6, 2)}M`;
  if (v >= 1e3) return `${fmt(v / 1e3, 2)}K`;
  return fmt(v, 0);
};

const colorPnL = (n) =>
  n > 0 ? 'text-emerald-400' : n < 0 ? 'text-red-400' : 'text-zinc-400';

const sign = (n) => (n > 0 ? '+' : '');

const symbolToPair = (s) => s.replace('USDT', '/USDT');
const pairToSymbol = (p) => p.replace('/', '');
const normalizeUiToken = (value) =>
  String(value || '')
    .trim()
    .replace(/^\//, '')
    .replace(/\/USDT$/i, '')
    .replace(/USDT$/i, '')
    .toUpperCase();
const normalizeCompareToken = normalizeUiToken;

const parseWatchlistInput = (value) =>
  String(value || '')
    .split(/[,\n ]+/)
    .map(normalizeUiToken)
    .filter(Boolean)
    .filter((token, index, arr) => arr.indexOf(token) === index);

const riskClass = (risk) => {
  if (risk === 'Low') return 'text-emerald-400';
  if (risk === 'Medium') return 'text-amber-400';
  if (risk === 'High') return 'text-red-400';
  return 'text-zinc-400';
};

const watchlistSignalClass = (signal) => {
  if (signal === 'BUY') return 'text-emerald-400';
  if (signal === 'ACCUMULATE') return 'text-cyan-400';
  if (signal === 'HOLD') return 'text-zinc-300';
  if (signal === 'WATCH') return 'text-amber-400';
  if (signal === 'AVOID') return 'text-red-400';
  return 'text-zinc-400';
};

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// EMA computation
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

// ─── HOOKS: Live Binance Data ──────────────────────────────────────────────
function useLiveTickers(symbols, intervalMs = 10000) {
  const [tickers, setTickers] = useState({});
  const [status, setStatus] = useState('connecting'); // connecting | live | error

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
        setStatus('live');
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    };

    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [symbols.join(','), intervalMs]);

  return { tickers, status };
}

function useKlines(symbol, interval = '1d', limit = 200) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch_ = async () => {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Klines error');
        const raw = await res.json();
        if (cancelled) return;

        const parsed = raw.map(k => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          date: new Date(k[0]).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
        }));

        let withEMAs = computeEMA(parsed, 50, 'close', 'ema50');
        withEMAs = computeEMA(withEMAs, 200, 'close', 'ema200');

        setData(withEMAs);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    fetch_();
    return () => { cancelled = true; };
  }, [symbol, interval, limit]);

  return { data, loading, error };
}

function useBinanceSpotSymbols() {
  const [symbols, setSymbols] = useState(ALL_PAIRS);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        if (!res.ok) throw new Error('exchangeInfo error');
        const data = await res.json();
        if (cancelled) return;
        const next = data.symbols
          .filter(s => s.status === 'TRADING'
            && s.quoteAsset === 'USDT'
            && s.isSpotTradingAllowed !== false)
          .map(s => s.symbol)
          .sort((a, b) => a.localeCompare(b));
        setSymbols([...new Set([...ALL_PAIRS, ...next])]);
        setStatus('live');
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return { symbols, status };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function TradingTerminal() {
  const [config, setConfig]     = useState(DEFAULT_CONFIG);
  const [trades, setTrades]     = useState([]);
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [analyses, setAnalyses] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tradePrefill, setTradePrefill] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('dashboard');
  const [editingTrade, setEditingTrade] = useState(null);
  const [language, setLanguage] = useState('es');
  const t = (key) => I18N[language]?.[key] || I18N.es[key] || key;

  // Load persisted state
  useEffect(() => {
    const load = async () => {
      try { const c = await localApiStorage.get('config');
            if (c?.value) setConfig(JSON.parse(c.value)); } catch(e){}
      try { const t = await localApiStorage.get('trades');
            if (t?.value) setTrades(JSON.parse(t.value)); } catch(e){}
      try { const w = await localApiStorage.get('watchlist');
            if (w?.value) setWatchlist(JSON.parse(w.value)); } catch(e){}
      try { const a = await localApiStorage.get('analyses');
            if (a?.value) setAnalyses(JSON.parse(a.value)); } catch(e){}
      try { const ch = await localApiStorage.get('challenges');
            if (ch?.value) setChallenges(JSON.parse(ch.value)); } catch(e){}
      try { const ach = await localApiStorage.get('achievements');
            if (ach?.value) setAchievements(JSON.parse(ach.value)); } catch(e){}
      try {
        const savedLanguage = window.localStorage.getItem('language');
        if (savedLanguage === 'en' || savedLanguage === 'es') setLanguage(savedLanguage);
      } catch(e){}
      setLoading(false);
    };
    load();
  }, []);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    try { window.localStorage.setItem('language', nextLanguage); } catch(e){}
    document.documentElement.lang = nextLanguage;
  };

  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    try { await localApiStorage.set('config', JSON.stringify(newConfig)); } catch(e){}
  };
  const saveTrades = async (newTrades) => {
    setTrades(newTrades);
    try { await localApiStorage.set('trades', JSON.stringify(newTrades)); } catch(e){}
  };
  const saveWatchlist = async (newList) => {
    setWatchlist(newList);
    try { await localApiStorage.set('watchlist', JSON.stringify(newList)); } catch(e){}
  };
  const saveAnalyses = async (newList) => {
    setAnalyses(newList);
    try { await localApiStorage.set('analyses', JSON.stringify(newList)); } catch(e){}
  };
  const saveChallenges = async (newList) => {
    setChallenges(newList);
    try { await localApiStorage.set('challenges', JSON.stringify(newList)); } catch(e){}
  };
  const saveAchievements = async (newList) => {
    setAchievements(newList);
    try { await localApiStorage.set('achievements', JSON.stringify(newList)); } catch(e){}
  };

  // Active challenge (single in-progress one)
  const activeChallenge = useMemo(() =>
    challenges.find(c => c.status === 'in_progress') || null,
  [challenges]);

  // Real-time evaluation of active challenge
  const challengeEval = useMemo(() => {
    if (!activeChallenge) return null;
    return evaluateChallenge(activeChallenge, trades);
  }, [activeChallenge, trades]);

  // Auto-update challenge status based on evaluation
  useEffect(() => {
    if (!activeChallenge || !challengeEval) return;
    if (challengeEval.newStatus !== activeChallenge.status) {
      const updated = challenges.map(c =>
        c.id === activeChallenge.id
          ? { ...c, status: challengeEval.newStatus,
              violations: challengeEval.newViolations,
              endDate: ['passed','failed','abandoned'].includes(challengeEval.newStatus)
                ? new Date().toISOString() : c.endDate,
              finalEquity: challengeEval.currentEquity }
          : c
      );
      saveChallenges(updated);
    }
  }, [challengeEval?.newStatus, activeChallenge?.id]);

  // Detect new achievements
  useEffect(() => {
    if (loading) return;
    const earnedIds = new Set(achievements.map(a => a.id));
    const newOnes = detectAchievements(trades, challenges).filter(
      a => !earnedIds.has(a.id));
    if (newOnes.length > 0) {
      saveAchievements([...achievements, ...newOnes.map(a => ({
        ...a, earnedAt: new Date().toISOString()
      }))]);
    }
  }, [trades, challenges, loading]);

  // Live data for ticker bar
  const { tickers: tickerBarData, status: tickerStatus } = useLiveTickers(TICKER_BAR_SYMBOLS, 10000);

  // ─── METRICS ────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const closed = trades.filter(t => t.status === 'closed');
    const open = trades.filter(t => t.status === 'open');
    const wins = closed.filter(t => t.pnl > 0);
    const losses = closed.filter(t => t.pnl <= 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
    const totalWon = wins.reduce((s, t) => s + t.pnl, 0);
    const totalLost = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
    const profitFactor = totalLost > 0 ? totalWon / totalLost : (totalWon > 0 ? Infinity : 0);
    const avgR = closed.length
      ? closed.reduce((s, t) => s + (t.rResult || 0), 0) / closed.length : 0;
    const planCompliance = closed.length
      ? (closed.filter(t => t.followedPlan).length / closed.length) * 100 : 0;
    const currentCapital = config.initialCapital + totalPnl;
    const progressPct = ((currentCapital - config.initialCapital) /
                         (config.goalCapital - config.initialCapital)) * 100;
    const openRisk = open.reduce((s, t) => s + (t.riskAmount || 0), 0);
    const openRiskPct = currentCapital > 0 ? (openRisk / currentCapital) * 100 : 0;

    let running = config.initialCapital;
    const curve = [{ idx: 0, capital: running, label: 'Inicio' }];
    [...closed].sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt))
      .forEach((t, i) => {
        running += t.pnl;
        curve.push({ idx: i + 1, capital: running, label: t.pair });
      });

    return { closed, open, wins, losses, totalPnl, winRate, profitFactor,
             avgR, planCompliance, currentCapital, progressPct,
             openRisk, openRiskPct, curve };
  }, [trades, config]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-400 text-sm tracking-[0.3em] animate-pulse">
          {t('loadingTerminal')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="grid-bg min-h-screen">
        <TickerBar tickers={tickerBarData} status={tickerStatus} t={t} />
        <Header config={config} metrics={metrics} status={tickerStatus}
                activeChallenge={activeChallenge} challengeEval={challengeEval}
                language={language} setLanguage={changeLanguage} t={t} />
        <TabNav tab={tab} setTab={setTab} activeChallenge={activeChallenge} t={t} />

        <main className="max-w-6xl mx-auto px-3 sm:px-6 pb-24 pt-5">
          {tab === 'dashboard' && (
            <Dashboard config={config} metrics={metrics} trades={trades}
                       setTab={setTab} activeChallenge={activeChallenge}
                       challengeEval={challengeEval} achievements={achievements} t={t} />
          )}
          {tab === 'markets' && (
            <Markets watchlist={watchlist} saveWatchlist={saveWatchlist}
                     setSelectedSymbol={setSelectedSymbol} setTab={setTab} />
          )}
          {tab === 'chart' && (
            <ChartView selectedSymbol={selectedSymbol}
                       setSelectedSymbol={setSelectedSymbol}
                       trades={trades} watchlist={watchlist}
                       setTab={setTab} />
          )}
          {tab === 'analyst' && (
            <AnalystView
              selectedSymbol={selectedSymbol}
              setSelectedSymbol={setSelectedSymbol}
              watchlist={watchlist}
              config={config}
              metrics={metrics}
              analyses={analyses}
              saveAnalyses={saveAnalyses}
              setTradePrefill={setTradePrefill}
              setTab={setTab}
            />
          )}
          {tab === 'challenges' && (
            <ChallengesView
              challenges={challenges}
              saveChallenges={saveChallenges}
              activeChallenge={activeChallenge}
              challengeEval={challengeEval}
              trades={trades}
              setTab={setTab}
            />
          )}
          {tab === 'new' && (
            <NewTrade config={config} metrics={metrics} trades={trades}
                      saveTrades={saveTrades} onDone={() => setTab('trades')}
                      defaultPair={selectedSymbol}
                      prefill={tradePrefill}
                      clearPrefill={() => setTradePrefill(null)}
                      activeChallenge={activeChallenge}
                      challengeEval={challengeEval} />
          )}
          {tab === 'trades' && (
            <TradesList trades={trades} saveTrades={saveTrades}
                        setEditingTrade={setEditingTrade} />
          )}
          {tab === 'stats' && (
            <AnalyticsView trades={trades} config={config} metrics={metrics} />
          )}
          {tab === 'settings' && (
            <Settings config={config} saveConfig={saveConfig}
                      trades={trades} saveTrades={saveTrades}
                      watchlist={watchlist} analyses={analyses}
                      challenges={challenges} achievements={achievements} />
          )}
        </main>

        {editingTrade && (
          <CloseTradeModal trade={editingTrade} trades={trades}
            saveTrades={saveTrades} onClose={() => setEditingTrade(null)} />
        )}

        <Footer status={tickerStatus} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TICKER BAR (top scrolling prices)
// ═══════════════════════════════════════════════════════════════════════════
function TickerBar({ tickers, status, t }) {
  const items = TICKER_BAR_SYMBOLS.map(s => tickers[s]).filter(Boolean);
  if (!items.length) {
    return (
      <div className="bg-zinc-900/80 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-1.5 text-[10px] tracking-wider text-zinc-500">
          {t('connectingBinance')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 border-b border-zinc-800 overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-1.5 flex items-center gap-3 text-[11px] tabular">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hidden">
          {items.map(ticker => {
            const change = parseFloat(ticker.priceChangePercent);
            return (
              <div key={ticker.symbol} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-zinc-500">{ticker.symbol.replace('USDT', '')}</span>
                <span className="text-zinc-200">${fmtPrice(ticker.lastPrice)}</span>
                <span className={change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {sign(change)}{fmt(change, 2)}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5 text-[10px] text-zinc-500">
          {status === 'live' && (
            <><Wifi className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">LIVE</span></>
          )}
          {status === 'connecting' && (
            <><RefreshCw className="w-3 h-3 animate-spin" /> CONN</>
          )}
          {status === 'error' && (
            <><WifiOff className="w-3 h-3 text-red-400" /> <span className="text-red-400">ERR</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════
function Header({ config, metrics, activeChallenge, challengeEval, language, setLanguage, t }) {
  const { currentCapital, totalPnl, progressPct } = metrics;
  const pct = Math.max(0, Math.min(100, progressPct));

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-soft" />
            <span className="text-[10px] tracking-[0.3em] text-zinc-500">
              TRADING.TERMINAL // FERNANDO
            </span>
            {activeChallenge && challengeEval && (
              <span className="ml-2 text-[10px] tracking-wider px-1.5 py-0.5 border border-amber-500/40 text-amber-400 inline-flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5" />
                {activeChallenge.name.slice(0, 25)} · {fmt(challengeEval.progressPct, 0)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle language={language} setLanguage={setLanguage} />
            <span className="text-[10px] tracking-[0.2em] text-zinc-600 hidden sm:block tabular">
              {new Date().toLocaleString(language === 'en' ? 'en-US' : 'es-MX', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-zinc-500 mb-1">
              {t('currentCapital')}
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-3xl sm:text-5xl font-bold tabular text-amber-400 tracking-tight">
                {fmtUsd(currentCapital)}
              </div>
              <div className={`text-sm sm:text-base tabular font-semibold ${colorPnL(totalPnl)}`}>
                {sign(totalPnl)}{fmtUsd(totalPnl)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="text-[10px] tracking-[0.3em] text-zinc-500">
              {t('goal')}: {fmtUsd(config.goalCapital, 0)}
            </div>
            <div className="text-xs tabular text-zinc-300">{fmt(pct, 1)}% {t('completed')}</div>
          </div>
        </div>

        <div className="mt-4 relative h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-700"
               style={{ width: `${pct}%` }} />
          {[20, 50, 80].map(p => (
            <div key={p} className="absolute inset-y-0" style={{ left: `${p}%` }}>
              <div className="w-px h-full bg-zinc-700" />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[9px] tracking-wider text-zinc-600 tabular">
          <span>${fmt(config.initialCapital, 0)}</span>
          <span>$2K</span><span>$3K</span><span>$4K</span>
          <span className="text-amber-500">${fmt(config.goalCapital, 0)}</span>
        </div>
      </div>
    </header>
  );
}

function LanguageToggle({ language, setLanguage }) {
  return (
    <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="relative h-7 w-20 border border-zinc-800 bg-zinc-950 px-1 text-[10px] font-bold tracking-[0.16em] text-zinc-500">
      <span className={`absolute top-1 h-5 w-9 bg-amber-500 transition-all ${
        language === 'en' ? 'left-10' : 'left-1'
      }`} />
      <span className={`relative z-10 inline-flex h-full w-1/2 items-center justify-center ${
        language === 'es' ? 'text-zinc-950' : 'text-zinc-500'
      }`}>ES</span>
      <span className={`relative z-10 inline-flex h-full w-1/2 items-center justify-center ${
        language === 'en' ? 'text-zinc-950' : 'text-zinc-500'
      }`}>EN</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAV
// ═══════════════════════════════════════════════════════════════════════════
function TabNav({ tab, setTab, activeChallenge, t }) {
  const tabs = [
    { id: 'dashboard', label: t('dashboard'),    icon: BarChart3 },
    { id: 'markets',   label: t('markets'),      icon: Activity  },
    { id: 'chart',     label: t('chart'),        icon: LineIcon  },
    { id: 'analyst',   label: t('analyst'),      icon: Brain     },
    { id: 'challenges',label: t('challenges'),   icon: Trophy, badge: activeChallenge ? '●' : null },
    { id: 'new',       label: t('newTrade'),     icon: Plus      },
    { id: 'trades',    label: t('journal'),      icon: FileText  },
    { id: 'stats',     label: t('stats'),        icon: BarChart2 },
    { id: 'settings',  label: t('settings'),     icon: SettingsIcon },
  ];

  return (
    <nav className="border-b border-zinc-800/80 bg-zinc-950/90 sticky top-[145px] sm:top-[157px] z-20">
      <div className="max-w-6xl mx-auto px-1 sm:px-6 overflow-x-auto scrollbar-hidden">
        <div className="flex min-w-max">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] tracking-[0.2em] transition-colors ${
                  active ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}>
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{label}</span>
                {tabs.find(t => t.id === id)?.badge && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] text-amber-400 pulse-soft">●</span>
                )}
                {active && <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ config, metrics, trades, setTab, activeChallenge, challengeEval, achievements, t }) {
  const { closed, open, winRate, profitFactor, avgR, planCompliance,
          openRisk, openRiskPct, totalPnl, curve } = metrics;
  const overRisk = openRiskPct > config.maxPortfolioRiskPct;
  const tooMany = open.length > config.maxOpenPositions;
  const goalRemaining = Math.max(0, config.goalCapital - metrics.currentCapital);
  const goalRemainingPct = Math.max(0, 100 - Math.max(0, Math.min(100, metrics.progressPct)));
  const offPlan = closed.filter(t => t.followedPlan === false);
  const onPlan = closed.filter(t => t.followedPlan === true);
  const mistakeTax = offPlan.reduce((s, t) => s + (t.pnl || 0), 0);
  const onPlanAvgR = onPlan.length ? onPlan.reduce((s, t) => s + (t.rResult || 0), 0) / onPlan.length : 0;
  const offPlanAvgR = offPlan.length ? offPlan.reduce((s, t) => s + (t.rResult || 0), 0) / offPlan.length : 0;
  const todayOpenRisk = open.reduce((s, t) => {
    const d = new Date(t.date);
    const now = new Date();
    return d.toDateString() === now.toDateString() ? s + (t.riskAmount || 0) : s;
  }, 0);
  const todayClosedPnl = closed.reduce((s, t) => {
    const d = new Date(t.closedAt || t.date);
    const now = new Date();
    return d.toDateString() === now.toDateString() ? s + (t.pnl || 0) : s;
  }, 0);
  const dailyRiskBudget = metrics.currentCapital * config.dailyStopPct / 100;
  const riskRemainingToday = Math.max(0, dailyRiskBudget + Math.min(0, todayClosedPnl) - todayOpenRisk);
  const sampleOk = closed.length >= 20;
  const edgeOk = avgR > 0.1 && profitFactor > 1.2;
  const disciplineOk = planCompliance >= 80;
  const riskOk = openRiskPct <= config.maxPortfolioRiskPct && !overRisk && !tooMany;
  const consistencyOk = closed.length >= 10 && profitFactor >= 1 && avgR >= 0;
  const confidenceLevel = [closed.length > 0, disciplineOk, riskOk, sampleOk && edgeOk, sampleOk && edgeOk && consistencyOk].filter(Boolean).length;
  const readinessChecks = [
    { label: t('planComplianceCheck'), pass: !closed.length || planCompliance >= 70 },
    { label: t('riskRoomToday'), pass: riskRemainingToday > 0 },
    { label: t('openRiskWithinLimit'), pass: riskOk },
    { label: t('activeChallengeSafe'), pass: !challengeEval || (challengeEval.dailyDDUsedPct < 80 && challengeEval.totalDDUsedPct < 80) },
    { label: t('enoughProcessData'), pass: closed.length >= 5 },
  ];
  const readinessScore = Math.round((readinessChecks.filter(c => c.pass).length / readinessChecks.length) * 100);
  const nextChallenge = (() => {
    if (closed.length < 5) return { name: t('nextDiscipline10Name'), reason: t('nextDiscipline10ReasonLowSample'), templateId: 'discipline_10' };
    if (planCompliance < 75) return { name: t('nextDiscipline10Name'), reason: t('nextDiscipline10ReasonCompliance'), templateId: 'discipline_10' };
    if (openRiskPct > config.maxPortfolioRiskPct * 0.7 || mistakeTax < 0) return { name: t('nextRiskFixed20Name'), reason: t('nextRiskFixed20Reason'), templateId: 'risk_fixed_20' };
    if (closed.some(trade => ['fomo', 'revenge'].includes(trade.emotion))) return { name: t('nextNoRevenge7Name'), reason: t('nextNoRevenge7Reason'), templateId: 'revenge_control_7d' };
    return { name: t('nextAPlusOnlyName'), reason: t('nextAPlusOnlyReason'), templateId: 'a_plus_only' };
  })();
  const dashboardMetrics = [
    {
      label: t('totalTrades'),
      symbol: 'TRD',
      value: trades.length,
      sub: `${closed.length} ${t('closed')} · ${open.length} ${t('open')}`,
      tone: 'cyan',
      meter: Math.min(100, trades.length * 5),
      icon: BarChart3,
      signal: trades.length ? 'ACTIVE' : 'IDLE',
    },
    {
      label: t('winRate'),
      symbol: 'WIN',
      value: `${fmt(winRate, 1)}%`,
      sub: closed.length ? `${metrics.wins.length}W / ${metrics.losses.length}L` : t('noSample'),
      tone: winRate >= 50 ? 'emerald' : winRate >= 40 ? 'amber' : winRate > 0 ? 'red' : 'zinc',
      meter: Math.min(100, winRate),
      icon: Target,
      signal: winRate >= 50 ? 'EDGE' : winRate > 0 ? 'WATCH' : 'WAIT',
    },
    {
      label: t('profitFactor'),
      symbol: 'PF',
      value: profitFactor === Infinity ? '∞' : fmt(profitFactor, 2),
      sub: t('grossRatio'),
      tone: profitFactor >= 1.5 || profitFactor === Infinity ? 'emerald' : profitFactor >= 1 ? 'amber' : 'red',
      meter: profitFactor === Infinity ? 100 : Math.min(100, profitFactor * 40),
      icon: TrendingUp,
      signal: profitFactor >= 1.5 || profitFactor === Infinity ? 'BULL' : profitFactor >= 1 ? 'FLAT' : 'BEAR',
    },
    {
      label: t('avgR'),
      symbol: 'AVG R',
      value: `${sign(avgR)}${fmt(avgR, 2)}R`,
      sub: t('perClosedTrade'),
      tone: avgR > 0 ? 'emerald' : avgR < 0 ? 'red' : 'zinc',
      meter: Math.min(100, Math.abs(avgR) * 60),
      icon: Activity,
      signal: avgR > 0 ? 'POS' : avgR < 0 ? 'NEG' : 'NEUTRAL',
    },
    {
      label: t('totalPnl'),
      symbol: 'PNL',
      value: `${sign(totalPnl)}${fmtUsd(totalPnl)}`,
      sub: `${t('equity')} ${fmtUsd(metrics.currentCapital)}`,
      tone: totalPnl > 0 ? 'emerald' : totalPnl < 0 ? 'red' : 'zinc',
      meter: Math.min(100, Math.abs(metrics.progressPct)),
      icon: Wallet,
      signal: totalPnl > 0 ? 'UP' : totalPnl < 0 ? 'DOWN' : 'FLAT',
    },
    {
      label: t('openRisk'),
      symbol: 'RISK',
      value: fmtUsd(openRisk),
      sub: `${fmt(openRiskPct, 1)}% ${t('capitalPct')}`,
      tone: overRisk ? 'red' : openRiskPct > 4 ? 'amber' : openRiskPct > 0 ? 'cyan' : 'zinc',
      meter: Math.min(100, config.maxPortfolioRiskPct > 0 ? (openRiskPct / config.maxPortfolioRiskPct) * 100 : 0),
      icon: AlertTriangle,
      signal: overRisk ? 'LIMIT' : openRiskPct > 0 ? 'OPEN' : 'CLEAR',
    },
    {
      label: t('planCompliance'),
      symbol: 'PLAN',
      value: `${fmt(planCompliance, 0)}%`,
      sub: t('operatingDiscipline'),
      tone: planCompliance >= 90 ? 'emerald' : planCompliance >= 70 ? 'amber' : closed.length ? 'red' : 'zinc',
      meter: closed.length ? planCompliance : 0,
      icon: CheckCircle,
      signal: planCompliance >= 90 ? 'LOCKED' : planCompliance >= 70 ? 'OK' : closed.length ? 'LEAK' : 'WAIT',
    },
    {
      label: t('remainingGoal'),
      symbol: 'GOAL',
      value: fmtUsd(goalRemaining),
      sub: `${fmt(goalRemainingPct, 1)}% ${t('pending')}`,
      tone: goalRemaining === 0 ? 'emerald' : metrics.progressPct > 50 ? 'cyan' : 'amber',
      meter: Math.max(0, Math.min(100, metrics.progressPct)),
      icon: Trophy,
      signal: goalRemaining === 0 ? 'DONE' : 'RUN',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Active challenge quick widget */}
      {activeChallenge && challengeEval && (
        <button onClick={() => setTab('challenges')}
          className="w-full text-left border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="text-[11px] tracking-[0.2em] text-amber-400">{t('activeChallenge')}</div>
              <div className="text-sm text-zinc-100">{activeChallenge.name}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-zinc-500 text-[10px]">{t('progress')}</div>
              <div className="tabular text-zinc-200">{fmt(challengeEval.progressPct, 1)}%</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px]">{t('dailyDd')}</div>
              <div className={`tabular ${
                challengeEval.dailyDDUsedPct > 80 ? 'text-red-400'
                : challengeEval.dailyDDUsedPct > 50 ? 'text-amber-400' : 'text-zinc-200'
              }`}>{fmt(challengeEval.dailyDDUsedPct, 0)}% {t('used')}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px]">{t('totalDd')}</div>
              <div className={`tabular ${
                challengeEval.totalDDUsedPct > 80 ? 'text-red-400'
                : challengeEval.totalDDUsedPct > 50 ? 'text-amber-400' : 'text-zinc-200'
              }`}>{fmt(challengeEval.totalDDUsedPct, 0)}% {t('used')}</div>
            </div>
          </div>
        </button>
      )}

      {/* Achievements row */}
      {achievements && achievements.length > 0 && (
        <div className="border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Medal className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-[10px] tracking-[0.2em] text-zinc-500">{t('achievements')} · {achievements.length}/{ACHIEVEMENTS.length}</div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
            {achievements.slice(-6).reverse().map(a => (
              <div key={a.id}
                title={a.desc}
                className="flex-shrink-0 border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 text-[10px] text-amber-400 whitespace-nowrap">
                <Medal className="w-2.5 h-2.5 inline mr-1" />
                {a.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <div className="text-amber-400 text-xs tracking-[0.3em] mb-3">{t('noTradesTitle')}</div>
          <div className="text-zinc-300 mb-2">{t('noTradesBody')}</div>
          <div className="text-zinc-500 text-sm mb-6">
            {t('currentRiskPerTrade')}{' '}
            <span className="text-amber-400">${fmt(config.initialCapital * config.riskPctPerTrade / 100, 2)}</span>.
          </div>
          <button onClick={() => setTab('markets')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 text-xs font-bold tracking-[0.2em]">
            <Activity className="w-4 h-4" /> {t('exploreMarkets')}
          </button>
        </div>
      )}

      {(overRisk || tooMany) && (
        <div className="border border-red-500/40 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 text-xs tracking-wider mb-1">{t('guardrailViolated')}</div>
            <ul className="text-sm text-zinc-300 space-y-1">
              {overRisk && <li>{t('exposedRisk')} {fmt(openRiskPct, 1)}% &gt; {t('limit')} {config.maxPortfolioRiskPct}%</li>}
              {tooMany && <li>{open.length} {t('openPositions')} — {t('max')} {config.maxOpenPositions}</li>}
            </ul>
          </div>
        </div>
      )}

      <TrainingCommandCenter
        readinessScore={readinessScore}
        readinessChecks={readinessChecks}
        confidenceLevel={confidenceLevel}
        mistakeTax={mistakeTax}
        onPlanAvgR={onPlanAvgR}
        offPlanAvgR={offPlanAvgR}
        nextChallenge={nextChallenge}
        riskRemainingToday={riskRemainingToday}
        dailyRiskBudget={dailyRiskBudget}
        setTab={setTab}
        t={t}
      />

      <div className="border border-zinc-800 bg-black/40 shadow-[0_0_40px_rgba(245,158,11,0.06)]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 sm:px-4 py-2 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <LineIcon className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-[10px] tracking-[0.24em] text-zinc-400">{t('performanceTerminal')}</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] tabular text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" />
            LIVE LOCAL
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {dashboardMetrics.map(item => (
            <TerminalMetric key={item.symbol} item={item} />
          ))}
        </div>
      </div>

      {curve.length > 1 && (
        <Panel title={t('equityCurve')} subtitle={t('equityCurveSub')}>
          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="idx" tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false}
                       tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46',
                  borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  labelStyle={{ color: '#a1a1aa' }} formatter={(v) => [fmtUsd(v), 'Capital']} />
                <ReferenceLine y={config.initialCapital} stroke="#52525b" strokeDasharray="4 4" />
                <ReferenceLine y={config.goalCapital} stroke="#10b981"
                               strokeDasharray="4 4" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="capital" stroke="#f59e0b"
                      strokeWidth={2} fill="url(#grad-eq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      {open.length > 0 && (
        <Panel title={t('openPositionsPanel')} subtitle={`${open.length}/${config.maxOpenPositions}`}>
          <div className="divide-y divide-zinc-800">
            {open.map(t => <OpenTradeRow key={t.id} t={t} />)}
          </div>
        </Panel>
      )}

      {closed.length > 0 && (
        <Panel title={t('lastClosedTrades')}>
          <div className="divide-y divide-zinc-800">
            {[...closed].reverse().slice(0, 5).map(t => <ClosedTradeRow key={t.id} t={t} />)}
          </div>
        </Panel>
      )}
    </div>
  );
}

function TerminalMetric({ item }) {
  const tone = {
    zinc: {
      text: 'text-zinc-200',
      dim: 'text-zinc-500',
      line: 'bg-zinc-500',
      border: 'border-zinc-800',
      glow: 'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
    },
    amber: {
      text: 'text-amber-300',
      dim: 'text-amber-500/70',
      line: 'bg-amber-400',
      border: 'border-amber-500/25',
      glow: 'shadow-[inset_0_1px_0_rgba(245,158,11,0.10),0_0_24px_rgba(245,158,11,0.06)]',
    },
    emerald: {
      text: 'text-emerald-300',
      dim: 'text-emerald-500/70',
      line: 'bg-emerald-400',
      border: 'border-emerald-500/25',
      glow: 'shadow-[inset_0_1px_0_rgba(16,185,129,0.10),0_0_24px_rgba(16,185,129,0.06)]',
    },
    red: {
      text: 'text-red-300',
      dim: 'text-red-500/70',
      line: 'bg-red-400',
      border: 'border-red-500/25',
      glow: 'shadow-[inset_0_1px_0_rgba(239,68,68,0.10),0_0_24px_rgba(239,68,68,0.06)]',
    },
    cyan: {
      text: 'text-cyan-300',
      dim: 'text-cyan-500/70',
      line: 'bg-cyan-400',
      border: 'border-cyan-500/25',
      glow: 'shadow-[inset_0_1px_0_rgba(34,211,238,0.10),0_0_24px_rgba(34,211,238,0.06)]',
    },
  }[item.tone] || {};
  const Icon = item.icon;
  const meter = Math.max(0, Math.min(100, item.meter || 0));

  return (
    <div className={`relative min-h-[132px] border-r border-b border-zinc-800 bg-zinc-950/70 p-3 sm:p-4 overflow-hidden ${tone.glow}`}>
      <div className={`absolute inset-x-0 top-0 h-px ${tone.line} opacity-70`} />
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(180deg,transparent_0,transparent_47%,#fff_50%,transparent_53%,transparent_100%)] bg-[length:100%_6px]" />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold tracking-[0.22em] ${tone.dim}`}>{item.symbol}</span>
            <span className={`text-[9px] tracking-[0.16em] border px-1.5 py-0.5 ${tone.border} ${tone.dim}`}>
              {item.signal}
            </span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] tracking-[0.18em] text-zinc-500">{item.label}</div>
        </div>
        <div className={`h-8 w-8 border ${tone.border} bg-black/30 flex items-center justify-center ${tone.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="relative mt-4">
        <div className={`text-xl sm:text-2xl lg:text-3xl font-black tabular ${tone.text}`}>{item.value}</div>
        <div className="mt-1 text-[10px] text-zinc-500 tabular truncate">{item.sub}</div>
      </div>

      <div className="relative mt-4 h-1.5 bg-zinc-900 border border-zinc-800">
        <div className={`h-full ${tone.line}`} style={{ width: `${meter}%` }} />
      </div>
      <div className="relative mt-2 flex justify-between text-[8px] tracking-[0.18em] text-zinc-700">
        <span>LOW</span>
        <span>HIGH</span>
      </div>
    </div>
  );
}

function TrainingCommandCenter({
  readinessScore,
  readinessChecks,
  confidenceLevel,
  mistakeTax,
  onPlanAvgR,
  offPlanAvgR,
  nextChallenge,
  riskRemainingToday,
  dailyRiskBudget,
  setTab,
  t,
}) {
  const readinessTone = readinessScore >= 80 ? 'emerald' : readinessScore >= 55 ? 'amber' : 'red';
  const confidenceLabels = [
    t('confidenceRegistro'),
    t('confidenceDisciplina'),
    t('confidenceRiesgo'),
    t('confidenceConsistencia'),
    t('confidenceEscalamiento'),
  ];
  const taxTone = mistakeTax < 0 ? 'red' : mistakeTax > 0 ? 'emerald' : 'zinc';
  const toneClass = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    zinc: 'text-zinc-300 border-zinc-800 bg-zinc-950/50',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  };

  return (
    <div className="border border-cyan-500/25 bg-black/50 shadow-[0_0_44px_rgba(34,211,238,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[11px] tracking-[0.22em] text-cyan-400">{t('trainingCommandCenter')}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{t('processDisciplineAction')}</div>
          </div>
        </div>
        <button onClick={() => setTab('challenges')}
          className="px-3 py-1.5 text-[10px] tracking-[0.18em] border border-zinc-800 hover:border-cyan-500/50 hover:text-cyan-400 text-zinc-400">
          {t('seeChallenges')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        <div className="p-4">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{t('readinessScore')}</div>
          <div className={`text-4xl tabular font-black ${toneClass[readinessTone].split(' ')[0]}`}>
            {readinessScore}<span className="text-lg text-zinc-600">/100</span>
          </div>
          <div className={`mt-3 inline-flex px-2 py-1 text-[10px] tracking-[0.18em] border ${toneClass[readinessTone]}`}>
            {readinessScore >= 80 ? t('ready') : readinessScore >= 55 ? t('caution') : t('noTrade')}
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{t('disciplineLevel')}</div>
          <div className="flex items-end gap-2">
            <div className="text-4xl tabular font-black text-amber-400">{confidenceLevel}</div>
            <div className="pb-1 text-sm text-zinc-600">/5</div>
          </div>
          <div className="mt-2 text-xs text-zinc-300">{confidenceLabels[Math.max(0, confidenceLevel - 1)] || t('noData')}</div>
          <div className="mt-3 flex gap-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`h-1.5 flex-1 ${n <= confidenceLevel ? 'bg-amber-400' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{t('mistakeTax')}</div>
          <div className={`text-2xl tabular font-black ${toneClass[taxTone].split(' ')[0]}`}>
            {sign(mistakeTax)}{fmtUsd(mistakeTax)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
            Off-plan avg {sign(offPlanAvgR)}{fmt(offPlanAvgR, 2)}R · on-plan {sign(onPlanAvgR)}{fmt(onPlanAvgR, 2)}R
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{t('nextBestChallenge')}</div>
          <div className="text-sm text-cyan-400 font-semibold">{nextChallenge.name}</div>
          <div className="mt-2 text-[10px] text-zinc-500 leading-relaxed">{nextChallenge.reason}</div>
        </div>

        <div className="p-4">
          <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{t('riskRemainingToday')}</div>
          <div className={`text-2xl tabular font-black ${riskRemainingToday > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtUsd(riskRemainingToday)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-500">{t('dailyBudget')} {fmtUsd(dailyRiskBudget)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 border-t border-zinc-800 p-3">
        {readinessChecks.map(check => (
          <div key={check.label}
            className={`flex items-center gap-2 border px-2 py-1.5 text-[10px] ${
              check.pass ? 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' : 'border-zinc-800 text-zinc-500'
            }`}>
            {check.pass ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, sub, accent = 'zinc' }) {
  const accentClass = {
    zinc: 'text-zinc-100', amber: 'text-amber-400',
    emerald: 'text-emerald-400', red: 'text-red-400', cyan: 'text-cyan-400',
  }[accent];
  return (
    <div className="border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <div className="text-[9px] sm:text-[10px] tracking-[0.2em] text-zinc-500 mb-2">{label}</div>
      <div className={`text-lg sm:text-2xl font-bold tabular ${accentClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-zinc-500 mt-1 tabular">{sub}</div>}
    </div>
  );
}

function Panel({ title, subtitle, children, action }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-zinc-300">{title}</div>
          {subtitle && <div className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function OpenTradeRow({ t }) {
  const symbol = pairToSymbol(t.pair);
  const { tickers } = useLiveTickers([symbol], 1000);
  const livePrice = tickers[symbol] ? parseFloat(tickers[symbol].lastPrice) : null;
  const units = t.entryPrice > 0 ? t.positionSize / t.entryPrice : 0;
  const floatingPnl = livePrice
    ? t.direction === 'long'
      ? (livePrice - t.entryPrice) * units
      : (t.entryPrice - livePrice) * units
    : null;
  const floatingR = floatingPnl !== null && t.riskAmount > 0 ? floatingPnl / t.riskAmount : null;
  const stopPct = t.stopPct || (t.direction === 'long'
    ? ((t.entryPrice - t.stopLoss) / t.entryPrice) * 100
    : ((t.stopLoss - t.entryPrice) / t.entryPrice) * 100);
  const tp1R = t.tp1
    ? (t.direction === 'long'
      ? (t.tp1 - t.entryPrice) / (t.entryPrice - t.stopLoss)
      : (t.entryPrice - t.tp1) / (t.stopLoss - t.entryPrice))
    : null;
  const ageHours = Math.max(0, (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60));
  const age = ageHours < 24 ? `${fmt(ageHours, 1)}h` : `${fmt(ageHours / 24, 1)}d`;
  const pnlColor = floatingPnl > 0 ? 'text-emerald-400'
    : floatingPnl < 0 ? 'text-red-400' : 'text-zinc-300';

  return (
    <div className="px-4 py-4 hover:bg-zinc-950/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] tracking-wider px-1.5 py-0.5 border border-amber-500/40 text-amber-400 blink">
            OPEN
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm tabular truncate">
              <span className="text-zinc-100">{t.pair}</span>
              <span className={t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}>
                {t.direction === 'long' ? 'LONG' : 'SHORT'}
              </span>
              {livePrice && <span className="text-[10px] text-zinc-500">LIVE ${fmtPrice(livePrice)}</span>}
            </div>
            <div className="text-[10px] text-zinc-500 tabular truncate">
              abierta {age} · {new Date(t.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-base tabular font-bold ${pnlColor}`}>
            {floatingPnl === null ? '—' : `${sign(floatingPnl)}${fmtUsd(floatingPnl)}`}
          </div>
          <div className={`text-[10px] tabular ${pnlColor}`}>
            {floatingR === null ? 'P&L flotante' : `${sign(floatingR)}${fmt(floatingR, 2)}R flotante`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">ENTRY</div>
          <div className="tabular text-zinc-200">{fmtUsd(t.entryPrice, 4)}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">STOP</div>
          <div className="tabular text-red-400">{fmtUsd(t.stopLoss, 4)}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">TP1</div>
          <div className="tabular text-emerald-400">
            {t.tp1 ? `${fmtUsd(t.tp1, 4)}${tp1R ? ` · ${fmt(tp1R, 1)}R` : ''}` : '—'}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">SIZE</div>
          <div className="tabular text-zinc-200">{fmtUsd(t.positionSize)}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">RIESGO</div>
          <div className="tabular text-amber-400">{fmtUsd(t.riskAmount)} · {fmt(stopPct, 2)}%</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px] tracking-wider">SETUP</div>
          <div className="tabular text-zinc-300 truncate" title={t.setup}>{t.setup || '—'}</div>
        </div>
      </div>
    </div>
  );
}

function ClosedTradeRow({ t }) {
  const isWin = t.pnl > 0;
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-[10px] tracking-wider px-1.5 py-0.5 border ${
          isWin ? 'border-emerald-500/40 text-emerald-400' : 'border-red-500/40 text-red-400'
        }`}>{isWin ? 'WIN' : 'LOSS'}</span>
        <div className="min-w-0">
          <div className="text-sm tabular truncate">
            {t.pair} <span className="text-zinc-500">·</span>{' '}
            <span className={t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}>
              {t.direction === 'long' ? 'L' : 'S'}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 truncate">
            {new Date(t.closedAt).toLocaleDateString('es-MX')}
            {t.followedPlan === false && <span className="ml-2 text-amber-500">⚠ no plan</span>}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-sm tabular font-semibold ${colorPnL(t.pnl)}`}>
          {sign(t.pnl)}{fmtUsd(t.pnl)}
        </div>
        <div className={`text-[10px] tabular ${colorPnL(t.rResult)}`}>
          {sign(t.rResult)}{fmt(t.rResult, 2)}R
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKETS — Live prices grid
// ═══════════════════════════════════════════════════════════════════════════
function Markets({ watchlist, saveWatchlist, setSelectedSymbol, setTab }) {
  const [sortBy, setSortBy] = useState('change');
  const [showAdd, setShowAdd] = useState(false);
  const [pairSearch, setPairSearch] = useState('');
  const [flashMap, setFlashMap] = useState({});
  const prevPricesRef = useRef({});
  const { symbols: availableSymbols, status: symbolsStatus } = useBinanceSpotSymbols();
  const { tickers, status } = useLiveTickers(watchlist, 1000);

  useEffect(() => {
    const nextFlash = {};
    Object.values(tickers).forEach(t => {
      const price = parseFloat(t.lastPrice);
      const prev = prevPricesRef.current[t.symbol];
      if (Number.isFinite(price) && Number.isFinite(prev) && price !== prev) {
        nextFlash[t.symbol] = price > prev ? 'up' : 'down';
      }
      if (Number.isFinite(price)) {
        prevPricesRef.current[t.symbol] = price;
      }
    });

    if (Object.keys(nextFlash).length) {
      setFlashMap(nextFlash);
      const id = setTimeout(() => setFlashMap({}), 850);
      return () => clearTimeout(id);
    }
  }, [tickers]);

  const sorted = useMemo(() => {
    const list = watchlist.map(s => tickers[s]).filter(Boolean);
    return list.sort((a, b) => {
      if (sortBy === 'change') return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
      if (sortBy === 'volume') return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume);
      if (sortBy === 'price')  return parseFloat(b.lastPrice) - parseFloat(a.lastPrice);
      return 0;
    });
  }, [watchlist, tickers, sortBy]);

  const removeFromWatchlist = (symbol) => {
    saveWatchlist(watchlist.filter(s => s !== symbol));
  };

  const addToWatchlist = (symbol) => {
    const normalized = symbol.toUpperCase().replace('/', '').trim();
    if (!watchlist.includes(normalized)) saveWatchlist([...watchlist, normalized]);
    setPairSearch('');
  };

  const normalizedSearch = pairSearch.toUpperCase().replace('/', '').replace(/\s+/g, '');
  const searchWithQuote = normalizedSearch && !normalizedSearch.endsWith('USDT')
    ? `${normalizedSearch}USDT`
    : normalizedSearch;
  const filteredAvailable = useMemo(() => {
    const q = normalizedSearch;
    const candidates = availableSymbols.filter(p => !watchlist.includes(p));
    if (!q) return candidates.slice(0, 30);
    return candidates
      .filter(p => p.includes(q) || p.replace('USDT', '').includes(q))
      .slice(0, 60);
  }, [availableSymbols, watchlist, normalizedSearch]);
  const canAddTyped = searchWithQuote
    && availableSymbols.includes(searchWithQuote)
    && !watchlist.includes(searchWithQuote);

  const onClickSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setTab('chart');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {[
            { id: 'change', label: 'CAMBIO' },
            { id: 'volume', label: 'VOLUMEN' },
            { id: 'price',  label: 'PRECIO' }
          ].map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] border transition-colors ${
                sortBy === s.id
                  ? 'border-amber-500/60 text-amber-400 bg-amber-500/5'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}>{s.label}</button>
          ))}
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 text-[10px] tracking-[0.2em] border border-zinc-800 hover:border-cyan-500/60 hover:text-cyan-400 text-zinc-300 inline-flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> AGREGAR PAR
        </button>
      </div>

      {showAdd && (
        <div className="border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-zinc-500">BUSCAR PAR SPOT USDT</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">
                {symbolsStatus === 'live'
                  ? `${availableSymbols.length} pares cargados desde Binance`
                  : symbolsStatus === 'error'
                    ? 'usando lista local; Binance no respondió'
                    : 'cargando catálogo Binance...'}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input value={pairSearch} onChange={e => setPairSearch(e.target.value)}
                placeholder="PEPE, WIF, BTC, 1000SATS..."
                className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs tabular focus:outline-none focus:border-cyan-500/50" />
              <button onClick={() => canAddTyped && addToWatchlist(searchWithQuote)}
                disabled={!canAddTyped}
                className={`px-3 py-2 text-[10px] tracking-[0.16em] border transition-colors ${
                  canAddTyped
                    ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                    : 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                }`}>
                ADD
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-hidden">
            {filteredAvailable.map(p => (
              <button key={p} onClick={() => { addToWatchlist(p); }}
                className="text-[11px] py-1.5 border border-zinc-800 hover:border-amber-500/60 hover:text-amber-400 text-zinc-400 tabular">
                {p.replace('USDT', '')}
              </button>
            ))}
            {filteredAvailable.length === 0 && (
              <div className="col-span-full py-6 text-center text-xs text-zinc-500">
                // sin resultados para {pairSearch || 'búsqueda'}
              </div>
            )}
          </div>
        </div>
      )}

      <Panel title={`WATCHLIST · ${watchlist.length} PARES`}
             subtitle={status === 'live' ? '// datos en vivo · refresco 1s' : '// reconectando...'}>
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 border-b border-zinc-800 text-[9px] tracking-[0.2em] text-zinc-600">
          <div className="col-span-3">SYMBOL</div>
          <div className="col-span-2 text-right">PRECIO</div>
          <div className="col-span-2 text-right">24H</div>
          <div className="col-span-2 text-right">HIGH 24H</div>
          <div className="col-span-2 text-right">VOL 24H</div>
          <div className="col-span-1"></div>
        </div>
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-500 text-sm">// cargando precios...</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {sorted.map(t => {
              const change = parseFloat(t.priceChangePercent);
              const flash = flashMap[t.symbol];
              const flashClass = flash === 'up'
                ? 'bg-emerald-500/12 shadow-[inset_3px_0_0_rgba(52,211,153,0.9)]'
                : flash === 'down'
                  ? 'bg-red-500/12 shadow-[inset_3px_0_0_rgba(248,113,113,0.9)]'
                  : '';
              return (
                <div key={t.symbol}
                     className={`relative px-4 py-3 hover:bg-zinc-900/60 transition-all duration-300 cursor-pointer overflow-hidden ${flashClass}`}
                     onClick={() => onClickSymbol(t.symbol)}>
                  {flash && (
                    <div className={`pointer-events-none absolute inset-y-0 left-0 w-full ${
                      flash === 'up'
                        ? 'bg-gradient-to-r from-emerald-400/20 via-emerald-400/5 to-transparent'
                        : 'bg-gradient-to-r from-red-400/20 via-red-400/5 to-transparent'
                    }`} />
                  )}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 sm:col-span-3 min-w-0">
                      <div className="relative flex items-center gap-2 text-sm tabular text-zinc-100">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          flash === 'up' ? 'bg-emerald-400 animate-ping'
                          : flash === 'down' ? 'bg-red-400 animate-ping'
                          : status === 'live' ? 'bg-zinc-600' : 'bg-amber-400 pulse-soft'
                        }`} />
                        {t.symbol.replace('USDT', '')}
                        <span className="text-zinc-600 text-[10px] ml-1">/USDT</span>
                      </div>
                    </div>
                    <div className={`relative col-span-3 sm:col-span-2 text-right tabular text-sm transition-colors ${
                      flash === 'up' ? 'text-emerald-300' : flash === 'down' ? 'text-red-300' : 'text-zinc-100'
                    }`}>
                      ${fmtPrice(t.lastPrice)}
                    </div>
                    <div className={`col-span-3 sm:col-span-2 text-right tabular text-sm ${
                      change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {sign(change)}{fmt(change, 2)}%
                    </div>
                    <div className="hidden sm:block col-span-2 text-right tabular text-xs text-zinc-400">
                      ${fmtPrice(t.highPrice)}
                    </div>
                    <div className="hidden sm:block col-span-2 text-right tabular text-xs text-zinc-500">
                      ${fmtVolume(t.quoteVolume)}
                    </div>
                    <div className="col-span-1 text-right">
                      <button onClick={(e) => { e.stopPropagation(); removeFromWatchlist(t.symbol); }}
                              className="text-zinc-700 hover:text-red-400 p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHART VIEW — Klines + EMAs
// ═══════════════════════════════════════════════════════════════════════════
function ChartView({ selectedSymbol, setSelectedSymbol, trades, watchlist, setTab }) {
  const [interval, setInterval] = useState('1d');
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const pickerRef = useRef(null);
  const { symbols: availableSymbols, status: symbolsStatus } = useBinanceSpotSymbols();
  const { data, loading, error } = useKlines(selectedSymbol, interval, 200);
  const { tickers } = useLiveTickers([selectedSymbol], 1000);

  const ticker = tickers[selectedSymbol];
  const change = ticker ? parseFloat(ticker.priceChangePercent) : 0;
  const lastPrice = ticker ? parseFloat(ticker.lastPrice) : (data.length ? data[data.length - 1].close : 0);

  // Trades on this symbol for overlay
  const symbolTrades = trades.filter(t => pairToSymbol(t.pair) === selectedSymbol);
  const openTrade = symbolTrades.find(t => t.status === 'open');
  const normalizedSearch = symbolSearch.toUpperCase().replace('/', '').replace(/\s+/g, '');
  const chartSymbols = useMemo(() => {
    const merged = [...new Set([...watchlist, ...availableSymbols])];
    if (!normalizedSearch) {
      return merged.filter(s => watchlist.includes(s)).concat(
        merged.filter(s => !watchlist.includes(s)).slice(0, 40)
      );
    }
    return merged
      .filter(s => s.includes(normalizedSearch) || s.replace('USDT', '').includes(normalizedSearch))
      .slice(0, 80);
  }, [watchlist, availableSymbols, normalizedSearch]);

  useEffect(() => {
    if (!showSymbolPicker) return;
    const onClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) {
        setShowSymbolPicker(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [showSymbolPicker]);

  const selectChartSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setSymbolSearch('');
    setShowSymbolPicker(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div ref={pickerRef} className="relative">
            <button onClick={() => setShowSymbolPicker(v => !v)}
              className="min-w-44 bg-zinc-950 border border-zinc-800 px-3 py-2 text-left text-sm tabular focus:outline-none hover:border-amber-500/50 flex items-center justify-between gap-3">
              <span>{selectedSymbol}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            {showSymbolPicker && (
              <div className="absolute left-0 top-full z-40 mt-2 w-80 border border-zinc-800 bg-zinc-950 shadow-2xl">
                <div className="p-3 border-b border-zinc-800">
                  <input autoFocus value={symbolSearch} onChange={e => setSymbolSearch(e.target.value)}
                    placeholder="Buscar: BTC, PEPE, WIF, SOLUSDT..."
                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs tabular focus:outline-none focus:border-amber-500/50" />
                  <div className="mt-2 text-[10px] text-zinc-600">
                    {symbolsStatus === 'live' ? `${availableSymbols.length} pares Binance` : 'catálogo local / cargando Binance'}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-hidden">
                  {chartSymbols.map(s => (
                    <button key={s} onClick={() => selectChartSymbol(s)}
                      className={`w-full px-3 py-2 text-left text-xs tabular border-b border-zinc-900 hover:bg-zinc-900/80 ${
                        s === selectedSymbol ? 'text-amber-400 bg-amber-500/5' : 'text-zinc-300'
                      }`}>
                      <span>{symbolToPair(s)}</span>
                      {watchlist.includes(s) && <span className="ml-2 text-[9px] text-cyan-400">WATCH</span>}
                    </button>
                  ))}
                  {chartSymbols.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-zinc-500">// sin resultados</div>
                  )}
                </div>
              </div>
            )}
          </div>
          {ticker && (
            <div className="flex items-baseline gap-2">
              <span className="text-xl tabular text-zinc-100">${fmtPrice(lastPrice)}</span>
              <span className={`text-sm tabular ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {sign(change)}{fmt(change, 2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 items-center">
          {INTERVALS.map(i => (
            <button key={i.id} onClick={() => setInterval(i.id)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] border transition-colors ${
                interval === i.id
                  ? 'border-amber-500/60 text-amber-400 bg-amber-500/5'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}>{i.label}</button>
          ))}
          {setTab && (
            <button onClick={() => setTab('analyst')}
              className="ml-2 px-3 py-1.5 text-[10px] tracking-[0.2em] border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 inline-flex items-center gap-1.5">
              <Brain className="w-3 h-3" /> ANALIZAR
            </button>
          )}
        </div>
      </div>

      <Panel title={`${symbolToPair(selectedSymbol)} · ${interval.toUpperCase()}`}
             subtitle="Candlesticks + EMA50 + EMA200 · refresco 1s">
        <div className="h-80 sm:h-[460px] -mx-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-amber-400 text-xs tracking-[0.3em] animate-pulse">// CARGANDO...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400 text-xs">// ERROR: {error}</div>
          ) : (
            <CandlestickChart data={data} livePrice={lastPrice} openTrade={openTrade} />
          )}
        </div>
      </Panel>

      {ticker && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="HIGH 24H" value={`$${fmtPrice(ticker.highPrice)}`} />
          <Metric label="LOW 24H"  value={`$${fmtPrice(ticker.lowPrice)}`} />
          <Metric label="VOL 24H"  value={`$${fmtVolume(ticker.quoteVolume)}`} />
          <Metric label="TRADES 24H" value={fmt(parseInt(ticker.count), 0)} />
        </div>
      )}

      {/* Quick analysis */}
      {data.length > 0 && (
        <Panel title="ANÁLISIS RÁPIDO" subtitle="Confluencia para tu setup">
          <div className="p-4 space-y-2 text-sm">
            {(() => {
              const last = data[data.length - 1];
              const aboveEma50 = last.close > last.ema50;
              const aboveEma200 = last.close > last.ema200;
              const goldenCross = last.ema50 > last.ema200;
              return (
                <>
                  <CheckLine pass={aboveEma50}
                    text={`Precio ${aboveEma50 ? 'sobre' : 'bajo'} EMA50 (${fmtPrice(last.ema50)})`} />
                  <CheckLine pass={aboveEma200}
                    text={`Precio ${aboveEma200 ? 'sobre' : 'bajo'} EMA200 (${fmtPrice(last.ema200)})`} />
                  <CheckLine pass={goldenCross}
                    text={`EMA50 ${goldenCross ? 'sobre' : 'bajo'} EMA200 (${goldenCross ? 'golden cross' : 'death cross'})`} />
                  <div className="pt-2 mt-2 border-t border-zinc-800 text-xs text-zinc-500">
                    {aboveEma50 && aboveEma200 && goldenCross
                      ? '→ Bias LONG según tu plan. Buscá pullback a EMA20 o soporte para entrada.'
                      : !aboveEma50 && !aboveEma200 && !goldenCross
                      ? '→ Tendencia bajista. Si no tradés shorts, mantenete fuera.'
                      : '→ Setup ambiguo. Tu plan dice esperar confluencia clara antes de entrar.'}
                  </div>
                </>
              );
            })()}
          </div>
        </Panel>
      )}
    </div>
  );
}

function CandlestickChart({ data, livePrice, openTrade }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height || !data.length) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    const pad = { top: 24, right: 92, bottom: 34, left: 14 };
    const plotW = size.width - pad.left - pad.right;
    const plotH = size.height - pad.top - pad.bottom;
    const visible = data.slice(-90).map((d, i, arr) => {
      if (i !== arr.length - 1 || !Number.isFinite(livePrice)) return d;
      return {
        ...d,
        high: Math.max(d.high, livePrice),
        low: Math.min(d.low, livePrice),
        close: livePrice,
      };
    });

    const tradePrices = openTrade
      ? [openTrade.entryPrice, openTrade.stopLoss, openTrade.tp1, openTrade.tp2].filter(Number.isFinite)
      : [];
    const pricePoints = visible.flatMap(d => [d.high, d.low, d.ema50, d.ema200]).filter(Number.isFinite);
    const min = Math.min(...pricePoints, ...tradePrices);
    const max = Math.max(...pricePoints, ...tradePrices);
    const padding = Math.max((max - min) * 0.08, max * 0.002);
    const minPrice = min - padding;
    const maxPrice = max + padding;
    const y = (price) => pad.top + ((maxPrice - price) / (maxPrice - minPrice || 1)) * plotH;
    const x = (idx) => pad.left + (visible.length <= 1 ? plotW : (idx / (visible.length - 1)) * plotW);

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, size.width, size.height);
    const bg = ctx.createLinearGradient(0, pad.top, 0, size.height);
    bg.addColorStop(0, 'rgba(245,158,11,0.035)');
    bg.addColorStop(0.42, 'rgba(34,211,238,0.018)');
    bg.addColorStop(1, 'rgba(9,9,11,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(pad.left, pad.top, plotW, plotH);

    ctx.strokeStyle = 'rgba(63,63,70,0.32)';
    ctx.lineWidth = 1;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const gy = pad.top + (plotH / 5) * i;
      const price = maxPrice - ((maxPrice - minPrice) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(pad.left + plotW, gy);
      ctx.stroke();
      ctx.fillStyle = '#71717a';
      ctx.fillText(`$${fmtPrice(price)}`, pad.left + plotW + 12, gy);
    }
    for (let i = 0; i <= 8; i++) {
      const gx = pad.left + (plotW / 8) * i;
      ctx.beginPath();
      ctx.moveTo(gx, pad.top);
      ctx.lineTo(gx, pad.top + plotH);
      ctx.stroke();
    }

    const step = plotW / Math.max(visible.length, 1);
    const bodyW = Math.max(3, Math.min(10, step * 0.56));
    visible.forEach((d, i) => {
      const cx = x(i);
      const openY = y(d.open);
      const closeY = y(d.close);
      const highY = y(d.high);
      const lowY = y(d.low);
      const up = d.close >= d.open;
      const color = up ? '#22c55e' : '#ef4444';
      const glow = up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, highY);
      ctx.lineTo(cx, lowY);
      ctx.stroke();
      const top = Math.min(openY, closeY);
      const height = Math.max(2, Math.abs(closeY - openY));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - bodyW * 0.9, top - 3, bodyW * 1.8, height + 6);
      ctx.fillStyle = up ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)';
      ctx.fillRect(cx - bodyW / 2, top, bodyW, height);
    });

    const drawLine = (key, color, width = 1.4) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      visible.forEach((d, i) => {
        if (!Number.isFinite(d[key])) return;
        const px = x(i);
        const py = y(d[key]);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();
    };
    drawLine('ema50', '#06b6d4', 1.2);
    drawLine('ema200', '#ec4899', 1.1);

    const drawPriceLine = (price, color, label, dashed = true) => {
      if (!Number.isFinite(price)) return;
      const py = y(price);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      if (dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(pad.left + plotW, py);
      ctx.stroke();
      ctx.setLineDash([]);
      const text = `${label}  $${fmtPrice(price)}`;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      const tw = ctx.measureText(text).width + 12;
      ctx.fillStyle = color;
      ctx.fillRect(size.width - pad.right + 4, py - 11, tw, 22);
      ctx.fillStyle = '#09090b';
      ctx.fillText(text, size.width - pad.right + 10, py);
      ctx.restore();
    };

    drawPriceLine(livePrice, '#f59e0b', 'LIVE');
    if (openTrade) {
      drawPriceLine(openTrade.entryPrice, '#a1a1aa', 'ENTRY');
      drawPriceLine(openTrade.stopLoss, '#ef4444', 'SL');
      drawPriceLine(openTrade.tp1, '#10b981', 'TP1');
      drawPriceLine(openTrade.tp2, '#22c55e', 'TP2');
    }

    const last = visible[visible.length - 1];
    const first = visible[0];
    ctx.fillStyle = '#52525b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textBaseline = 'alphabetic';
    if (first) ctx.fillText(new Date(first.time).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }), pad.left, size.height - 10);
    if (last) {
      const label = new Date(last.time).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
      ctx.fillText(label, pad.left + plotW - ctx.measureText(label).width, size.height - 10);
    }
  }, [data, livePrice, openTrade, size]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-zinc-950">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 flex gap-2 text-[10px] tracking-[0.18em]">
        <span className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-amber-300">FAST CANVAS</span>
        <span className="border border-cyan-500/30 bg-cyan-500/5 px-2 py-1 text-cyan-300">EMA50</span>
        <span className="border border-pink-500/30 bg-pink-500/5 px-2 py-1 text-pink-300">EMA200</span>
      </div>
    </div>
  );
}

function CheckLine({ pass, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
        pass ? 'border-emerald-400 bg-emerald-500/20' : 'border-zinc-700'
      }`}>
        {pass ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-zinc-600" />}
      </div>
      <span className={pass ? 'text-zinc-200' : 'text-zinc-500'}>{text}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW TRADE
// ═══════════════════════════════════════════════════════════════════════════
function NewTrade({ config, metrics, trades, saveTrades, onDone, defaultPair, prefill, clearPrefill, activeChallenge, challengeEval }) {
  const [step, setStep] = useState('checklist');
  const [checks, setChecks] = useState(Array(CHECKLIST.length).fill(false));
  const [pair, setPair] = useState(prefill?.pair || defaultPair || 'BTCUSDT');
  const [direction, setDirection] = useState(prefill?.direction || 'long');
  const [setup, setSetup] = useState(prefill?.setup || '');
  const [entryPrice, setEntryPrice] = useState(prefill?.entry?.toString() || '');
  const [stopLoss, setStopLoss] = useState(prefill?.stopLoss?.toString() || '');
  const [stopMode, setStopMode] = useState(prefill ? 'price' : 'percent');
  const [stopPercent, setStopPercent] = useState('3');
  const [tp1, setTp1] = useState(prefill?.tp1?.toString() || '');
  const [tp2, setTp2] = useState(prefill?.tp2?.toString() || '');
  const [tpMode, setTpMode] = useState(prefill ? 'price' : 'percent');
  const [tp1Percent, setTp1Percent] = useState('3');
  const [tp2Percent, setTp2Percent] = useState('6');
  const [tp1RMultiple, setTp1RMultiple] = useState('1.5');
  const [tp2RMultiple, setTp2RMultiple] = useState('3');
  const [emotion, setEmotion] = useState('calm');
  const [notes, setNotes] = useState(prefill?.notes || '');

  // If prefill arrives mid-render, skip checklist (user came from AI analyst with pre-validated setup)
  useEffect(() => {
    if (prefill) {
      setStep('form');
    }
  }, [prefill?.id]);

  const allChecked = checks.every(Boolean);

  // Live price for the selected pair
  const { tickers } = useLiveTickers([pair], 5000);
  const livePrice = tickers[pair] ? parseFloat(tickers[pair].lastPrice) : null;

  const autoStop = useMemo(() => {
    const ep = parseFloat(entryPrice);
    const pct = parseFloat(stopPercent);
    if (stopMode !== 'percent' || !ep || ep <= 0 || !pct || pct <= 0) return null;
    return direction === 'long'
      ? ep * (1 - pct / 100)
      : ep * (1 + pct / 100);
  }, [entryPrice, stopMode, stopPercent, direction]);

  useEffect(() => {
    if (stopMode !== 'percent') return;
    setStopLoss(autoStop ? String(Number(autoStop.toFixed(8))) : '');
  }, [stopMode, autoStop]);

  const autoTp = useMemo(() => {
    const ep = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const deriveTpPrice = (percentValue, rValue) => {
      if (!ep || ep <= 0) return null;
      if (tpMode === 'percent') {
        const pct = parseFloat(percentValue);
        if (!pct || pct <= 0) return null;
        return direction === 'long'
          ? ep * (1 + pct / 100)
          : ep * (1 - pct / 100);
      }
      if (tpMode === 'r') {
        const multiple = parseFloat(rValue);
        if (!multiple || multiple <= 0 || !sl) return null;
        const riskPerUnit = direction === 'long' ? ep - sl : sl - ep;
        if (riskPerUnit <= 0) return null;
        return direction === 'long'
          ? ep + riskPerUnit * multiple
          : ep - riskPerUnit * multiple;
      }
      return null;
    };
    return {
      tp1: deriveTpPrice(tp1Percent, tp1RMultiple),
      tp2: deriveTpPrice(tp2Percent, tp2RMultiple),
    };
  }, [entryPrice, stopLoss, direction, tpMode, tp1Percent, tp2Percent, tp1RMultiple, tp2RMultiple]);

  useEffect(() => {
    if (tpMode === 'price') return;
    setTp1(autoTp.tp1 ? String(Number(autoTp.tp1.toFixed(8))) : '');
    setTp2(autoTp.tp2 ? String(Number(autoTp.tp2.toFixed(8))) : '');
  }, [tpMode, autoTp.tp1, autoTp.tp2]);

  const calc = useMemo(() => {
    const ep = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const t1 = parseFloat(tp1);
    if (!ep || !sl || ep <= 0) return null;
    const stopPct = direction === 'long'
      ? ((ep - sl) / ep) * 100
      : ((sl - ep) / ep) * 100;
    if (stopPct <= 0) return { error: 'Stop loss inválido para esta dirección' };
    if (stopPct > 12) return { error: `Stop ${fmt(stopPct, 1)}% > 12% — descartá el trade` };
    const riskAmount = metrics.currentCapital * config.riskPctPerTrade / 100;
    const positionSize = riskAmount / (stopPct / 100);
    let rr1 = null;
    if (t1 > 0) {
      const profit = direction === 'long' ? t1 - ep : ep - t1;
      const risk = direction === 'long' ? ep - sl : sl - ep;
      rr1 = profit / risk;
    }
    return { stopPct, riskAmount, positionSize, rr1,
             pctOfCapital: (positionSize / metrics.currentCapital) * 100 };
  }, [entryPrice, stopLoss, tp1, direction, metrics.currentCapital, config.riskPctPerTrade]);

  const canSubmit = entryPrice && stopLoss && setup && calc && !calc.error
    && metrics.open.length < config.maxOpenPositions
    && (metrics.openRiskPct + (calc?.riskAmount / metrics.currentCapital * 100)) <= config.maxPortfolioRiskPct;

  // Challenge pre-trade check
  const challengeBlock = useMemo(() => {
    if (!activeChallenge || !challengeEval || !calc || calc.error) return null;
    return canOpenTradeInChallenge(activeChallenge, challengeEval, calc.riskAmount);
  }, [activeChallenge, challengeEval, calc]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (challengeBlock && !challengeBlock.ok) {
      if (!confirm(`⚠ Este trade violaría una regla del reto activo:\n\n${challengeBlock.reason}\n\n¿Abrir igual? (Esto puede fallar el reto)`)) {
        return;
      }
    }
    const newTrade = {
      id: makeId(),
      date: new Date().toISOString(),
      pair: symbolToPair(pair),
      direction, setup,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      tp1: parseFloat(tp1) || null,
      tp2: parseFloat(tp2) || null,
      positionSize: calc.positionSize,
      riskAmount: calc.riskAmount,
      stopPct: calc.stopPct,
      rrExpected: calc.rr1 || null,
      emotion, notes,
      status: 'open',
      challengeId: activeChallenge?.id || null,
    };
    saveTrades([...trades, newTrade]);
    if (clearPrefill) clearPrefill();
    onDone();
  };

  if (step === 'checklist') {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Panel title="PRE-TRADE CHECKLIST"
               subtitle="Una sola sin marcar = no entrás. Sin excepciones.">
          <div className="p-4 space-y-3">
            {CHECKLIST.map((item, i) => (
              <button key={i}
                onClick={() => setChecks(c => c.map((v, idx) => idx === i ? !v : v))}
                className={`w-full flex items-start gap-3 p-3 border transition-colors text-left ${
                  checks[i] ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                <div className={`flex-shrink-0 w-5 h-5 border flex items-center justify-center mt-0.5 ${
                  checks[i] ? 'border-emerald-400 bg-emerald-500/20' : 'border-zinc-700'
                }`}>
                  {checks[i] && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className={`text-sm ${checks[i] ? 'text-zinc-200' : 'text-zinc-400'}`}>{item}</span>
              </button>
            ))}
            <div className="pt-3 mt-2 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-xs tabular text-zinc-500">
                {checks.filter(Boolean).length}/{CHECKLIST.length} validados
              </div>
              <button onClick={() => setStep('form')} disabled={!allChecked}
                className={`px-5 py-2.5 text-xs font-bold tracking-[0.2em] transition-colors ${
                  allChecked ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                             : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}>
                {allChecked ? 'CONTINUAR →' : 'COMPLETAR CHECKLIST'}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <button onClick={() => setStep('checklist')}
              className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wider">
        ← VOLVER A CHECKLIST
      </button>

      <Panel title="DATOS DE LA POSICIÓN">
        <div className="p-4 space-y-4">
          {activeChallenge && challengeEval && (
            <div className="border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-[10px] tracking-[0.2em] text-amber-400">RETO ACTIVO</div>
                <div className="text-xs text-zinc-300 ml-1">{activeChallenge.name}</div>
              </div>
              <div className="text-[10px] text-zinc-500 tabular">
                Daily DD usado: {fmt(challengeEval.dailyDDUsedPct, 0)}% · Total DD usado: {fmt(challengeEval.totalDDUsedPct, 0)}% · Progreso: {fmt(challengeEval.progressPct, 0)}%
              </div>
              {challengeBlock && !challengeBlock.ok && (
                <div className="mt-2 text-[11px] text-red-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  {challengeBlock.reason}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="PAIR">
              <select value={pair} onChange={e => setPair(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50">
                {ALL_PAIRS.map(p => <option key={p} value={p}>{symbolToPair(p)}</option>)}
              </select>
              {livePrice && (
                <div className="text-[10px] text-zinc-500 mt-1 tabular">
                  live: ${fmtPrice(livePrice)}{' '}
                  <button onClick={() => setEntryPrice(livePrice.toString())}
                          className="text-cyan-400 hover:text-cyan-300 ml-1">
                    [usar]
                  </button>
                </div>
              )}
            </Field>
            <Field label="DIRECCIÓN">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDirection('long')}
                  className={`py-2 text-xs tracking-wider border transition-colors ${
                    direction === 'long'
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}>
                  <ArrowUp className="w-3 h-3 inline -mt-0.5" /> LONG
                </button>
                <button onClick={() => setDirection('short')}
                  className={`py-2 text-xs tracking-wider border transition-colors ${
                    direction === 'short'
                      ? 'border-red-500/60 bg-red-500/10 text-red-400'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}>
                  <ArrowDown className="w-3 h-3 inline -mt-0.5" /> SHORT
                </button>
              </div>
            </Field>
          </div>

          <Field label="SETUP / RAZÓN DE ENTRADA">
            <input type="text" value={setup} onChange={e => setSetup(e.target.value)}
              placeholder="Pullback a EMA 50 4H + RSI bounce..."
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ENTRY">
              <input type="number" step="any" value={entryPrice}
                onChange={e => setEntryPrice(e.target.value)} placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/60 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] tracking-[0.2em] text-zinc-500">STOP LOSS</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  Precio manual o porcentaje desde entry.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: 'price', label: 'PRECIO' },
                  { id: 'percent', label: '%' },
                ].map(mode => (
                  <button key={mode.id} onClick={() => setStopMode(mode.id)}
                    className={`px-3 py-1.5 text-[10px] tracking-[0.16em] border transition-colors ${
                      stopMode === mode.id
                        ? 'border-red-500/60 bg-red-500/10 text-red-400'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {stopMode === 'price' ? (
              <Field label="STOP PRECIO">
                <input type="number" step="any" value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)} placeholder="0.00"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-red-500/50" />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="STOP % DESDE ENTRY">
                  <input type="number" step="0.1" value={stopPercent}
                    onChange={e => setStopPercent(e.target.value)} placeholder="3"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-red-500/50" />
                </Field>
                <div>
                  <div className="text-[10px] tracking-wider text-zinc-500 mb-1">STOP CALCULADO</div>
                  <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular text-red-400">
                    {stopLoss ? fmtUsd(parseFloat(stopLoss), 4) : '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border border-zinc-800 bg-zinc-950/60 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] tracking-[0.2em] text-zinc-500">TAKE PROFITS</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  Precio manual, porcentaje desde entry o múltiplos de R.
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'price', label: 'PRECIO' },
                  { id: 'percent', label: '%' },
                  { id: 'r', label: 'R' },
                ].map(mode => (
                  <button key={mode.id} onClick={() => setTpMode(mode.id)}
                    className={`px-3 py-1.5 text-[10px] tracking-[0.16em] border transition-colors ${
                      tpMode === mode.id
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {tpMode === 'price' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="TP1 PRECIO">
                  <input type="number" step="any" value={tp1}
                    onChange={e => setTp1(e.target.value)} placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
                <Field label="TP2 PRECIO">
                  <input type="number" step="any" value={tp2}
                    onChange={e => setTp2(e.target.value)} placeholder="opcional"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
              </div>
            )}

            {tpMode === 'percent' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="TP1 % DESDE ENTRY">
                  <input type="number" step="0.1" value={tp1Percent}
                    onChange={e => setTp1Percent(e.target.value)} placeholder="3"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
                <Field label="TP2 % DESDE ENTRY">
                  <input type="number" step="0.1" value={tp2Percent}
                    onChange={e => setTp2Percent(e.target.value)} placeholder="6"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
              </div>
            )}

            {tpMode === 'r' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="TP1 MÚLTIPLO R">
                  <input type="number" step="0.1" value={tp1RMultiple}
                    onChange={e => setTp1RMultiple(e.target.value)} placeholder="1.5"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
                <Field label="TP2 MÚLTIPLO R">
                  <input type="number" step="0.1" value={tp2RMultiple}
                    onChange={e => setTp2RMultiple(e.target.value)} placeholder="3"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-emerald-500/50" />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-800">
              <div>
                <div className="text-zinc-500 text-[10px] tracking-wider">TP1 CALCULADO</div>
                <div className="tabular text-emerald-400">{tp1 ? fmtUsd(parseFloat(tp1), 4) : '—'}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px] tracking-wider">TP2 CALCULADO</div>
                <div className="tabular text-emerald-400">{tp2 ? fmtUsd(parseFloat(tp2), 4) : '—'}</div>
              </div>
            </div>
          </div>

          {calc && (
            <div className={`border p-3 ${calc.error ? 'border-red-500/40 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5">
                <Calculator className="w-3 h-3" /> POSITION SIZE CALCULADO
              </div>
              {calc.error ? (
                <div className="text-sm text-red-400">{calc.error}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><div className="text-zinc-500 text-[10px]">STOP DIST</div>
                       <div className="tabular text-zinc-200">{fmt(calc.stopPct, 2)}%</div></div>
                  <div><div className="text-zinc-500 text-[10px]">RIESGO $</div>
                       <div className="tabular text-amber-400">${fmt(calc.riskAmount, 2)}</div></div>
                  <div><div className="text-zinc-500 text-[10px]">POSITION SIZE</div>
                       <div className="tabular text-amber-400 font-semibold">${fmt(calc.positionSize, 2)}</div></div>
                  <div><div className="text-zinc-500 text-[10px]">R:R (TP1)</div>
                       <div className={`tabular ${
                         !calc.rr1 ? 'text-zinc-500'
                         : calc.rr1 >= 1.5 ? 'text-emerald-400' : 'text-red-400'
                       }`}>{calc.rr1 ? `1:${fmt(calc.rr1, 2)}` : '—'}</div></div>
                </div>
              )}
            </div>
          )}

          <Field label="ESTADO MENTAL">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {EMOTIONS.map(e => (
                <button key={e.id} onClick={() => setEmotion(e.id)}
                  className={`py-2 px-2 text-[10px] tracking-wider border transition-colors ${
                    emotion === e.id ? `${e.classes} bg-zinc-900`
                                     : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}>{e.label}</button>
              ))}
            </div>
          </Field>

          <Field label="NOTAS (opcional)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Contexto, niveles, plan de gestión..."
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
          </Field>

          <div className="pt-2 border-t border-zinc-800">
            {!canSubmit && (
              <div className="text-xs text-amber-500 mb-3">
                {!setup && '• Falta setup '}{!entryPrice && '• Falta entry '}
                {!stopLoss && '• Falta stop loss '}
                {metrics.open.length >= config.maxOpenPositions && '• Máx posiciones abiertas alcanzado '}
              </div>
            )}
            <button onClick={handleSubmit} disabled={!canSubmit}
              className={`w-full py-3 text-xs font-bold tracking-[0.2em] transition-colors ${
                canSubmit ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}>ABRIR POSICIÓN</button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] text-zinc-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ANALYST — Análisis con IA usando Claude API
// ═══════════════════════════════════════════════════════════════════════════
function AnalystView({ selectedSymbol, setSelectedSymbol, watchlist, config,
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
      {error && (
        <div className="border border-red-500/40 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      {/* Loading */}
      {analyzing && <AnalysisLoading />}

      {/* Active analysis */}
      {activeAnalysis && !analyzing && (
        <AnalysisCard
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

function CryptoComparePanel({
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
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
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

        {result && <CryptoCompareResult result={result} />}
      </div>
    </div>
  );
}

function CryptoCompareResult({ result }) {
  const tokenA = result?.tokenA || 'TOKEN A';
  const tokenB = result?.tokenB || 'TOKEN B';
  const verdict = result?.executiveVerdict || {};
  const composite = result?.composite || {};
  const scores = result?.scores || {};
  const riskMatrix = result?.riskMatrix || {};
  const biggestRisks = result?.biggestRisks || {};
  const dataQuality = result?.dataQuality || {};
  const scoreRows = [
    ['On-Chain Health', scores.onChainHealth],
    ['Tokenomics Quality', scores.tokenomicsQuality],
    ['Sentiment & Momentum', scores.sentimentMomentum],
    ['Technical Setup', scores.technicalSetup],
    ['Fundamental Strength', scores.fundamentalStrength],
  ];
  const riskRows = [
    ['Volatility', riskMatrix.volatilityRisk],
    ['Liquidity', riskMatrix.liquidityRisk],
    ['Dilution / Unlock', riskMatrix.dilutionUnlockRisk],
    ['Regulatory', riskMatrix.regulatoryRisk],
    ['Smart Contract', riskMatrix.smartContractRisk],
    ['Narrative', riskMatrix.narrativeRisk],
    ['Centralization', riskMatrix.centralizationRisk],
    ['Drawdown', riskMatrix.drawdownRisk],
  ];

  return (
    <div className="space-y-4 pt-1">
      <section className="border border-cyan-500/30 bg-cyan-500/5 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <h4 className="text-[11px] tracking-[0.2em] text-cyan-300">EXECUTIVE VERDICT</h4>
            <div className="text-[10px] text-zinc-500 mt-0.5">Resultado educativo, no asesoría financiera.</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-wider text-zinc-500">WINNER</div>
            <div className="text-lg tabular text-cyan-300 font-semibold">{verdict.winner || composite.winner || 'Tie'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mb-3">
          <CompareMetric label="Confidence" value={verdict.confidence} accent="cyan" />
          <CompareMetric label="Long-Term" value={verdict.betterLongTermThesis} />
          <CompareMetric label="Short-Term" value={verdict.betterShortTermSetup} />
          <CompareMetric label="Risk-Adjusted" value={verdict.betterRiskAdjustedProfile} />
          <CompareMetric label={`${tokenA} Signal`} value={verdict.signalA} accent={signalAccent(verdict.signalA)} />
          <CompareMetric label={`${tokenB} Signal`} value={verdict.signalB} accent={signalAccent(verdict.signalB)} />
          <CompareMetric label={`${tokenA} Grade`} value={composite.gradeA} />
          <CompareMetric label={`${tokenB} Grade`} value={composite.gradeB} />
        </div>

        {verdict.summary && (
          <div className="border-t border-cyan-500/20 pt-3 text-sm text-zinc-200 leading-relaxed">
            {verdict.summary}
          </div>
        )}
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">COMPOSITE SCORE</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Dimension</th>
                <th className="text-right px-4 py-2 font-medium">{tokenA}</th>
                <th className="text-right px-4 py-2 font-medium">{tokenB}</th>
                <th className="text-left px-4 py-2 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {scoreRows.map(([label, row]) => (
                <tr key={label}>
                  <td className="px-4 py-2 text-zinc-300">{label}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100">{scoreValue(row?.tokenA)}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100">{scoreValue(row?.tokenB)}</td>
                  <td className="px-4 py-2 tabular text-cyan-300">{row?.winner || '-'}</td>
                </tr>
              ))}
              <tr className="bg-zinc-900/40">
                <td className="px-4 py-2 text-zinc-100 font-semibold">Composite</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(composite.tokenA)}</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(composite.tokenB)}</td>
                <td className="px-4 py-2 tabular text-cyan-300 font-semibold">{composite.winner || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-100 font-semibold">Grade</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{composite.gradeA || '-'}</td>
                <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{composite.gradeB || '-'}</td>
                <td className="px-4 py-2 tabular text-cyan-300">{composite.winner || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 p-4 border-t border-zinc-800">
          {scoreRows.map(([label, row]) => row?.reason && (
            <div key={label} className="border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-[10px] tracking-wider text-zinc-500 mb-1">{label.toUpperCase()}</div>
              <div className="text-xs text-zinc-300 leading-relaxed">{row.reason}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">RISK MATRIX</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Risk Factor</th>
                <th className="text-left px-4 py-2 font-medium">{tokenA}</th>
                <th className="text-left px-4 py-2 font-medium">{tokenB}</th>
                <th className="text-left px-4 py-2 font-medium">Higher Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {riskRows.map(([label, row]) => (
                <tr key={label}>
                  <td className="px-4 py-2 text-zinc-300">{label}</td>
                  <td className={`px-4 py-2 tabular ${riskClass(row?.tokenA)}`}>{row?.tokenA || '-'}</td>
                  <td className={`px-4 py-2 tabular ${riskClass(row?.tokenB)}`}>{row?.tokenB || '-'}</td>
                  <td className="px-4 py-2 tabular text-zinc-200">{row?.higherRisk || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 p-4 border-t border-zinc-800">
          <RiskNote label={`Biggest Risk ${tokenA}`} value={biggestRisks[tokenA]} />
          <RiskNote label={`Biggest Risk ${tokenB}`} value={biggestRisks[tokenB]} />
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-[11px] tracking-[0.2em] text-zinc-300 mb-3">DATA QUALITY</h4>
        <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
          <CompareMetric label="Freshness" value={dataQuality.freshness} accent={dataQuality.freshness === 'High' ? 'emerald' : dataQuality.freshness === 'Medium' ? 'amber' : 'red'} />
          <CompareMetric label="Missing Data" value={Array.isArray(dataQuality.missingData) ? dataQuality.missingData.length : 0} />
          <CompareMetric label="Disclaimer" value="Visible" accent="cyan" />
        </div>
        {Array.isArray(dataQuality.missingData) && dataQuality.missingData.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] tracking-wider text-zinc-500 mb-1">MISSING DATA</div>
            <div className="flex flex-wrap gap-1.5">
              {dataQuality.missingData.map((item, i) => (
                <span key={`${item}-${i}`} className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[10px] text-amber-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {dataQuality.uncertaintyNote && (
          <div className="text-xs text-zinc-300 leading-relaxed mb-3">{dataQuality.uncertaintyNote}</div>
        )}
        <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200 leading-relaxed">
          {result.disclaimer || 'Educational analysis only. This is not financial advice.'}
        </div>
      </section>
    </div>
  );
}

function CompareMetric({ label, value, accent = 'zinc' }) {
  const accentClass = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    cyan: 'text-cyan-300',
    zinc: 'text-zinc-100',
  }[accent] || 'text-zinc-100';

  return (
    <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2 min-w-0">
      <div className="text-[9px] tracking-wider text-zinc-500 truncate">{label.toUpperCase()}</div>
      <div className={`text-sm tabular font-semibold truncate ${accentClass}`}>{value ?? '-'}</div>
    </div>
  );
}

function RiskNote({ label, value }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="text-[10px] tracking-wider text-zinc-500 mb-1">{label.toUpperCase()}</div>
      <div className="text-xs text-zinc-300 leading-relaxed">{value || 'No disponible.'}</div>
    </div>
  );
}

function signalAccent(signal) {
  if (signal === 'BUY' || signal === 'ACCUMULATE') return 'emerald';
  if (signal === 'WATCH' || signal === 'HOLD') return 'amber';
  if (signal === 'AVOID') return 'red';
  return 'zinc';
}

function scoreValue(value) {
  return typeof value === 'number' ? fmt(value, 0) : '-';
}

function WatchlistScoringPanel({
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
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
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

        {result && <WatchlistScoringResult result={result} />}
      </div>
    </div>
  );
}

function WatchlistScoringResult({ result }) {
  const assets = Array.isArray(result?.assets)
    ? [...result.assets].sort((a, b) => Number(b.compositeScore || 0) - Number(a.compositeScore || 0))
    : [];
  const summary = result?.summary || {};
  const dataQuality = result?.dataQuality || {};

  return (
    <div className="space-y-4 pt-1">
      <section className="border border-cyan-500/30 bg-cyan-500/5 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h4 className="text-[11px] tracking-[0.2em] text-cyan-300">EXECUTIVE DASHBOARD</h4>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Snapshot generado {result?.generatedAt ? new Date(result.generatedAt).toLocaleString('es-MX') : 'ahora'}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 tabular">{assets.length} assets</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          <CompareMetric label="Best Overall" value={summary.bestOverall || 'N/A'} accent="cyan" />
          <CompareMetric label="Best Momentum" value={summary.bestMomentum || 'N/A'} accent="emerald" />
          <CompareMetric label="Lowest Risk" value={summary.lowestRisk || 'N/A'} accent="emerald" />
          <CompareMetric label="Highest Risk" value={summary.highestRisk || 'N/A'} accent="red" />
          <CompareMetric label="Freshness" value={dataQuality.freshness || 'N/A'} accent={dataQuality.freshness === 'High' ? 'emerald' : dataQuality.freshness === 'Medium' ? 'amber' : 'red'} />
        </div>
        {summary.marketRegimeNote && (
          <div className="mt-3 border-t border-cyan-500/20 pt-3 text-sm text-zinc-200 leading-relaxed">
            {summary.marketRegimeNote}
          </div>
        )}
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">RANKING TABLE</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-xs">
            <thead className="text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="text-right px-4 py-2 font-medium">Rank</th>
                <th className="text-left px-4 py-2 font-medium">Asset</th>
                <th className="text-right px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium">Grade</th>
                <th className="text-left px-4 py-2 font-medium">Signal</th>
                <th className="text-left px-4 py-2 font-medium">Risk</th>
                <th className="text-left px-4 py-2 font-medium">Confidence</th>
                <th className="text-left px-4 py-2 font-medium">Key Strength</th>
                <th className="text-left px-4 py-2 font-medium">Key Weakness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {assets.map((asset, index) => (
                <tr key={asset.symbol || index}>
                  <td className="px-4 py-2 text-right tabular text-zinc-400">{asset.rank || index + 1}</td>
                  <td className="px-4 py-2 tabular text-zinc-100 font-semibold">{asset.symbol || '-'}</td>
                  <td className="px-4 py-2 text-right tabular text-zinc-100 font-semibold">{scoreValue(asset.compositeScore)}</td>
                  <td className="px-4 py-2 tabular text-cyan-300">{asset.grade || '-'}</td>
                  <td className={`px-4 py-2 tabular font-semibold ${watchlistSignalClass(asset.signal)}`}>{asset.signal || '-'}</td>
                  <td className={`px-4 py-2 tabular ${riskClass(asset.riskLevel)}`}>{asset.riskLevel || '-'}</td>
                  <td className="px-4 py-2 tabular text-zinc-200">{asset.confidence || '-'}</td>
                  <td className="px-4 py-2 text-zinc-300 max-w-[220px]">{asset.keyStrength || '-'}</td>
                  <td className="px-4 py-2 text-zinc-400 max-w-[220px]">{asset.keyWeakness || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h4 className="text-[11px] tracking-[0.2em] text-zinc-300">SCORE BREAKDOWN</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3 p-4">
          {assets.map((asset, index) => (
            <WatchlistAssetScoreCard key={asset.symbol || index} asset={asset} />
          ))}
        </div>
      </section>

      <section className="border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-[11px] tracking-[0.2em] text-zinc-300 mb-3">DATA QUALITY</h4>
        <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
          <CompareMetric label="Freshness" value={dataQuality.freshness || 'N/A'} accent={dataQuality.freshness === 'High' ? 'emerald' : dataQuality.freshness === 'Medium' ? 'amber' : 'red'} />
          <CompareMetric label="Missing Data" value={Array.isArray(dataQuality.missingData) ? dataQuality.missingData.length : 0} />
          <CompareMetric label="Disclaimer" value="Visible" accent="cyan" />
        </div>
        {Array.isArray(dataQuality.missingData) && dataQuality.missingData.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] tracking-wider text-zinc-500 mb-1">MISSING DATA</div>
            <div className="flex flex-wrap gap-1.5">
              {dataQuality.missingData.map((item, i) => (
                <span key={`${item}-${i}`} className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-[10px] text-amber-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {dataQuality.uncertaintyNote && (
          <div className="text-xs text-zinc-300 leading-relaxed mb-3">{dataQuality.uncertaintyNote}</div>
        )}
        <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200 leading-relaxed">
          {result.disclaimer || 'Educational analysis only. This is not financial advice.'}
        </div>
      </section>
    </div>
  );
}

function WatchlistAssetScoreCard({ asset }) {
  const rows = [
    ['On-Chain', asset?.scores?.onChainHealth],
    ['Tokenomics', asset?.scores?.tokenomicsQuality],
    ['Sentiment', asset?.scores?.sentimentMomentum],
    ['Technical', asset?.scores?.technicalSetup],
    ['Fundamental', asset?.scores?.fundamentalStrength],
  ];

  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm tabular text-zinc-100 font-semibold">{asset?.symbol || '-'}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{asset?.summary || 'Sin resumen disponible.'}</div>
        </div>
        <div className={`text-xs tabular font-semibold ${watchlistSignalClass(asset?.signal)}`}>
          {asset?.signal || '-'}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[92px_1fr_36px] items-center gap-2">
            <div className="text-[10px] text-zinc-500">{label}</div>
            <div className="h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full ${Number(value || 0) >= 70 ? 'bg-emerald-400' : Number(value || 0) >= 45 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }}
              />
            </div>
            <div className="text-right text-[10px] tabular text-zinc-300">{scoreValue(value)}</div>
          </div>
        ))}
      </div>
      {asset?.invalidation && (
        <div className="mt-3 border-t border-zinc-800 pt-2 text-[10px] text-amber-300 leading-relaxed">
          Invalidation: {asset.invalidation}
        </div>
      )}
    </div>
  );
}

function AnalysisLoading() {
  const messages = [
    'Pidiendo análisis a Claude...',
    'Evaluando filtros del plan...',
    'Computando confluencia técnica...',
    'Buscando setup válido...',
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="border border-cyan-500/30 bg-cyan-500/5 p-8 text-center">
      <Loader2 className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin" />
      <div className="text-cyan-400 text-xs tracking-[0.3em] mb-1">// {messages[msgIdx]}</div>
      <div className="text-[10px] text-zinc-500 mt-2">esto puede tomar 10-20s</div>
    </div>
  );
}

function AnalysisCard({ analysis, onApply, onDelete, metrics, config }) {
  const a = analysis;
  const verdictStyles = {
    TRADE: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/40', text: 'text-emerald-400' },
    WAIT:  { bg: 'bg-amber-500/5',   border: 'border-amber-500/40',   text: 'text-amber-400' },
    PASS:  { bg: 'bg-zinc-800/40',   border: 'border-zinc-700',       text: 'text-zinc-400' },
  };
  const vs = verdictStyles[a.verdict] || verdictStyles.PASS;
  const biasColor = a.bias === 'bullish' ? 'text-emerald-400'
                  : a.bias === 'bearish' ? 'text-red-400' : 'text-zinc-400';

  // Validate setup against Fernando's rules
  const setupBlocked = a.setup?.valid && (
    metrics.open.length >= config.maxOpenPositions ||
    (a.setup.stopPct && a.setup.stopPct > 12)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`border ${vs.border} ${vs.bg} p-4`}>
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`text-[10px] tracking-[0.3em] px-2 py-1 border ${vs.border} ${vs.text} font-bold`}>
              {a.verdict}
            </div>
            <div className="text-lg tabular text-zinc-100">{symbolToPair(a.symbol)}</div>
            <div className={`text-xs tracking-wider ${biasColor}`}>
              {a.bias?.toUpperCase()} <span className="text-zinc-500">({a.biasStrength}/10)</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 tabular">
            {new Date(a.timestamp).toLocaleString('es-MX')}
          </div>
        </div>
        <div className="text-sm text-zinc-200 leading-relaxed">{a.summary}</div>
      </div>

      {/* Confluence */}
      {a.confluence && (
        <Panel title="CONFLUENCIA" subtitle={`Score ${a.confluence.score}/10`}>
          <div className="p-4 space-y-3">
            <div className="relative h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className={`absolute inset-y-0 left-0 ${
                a.confluence.score >= 7 ? 'bg-emerald-400'
                : a.confluence.score >= 4 ? 'bg-amber-400' : 'bg-red-400'
              }`} style={{ width: `${a.confluence.score * 10}%` }} />
            </div>
            <div className="space-y-1.5 pt-2">
              {a.confluence.factors?.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {f.type === 'positive' ? (
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={f.type === 'positive' ? 'text-zinc-200' : 'text-zinc-400'}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Setup */}
      {a.setup && (
        <Panel title="SETUP PROPUESTO"
               subtitle={a.setup.valid ? '✓ Cumple filtros del plan' : '✗ No cumple filtros — no operar'}>
          <div className="p-4 space-y-3">
            {!a.setup.valid ? (
              <div className="text-sm text-amber-300">
                {a.setup.rationale || 'Setup descartado por el analyst.'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">DIRECCIÓN</div>
                    <div className={`text-sm tabular font-semibold ${
                      a.setup.direction === 'long' ? 'text-emerald-400' : 'text-red-400'
                    }`}>{a.setup.direction?.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">ENTRY</div>
                    <div className="text-sm tabular text-zinc-100">${fmtPrice(a.setup.entry)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">STOP LOSS</div>
                    <div className="text-sm tabular text-red-400">${fmtPrice(a.setup.stopLoss)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">STOP DIST</div>
                    <div className={`text-sm tabular ${
                      (a.setup.stopPct || 0) > 12 ? 'text-red-400' : 'text-zinc-100'
                    }`}>{fmt(a.setup.stopPct || 0, 2)}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">TP1</div>
                    <div className="text-sm tabular text-emerald-400">
                      {a.setup.tp1 ? `$${fmtPrice(a.setup.tp1)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">TP2</div>
                    <div className="text-sm tabular text-emerald-400/70">
                      {a.setup.tp2 ? `$${fmtPrice(a.setup.tp2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">R:R TP1</div>
                    <div className={`text-sm tabular ${
                      (a.setup.rrTp1 || 0) >= 1.5 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {a.setup.rrTp1 ? `1:${fmt(a.setup.rrTp1, 2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-zinc-500">SIZE</div>
                    <div className="text-sm tabular text-amber-400">
                      {a.setup.stopPct
                        ? `$${fmt((metrics.currentCapital * config.riskPctPerTrade / 100) / (a.setup.stopPct / 100), 0)}`
                        : '—'}
                    </div>
                  </div>
                </div>
                {a.setup.rationale && (
                  <div className="pt-3 border-t border-zinc-800 text-sm text-zinc-300 italic leading-relaxed">
                    {a.setup.rationale}
                  </div>
                )}
              </>
            )}
          </div>
        </Panel>
      )}

      {/* Risks */}
      {a.risks?.length > 0 && (
        <Panel title="RIESGOS" subtitle="Lo que podría salir mal">
          <div className="p-4 space-y-2">
            {a.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{r}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {a.setup?.valid ? (
          <button onClick={onApply} disabled={setupBlocked}
            className={`py-3 text-xs font-bold tracking-[0.2em] inline-flex items-center justify-center gap-2 ${
              setupBlocked
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
            }`}>
            <ArrowUp className="w-3.5 h-3.5" />
            APLICAR A NUEVO TRADE
          </button>
        ) : (
          <div className="py-3 text-xs tracking-[0.2em] text-zinc-500 text-center border border-zinc-800">
            SIN SETUP VÁLIDO
          </div>
        )}
        <button onClick={onDelete}
          className="py-3 text-xs tracking-[0.2em] border border-zinc-800 hover:border-red-500/40 hover:text-red-400 text-zinc-400 inline-flex items-center justify-center gap-2">
          <Trash2 className="w-3.5 h-3.5" />
          ELIMINAR
        </button>
      </div>
      {setupBlocked && (
        <div className="text-[11px] text-amber-400 text-center">
          ⚠ No podés aplicar: {metrics.open.length >= config.maxOpenPositions
            ? `máx ${config.maxOpenPositions} posiciones abiertas alcanzado`
            : 'stop dist supera 12%'}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADES LIST + CSV IMPORT
// ═══════════════════════════════════════════════════════════════════════════
function TradesList({ trades, saveTrades, setEditingTrade }) {
  const [filter, setFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    let f = [...trades].reverse();
    if (filter === 'open')   f = f.filter(t => t.status === 'open');
    if (filter === 'closed') f = f.filter(t => t.status === 'closed');
    if (filter === 'wins')   f = f.filter(t => t.status === 'closed' && t.pnl > 0);
    if (filter === 'losses') f = f.filter(t => t.status === 'closed' && t.pnl <= 0);
    return f;
  }, [trades, filter]);

  const deleteTrade = (id) => {
    if (!confirm('¿Eliminar este trade del registro? No se puede deshacer.')) return;
    saveTrades(trades.filter(t => t.id !== id));
  };

  const exportCSV = () => {
    const headers = ['date','pair','direction','status','entry','stop','tp1','size','risk','exit','pnl','rResult','followedPlan','setup','lesson'];
    const rows = trades.map(t => [
      new Date(t.date).toISOString(), t.pair, t.direction, t.status,
      t.entryPrice, t.stopLoss, t.tp1 || '', t.positionSize, t.riskAmount,
      t.exitPrice || '', t.pnl || '', t.rResult || '',
      t.followedPlan ?? '', `"${(t.setup || '').replace(/"/g, '""')}"`,
      `"${(t.lesson || '').replace(/"/g, '""')}"`,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filters = [
    { id: 'all', label: 'TODOS' }, { id: 'open', label: 'ABIERTOS' },
    { id: 'closed', label: 'CERRADOS' }, { id: 'wins', label: 'WINS' },
    { id: 'losses', label: 'LOSSES' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] border whitespace-nowrap transition-colors ${
                filter === f.id ? 'border-amber-500/60 text-amber-400 bg-amber-500/5'
                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}>{f.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(!showImport)}
            className="px-3 py-1.5 text-[10px] tracking-[0.2em] border border-zinc-800 hover:border-cyan-500/60 hover:text-cyan-400 text-zinc-300 inline-flex items-center gap-1.5">
            <Upload className="w-3 h-3" /> IMPORTAR
          </button>
          <button onClick={exportCSV}
            className="px-3 py-1.5 text-[10px] tracking-[0.2em] border border-zinc-800 hover:border-amber-500/60 hover:text-amber-400 text-zinc-300 inline-flex items-center gap-1.5">
            <Download className="w-3 h-3" /> EXPORT
          </button>
        </div>
      </div>

      {showImport && <CsvImport trades={trades} saveTrades={saveTrades}
                                onClose={() => setShowImport(false)} />}

      {filtered.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <div className="text-zinc-500 text-sm">// sin resultados</div>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800">
          {filtered.map(t => (
            <TradeListItem key={t.id} trade={t}
              onClose={() => setEditingTrade(t)} onDelete={() => deleteTrade(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeListItem({ trade: t, onClose, onDelete }) {
  const isOpen = t.status === 'open';
  const isWin = !isOpen && t.pnl > 0;

  return (
    <div className="p-4 hover:bg-zinc-900/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] tracking-wider px-1.5 py-0.5 border ${
            isOpen ? 'border-amber-500/40 text-amber-400 blink'
            : isWin ? 'border-emerald-500/40 text-emerald-400'
                    : 'border-red-500/40 text-red-400'
          }`}>{isOpen ? 'OPEN' : isWin ? 'WIN' : 'LOSS'}</span>
          <span className="text-sm tabular">{t.pair}</span>
          <span className={`text-xs tabular ${
            t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'
          }`}>{t.direction === 'long' ? 'LONG' : 'SHORT'}</span>
          {t.imported && (
            <span className="text-[9px] tracking-wider px-1 py-0.5 border border-cyan-500/30 text-cyan-400">
              IMPORTED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOpen && (
            <button onClick={onClose}
              className="text-[10px] tracking-wider px-2 py-1 border border-zinc-700 hover:border-amber-500/60 hover:text-amber-400 text-zinc-400 transition-colors">
              CERRAR
            </button>
          )}
          <button onClick={onDelete} className="text-zinc-600 hover:text-red-400 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-2">
        <div><div className="text-zinc-500 text-[10px]">ENTRY</div>
             <div className="tabular">{fmtUsd(t.entryPrice, 4)}</div></div>
        <div><div className="text-zinc-500 text-[10px]">STOP</div>
             <div className="tabular">{fmtUsd(t.stopLoss || 0, 4)}</div></div>
        <div><div className="text-zinc-500 text-[10px]">SIZE</div>
             <div className="tabular">{fmtUsd(t.positionSize)}</div></div>
        <div><div className="text-zinc-500 text-[10px]">RIESGO</div>
             <div className="tabular text-amber-400">${fmt(t.riskAmount)}</div></div>
      </div>

      {!isOpen && (
        <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-zinc-800">
          <div><div className="text-zinc-500 text-[10px]">EXIT</div>
               <div className="tabular">{fmtUsd(t.exitPrice, 4)}</div></div>
          <div><div className="text-zinc-500 text-[10px]">P&L</div>
               <div className={`tabular font-semibold ${colorPnL(t.pnl)}`}>
                 {sign(t.pnl)}{fmtUsd(t.pnl)}</div></div>
          <div><div className="text-zinc-500 text-[10px]">R</div>
               <div className={`tabular ${colorPnL(t.rResult)}`}>
                 {sign(t.rResult)}{fmt(t.rResult, 2)}R</div></div>
        </div>
      )}

      {t.setup && <div className="text-[11px] text-zinc-500 mt-2 italic">"{t.setup}"</div>}
      {!isOpen && t.lesson && (
        <div className="text-[11px] text-cyan-400/80 mt-2">→ {t.lesson}</div>
      )}
    </div>
  );
}

// ─── CSV IMPORT (Binance trade history) ────────────────────────────────────
function CsvImport({ trades, saveTrades, onClose }) {
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setCsvText(e.target.result);
    reader.readAsText(file);
  };

  const parseCSV = () => {
    setError(null);
    try {
      const parsedCsv = Papa.parse(csvText.trim(), {
        skipEmptyLines: true,
      });
      if (parsedCsv.errors?.length) {
        throw new Error(parsedCsv.errors[0].message || 'CSV inválido');
      }
      const rows = parsedCsv.data;
      if (rows.length < 2) throw new Error('CSV vacío o inválido');
      const headers = rows[0].map(h => String(h).trim().toLowerCase());

      // Try to detect Binance format (Date, Pair, Type, Side, Price, Amount, Total, Fee...)
      // Or generic format (date, pair, side, price, qty)
      const idx = (...names) => names.map(n => headers.indexOf(n)).find(i => i >= 0);
      const dateIdx  = idx('date', 'date(utc)', 'time');
      const pairIdx  = idx('pair', 'symbol', 'market');
      const sideIdx  = idx('side', 'type');
      const priceIdx = idx('price', 'avg price');
      const amountIdx = idx('amount', 'executed', 'qty', 'quantity');
      const totalIdx = idx('total', 'amount(usdt)', 'cost');

      if (dateIdx < 0 || pairIdx < 0 || sideIdx < 0 || priceIdx < 0) {
        throw new Error('Columnas requeridas no encontradas: date, pair, side, price');
      }

      const fills = rows.slice(1).map(row => {
        const cells = row.map(c => String(c ?? '').trim().replace(/^"|"$/g, ''));
        return {
          date: cells[dateIdx],
          pair: cells[pairIdx].toUpperCase(),
          side: cells[sideIdx].toUpperCase().includes('BUY') ? 'BUY' : 'SELL',
          price: parseFloat(cells[priceIdx]),
          amount: amountIdx >= 0 ? parseFloat(cells[amountIdx]) : 0,
          total: totalIdx >= 0 ? parseFloat(cells[totalIdx]) : 0,
        };
      }).filter(f => f.price > 0);

      // Match buy+sell pairs (FIFO per symbol) into closed trades
      const bySymbol = {};
      fills.forEach(f => {
        if (!bySymbol[f.pair]) bySymbol[f.pair] = [];
        bySymbol[f.pair].push(f);
      });

      const matched = [];
      Object.entries(bySymbol).forEach(([pair, list]) => {
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        const buys = [];
        list.forEach(fill => {
          if (fill.side === 'BUY') {
            buys.push({ ...fill, remaining: fill.amount });
          } else if (fill.side === 'SELL' && buys.length) {
            let sellQty = fill.amount;
            while (sellQty > 0 && buys.length) {
              const buy = buys[0];
              const matchedQty = Math.min(sellQty, buy.remaining);
              const positionSize = matchedQty * buy.price;
              const pnl = matchedQty * (fill.price - buy.price);
              matched.push({
                id: makeId(),
                date: buy.date,
                closedAt: fill.date,
                pair: pair.replace('USDT', '/USDT'),
                direction: 'long',
                status: 'closed',
                entryPrice: buy.price,
                exitPrice: fill.price,
                stopLoss: 0,
                positionSize,
                riskAmount: positionSize * 0.015,
                pnl,
                rResult: pnl / (positionSize * 0.015),
                setup: 'Importado de CSV',
                followedPlan: null,
                imported: true,
              });
              buy.remaining -= matchedQty;
              sellQty -= matchedQty;
              if (buy.remaining <= 0) buys.shift();
            }
          }
        });
      });

      setPreview({ matched, total: fills.length });
    } catch (e) {
      setError(e.message);
      setPreview(null);
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    saveTrades([...trades, ...preview.matched]);
    onClose();
  };

  return (
    <div className="border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-cyan-400 mb-1">// IMPORTAR HISTORIAL CSV</div>
          <div className="text-[10px] text-zinc-500">
            Binance: Wallet → Transaction History → Export. Formato esperado: Date, Pair, Side, Price, Amount.
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
               onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()}
          className="px-3 py-2 text-xs tracking-wider border border-zinc-700 hover:border-cyan-500/60 hover:text-cyan-400 text-zinc-300">
          SELECCIONAR ARCHIVO
        </button>
        <span className="text-[10px] text-zinc-600 self-center">o pegá CSV abajo</span>
      </div>

      <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
        rows={6} placeholder="date,pair,side,price,amount&#10;2025-01-15,SOLUSDT,BUY,180.50,2.5&#10;..."
        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs tabular focus:outline-none focus:border-cyan-500/50 resize-none" />

      <div className="flex gap-2">
        <button onClick={parseCSV} disabled={!csvText.trim()}
          className={`px-4 py-2 text-xs tracking-wider transition-colors ${
            csvText.trim() ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}>PARSEAR</button>
      </div>

      {error && (
        <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/5 p-2">
          ⚠ {error}
        </div>
      )}

      {preview && (
        <div className="border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
          <div className="text-xs text-emerald-400">
            ✓ {preview.matched.length} trades cerrados detectados de {preview.total} fills
          </div>
          <div className="text-[10px] text-zinc-500">
            Los stops se setean en 0 (no disponibles en Binance trade history). Vas a poder editar manualmente.
          </div>
          <button onClick={confirmImport}
            className="px-4 py-2 text-xs font-bold tracking-wider bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
            CONFIRMAR IMPORT ({preview.matched.length} TRADES)
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOSE TRADE MODAL
// ═══════════════════════════════════════════════════════════════════════════
function CloseTradeModal({ trade: t, trades, saveTrades, onClose }) {
  const [exitPrice, setExitPrice] = useState('');
  const [followedPlan, setFollowedPlan] = useState(true);
  const [lesson, setLesson] = useState('');

  // Live price
  const symbol = pairToSymbol(t.pair);
  const { tickers } = useLiveTickers([symbol], 5000);
  const livePrice = tickers[symbol] ? parseFloat(tickers[symbol].lastPrice) : null;

  const preview = useMemo(() => {
    const ex = parseFloat(exitPrice);
    if (!ex || ex <= 0) return null;
    const units = t.positionSize / t.entryPrice;
    const pnl = t.direction === 'long' ? (ex - t.entryPrice) * units
                                       : (t.entryPrice - ex) * units;
    const rResult = pnl / t.riskAmount;
    return { pnl, rResult };
  }, [exitPrice, t]);

  const handleClose = () => {
    if (!preview) return;
    const updated = trades.map(x =>
      x.id === t.id ? { ...x, status: 'closed',
        exitPrice: parseFloat(exitPrice), pnl: preview.pnl, rResult: preview.rResult,
        followedPlan, lesson, closedAt: new Date().toISOString() } : x
    );
    saveTrades(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6"
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full max-w-md bg-zinc-950 border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-[0.2em] text-zinc-300">CERRAR POSICIÓN</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {t.pair} · {t.direction.toUpperCase()} · entry {fmtUsd(t.entryPrice, 4)}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Field label="PRECIO DE SALIDA">
            <input type="number" step="any" value={exitPrice} autoFocus
              onChange={e => setExitPrice(e.target.value)} placeholder="0.00"
              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            {livePrice && (
              <div className="text-[10px] text-zinc-500 mt-1 tabular">
                live: ${fmtPrice(livePrice)}{' '}
                <button onClick={() => setExitPrice(livePrice.toString())}
                        className="text-cyan-400 hover:text-cyan-300 ml-1">[usar]</button>
              </div>
            )}
          </Field>

          {preview && (
            <div className={`border p-3 ${
              preview.pnl > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'
            }`}>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-[10px] tracking-[0.2em] text-zinc-500">P&L</div>
                     <div className={`text-xl tabular font-bold ${colorPnL(preview.pnl)}`}>
                       {sign(preview.pnl)}{fmtUsd(preview.pnl)}</div></div>
                <div><div className="text-[10px] tracking-[0.2em] text-zinc-500">R RESULTADO</div>
                     <div className={`text-xl tabular font-bold ${colorPnL(preview.rResult)}`}>
                       {sign(preview.rResult)}{fmt(preview.rResult, 2)}R</div></div>
              </div>
            </div>
          )}

          <Field label="¿SEGUÍ MI PLAN?">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setFollowedPlan(true)}
                className={`py-2 text-xs tracking-wider border transition-colors ${
                  followedPlan ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-800 text-zinc-500'
                }`}>SÍ — TAL CUAL</button>
              <button onClick={() => setFollowedPlan(false)}
                className={`py-2 text-xs tracking-wider border transition-colors ${
                  !followedPlan ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                                : 'border-zinc-800 text-zinc-500'
                }`}>NO — ME DESVIÉ</button>
            </div>
          </Field>

          <Field label="LECCIÓN APRENDIDA">
            <textarea value={lesson} onChange={e => setLesson(e.target.value)} rows={2}
              placeholder="¿Qué aprendiste de este trade?"
              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
          </Field>

          <button onClick={handleClose} disabled={!preview}
            className={`w-full py-3 text-xs font-bold tracking-[0.2em] transition-colors ${
              preview ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}>CERRAR TRADE</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS — Observability del trading system
// ═══════════════════════════════════════════════════════════════════════════
function AnalyticsView({ trades, config, metrics }) {
  const closed = useMemo(() => trades.filter(t => t.status === 'closed'), [trades]);
  const N = closed.length;

  // ─── Core stats computation ────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!N) return null;

    const wins = closed.filter(t => t.pnl > 0);
    const losses = closed.filter(t => t.pnl <= 0);
    const winRate = wins.length / N;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) / losses.length : 0;
    const avgWinR = wins.length ? wins.reduce((s, t) => s + (t.rResult || 0), 0) / wins.length : 0;
    const avgLossR = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.rResult || 0), 0)) / losses.length : 0;

    // Expectancy
    const expectancyDollar = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    const expectancyR = (winRate * avgWinR) - ((1 - winRate) * avgLossR);

    // Profit factor
    const grossWon = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLost = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLost > 0 ? grossWon / grossLost : grossWon > 0 ? Infinity : 0;

    // Standard deviation of R-results (volatility of returns)
    const rResults = closed.map(t => t.rResult || 0);
    const meanR = rResults.reduce((s, r) => s + r, 0) / N;
    const variance = rResults.reduce((s, r) => s + Math.pow(r - meanR, 2), 0) / N;
    const stdR = Math.sqrt(variance);
    // Sharpe-like ratio (risk-adjusted return per trade)
    const consistency = stdR > 0 ? meanR / stdR : 0;

    // Best / worst
    const bestTrade = closed.reduce((b, t) => (!b || t.pnl > b.pnl) ? t : b, null);
    const worstTrade = closed.reduce((w, t) => (!w || t.pnl < w.pnl) ? t : w, null);

    return {
      wins, losses, winRate, avgWin, avgLoss, avgWinR, avgLossR,
      expectancyDollar, expectancyR, profitFactor, grossWon, grossLost,
      meanR, stdR, consistency, bestTrade, worstTrade,
    };
  }, [closed, N]);

  // ─── R-multiple distribution ───────────────────────────────────────────
  const rDistribution = useMemo(() => {
    const bins = [
      { range: '< -2R',     min: -Infinity, max: -2, count: 0, color: '#dc2626' },
      { range: '-2 to -1R', min: -2,        max: -1, count: 0, color: '#ef4444' },
      { range: '-1 to 0R',  min: -1,        max: 0,  count: 0, color: '#f87171' },
      { range: '0 to 1R',   min: 0,         max: 1,  count: 0, color: '#34d399' },
      { range: '1 to 2R',   min: 1,         max: 2,  count: 0, color: '#10b981' },
      { range: '2 to 3R',   min: 2,         max: 3,  count: 0, color: '#059669' },
      { range: '> 3R',      min: 3,         max: Infinity, count: 0, color: '#047857' },
    ];
    closed.forEach(t => {
      const r = t.rResult || 0;
      const bin = bins.find(b => r >= b.min && r < b.max);
      if (bin) bin.count++;
    });
    return bins;
  }, [closed]);

  // ─── Equity curve + drawdown ───────────────────────────────────────────
  const equityData = useMemo(() => {
    if (!closed.length) return [];
    const sorted = [...closed].sort((a, b) =>
      new Date(a.closedAt) - new Date(b.closedAt));
    let running = config.initialCapital;
    let peak = running;
    const points = [{ idx: 0, equity: running, peak, dd: 0, ddPct: 0 }];
    sorted.forEach((t, i) => {
      running += t.pnl;
      peak = Math.max(peak, running);
      const dd = running - peak;
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      points.push({ idx: i + 1, equity: running, peak, dd, ddPct });
    });
    return points;
  }, [closed, config.initialCapital]);

  const maxDD = useMemo(() => {
    if (!equityData.length) return { value: 0, pct: 0 };
    return equityData.reduce((m, p) =>
      p.dd < m.value ? { value: p.dd, pct: p.ddPct } : m,
      { value: 0, pct: 0 });
  }, [equityData]);

  // ─── Streak analysis ───────────────────────────────────────────────────
  const streaks = useMemo(() => {
    if (!closed.length) return null;
    const sorted = [...closed].sort((a, b) =>
      new Date(a.closedAt) - new Date(b.closedAt));
    let curW = 0, curL = 0, maxW = 0, maxL = 0, currentStreak = 0;
    sorted.forEach(t => {
      if (t.pnl > 0) {
        curW++; curL = 0;
        maxW = Math.max(maxW, curW);
      } else {
        curL++; curW = 0;
        maxL = Math.max(maxL, curL);
      }
    });
    const lastTrade = sorted[sorted.length - 1];
    currentStreak = lastTrade.pnl > 0 ? curW : -curL;
    return { maxW, maxL, currentStreak };
  }, [closed]);

  // ─── Breakdowns ─────────────────────────────────────────────────────────
  const byPair = useMemo(() => groupBreakdown(closed, t => t.pair), [closed]);
  const byEmotion = useMemo(() => groupBreakdown(closed, t => t.emotion || 'unknown'), [closed]);
  const byDow = useMemo(() => {
    const dows = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return groupBreakdown(closed, t => dows[new Date(t.date).getDay()]);
  }, [closed]);
  const byPlanFollowed = useMemo(() => {
    const onPlan = closed.filter(t => t.followedPlan === true);
    const offPlan = closed.filter(t => t.followedPlan === false);
    return { onPlan, offPlan };
  }, [closed]);

  // ─── Edge verdict ──────────────────────────────────────────────────────
  const verdict = useMemo(() => {
    if (N === 0) return { state: 'empty', label: 'SIN DATA', detail: '' };
    if (N < 10) return {
      state: 'insufficient',
      label: 'MUESTRA INSUFICIENTE',
      detail: `Necesitás al menos 10 trades para sacar conclusiones. Llevás ${N}.`
    };
    if (!stats) return { state: 'empty', label: 'SIN DATA', detail: '' };

    const hasEdge = stats.expectancyR > 0.1 && stats.profitFactor > 1.3;
    const possibleEdge = stats.expectancyR > 0 && stats.profitFactor > 1;
    const noEdge = stats.expectancyR <= 0 || stats.profitFactor < 1;

    if (N < 30) {
      return {
        state: 'preliminary',
        label: hasEdge ? 'EDGE PRELIMINAR ✓' : possibleEdge ? 'TENDENCIA POSITIVA' : 'BAJO RENDIMIENTO',
        detail: `${N}/30 trades. Datos preliminares — necesitás 30+ para confianza estadística.`
      };
    }
    if (hasEdge) return {
      state: 'edge',
      label: 'SISTEMA CON EDGE ✓',
      detail: `Expectancy ${stats.expectancyR.toFixed(2)}R por trade · PF ${stats.profitFactor.toFixed(2)}. Seguí ejecutando.`
    };
    if (possibleEdge) return {
      state: 'marginal',
      label: 'EDGE MARGINAL',
      detail: `Sistema apenas rentable. Revisá qué setups funcionan mejor abajo y eliminá los que no.`
    };
    return {
      state: 'no-edge',
      label: 'SIN EVIDENCIA DE EDGE ✗',
      detail: `Expectancy ${stats.expectancyR.toFixed(2)}R · PF ${stats.profitFactor.toFixed(2)}. PAUSÁ y rediseñá tu plan.`
    };
  }, [N, stats]);

  // ─── EMPTY STATE ───────────────────────────────────────────────────────
  if (N === 0) {
    return (
      <div className="space-y-4">
        <div className="border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <BarChart2 className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <div className="text-amber-400 text-xs tracking-[0.3em] mb-3">// ANALYTICS PENDIENTES</div>
          <div className="text-zinc-300 mb-2">Cuando cierres tu primer trade, esto cobra vida.</div>
          <div className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Acá vas a ver: distribución de R-multiples, equity curve con drawdown,
            performance por par/emoción/día, streaks, expectancy, profit factor,
            y el veredicto sobre si tu sistema tiene edge real o no.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Edge Verdict — pieza más importante */}
      <EdgeVerdictCard verdict={verdict} stats={stats} N={N} />

      {/* Core metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="EXPECTANCY $"
                  value={`${sign(stats.expectancyDollar)}${fmtUsd(stats.expectancyDollar)}`}
                  sub="por trade"
                  accent={stats.expectancyDollar > 0 ? 'emerald' : 'red'} />
          <Metric label="EXPECTANCY R"
                  value={`${sign(stats.expectancyR)}${fmt(stats.expectancyR, 2)}R`}
                  sub="por trade"
                  accent={stats.expectancyR > 0.1 ? 'emerald' : stats.expectancyR > 0 ? 'amber' : 'red'} />
          <Metric label="PROFIT FACTOR"
                  value={stats.profitFactor === Infinity ? '∞' : fmt(stats.profitFactor, 2)}
                  sub={`$${fmt(stats.grossWon, 0)} won · $${fmt(stats.grossLost, 0)} lost`}
                  accent={stats.profitFactor >= 1.5 ? 'emerald' : stats.profitFactor >= 1 ? 'amber' : 'red'} />
          <Metric label="CONSISTENCY"
                  value={fmt(stats.consistency, 2)}
                  sub="mean(R)/std(R)"
                  accent={stats.consistency > 0.3 ? 'emerald' : stats.consistency > 0 ? 'amber' : 'red'} />
        </div>
      )}

      {/* Win/Loss breakdown */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="WIN RATE" value={`${fmt(stats.winRate * 100, 1)}%`}
                  sub={`${stats.wins.length}W / ${stats.losses.length}L`}
                  accent={stats.winRate >= 0.4 ? 'emerald' : 'amber'} />
          <Metric label="AVG WIN" value={`+${fmtUsd(stats.avgWin)}`}
                  sub={`+${fmt(stats.avgWinR, 2)}R`}
                  accent="emerald" />
          <Metric label="AVG LOSS" value={`-${fmtUsd(stats.avgLoss)}`}
                  sub={`-${fmt(stats.avgLossR, 2)}R`}
                  accent="red" />
          <Metric label="MAX DRAWDOWN"
                  value={`${fmt(maxDD.pct, 1)}%`}
                  sub={fmtUsd(maxDD.value)}
                  accent={Math.abs(maxDD.pct) > 15 ? 'red' : Math.abs(maxDD.pct) > 8 ? 'amber' : 'zinc'} />
        </div>
      )}

      {/* R-Distribution histogram */}
      <Panel title="DISTRIBUCIÓN R-MULTIPLES"
             subtitle="Forma del histograma = forma de tu edge">
        <div className="p-4">
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: '#71717a', fontSize: 9 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false}
                       allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46',
                  borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v) => [`${v} trades`, 'Cantidad']} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {rDistribution.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <RDistributionInsight bins={rDistribution} N={N} />
        </div>
      </Panel>

      {/* Equity Curve + Drawdown */}
      <Panel title="EQUITY CURVE + DRAWDOWN"
             subtitle={`Max DD: ${fmt(maxDD.pct, 1)}% (${fmtUsd(maxDD.value)})`}>
        <div className="p-4 space-y-4">
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="idx" tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={{ stroke: '#3f3f46' }} tickLine={false}
                       tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46',
                  borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  labelStyle={{ color: '#a1a1aa' }} />
                <ReferenceLine y={config.initialCapital} stroke="#52525b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="peak" stroke="#10b981"
                      strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.6}
                      dot={false} name="Peak" />
                <Line type="monotone" dataKey="equity" stroke="#f59e0b"
                      strokeWidth={2} dot={false} name="Equity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-24 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-dd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" hide />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }}
                       axisLine={false} tickLine={false}
                       tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46',
                  borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  formatter={(v) => [`${fmt(v, 2)}%`, 'Drawdown']} />
                <ReferenceLine y={-config.dailyStopPct * 5} stroke="#ef4444"
                               strokeDasharray="4 4" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="ddPct" stroke="#ef4444"
                      strokeWidth={1.5} fill="url(#grad-dd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {Math.abs(maxDD.pct) > 15 && (
            <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/5 p-2">
              ⚠ DD &gt; 15%: tu plan dice pausar 2 semanas y rediseñar.
            </div>
          )}
        </div>
      </Panel>

      {/* Streaks */}
      {streaks && (
        <Panel title="STREAKS · RACHAS">
          <div className="p-4 grid grid-cols-3 gap-3">
            <StreakCell icon={Flame} label="ACTUAL"
              value={`${Math.abs(streaks.currentStreak)} ${streaks.currentStreak > 0 ? 'W' : streaks.currentStreak < 0 ? 'L' : '-'}`}
              sub={streaks.currentStreak > 0 ? 'racha ganadora' : streaks.currentStreak < 0 ? 'racha perdedora' : 'sin racha'}
              accent={streaks.currentStreak > 0 ? 'emerald' : streaks.currentStreak < 0 ? 'red' : 'zinc'} />
            <StreakCell icon={Award} label="MAX W"
              value={`${streaks.maxW}W`}
              sub="mejor racha"
              accent="emerald" />
            <StreakCell icon={Skull} label="MAX L"
              value={`${streaks.maxL}L`}
              sub="peor racha"
              accent="red" />
          </div>
        </Panel>
      )}

      {/* Plan Compliance Impact */}
      {(byPlanFollowed.onPlan.length > 0 || byPlanFollowed.offPlan.length > 0) && (
        <Panel title="¿SEGUIR EL PLAN PAGA?"
               subtitle="Comparación trades on-plan vs off-plan">
          <PlanCompareTable onPlan={byPlanFollowed.onPlan} offPlan={byPlanFollowed.offPlan} />
        </Panel>
      )}

      {/* Breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {byPair.length > 0 && (
          <Panel title="POR PAR" subtitle="¿Qué activos te funcionan?">
            <BreakdownTable rows={byPair} N={N} />
          </Panel>
        )}
        {byEmotion.length > 0 && (
          <Panel title="POR EMOCIÓN" subtitle="El reveal incómodo">
            <BreakdownTable rows={byEmotion} N={N} colorize="emotion" />
          </Panel>
        )}
      </div>

      {byDow.length > 0 && (
        <Panel title="POR DÍA DE LA SEMANA">
          <BreakdownTable rows={byDow} N={N} />
        </Panel>
      )}

      {/* Best/Worst */}
      {stats?.bestTrade && stats?.worstTrade && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ExtremesTradeCard trade={stats.bestTrade} kind="best" />
          <ExtremesTradeCard trade={stats.worstTrade} kind="worst" />
        </div>
      )}
    </div>
  );
}

// ─── Edge Verdict Card ─────────────────────────────────────────────────────
function EdgeVerdictCard({ verdict, stats, N }) {
  const styles = {
    edge:        { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
    preliminary: { border: 'border-amber-500/40',   bg: 'bg-amber-500/5',   text: 'text-amber-400' },
    marginal:    { border: 'border-amber-500/40',   bg: 'bg-amber-500/5',   text: 'text-amber-400' },
    insufficient:{ border: 'border-zinc-700',       bg: 'bg-zinc-900/40',   text: 'text-zinc-400' },
    'no-edge':   { border: 'border-red-500/40',     bg: 'bg-red-500/5',     text: 'text-red-400' },
    empty:       { border: 'border-zinc-700',       bg: 'bg-zinc-900/40',   text: 'text-zinc-400' },
  };
  const s = styles[verdict.state] || styles.empty;

  return (
    <div className={`border ${s.border} ${s.bg} p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-[10px] tracking-[0.3em] ${s.text} font-bold`}>
          // VEREDICTO
        </div>
        <div className="ml-auto text-[10px] text-zinc-500 tabular">
          {N} trade{N !== 1 ? 's' : ''} cerrado{N !== 1 ? 's' : ''}
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${s.text} mb-2`}>
        {verdict.label}
      </div>
      <div className="text-sm text-zinc-300 leading-relaxed">{verdict.detail}</div>
    </div>
  );
}

// ─── R-Distribution insight ────────────────────────────────────────────────
function RDistributionInsight({ bins, N }) {
  const winners = bins.filter(b => b.min >= 0).reduce((s, b) => s + b.count, 0);
  const losers = bins.filter(b => b.max <= 0).reduce((s, b) => s + b.count, 0);
  const big_winners = bins.filter(b => b.min >= 2).reduce((s, b) => s + b.count, 0);
  const fullStops = bins.find(b => b.range === '-1 to 0R')?.count || 0;
  const overStops = bins.filter(b => b.max <= -1).reduce((s, b) => s + b.count, 0);

  const insights = [];
  if (overStops > N * 0.1) {
    insights.push({
      type: 'negative',
      text: `${overStops} trades perdieron MÁS de 1R. Estás moviendo stops o el slippage te está matando.`
    });
  }
  if (big_winners >= N * 0.15) {
    insights.push({
      type: 'positive',
      text: `${big_winners} trades de 2R+. Estás dejando correr ganadores — bien.`
    });
  }
  if (big_winners < 2 && N > 10) {
    insights.push({
      type: 'negative',
      text: `Pocos trades de 2R+. Estás cortando ganadores temprano. Tu plan tiene runners por una razón.`
    });
  }
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      text: `Distribución balanceada. ${winners} winners (${fmt(winners/N*100, 0)}%), ${losers} losers.`
    });
  }

  return (
    <div className="space-y-1.5 pt-3 mt-3 border-t border-zinc-800">
      {insights.map((ins, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          {ins.type === 'positive' ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
           : ins.type === 'negative' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
           : <Info className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />}
          <span className="text-zinc-300">{ins.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Streak cell ───────────────────────────────────────────────────────────
function StreakCell({ icon: Icon, label, value, sub, accent }) {
  const accentClass = {
    emerald: 'text-emerald-400', red: 'text-red-400',
    amber: 'text-amber-400', zinc: 'text-zinc-300',
  }[accent];
  return (
    <div className="border border-zinc-800 bg-zinc-950/40 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Icon className={`w-3 h-3 ${accentClass}`} />
        <div className="text-[9px] tracking-[0.2em] text-zinc-500">{label}</div>
      </div>
      <div className={`text-xl tabular font-bold ${accentClass}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 mt-0.5">{sub}</div>
    </div>
  );
}

// ─── Plan Compare Table ────────────────────────────────────────────────────
function PlanCompareTable({ onPlan, offPlan }) {
  const calc = (list) => {
    if (!list.length) return null;
    const wins = list.filter(t => t.pnl > 0);
    const totalPnl = list.reduce((s, t) => s + t.pnl, 0);
    const winRate = wins.length / list.length * 100;
    const avgR = list.reduce((s, t) => s + (t.rResult || 0), 0) / list.length;
    return { count: list.length, winRate, totalPnl, avgR };
  };
  const onP = calc(onPlan);
  const offP = calc(offPlan);

  if (!onP && !offP) return <div className="p-4 text-xs text-zinc-500">Sin data de plan compliance aún.</div>;

  const rows = [
    { label: 'Trades', getOn: () => onP?.count ?? '—', getOff: () => offP?.count ?? '—' },
    { label: 'Win rate', getOn: () => onP ? `${fmt(onP.winRate, 1)}%` : '—', getOff: () => offP ? `${fmt(offP.winRate, 1)}%` : '—' },
    { label: 'P&L total', getOn: () => onP ? `${sign(onP.totalPnl)}${fmtUsd(onP.totalPnl)}` : '—', getOff: () => offP ? `${sign(offP.totalPnl)}${fmtUsd(offP.totalPnl)}` : '—' },
    { label: 'R promedio', getOn: () => onP ? `${sign(onP.avgR)}${fmt(onP.avgR, 2)}R` : '—', getOff: () => offP ? `${sign(offP.avgR)}${fmt(offP.avgR, 2)}R` : '—' },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3 text-[10px] tracking-[0.2em] text-zinc-500 pb-2 border-b border-zinc-800">
        <div></div>
        <div className="text-emerald-400">SEGUÍ PLAN</div>
        <div className="text-amber-400">DESVÍE</div>
      </div>
      {rows.map(r => (
        <div key={r.label} className="grid grid-cols-3 gap-3 text-sm tabular">
          <div className="text-zinc-400 text-xs">{r.label}</div>
          <div className="text-zinc-100">{r.getOn()}</div>
          <div className="text-zinc-300">{r.getOff()}</div>
        </div>
      ))}
      {onP && offP && (
        <div className="pt-3 mt-2 border-t border-zinc-800 text-xs">
          {onP.avgR > offP.avgR ? (
            <div className="text-emerald-400">
              ✓ Tus trades on-plan rinden {fmt(onP.avgR - offP.avgR, 2)}R más por trade. Seguí el plan.
            </div>
          ) : (
            <div className="text-amber-400">
              ⚠ Curiosamente, tus desvíos rinden mejor. Esto puede ser ruido (muestra chica) o señal de que tu plan necesita ajustes. Mirá con cuidado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Generic breakdown table ───────────────────────────────────────────────
function BreakdownTable({ rows, N, colorize }) {
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => b.totalPnl - a.totalPnl);
  return (
    <div className="divide-y divide-zinc-800">
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] tracking-[0.2em] text-zinc-600 border-b border-zinc-800">
        <div className="col-span-4">CATEGORÍA</div>
        <div className="col-span-2 text-right">N</div>
        <div className="col-span-2 text-right">WR%</div>
        <div className="col-span-2 text-right">AVG R</div>
        <div className="col-span-2 text-right">P&L</div>
      </div>
      {sorted.map(r => {
        const pct = r.count / N * 100;
        return (
          <div key={r.key} className="grid grid-cols-12 gap-2 px-4 py-2 text-xs items-center">
            <div className="col-span-4 truncate text-zinc-200">{r.key}</div>
            <div className="col-span-2 text-right tabular text-zinc-400">
              {r.count} <span className="text-zinc-600">({fmt(pct, 0)}%)</span>
            </div>
            <div className={`col-span-2 text-right tabular ${
              r.winRate >= 50 ? 'text-emerald-400' : r.winRate >= 30 ? 'text-amber-400' : 'text-red-400'
            }`}>{fmt(r.winRate, 0)}%</div>
            <div className={`col-span-2 text-right tabular ${
              r.avgR > 0.3 ? 'text-emerald-400' : r.avgR > 0 ? 'text-amber-400' : 'text-red-400'
            }`}>{sign(r.avgR)}{fmt(r.avgR, 2)}</div>
            <div className={`col-span-2 text-right tabular ${colorPnL(r.totalPnl)} font-semibold`}>
              {sign(r.totalPnl)}${fmt(Math.abs(r.totalPnl), 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Extremes (best/worst) trade card ──────────────────────────────────────
function ExtremesTradeCard({ trade, kind }) {
  const isBest = kind === 'best';
  return (
    <div className={`border p-4 ${
      isBest ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
    }`}>
      <div className={`text-[10px] tracking-[0.3em] mb-2 ${
        isBest ? 'text-emerald-400' : 'text-red-400'
      }`}>
        // {isBest ? 'MEJOR TRADE' : 'PEOR TRADE'}
      </div>
      <div className="text-lg tabular text-zinc-100 mb-1">{trade.pair}</div>
      <div className="text-[10px] text-zinc-500 mb-3">
        {new Date(trade.closedAt || trade.date).toLocaleDateString('es-MX')} · {trade.direction?.toUpperCase()}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] tracking-wider text-zinc-500">P&L</div>
          <div className={`tabular font-bold ${colorPnL(trade.pnl)}`}>
            {sign(trade.pnl)}{fmtUsd(trade.pnl)}
          </div>
        </div>
        <div>
          <div className="text-[10px] tracking-wider text-zinc-500">R</div>
          <div className={`tabular font-bold ${colorPnL(trade.rResult)}`}>
            {sign(trade.rResult)}{fmt(trade.rResult || 0, 2)}R
          </div>
        </div>
      </div>
      {trade.setup && (
        <div className="text-[11px] text-zinc-500 italic mt-3 pt-3 border-t border-zinc-800">
          "{trade.setup.slice(0, 80)}{trade.setup.length > 80 ? '...' : ''}"
        </div>
      )}
    </div>
  );
}

// ─── Helper: group breakdown ───────────────────────────────────────────────
function groupBreakdown(trades, keyFn) {
  const groups = {};
  trades.forEach(t => {
    const key = keyFn(t);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).map(([key, list]) => {
    const wins = list.filter(t => t.pnl > 0);
    const totalPnl = list.reduce((s, t) => s + t.pnl, 0);
    const avgR = list.reduce((s, t) => s + (t.rResult || 0), 0) / list.length;
    return {
      key,
      count: list.length,
      winRate: (wins.length / list.length) * 100,
      avgR,
      totalPnl,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHALLENGE ENGINE — pure functions
// ═══════════════════════════════════════════════════════════════════════════
function evaluateChallenge(challenge, allTrades) {
  // Trades belonging to this challenge
  const cTrades = allTrades.filter(t => t.challengeId === challenge.id);
  const closed = cTrades.filter(t => t.status === 'closed');

  // Equity tracking
  const totalPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const currentEquity = challenge.startCapital + totalPnl;

  // Track peak (running)
  const sorted = [...closed].sort((a, b) =>
    new Date(a.closedAt) - new Date(b.closedAt));
  let running = challenge.startCapital;
  let peak = running;
  sorted.forEach(t => {
    running += t.pnl;
    peak = Math.max(peak, running);
  });
  const peakEquity = Math.max(peak, currentEquity);

  // Total drawdown
  const totalDDValue = currentEquity - peakEquity; // ≤ 0
  const totalDDPct = peakEquity > 0
    ? (Math.abs(totalDDValue) / peakEquity) * 100
    : 0;
  const totalDDUsedPct = challenge.maxTotalDDPct > 0
    ? (totalDDPct / challenge.maxTotalDDPct) * 100
    : 0;

  // Progress
  const targetEquity = challenge.startCapital * (1 + challenge.targetPct / 100);
  const progressPct = targetEquity > challenge.startCapital
    ? ((currentEquity - challenge.startCapital) /
       (targetEquity - challenge.startCapital)) * 100
    : 0;

  // Today's P&L (since 00:00 local)
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const todayClosed = closed.filter(t =>
    new Date(t.closedAt) >= midnight);
  const tradesBeforeToday = closed.filter(t =>
    new Date(t.closedAt) < midnight);
  const startOfDayEquity = challenge.startCapital +
    tradesBeforeToday.reduce((s, t) => s + t.pnl, 0);
  const todayPnl = todayClosed.reduce((s, t) => s + t.pnl, 0);
  const todayDDValue = todayPnl < 0 ? Math.abs(todayPnl) : 0;
  const todayDDPct = startOfDayEquity > 0
    ? (todayDDValue / startOfDayEquity) * 100
    : 0;
  const dailyDDUsedPct = challenge.maxDailyDDPct > 0
    ? (todayDDPct / challenge.maxDailyDDPct) * 100
    : 0;

  // Days
  const startDate = new Date(challenge.startDate);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = challenge.maxDays
    ? Math.max(0, challenge.maxDays - daysElapsed)
    : null;
  const uniqueTradingDays = new Set(closed.map(t =>
    new Date(t.closedAt).toDateString())).size;
  const planCompliancePct = closed.length
    ? (closed.filter(t => t.followedPlan === true).length / closed.length) * 100
    : 0;
  const minTradesMet = closed.length >= (challenge.minTrades || 0);
  const planComplianceMet = !challenge.requiredPlanCompliancePct
    || planCompliancePct >= challenge.requiredPlanCompliancePct;
  const trainingObjectiveMet = challenge.objectiveType
    ? minTradesMet && planComplianceMet && uniqueTradingDays >= (challenge.minDays || 0)
    : false;

  // Status determination
  let newStatus = challenge.status;
  let newViolations = [...(challenge.violations || [])];

  if (challenge.status === 'in_progress') {
    if (totalDDUsedPct >= 100) {
      newStatus = 'failed';
      newViolations.push({
        timestamp: new Date().toISOString(),
        type: 'max_total_dd',
        detail: `Total DD ${totalDDPct.toFixed(2)}% supera límite ${challenge.maxTotalDDPct}%`
      });
    } else if (dailyDDUsedPct >= 100) {
      newStatus = 'failed';
      newViolations.push({
        timestamp: new Date().toISOString(),
        type: 'max_daily_dd',
        detail: `DD diario ${todayDDPct.toFixed(2)}% supera límite ${challenge.maxDailyDDPct}%`
      });
    } else if (trainingObjectiveMet) {
      newStatus = 'passed';
    } else if (challenge.targetPct > 0 && currentEquity >= targetEquity &&
               uniqueTradingDays >= (challenge.minDays || 0)) {
      newStatus = 'passed';
    } else if (challenge.maxDays && daysElapsed >= challenge.maxDays
               && !trainingObjectiveMet
               && (challenge.targetPct <= 0 || currentEquity < targetEquity)) {
      newStatus = 'failed';
      newViolations.push({
        timestamp: new Date().toISOString(),
        type: 'time_limit',
        detail: `Tiempo agotado (${challenge.maxDays}d) sin llegar al target`
      });
    }
  }

  return {
    currentEquity, peakEquity, targetEquity, progressPct,
    totalDDValue, totalDDPct, totalDDUsedPct,
    todayPnl, todayDDPct, dailyDDUsedPct, startOfDayEquity,
    daysElapsed, daysRemaining, uniqueTradingDays, planCompliancePct,
    minTradesMet, planComplianceMet, trainingObjectiveMet,
    closedCount: closed.length, openCount: cTrades.length - closed.length,
    newStatus, newViolations,
  };
}

function canOpenTradeInChallenge(challenge, ev, proposedRisk) {
  if (!challenge || challenge.status !== 'in_progress') return { ok: true };
  if (!ev) return { ok: true };

  // What if the trade hits stop loss?
  // Total DD would be: (currentEquity - proposedRisk - peakEquity) / peakEquity
  const projectedEquityIfLoss = ev.currentEquity - proposedRisk;
  const projectedTotalDDPct = ev.peakEquity > 0
    ? Math.abs((projectedEquityIfLoss - ev.peakEquity) / ev.peakEquity) * 100
    : 0;
  if (projectedTotalDDPct > challenge.maxTotalDDPct) {
    return {
      ok: false,
      reason: `Si pierde, total DD sería ${projectedTotalDDPct.toFixed(2)}% > límite ${challenge.maxTotalDDPct}%`
    };
  }

  // Daily DD: today's loss + this risk
  const projectedDailyLoss = Math.abs(Math.min(0, ev.todayPnl - proposedRisk));
  const projectedDailyDDPct = ev.startOfDayEquity > 0
    ? (projectedDailyLoss / ev.startOfDayEquity) * 100
    : 0;
  if (projectedDailyDDPct > challenge.maxDailyDDPct) {
    return {
      ok: false,
      reason: `Si pierde, daily DD sería ${projectedDailyDDPct.toFixed(2)}% > límite ${challenge.maxDailyDDPct}%`
    };
  }

  return { ok: true };
}

function detectAchievements(trades, challenges) {
  const earned = [];
  const closed = trades.filter(t => t.status === 'closed');
  const sortedClosed = [...closed].sort((a, b) =>
    new Date(a.closedAt) - new Date(b.closedAt));

  if (closed.length >= 1) earned.push({ id: 'first_trade' });
  if (closed.some(t => t.pnl > 0)) earned.push({ id: 'first_win' });
  if (closed.some(t => (t.rResult || 0) >= 3)) earned.push({ id: 'r3_trade' });

  // Plan compliance streaks
  let streak = 0, maxStreak = 0;
  sortedClosed.forEach(t => {
    if (t.followedPlan === true) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else streak = 0;
  });
  if (maxStreak >= 5) earned.push({ id: 'plan_compliance_5' });
  if (maxStreak >= 10) earned.push({ id: 'plan_compliance_10' });

  // Challenges
  if (challenges.length >= 1) earned.push({ id: 'first_challenge' });
  const passed = challenges.filter(c => c.status === 'passed');
  if (passed.length >= 1) earned.push({ id: 'challenge_passed' });
  if (passed.length >= 3) earned.push({ id: 'challenge_passed_3' });

  // 30 days no violation in any challenge
  const hasLongSafeStreak = challenges.some(c => {
    if (c.status !== 'in_progress' && c.status !== 'passed') return false;
    if (!c.startDate) return false;
    const start = new Date(c.startDate);
    const end = c.endDate ? new Date(c.endDate) : new Date();
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return days >= 30 && (!c.violations || c.violations.length === 0);
  });
  if (hasLongSafeStreak) earned.push({ id: 'no_violation_30' });

  // Enrich with name/desc
  return earned.map(e => {
    const def = ACHIEVEMENTS.find(a => a.id === e.id);
    return { ...e, name: def?.name, desc: def?.desc };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHALLENGES VIEW
// ═══════════════════════════════════════════════════════════════════════════
function ChallengesView({ challenges, saveChallenges, activeChallenge,
                          challengeEval, trades, setTab }) {
  const [creating, setCreating] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const past = challenges.filter(c => c.status !== 'in_progress');

  const startChallenge = (template, customConfig) => {
    if (activeChallenge) {
      if (!confirm('Ya hay un reto en progreso. ¿Abandonarlo y empezar uno nuevo?')) return;
      // Mark current as abandoned
      const updated = challenges.map(c =>
        c.id === activeChallenge.id
          ? { ...c, status: 'abandoned', endDate: new Date().toISOString() }
          : c
      );
      const cfg = customConfig || template.config;
      const newChallenge = {
        id: makeId(),
        name: customConfig?.name || template.name,
        templateId: template.id,
        status: 'in_progress',
        startDate: new Date().toISOString(),
        endDate: null,
        violations: [],
        ...cfg,
      };
      saveChallenges([...updated, newChallenge]);
    } else {
      const cfg = customConfig || template.config;
      const newChallenge = {
        id: makeId(),
        name: customConfig?.name || template.name,
        templateId: template.id,
        status: 'in_progress',
        startDate: new Date().toISOString(),
        endDate: null,
        violations: [],
        ...cfg,
      };
      saveChallenges([...challenges, newChallenge]);
    }
    setCreating(false);
  };

  const abandonChallenge = () => {
    if (!activeChallenge) return;
    if (!confirm('¿Abandonar el reto activo? Quedará marcado como ABANDONADO.')) return;
    const updated = challenges.map(c =>
      c.id === activeChallenge.id
        ? { ...c, status: 'abandoned', endDate: new Date().toISOString() }
        : c
    );
    saveChallenges(updated);
  };

  const deleteChallenge = (id) => {
    if (!confirm('¿Eliminar este reto del histórico?')) return;
    saveChallenges(challenges.filter(c => c.id !== id));
  };

  const duplicateChallenge = (challenge) => {
    const template = {
      id: challenge.templateId || 'copied',
      name: `${challenge.name} · copia`,
      config: {
        startCapital: challenge.startCapital,
        targetPct: challenge.targetPct,
        maxDailyDDPct: challenge.maxDailyDDPct,
        maxTotalDDPct: challenge.maxTotalDDPct,
        minDays: challenge.minDays || 0,
        maxDays: challenge.maxDays || 0,
        objectiveType: challenge.objectiveType || null,
        minTrades: challenge.minTrades || 0,
        requiredPlanCompliancePct: challenge.requiredPlanCompliancePct || 0,
      },
    };
    startChallenge(template);
  };

  if (creating) {
    return <CreateChallengeView
              onCancel={() => setCreating(false)}
              onCreate={startChallenge} />;
  }

  return (
    <div className="space-y-4">
      {/* Active challenge dashboard */}
      {activeChallenge && challengeEval ? (
        <ActiveChallengePanel
          challenge={activeChallenge}
          ev={challengeEval}
          onAbandon={abandonChallenge}
        />
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <div className="text-amber-400 text-xs tracking-[0.3em] mb-2">// SIN RETO ACTIVO</div>
          <div className="text-zinc-300 mb-1">
            Definí reglas claras y dejá que el sistema te discipline.
          </div>
          <div className="text-zinc-500 text-sm max-w-md mx-auto">
            Un reto convierte tu trading en un objetivo medible con guardrails reales:
            target, max DD diario, max DD total, fecha límite.
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => setCreating(true)}
          className="py-3 text-xs font-bold tracking-[0.2em] bg-amber-500 hover:bg-amber-400 text-zinc-950 inline-flex items-center justify-center gap-2">
          <PlayCircle className="w-4 h-4" />
          {activeChallenge ? 'CAMBIAR DE RETO' : 'EMPEZAR NUEVO RETO'}
        </button>
        <button onClick={() => setTab('stats')}
          className="py-3 text-xs tracking-[0.2em] border border-zinc-800 hover:border-cyan-500/60 hover:text-cyan-400 text-zinc-300 inline-flex items-center justify-center gap-2">
          <BarChart2 className="w-4 h-4" />
          VER STATS
        </button>
      </div>

      <div className="border border-cyan-500/25 bg-cyan-500/5 p-4 flex items-start gap-3">
        <Brain className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] tracking-[0.2em] text-cyan-400 mb-1">COACH ROADMAP</div>
          <div className="text-sm text-zinc-300 leading-relaxed">
            Próximo paso con Claude: analizar tu historial, detectar el cuello de botella y proponerte el siguiente reto
            de entrenamiento. Por ahora podés copiar retos, usar templates didácticos y medir disciplina.
          </div>
        </div>
      </div>

      {/* Past challenges */}
      {past.length > 0 && (
        <div className="border border-zinc-800 bg-zinc-900/40">
          <button onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-left hover:bg-zinc-900/60">
            <div>
              <div className="text-[11px] tracking-[0.2em] text-zinc-300">HISTORIAL DE RETOS</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {past.filter(c => c.status === 'passed').length} pasados ·
                {' '}{past.filter(c => c.status === 'failed').length} fallados ·
                {' '}{past.filter(c => c.status === 'abandoned').length} abandonados
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          {showHistory && (
            <div className="divide-y divide-zinc-800">
              {[...past].reverse().map(c => (
                <ChallengeHistoryRow key={c.id} challenge={c} trades={trades}
                                     onDuplicate={() => duplicateChallenge(c)}
                                     onDelete={() => deleteChallenge(c.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Active challenge panel ────────────────────────────────────────────────
function ActiveChallengePanel({ challenge, ev, onAbandon }) {
  const isWarning = ev.dailyDDUsedPct > 70 || ev.totalDDUsedPct > 70;
  const isCritical = ev.dailyDDUsedPct > 90 || ev.totalDDUsedPct > 90;

  return (
    <div className={`border ${
      isCritical ? 'border-red-500/50' : isWarning ? 'border-amber-500/40' : 'border-emerald-500/30'
    } ${
      isCritical ? 'bg-red-500/5' : isWarning ? 'bg-amber-500/5' : 'bg-emerald-500/5'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-[11px] tracking-[0.2em] text-zinc-300">RETO ACTIVO</div>
            <div className="text-sm text-zinc-100 ml-2">{challenge.name}</div>
            {challenge.objectiveType && (
              <span className="text-[10px] tracking-wider px-1.5 py-0.5 border border-cyan-500/40 text-cyan-400">
                TRAINING
              </span>
            )}
            <span className="text-[10px] tracking-wider px-1.5 py-0.5 border border-emerald-500/40 text-emerald-400 blink">
              IN PROGRESS
            </span>
          </div>
          <button onClick={onAbandon}
            className="text-[10px] tracking-wider px-2 py-1 border border-zinc-800 hover:border-red-500/40 hover:text-red-400 text-zinc-500">
            ABANDONAR
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress to target */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] tracking-[0.2em] text-zinc-500">
              {challenge.objectiveType ? 'PROGRESO DE ENTRENAMIENTO' : 'PROGRESO AL TARGET'}
            </div>
            <div className="text-xs tabular text-zinc-300">
              {challenge.objectiveType
                ? `${ev.closedCount}/${challenge.minTrades || 0} trades · plan ${fmt(ev.planCompliancePct, 0)}%`
                : `${fmtUsd(ev.currentEquity)} / ${fmtUsd(ev.targetEquity)} (${fmt(ev.progressPct, 1)}%)`}
            </div>
          </div>
          <div className="relative h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all"
                 style={{ width: `${challenge.objectiveType
                   ? Math.max(0, Math.min(100, ((ev.closedCount || 0) / Math.max(1, challenge.minTrades || 1)) * 100))
                   : Math.max(0, Math.min(100, ev.progressPct))}%` }} />
          </div>
        </div>

        {/* Rule gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RuleGauge
            label="DAILY DD"
            usedPct={ev.dailyDDUsedPct}
            value={`-$${fmt(Math.abs(Math.min(0, ev.todayPnl)), 2)}`}
            limit={`-${challenge.maxDailyDDPct}%`}
            sub={`hoy: ${ev.todayPnl >= 0 ? '+' : ''}${fmtUsd(ev.todayPnl)}`}
          />
          <RuleGauge
            label="TOTAL DD"
            usedPct={ev.totalDDUsedPct}
            value={`-${fmt(ev.totalDDPct, 2)}%`}
            limit={`-${challenge.maxTotalDDPct}%`}
            sub={`peak: ${fmtUsd(ev.peakEquity)}`}
          />
        </div>

        {/* Time + days info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/60">
          <Metric label="DÍAS TRANS." value={ev.daysElapsed}
                  sub={challenge.maxDays ? `de ${challenge.maxDays}` : 'sin límite'} />
          <Metric label="DÍAS RESTANTES"
                  value={ev.daysRemaining !== null ? ev.daysRemaining : '∞'}
                  accent={ev.daysRemaining !== null && ev.daysRemaining < 5 ? 'amber' : 'zinc'} />
          <Metric label="DÍAS TRADED" value={ev.uniqueTradingDays}
                  sub={challenge.minDays > 0 ? `min ${challenge.minDays}` : ''} />
          <Metric label="TRADES" value={ev.closedCount}
                  sub={`${ev.openCount} abiertos`} />
        </div>

        {challenge.objectiveType && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TrainingCheck label="TRADES MÍNIMOS" pass={ev.minTradesMet}
                           value={`${ev.closedCount}/${challenge.minTrades || 0}`} />
            <TrainingCheck label="CUMPL. PLAN" pass={ev.planComplianceMet}
                           value={`${fmt(ev.planCompliancePct, 0)}% / ${challenge.requiredPlanCompliancePct || 0}%`} />
            <TrainingCheck label="DÍAS MÍNIMOS" pass={ev.uniqueTradingDays >= (challenge.minDays || 0)}
                           value={`${ev.uniqueTradingDays}/${challenge.minDays || 0}`} />
          </div>
        )}

        {/* Critical warning */}
        {isCritical && (
          <div className="border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-300">
              <strong>ZONA CRÍTICA.</strong> Estás muy cerca de fallar el reto.
              Considerá no operar el resto del día.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingCheck({ label, pass, value }) {
  return (
    <div className={`border p-3 ${pass ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/40'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] tracking-[0.18em] text-zinc-500">{label}</div>
        {pass ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-zinc-600" />}
      </div>
      <div className={`mt-2 text-lg tabular font-bold ${pass ? 'text-emerald-400' : 'text-zinc-300'}`}>{value}</div>
    </div>
  );
}

// ─── Rule Gauge ────────────────────────────────────────────────────────────
function RuleGauge({ label, usedPct, value, limit, sub }) {
  const clamped = Math.max(0, Math.min(100, usedPct));
  const color = clamped > 90 ? 'bg-red-500'
              : clamped > 70 ? 'bg-amber-500'
              : clamped > 40 ? 'bg-emerald-500'
              : 'bg-emerald-400';
  const textColor = clamped > 90 ? 'text-red-400'
                  : clamped > 70 ? 'text-amber-400'
                  : 'text-zinc-100';

  return (
    <div className="border border-zinc-800 bg-zinc-950/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] tracking-[0.2em] text-zinc-500">{label}</div>
        <div className="text-[10px] tabular text-zinc-500">{fmt(clamped, 0)}% usado</div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className={`text-lg tabular font-bold ${textColor}`}>{value}</div>
        <div className="text-[10px] tabular text-zinc-500">/ {limit}</div>
      </div>
      <div className="relative h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden mb-1">
        <div className={`absolute inset-y-0 left-0 ${color} transition-all`}
             style={{ width: `${clamped}%` }} />
      </div>
      {sub && <div className="text-[10px] text-zinc-500 tabular">{sub}</div>}
    </div>
  );
}

// ─── Create challenge view (templates + custom) ───────────────────────────
function CreateChallengeView({ onCancel, onCreate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [category, setCategory] = useState('all');
  const [customCfg, setCustomCfg] = useState({
    name: 'Reto Personalizado',
    startCapital: 1000, targetPct: 50,
    maxDailyDDPct: 5, maxTotalDDPct: 10,
    minDays: 0, maxDays: 60,
  });

  const updateCfg = (k, v) => setCustomCfg(c => ({ ...c, [k]: v }));

  if (customMode) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <button onClick={() => setCustomMode(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wider">
          ← VOLVER A TEMPLATES
        </button>
        <Panel title="RETO PERSONALIZADO" subtitle="Definí tus propias reglas">
          <div className="p-4 space-y-4">
            <Field label="NOMBRE DEL RETO">
              <input type="text" value={customCfg.name}
                onChange={e => updateCfg('name', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CAPITAL INICIAL ($)">
                <input type="number" value={customCfg.startCapital}
                  onChange={e => updateCfg('startCapital', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
              </Field>
              <Field label="TARGET (%)">
                <input type="number" value={customCfg.targetPct}
                  onChange={e => updateCfg('targetPct', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="MAX DAILY DD (%)">
                <input type="number" step="0.5" value={customCfg.maxDailyDDPct}
                  onChange={e => updateCfg('maxDailyDDPct', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-red-500/50" />
              </Field>
              <Field label="MAX TOTAL DD (%)">
                <input type="number" step="0.5" value={customCfg.maxTotalDDPct}
                  onChange={e => updateCfg('maxTotalDDPct', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-red-500/50" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="MIN DÍAS DE TRADING">
                <input type="number" value={customCfg.minDays}
                  onChange={e => updateCfg('minDays', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
              </Field>
              <Field label="MAX DÍAS (límite)">
                <input type="number" value={customCfg.maxDays}
                  onChange={e => updateCfg('maxDays', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
              </Field>
            </div>

            <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-zinc-300 leading-relaxed">
              <div className="text-[10px] tracking-[0.2em] text-amber-400 mb-1">// VISTA PREVIA</div>
              Empezás con <strong>${fmt(customCfg.startCapital, 0)}</strong>, target llegar a{' '}
              <strong>${fmt(customCfg.startCapital * (1 + customCfg.targetPct/100), 0)}</strong>
              {' '}({sign(customCfg.targetPct)}{customCfg.targetPct}%).
              Si perdés más de <strong>${fmt(customCfg.startCapital * customCfg.maxDailyDDPct/100, 2)}</strong>
              {' '}en un día, fallás. Si tu DD total supera <strong>{customCfg.maxTotalDDPct}%</strong> desde el peak, fallás.
              {customCfg.minDays > 0 && ` Mínimo ${customCfg.minDays} días de trading.`}
              {customCfg.maxDays > 0 && ` Tenés ${customCfg.maxDays} días para lograrlo.`}
            </div>

            <button onClick={() => onCreate({ id: 'custom' }, customCfg)}
              disabled={!customCfg.name || customCfg.startCapital <= 0 || customCfg.targetPct <= 0}
              className="w-full py-3 text-xs font-bold tracking-[0.2em] bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600">
              EMPEZAR ESTE RETO
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel}
                className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wider">
          ← CANCELAR
        </button>
        <div className="text-[10px] tracking-[0.2em] text-zinc-500">SELECCIONÁ TEMPLATE</div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
        {[
          { id: 'all', label: 'TODOS' },
          { id: 'capital', label: 'CAPITAL' },
          { id: 'prop', label: 'PROP' },
          { id: 'disciplina', label: 'DISCIPLINA' },
          { id: 'riesgo', label: 'RIESGO' },
          { id: 'psicologia', label: 'PSICOLOGÍA' },
          { id: 'consistencia', label: 'CONSISTENCIA' },
        ].map(c => (
          <button key={c.id} onClick={() => { setCategory(c.id); setSelectedTemplate(null); }}
            className={`px-3 py-1.5 text-[10px] tracking-[0.18em] border whitespace-nowrap ${
              category === c.id
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400'
                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGE_TEMPLATES.filter(t => category === 'all' || t.category === category).map(t => {
          const isCustom = t.id === 'custom';
          const isSelected = selectedTemplate?.id === t.id;
          return (
            <button key={t.id}
              onClick={() => isCustom ? setCustomMode(true) : setSelectedTemplate(t)}
              className={`text-left border p-4 transition-colors ${
                isSelected
                  ? 'border-amber-500/60 bg-amber-500/5'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm text-zinc-100 font-semibold">{t.name}</div>
                <span className={`text-[9px] tracking-wider px-1.5 py-0.5 border ${
                  t.badge === 'PROP STYLE' ? 'border-cyan-500/40 text-cyan-400'
                  : t.badge === 'TRAINING' ? 'border-emerald-500/40 text-emerald-400'
                  : t.badge === 'MINDSET' ? 'border-pink-500/40 text-pink-400'
                  : t.badge === 'EASY' ? 'border-emerald-500/40 text-emerald-400'
                  : t.badge === 'HARD' ? 'border-red-500/40 text-red-400'
                  : t.badge === 'CUSTOM' ? 'border-amber-500/40 text-amber-400'
                  : 'border-zinc-700 text-zinc-400'
                }`}>{t.badge}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mb-3 leading-relaxed">{t.description}</div>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="text-[9px] tracking-wider px-1.5 py-0.5 border border-zinc-700 text-zinc-400">
                  {t.difficulty}
                </span>
                <span className="text-[9px] tracking-wider px-1.5 py-0.5 border border-cyan-500/25 text-cyan-400">
                  {t.skill}
                </span>
              </div>
              {!isCustom && t.config && (
                <div className="grid grid-cols-2 gap-2 text-[10px] tabular">
                  <div className="text-zinc-500">Capital: <span className="text-zinc-300">${fmt(t.config.startCapital, 0)}</span></div>
                  <div className="text-zinc-500">Target: <span className="text-emerald-400">{t.config.targetPct > 0 ? `+${t.config.targetPct}%` : 'Proceso'}</span></div>
                  <div className="text-zinc-500">Daily DD: <span className="text-red-400">-{t.config.maxDailyDDPct}%</span></div>
                  <div className="text-zinc-500">Total DD: <span className="text-red-400">-{t.config.maxTotalDDPct}%</span></div>
                  <div className="text-zinc-500">Min días: <span className="text-zinc-300">{t.config.minDays}</span></div>
                  <div className="text-zinc-500">Trades: <span className="text-zinc-300">{t.config.minTrades || '—'}</span></div>
                </div>
              )}
              {isCustom && (
                <div className="text-[10px] text-amber-400">→ Definir reglas custom</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <button onClick={() => onCreate(selectedTemplate)}
          className="w-full py-3 text-xs font-bold tracking-[0.2em] bg-amber-500 hover:bg-amber-400 text-zinc-950 inline-flex items-center justify-center gap-2">
          <PlayCircle className="w-4 h-4" />
          EMPEZAR "{selectedTemplate.name.toUpperCase()}"
        </button>
      )}
    </div>
  );
}

// ─── Challenge history row ─────────────────────────────────────────────────
function ChallengeHistoryRow({ challenge: c, trades, onDuplicate, onDelete }) {
  const ev = useMemo(() => evaluateChallenge(c, trades), [c, trades]);

  const styles = {
    passed:    { border: 'border-emerald-500/40', text: 'text-emerald-400', icon: CheckCircle, label: 'PASADO' },
    failed:    { border: 'border-red-500/40',     text: 'text-red-400',     icon: XCircle, label: 'FALLADO' },
    abandoned: { border: 'border-zinc-700',       text: 'text-zinc-500',    icon: PauseCircle, label: 'ABANDONADO' },
  };
  const s = styles[c.status] || styles.abandoned;
  const Icon = s.icon;

  const startD = new Date(c.startDate);
  const endD = c.endDate ? new Date(c.endDate) : new Date();
  const days = Math.max(1, Math.floor((endD - startD) / (1000 * 60 * 60 * 24)));

  return (
    <div className="px-4 py-3 hover:bg-zinc-900/40">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] tracking-wider px-1.5 py-0.5 border ${s.border} ${s.text} inline-flex items-center gap-1`}>
            <Icon className="w-3 h-3" /> {s.label}
          </span>
          <span className="text-sm text-zinc-100">{c.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} title="Copiar reto"
                  className="text-zinc-700 hover:text-cyan-400 p-1">
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="text-zinc-700 hover:text-red-400 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {c.objectiveType && (
        <div className="mb-2 flex gap-2 flex-wrap">
          <span className="text-[9px] tracking-wider px-1.5 py-0.5 border border-cyan-500/30 text-cyan-400">
            TRAINING
          </span>
          <span className="text-[9px] tracking-wider px-1.5 py-0.5 border border-zinc-700 text-zinc-400">
            plan {fmt(ev.planCompliancePct, 0)}%
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-zinc-500 text-[10px]">CAPITAL FINAL</div>
          <div className={`tabular ${ev.currentEquity > c.startCapital ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmtUsd(ev.currentEquity)}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">PROGRESO</div>
          <div className="tabular text-zinc-300">{fmt(ev.progressPct, 1)}%</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">TRADES</div>
          <div className="tabular text-zinc-300">{ev.closedCount}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">DURACIÓN</div>
          <div className="tabular text-zinc-300">{days}d</div>
        </div>
      </div>
      {c.violations && c.violations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-red-400/80">
          ⚠ {c.violations[c.violations.length - 1].detail}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
function Settings({ config, saveConfig, trades, saveTrades,
                    watchlist, analyses, challenges, achievements }) {
  const [local, setLocal] = useState(config);
  useEffect(() => setLocal(config), [config]);
  const update = (k, v) => setLocal(c => ({ ...c, [k]: v }));
  const save = () => saveConfig(local);

  const exportData = () => {
    const data = JSON.stringify({
      config,
      trades,
      watchlist,
      analyses,
      challenges,
      achievements,
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (!confirm('⚠ ESTO BORRARÁ TODOS LOS TRADES Y CONFIG. ¿Estás seguro?')) return;
    if (!confirm('Última oportunidad. ¿Borrar todo?')) return;
    saveTrades([]); saveConfig(DEFAULT_CONFIG);
  };

  const dirty = JSON.stringify(local) !== JSON.stringify(config);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Panel title="GUARDRAILS" subtitle="Tus límites de prod. Violarlos = blowup.">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="CAPITAL INICIAL ($)">
              <input type="number" value={local.initialCapital}
                onChange={e => update('initialCapital', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
            <Field label="META ($)">
              <input type="number" value={local.goalCapital}
                onChange={e => update('goalCapital', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="RIESGO POR TRADE (%)">
              <input type="number" step="0.1" value={local.riskPctPerTrade}
                onChange={e => update('riskPctPerTrade', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
            <Field label="MÁX POSICIONES ABIERTAS">
              <input type="number" value={local.maxOpenPositions}
                onChange={e => update('maxOpenPositions', parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="RIESGO TOTAL MÁX (%)">
              <input type="number" step="0.5" value={local.maxPortfolioRiskPct}
                onChange={e => update('maxPortfolioRiskPct', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
            <Field label="DAILY STOP (%)">
              <input type="number" step="0.5" value={local.dailyStopPct}
                onChange={e => update('dailyStopPct', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm tabular focus:outline-none focus:border-amber-500/50" />
            </Field>
          </div>
          {dirty && (
            <button onClick={save}
              className="w-full py-2.5 text-xs font-bold tracking-[0.2em] bg-amber-500 hover:bg-amber-400 text-zinc-950">
              GUARDAR CAMBIOS
            </button>
          )}
        </div>
      </Panel>

      <Panel title="DATA SOURCES" subtitle="Estado de las integraciones">
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-zinc-300">Binance Public API</div>
              <div className="text-[10px] text-zinc-500">precios live, klines, market data</div>
            </div>
            <span className="text-[10px] tracking-wider px-2 py-0.5 border border-emerald-500/40 text-emerald-400">
              CONNECTED
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div>
              <div className="text-zinc-300">Binance Private API</div>
              <div className="text-[10px] text-zinc-500">balance, trade history, ordenes</div>
            </div>
            <span className="text-[10px] tracking-wider px-2 py-0.5 border border-zinc-700 text-zinc-500">
              REQUIERE BACKEND
            </span>
          </div>
          <div className="text-[10px] text-zinc-600 pt-2 border-t border-zinc-800 leading-relaxed">
            // Para conectar tu cuenta de Binance directamente necesitás un backend que firme requests
            con HMAC server-side. Mientras tanto: importá CSV en JOURNAL → IMPORTAR.
          </div>
        </div>
      </Panel>

      <Panel title="DATOS">
        <div className="p-4 space-y-3">
          <button onClick={exportData}
            className="w-full py-2.5 text-xs tracking-[0.2em] border border-zinc-700 hover:border-cyan-500/60 hover:text-cyan-400 text-zinc-300">
            EXPORTAR BACKUP (.JSON)
          </button>
          <button onClick={resetAll}
            className="w-full py-2.5 text-xs tracking-[0.2em] border border-red-500/40 hover:bg-red-500/10 text-red-400">
            BORRAR TODO Y REINICIAR
          </button>
          <div className="text-[10px] text-zinc-600 pt-2 border-t border-zinc-800">
            // {trades.length} trades almacenados · datos persistidos localmente
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer({ status }) {
  return (
    <footer className="border-t border-zinc-800/80 mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="text-[9px] tracking-[0.3em] text-zinc-600">
          // SISTEMA OPERANDO · NO ES ASESORÍA FINANCIERA
        </div>
        <div className="text-[9px] tracking-wider text-zinc-600 flex items-center gap-1.5">
          {status === 'live' && <><div className="w-1 h-1 bg-emerald-400 rounded-full pulse-soft" /> BINANCE.PUBLIC</>}
          {status === 'error' && <><div className="w-1 h-1 bg-red-400 rounded-full" /> OFFLINE</>}
        </div>
      </div>
    </footer>
  );
}
