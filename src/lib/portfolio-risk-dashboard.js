import { calculateTotalDrawdown } from "@/lib/risk-engine";

const DEFAULT_CONFIG = {
  initialCapital: 1000,
  maxOpenPositions: 3,
  maxPortfolioRiskPct: 6,
  dailyStopPct: 3,
};

const DISCLAIMER =
  "Educational risk dashboard only. This is not financial advice and does not execute trades.";

const round = (value, decimals = 4) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
};

const numberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeConfig = (config = {}) => ({
  ...DEFAULT_CONFIG,
  ...config,
});

const symbolOf = (trade = {}) =>
  String(trade.symbol || trade.pair || trade.asset || "").replace("/", "").toUpperCase() || "UNKNOWN";

const directionOf = (trade = {}) => {
  const direction = String(trade.direction || trade.side || "long").toLowerCase();
  return direction === "short" ? "short" : "long";
};

const entryOf = (trade = {}) => numberOrNull(trade.entry ?? trade.entryPrice ?? trade.price);
const stopOf = (trade = {}) => numberOrNull(trade.stopLoss ?? trade.sl);

const closedDateOf = (trade = {}) =>
  trade.closeDate || trade.closedAt || trade.exitDate || trade.date || trade.createdAt;

const pnlOf = (trade = {}) =>
  numberOrNull(trade.pnl ?? trade.pnlAmount ?? trade.profit ?? trade.realizedPnl ?? trade.netPnl) || 0;

const isClosedTrade = (trade = {}) => {
  const status = String(trade.status || "").toLowerCase();
  if (status === "closed") return true;
  if (trade.closedAt || trade.closeDate || trade.exitDate || trade.exitPrice) return true;
  return Number.isFinite(Number(trade.pnl));
};

const isOpenTrade = (trade = {}) => {
  const status = String(trade.status || "").toLowerCase();
  if (status === "open") return true;
  if (status === "closed" || status === "cancelled") return false;
  return !isClosedTrade(trade);
};

const inferUnitsAndNotional = (trade = {}, entry) => {
  const explicitUnits = numberOrNull(
    trade.units ?? trade.quantity ?? trade.qty ?? trade.amount ?? trade.size
  );
  if (explicitUnits && explicitUnits > 0) {
    return {
      units: explicitUnits,
      notionalExposure: entry ? explicitUnits * entry : null,
      source: "units",
    };
  }

  const rawPositionSize = numberOrNull(trade.positionSize);
  if (!rawPositionSize || rawPositionSize <= 0) {
    return { units: null, notionalExposure: null, source: "missing" };
  }

  const storedRisk = numberOrNull(trade.riskAmount);
  const looksLikeNotional = Boolean(storedRisk && storedRisk > 0) || (entry && rawPositionSize > entry * 0.25);

  if (looksLikeNotional) {
    return {
      units: entry ? rawPositionSize / entry : null,
      notionalExposure: rawPositionSize,
      source: "notional",
    };
  }

  return {
    units: rawPositionSize,
    notionalExposure: entry ? rawPositionSize * entry : null,
    source: "positionSizeUnits",
  };
};

export function normalizeTradeForRisk(trade = {}) {
  const entry = entryOf(trade);
  const stopLoss = stopOf(trade);
  const direction = directionOf(trade);
  const position = inferUnitsAndNotional(trade, entry);

  return {
    id: trade.id || null,
    symbol: symbolOf(trade),
    direction,
    status: isOpenTrade(trade) ? "open" : "closed",
    entry,
    stopLoss,
    units: position.units,
    notionalExposure: position.notionalExposure,
    positionSource: position.source,
    riskAmount: numberOrNull(trade.riskAmount),
    original: trade,
  };
}

