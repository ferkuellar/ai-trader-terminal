import { getAssetProfile, normalizePair, symbolFromPair } from "./chart-data-adapter";

const BINANCE_BASE_URL = "https://api.binance.com/api/v3";
const FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=7&format=json";

export const TIMEFRAME_CONFIG = {
  "1H": { interval: "1m", limit: 60 },
  "24H": { interval: "30m", limit: 48 },
  "7D": { interval: "4h", limit: 42 },
  "30D": { interval: "12h", limit: 60 },
  "90D": { interval: "1d", limit: 90 },
};

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getKlineConfig(timeframe = "7D") {
  return TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG["7D"];
}

export function formatKlineLabel(openTime, timeframe) {
  const date = new Date(openTime);
  if (timeframe === "1H" || timeframe === "24H") {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function fetchLiveChartData(pair, timeframe = "7D") {
  const normalizedPair = normalizePair(pair);
  const config = getKlineConfig(timeframe);
  const params = new URLSearchParams({
    symbol: normalizedPair,
    interval: config.interval,
    limit: String(config.limit),
  });
  const response = await fetch(`${BINANCE_BASE_URL}/klines?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load Binance chart data");
  const rows = await response.json();

  return rows.map((row) => ({
    openTime: row[0],
    closeTime: row[6],
    label: formatKlineLabel(row[0], timeframe),
    value: safeNumber(row[4]),
    volume: safeNumber(row[7]),
  })).filter((row) => row.value !== null);
}

export async function fetchLiveTicker(pair) {
  const normalizedPair = normalizePair(pair);
  const response = await fetch(`${BINANCE_BASE_URL}/ticker/24hr?symbol=${normalizedPair}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load Binance ticker");
  const raw = await response.json();

  return {
    pair: raw.s,
    price: safeNumber(raw.lastPrice),
    change24hPct: safeNumber(raw.priceChangePercent),
    high24h: safeNumber(raw.highPrice),
    low24h: safeNumber(raw.lowPrice),
    volume24h: safeNumber(raw.quoteVolume),
    baseVolume24h: safeNumber(raw.volume),
    eventTime: raw.closeTime || Date.now(),
    source: "Binance public REST",
  };
}

export function buildLiveMarketDetails(pair, ticker, profile = getAssetProfile(pair)) {
  const symbol = symbolFromPair(pair);
  const price = ticker?.price ?? null;
  const baseDetails = profile?.marketDetails || {};
  const circulatingSupply = safeNumber(baseDetails.circulatingSupply);
  const totalSupply = safeNumber(baseDetails.totalSupply);
  const maxSupply = safeNumber(baseDetails.maxSupply);
  const fdvSupply = maxSupply || totalSupply || circulatingSupply;

  return {
    marketCap: price && circulatingSupply ? price * circulatingSupply : null,
    volume24h: ticker?.volume24h ?? null,
    fdv: price && fdvSupply ? price * fdvSupply : null,
    totalSupply,
    maxSupply,
    circulatingSupply,
    treasuryHoldings: safeNumber(baseDetails.treasuryHoldings),
    symbol,
    source: "Binance public ticker + local public supply profile",
  };
}

function trendFromFearGreed(items) {
  return items.slice().reverse().map((item) => {
    const bullish = Math.max(0, Math.min(100, safeNumber(item.value) ?? 50));
    return {
      label: new Date(Number(item.timestamp) * 1000).toLocaleDateString("en-US", { weekday: "short" }),
      bullish,
      bearish: 100 - bullish,
    };
  });
}

function sentimentLabel(score) {
  if (score >= 65) return "Greed";
  if (score >= 55) return "Bullish";
  if (score <= 35) return "Fear";
  if (score <= 45) return "Bearish";
  return "Neutral";
}

export async function fetchLiveSentiment(pair, ticker) {
  const response = await fetch(FEAR_GREED_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load public sentiment");
  const raw = await response.json();
  const items = Array.isArray(raw?.data) ? raw.data : [];
  const currentFearGreed = safeNumber(items[0]?.value) ?? 50;
  const momentum = Math.max(-12, Math.min(12, (ticker?.change24hPct ?? 0) * 1.8));
  const bullishPct = Math.max(5, Math.min(95, Math.round(currentFearGreed + momentum)));
  const bearishPct = 100 - bullishPct;

  return {
    bullishPct,
    bearishPct,
    socialScore: bullishPct,
    fearGreedLabel: items[0]?.value_classification || sentimentLabel(bullishPct),
    sentimentTrend: trendFromFearGreed(items),
    source: "Alternative.me Fear & Greed + Binance public momentum",
    updatedAt: Date.now(),
    pair: normalizePair(pair),
  };
}

export function buildMarketDerivedSentiment(pair, ticker) {
  const change = ticker?.change24hPct ?? 0;
  const range = ticker?.high24h && ticker?.low24h && ticker?.price
    ? ((ticker.price - ticker.low24h) / Math.max(0.0000001, ticker.high24h - ticker.low24h) - 0.5) * 30
    : 0;
  const bullishPct = Math.max(5, Math.min(95, Math.round(50 + change * 2 + range)));

  return {
    bullishPct,
    bearishPct: 100 - bullishPct,
    socialScore: bullishPct,
    fearGreedLabel: sentimentLabel(bullishPct),
    sentimentTrend: Array.from({ length: 7 }, (_, index) => {
      const bullish = Math.max(5, Math.min(95, bullishPct + Math.round(Math.sin(index / 1.2) * 5)));
      return { label: `T-${6 - index}`, bullish, bearish: 100 - bullish };
    }),
    source: "Binance public market momentum fallback",
    updatedAt: Date.now(),
    pair: normalizePair(pair),
  };
}

export function mergeLatestPriceIntoChart(chartData, price) {
  if (!chartData?.length || price === null || price === undefined) return chartData || [];
  return chartData.map((point, index) => (
    index === chartData.length - 1 ? { ...point, value: price } : point
  ));
}

export function mergeLiveKlineIntoChart(chartData, kline, timeframe = "7D", maxPoints = 90) {
  if (!kline?.openTime || kline.close === null || kline.close === undefined) return chartData || [];
  const current = chartData?.length ? chartData : [];
  const nextPoint = {
    openTime: kline.openTime,
    closeTime: kline.closeTime,
    label: formatKlineLabel(kline.openTime, timeframe),
    value: kline.close,
    volume: kline.quoteVolume,
  };
  const lastIndex = current.findIndex((point) => point.openTime === kline.openTime);
  const next = lastIndex >= 0
    ? current.map((point, index) => (index === lastIndex ? { ...point, ...nextPoint } : point))
    : [...current, nextPoint];

  return next.slice(Math.max(0, next.length - maxPoints));
}
