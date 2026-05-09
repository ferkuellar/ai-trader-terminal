export const LOCAL_USER_ID = "local-user";

export const DEFAULT_CONFIG = {
  initialCapital: 1000,
  goalCapital: 5000,
  riskPctPerTrade: 1.5,
  maxOpenPositions: 3,
  maxPortfolioRiskPct: 6,
  dailyStopPct: 3,
  maxStopDistancePct: 12,
  minRewardRisk: 1.5,
  startDate: null,
};

export const DEFAULT_WATCHLIST = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "ARBUSDT",
  "OPUSDT",
];

export const DEFAULT_STATE = {
  config: DEFAULT_CONFIG,
  trades: [],
  watchlist: DEFAULT_WATCHLIST,
  analyses: [],
  challenges: [],
  achievements: [],
  positionEvents: [],
  journal: [],
};