export function calculateTradeOpenRisk({ trade, currentCapital } = {}) {
  const normalized = normalizeTradeForRisk(trade);
  const capital = Number(currentCapital || 0);
  const missing = [];

  if (!normalized.entry || normalized.entry <= 0) missing.push("entry");
  if (!normalized.stopLoss || normalized.stopLoss <= 0) missing.push("stopLoss");
  if (!normalized.units || normalized.units <= 0) missing.push("positionSize");

  if (missing.length) {
    return {
      ...normalized,
      measurable: false,
      missing,
      riskPerUnit: 0,
      openRiskAmount: 0,
      openRiskPct: 0,
    };
  }

  const riskPerUnit = normalized.direction === "short"
    ? normalized.stopLoss - normalized.entry
    : normalized.entry - normalized.stopLoss;

  if (riskPerUnit <= 0) {
    return {
      ...normalized,
      measurable: false,
      missing: ["validStop"],
      riskPerUnit,
      openRiskAmount: 0,
      openRiskPct: 0,
    };
  }

  const openRiskAmount = normalized.riskAmount && normalized.riskAmount > 0
    ? normalized.riskAmount
    : riskPerUnit * normalized.units;

  return {
    ...normalized,
    measurable: true,
    missing: [],
    riskPerUnit,
    openRiskAmount,
    openRiskPct: capital > 0 ? (openRiskAmount / capital) * 100 : 0,
  };
}

export function calculateTradeNotionalExposure(trade) {
  const normalized = normalizeTradeForRisk(trade);
  return normalized.notionalExposure || 0;
}

const emptyDirectionBucket = () => ({
  trades: 0,
  openRiskAmount: 0,
  openRiskPct: 0,
  notionalExposure: 0,
  notionalExposurePct: 0,
});

export function groupRiskBySymbol({ trades = [], currentCapital = 0 } = {}) {
  const openTrades = trades.filter(isOpenTrade);
  const buckets = new Map();

  openTrades.forEach((trade) => {
    const risk = calculateTradeOpenRisk({ trade, currentCapital });
    const bucket = buckets.get(risk.symbol) || {
      symbol: risk.symbol,
      openTrades: 0,
      longTrades: 0,
      shortTrades: 0,
      openRiskAmount: 0,
      openRiskPct: 0,
      notionalExposure: 0,
      notionalExposurePct: 0,
      highestSingleTradeRiskPct: 0,
      missingRiskData: false,
    };

    bucket.openTrades += 1;
    if (risk.direction === "short") bucket.shortTrades += 1;
    else bucket.longTrades += 1;

    bucket.openRiskAmount += risk.openRiskAmount || 0;
    bucket.notionalExposure += risk.notionalExposure || 0;
    bucket.highestSingleTradeRiskPct = Math.max(bucket.highestSingleTradeRiskPct, risk.openRiskPct || 0);
    bucket.missingRiskData = bucket.missingRiskData || !risk.measurable;
    buckets.set(risk.symbol, bucket);
  });

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      openRiskAmount: round(bucket.openRiskAmount, 2),
      openRiskPct: currentCapital > 0 ? round((bucket.openRiskAmount / currentCapital) * 100, 2) : 0,
      notionalExposure: round(bucket.notionalExposure, 2),
      notionalExposurePct: currentCapital > 0 ? round((bucket.notionalExposure / currentCapital) * 100, 2) : 0,
      highestSingleTradeRiskPct: round(bucket.highestSingleTradeRiskPct, 2),
    }))
    .sort((a, b) => b.openRiskPct - a.openRiskPct);
}

export function groupRiskByDirection({ trades = [], currentCapital = 0 } = {}) {
  const buckets = {
    long: emptyDirectionBucket(),
    short: emptyDirectionBucket(),
  };

  trades.filter(isOpenTrade).forEach((trade) => {
    const risk = calculateTradeOpenRisk({ trade, currentCapital });
    const bucket = buckets[risk.direction] || buckets.long;
    bucket.trades += 1;
    bucket.openRiskAmount += risk.openRiskAmount || 0;
    bucket.notionalExposure += risk.notionalExposure || 0;
  });

  Object.values(buckets).forEach((bucket) => {
    bucket.openRiskAmount = round(bucket.openRiskAmount, 2);
    bucket.openRiskPct = currentCapital > 0 ? round((bucket.openRiskAmount / currentCapital) * 100, 2) : 0;
    bucket.notionalExposure = round(bucket.notionalExposure, 2);
    bucket.notionalExposurePct = currentCapital > 0 ? round((bucket.notionalExposure / currentCapital) * 100, 2) : 0;
  });

  return buckets;
}

