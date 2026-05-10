import { ASSET_PROFILES } from "./asset-profile-data";

export const CHART_TIMEFRAMES = ["1H", "24H", "7D", "30D", "90D"];

export function normalizePair(input = "BTCUSDT") {
  const normalized = String(input).toUpperCase().replace("/", "").trim();
  if (!normalized) return "BTCUSDT";
  return normalized.endsWith("USDT") ? normalized : `${normalized}USDT`;
}

export function symbolFromPair(input = "BTCUSDT") {
  return normalizePair(input).replace("USDT", "");
}

export function getAssetProfile(symbolOrPair = "BTCUSDT") {
  const symbol = symbolFromPair(symbolOrPair);
  return ASSET_PROFILES[symbol] || ASSET_PROFILES.BTC;
}

export function getChartDataForPair(pair = "BTCUSDT", timeframe = "7D") {
  const profile = getAssetProfile(pair);
  return profile.chartData?.[timeframe] || profile.chartData?.["7D"] || [];
}

export function getCommunitySentiment(symbolOrPair = "BTCUSDT") {
  return getAssetProfile(symbolOrPair).sentiment;
}