export function calculatePortfolioExposure({ trades = [], config = {}, currentCapital = 0 } = {}) {
  const cfg = normalizeConfig(config);
  const openTrades = trades.filter(isOpenTrade);
  const riskRows = openTrades.map((trade) => calculateTradeOpenRisk({ trade, currentCapital }));
  const totalOpenRiskAmount = riskRows.reduce((sum, row) => sum + (row.openRiskAmount || 0), 0);
  const totalNotionalExposure = riskRows.reduce((sum, row) => sum + (row.notionalExposure || 0), 0);
  const maxPortfolioRiskPct = Number(cfg.maxPortfolioRiskPct || 6);
  const riskCapacityRemainingPct = Math.max(0, maxPortfolioRiskPct - (currentCapital > 0 ? (totalOpenRiskAmount / currentCapital) * 100 : 0));

  return {
    riskRows,
    totalOpenRiskAmount: round(totalOpenRiskAmount, 2),
    totalOpenRiskPct: currentCapital > 0 ? round((totalOpenRiskAmount / currentCapital) * 100, 2) : 0,
    totalNotionalExposure: round(totalNotionalExposure, 2),
    totalNotionalExposurePct: currentCapital > 0 ? round((totalNotionalExposure / currentCapital) * 100, 2) : 0,
    openPositionsCount: openTrades.length,
    maxOpenPositions: Number(cfg.maxOpenPositions || 0),
    maxPortfolioRiskPct,
    riskCapacityRemainingPct: round(riskCapacityRemainingPct, 2),
    riskCapacityRemainingAmount: round(currentCapital * (riskCapacityRemainingPct / 100), 2),
  };
}

export function calculateDailyRiskState({ trades = [], config = {}, currentCapital = 0, date = new Date() } = {}) {
  const cfg = normalizeConfig(config);
  const day = new Date(date).toISOString().slice(0, 10);
  const todayClosedPnl = trades
    .filter(isClosedTrade)
    .filter((trade) => {
      const closedDate = closedDateOf(trade);
      if (!closedDate) return false;
      return new Date(closedDate).toISOString().slice(0, 10) === day;
    })
    .reduce((sum, trade) => sum + pnlOf(trade), 0);

  const todayClosedPnlPct = currentCapital > 0 ? (todayClosedPnl / currentCapital) * 100 : 0;
  const dailyStopPct = Number(cfg.dailyStopPct || 3);
  const dailyStopUsedPct = Math.abs(Math.min(todayClosedPnlPct, 0));
  const dailyStopRemainingPct = Math.max(0, dailyStopPct - dailyStopUsedPct);

  let status = "SAFE";
  const usedRatio = dailyStopPct > 0 ? dailyStopUsedPct / dailyStopPct : 0;
  if (usedRatio >= 1) status = "LOCKDOWN";
  else if (usedRatio >= 0.9) status = "DANGER";
  else if (usedRatio >= 0.7) status = "CAUTION";

  return {
    todayClosedPnl: round(todayClosedPnl, 2),
    todayClosedPnlPct: round(todayClosedPnlPct, 2),
    dailyStopPct,
    dailyStopUsedPct: round(dailyStopUsedPct, 2),
    dailyStopRemainingPct: round(dailyStopRemainingPct, 2),
    status,
  };
}

export function calculateDrawdownState({ config = {}, currentCapital = 0, activeChallenge = null } = {}) {
  const cfg = normalizeConfig(config);
  const initialCapital = Number(cfg.initialCapital || 0);
  const totalDrawdownPct = calculateTotalDrawdown({ currentCapital, initialCapital });
  const challengeLimitPct = numberOrNull(activeChallenge?.config?.maxTotalDDPct ?? activeChallenge?.maxTotalDDPct);
  const maxTotalDrawdownPct = challengeLimitPct || numberOrNull(cfg.maxTotalDrawdownPct);
  const limit = maxTotalDrawdownPct || null;
  const ratio = limit ? totalDrawdownPct / limit : 0;

  let status = "SAFE";
  if (limit && ratio >= 1) status = "LOCKDOWN";
  else if (limit && ratio >= 0.9) status = "DANGER";
  else if (limit && ratio >= 0.7) status = "CAUTION";

  return {
    initialCapital,
    currentCapital: Number(currentCapital || 0),
    totalDrawdownPct: round(totalDrawdownPct, 2),
    maxTotalDrawdownPct: limit,
    challengeLimitPct: challengeLimitPct || null,
    status,
  };
}

const alert = (id, severity, title, message, recommendation) => ({
  id,
  severity,
  title,
  message,
  recommendation,
});

export function generateCapitalPreservationAlerts({
  exposure,
  dailyState,
  drawdownState,
  config = {},
  activeChallenge = null,
} = {}) {
  const cfg = normalizeConfig(config);
  const alerts = [];
  const maxRisk = Number(exposure?.maxPortfolioRiskPct || cfg.maxPortfolioRiskPct || 6);
  const riskRatio = maxRisk > 0 ? (exposure?.totalOpenRiskPct || 0) / maxRisk : 0;

  if (riskRatio >= 1) {
    alerts.push(alert("portfolio_risk_high", "danger", "Portfolio risk above limit", `Open risk is ${exposure.totalOpenRiskPct}% vs max ${maxRisk}%.`, "Reduce exposure before adding new trades."));
  } else if (riskRatio >= 0.8) {
    alerts.push(alert("portfolio_risk_high", "warning", "Portfolio risk near limit", "Open risk is above 80% of the configured limit.", "Avoid adding risk unless a weaker setup is reduced first."));
  }

  const maxPositions = Number(exposure?.maxOpenPositions || cfg.maxOpenPositions || 0);
  const positionRatio = maxPositions > 0 ? (exposure?.openPositionsCount || 0) / maxPositions : 0;
  if (maxPositions > 0 && positionRatio > 1) {
    alerts.push(alert("too_many_open_positions", "danger", "Too many open positions", `${exposure.openPositionsCount}/${maxPositions} positions are open.`, "Close or manage positions before opening more."));
  } else if (maxPositions > 0 && positionRatio >= 0.8) {
    alerts.push(alert("too_many_open_positions", "warning", "Open positions near limit", `${exposure.openPositionsCount}/${maxPositions} positions are open.`, "Be selective with any new setup."));
  }

  const dailyRatio = dailyState?.dailyStopPct > 0 ? dailyState.dailyStopUsedPct / dailyState.dailyStopPct : 0;
  if (dailyRatio >= 1) {
    alerts.push(alert("daily_stop_warning", "lockdown", "Daily stop reached", "Closed losses reached or exceeded the daily stop.", "Stop trading for the day."));
  } else if (dailyRatio >= 0.7) {
    alerts.push(alert("daily_stop_warning", "warning", "Daily stop near limit", "Closed daily losses used at least 70% of the stop.", "Reduce activity and review execution."));
  }

  const ddLimit = drawdownState?.maxTotalDrawdownPct;
  const ddRatio = ddLimit ? drawdownState.totalDrawdownPct / ddLimit : 0;
  if (ddLimit && ddRatio >= 1) {
    alerts.push(alert("drawdown_warning", "lockdown", "Drawdown limit reached", `Drawdown ${drawdownState.totalDrawdownPct}% reached limit ${ddLimit}%.`, "Protect capital and stop adding new risk."));
  } else if (ddLimit && ddRatio >= 0.9) {
    alerts.push(alert("drawdown_warning", "danger", "Drawdown near failure", `Drawdown is above 90% of the limit.`, "Shift to capital preservation mode."));
  } else if (ddLimit && ddRatio >= 0.7) {
    alerts.push(alert("drawdown_warning", "warning", "Drawdown warning", `Drawdown is above 70% of the limit.`, "Lower risk until equity stabilizes."));
  }

  const rows = exposure?.riskRows || [];
  const missingStopLoss = rows.filter((row) => row.missing?.includes("stopLoss")).length;
  const missingPositionSize = rows.filter((row) => row.missing?.includes("positionSize")).length;

  if (missingStopLoss) {
    alerts.push(alert("missing_stop_loss", "danger", "Open trades without stop loss", `${missingStopLoss} open trade(s) have no measurable stop loss.`, "Add stop loss data or exclude the trade from risk decisions."));
  }

  if (missingPositionSize) {
    alerts.push(alert("missing_position_size", "warning", "Open trades without position size", `${missingPositionSize} open trade(s) have no measurable size.`, "Add position size to make exposure accurate."));
  }

  const bySymbol = exposure?.bySymbol || [];
  const topSymbol = bySymbol[0];
  if (topSymbol && exposure.totalOpenRiskPct > 0 && topSymbol.openRiskPct / exposure.totalOpenRiskPct > 0.5) {
    alerts.push(alert("symbol_concentration", "warning", "Symbol risk concentration", `${topSymbol.symbol} holds more than 50% of open risk.`, "Avoid stacking correlated risk on one asset."));
  }

  const byDirection = exposure?.byDirection || {};
  ["long", "short"].forEach((direction) => {
    const row = byDirection[direction];
    if (row && exposure.totalOpenRiskPct > 0 && row.openRiskPct / exposure.totalOpenRiskPct > 0.8) {
      alerts.push(alert("direction_concentration", "warning", `${direction.toUpperCase()} direction concentration`, `${direction.toUpperCase()} holds more than 80% of open risk.`, "Check whether directional exposure matches the current market regime."));
    }
  });

  if (activeChallenge?.status === "failed") {
    alerts.push(alert("challenge_failed", "lockdown", "Active challenge failed", "The active challenge is already marked failed.", "Do not add new challenge risk."));
  }

  return alerts;
}

export function getPortfolioRiskStatus({ exposure, dailyState, drawdownState, alerts = [] } = {}) {
  if (alerts.some((item) => item.severity === "lockdown") || dailyState?.status === "LOCKDOWN" || drawdownState?.status === "LOCKDOWN") {
    return "LOCKDOWN";
  }
  if (alerts.some((item) => item.severity === "danger") || dailyState?.status === "DANGER" || drawdownState?.status === "DANGER") {
    return "DANGER";
  }
  if (alerts.some((item) => item.severity === "warning") || dailyState?.status === "CAUTION" || drawdownState?.status === "CAUTION") {
    return "CAUTION";
  }
  if ((exposure?.totalOpenRiskPct || 0) <= 0) return "SAFE";
  return "SAFE";
}

export function buildPortfolioRiskDashboard(input = {}) {
  const trades = Array.isArray(input.trades) ? input.trades : [];
  const config = normalizeConfig(input.config);
  const currentCapital = Number(input.currentCapital || config.initialCapital || 0);
  const activeChallenge = input.activeChallenge || null;
  const date = input.date || new Date();

  const exposure = calculatePortfolioExposure({ trades, config, currentCapital });
  const bySymbol = groupRiskBySymbol({ trades, currentCapital });
  const byDirection = groupRiskByDirection({ trades, currentCapital });
  const dailyState = calculateDailyRiskState({ trades, config, currentCapital, date });
  const drawdownState = calculateDrawdownState({ config, currentCapital, activeChallenge });
  const exposureWithGroups = { ...exposure, bySymbol, byDirection };
  const alerts = generateCapitalPreservationAlerts({
    exposure: exposureWithGroups,
    dailyState,
    drawdownState,
    config,
    activeChallenge,
  });

  const riskRows = exposure.riskRows || [];
  const missingStopLoss = riskRows.filter((row) => row.missing?.includes("stopLoss")).length;
  const missingPositionSize = riskRows.filter((row) => row.missing?.includes("positionSize")).length;
  const unmeasurableTrades = riskRows.filter((row) => !row.measurable).length;
  const measurableTrades = riskRows.length - unmeasurableTrades;

  return {
    status: getPortfolioRiskStatus({ exposure: exposureWithGroups, dailyState, drawdownState, alerts }),
    generatedAt: new Date().toISOString(),
    summary: {
      currentCapital: round(currentCapital, 2),
      initialCapital: round(config.initialCapital, 2),
      totalOpenRiskAmount: exposure.totalOpenRiskAmount,
      totalOpenRiskPct: exposure.totalOpenRiskPct,
      totalNotionalExposure: exposure.totalNotionalExposure,
      totalNotionalExposurePct: exposure.totalNotionalExposurePct,
      openPositionsCount: exposure.openPositionsCount,
      maxOpenPositions: exposure.maxOpenPositions,
      maxPortfolioRiskPct: exposure.maxPortfolioRiskPct,
      riskCapacityRemainingPct: exposure.riskCapacityRemainingPct,
      riskCapacityRemainingAmount: exposure.riskCapacityRemainingAmount,
    },
    bySymbol,
    byDirection,
    dailyState,
    drawdownState,
    alerts,
    dataQuality: {
      measurableTrades,
      unmeasurableTrades,
      missingStopLoss,
      missingPositionSize,
      notes: [
        "Open trades are inferred from status=open or absence of closing fields.",
        "When existing app trades store positionSize as notional, exposure is converted to units using entry price.",
        ...(unmeasurableTrades ? ["Some open trades are not fully measurable and may understate total risk."] : []),
      ],
    },
    disclaimer: DISCLAIMER,
  };
}
