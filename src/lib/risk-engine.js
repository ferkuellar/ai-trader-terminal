const DEFAULT_RISK_CONFIG = {
  initialCapital: 1000,
  riskPctPerTrade: 1.5,
  maxOpenPositions: 3,
  maxPortfolioRiskPct: 6,
  dailyStopPct: 3,
  maxStopDistancePct: 12,
  minRewardRisk: 1.5,
};

const EMOTION_RULES = {
  calm: { status: "pass", message: "Emotional state is calm." },
  focused: { status: "pass", message: "Emotional state is focused." },
  doubt: { status: "warning", message: "Doubt detected. Reduce discretion and re-check the plan." },
  fomo: { status: "fail", message: "FOMO detected. Trade is blocked." },
  revenge: { status: "fail", message: "Revenge trading detected. Trade is blocked." },
};

const CHECKLIST_LABELS = {
  trendAligned: "Trend aligned",
  triggerConfirmed: "Trigger confirmed",
  validStop: "Valid technical stop",
  rrMin: "Minimum reward/risk",
  portfolioRiskOk: "Portfolio risk acceptable",
  documentedBeforeEntry: "Documented before entry",
  emotionalStateOk: "Emotional state acceptable",
};

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

const mergeConfig = (config = {}) => ({
  ...DEFAULT_RISK_CONFIG,
  ...config,
});

const getTradeEntry = (trade = {}) => numberOrNull(trade.entry ?? trade.entryPrice);
const getTradeStop = (trade = {}) => numberOrNull(trade.stopLoss);
const getTradeTp1 = (trade = {}) => numberOrNull(trade.tp1);
const getTradeDirection = (trade = {}) => String(trade.direction || "long").toLowerCase();

export function calculateTradeRisk(input = {}) {
  const trade = input.trade || {};
  const config = mergeConfig(input.config);
  const currentCapital = Number(input.currentCapital || config.initialCapital || 0);
  const entry = getTradeEntry(trade);
  const stopLoss = getTradeStop(trade);
  const tp1 = getTradeTp1(trade);
  const direction = getTradeDirection(trade);

  if (!entry || entry <= 0 || !stopLoss || stopLoss <= 0) {
    return { error: "Entry and stop loss must be positive numbers." };
  }

  const riskPerUnit = direction === "short" ? stopLoss - entry : entry - stopLoss;
  if (riskPerUnit <= 0) {
    return { error: "Stop loss is invalid for the selected direction.", riskPerUnit };
  }

  const stopDistancePct = (riskPerUnit / entry) * 100;
  const allowedRiskAmount = currentCapital * (Number(config.riskPctPerTrade || 0) / 100);
  const suggestedPositionSize = allowedRiskAmount / riskPerUnit;
  const notionalValue = suggestedPositionSize * entry;

  const inputPositionSize = numberOrNull(trade.positionSize);
  const actualUnits = inputPositionSize && inputPositionSize > 0
    ? inputPositionSize
    : suggestedPositionSize;
  const actualRiskAmount = actualUnits * riskPerUnit;
  const actualRiskPct = currentCapital > 0 ? (actualRiskAmount / currentCapital) * 100 : 0;

  let rewardPerUnit = null;
  let rrTp1 = null;
  if (tp1 && tp1 > 0) {
    rewardPerUnit = direction === "short" ? entry - tp1 : tp1 - entry;
    rrTp1 = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : null;
  }

  return {
    entry,
    stopLoss,
    tp1,
    direction,
    riskPerUnit,
    stopDistancePct,
    allowedRiskAmount,
    suggestedPositionSize,
    actualPositionSize: actualUnits,
    actualRiskAmount,
    actualRiskPct,
    notionalValue,
    rewardPerUnit,
    rrTp1,
  };
}

export function calculatePositionSize(input = {}) {
  const result = calculateTradeRisk(input);
  if (result.error) return result;
  return {
    suggestedPositionSize: result.suggestedPositionSize,
    notionalValue: result.notionalValue,
    allowedRiskAmount: result.allowedRiskAmount,
    riskPerUnit: result.riskPerUnit,
  };
}

export function calculateOpenPortfolioRisk({ trades = [], currentCapital = 0 } = {}) {
  const capital = Number(currentCapital || 0);
  const openTrades = Array.isArray(trades)
    ? trades.filter((trade) => String(trade.status || "open").toLowerCase() === "open")
    : [];

  const openRiskAmount = openTrades.reduce((sum, trade) => {
    const storedRisk = numberOrNull(trade.riskAmount);
    if (storedRisk && storedRisk > 0) return sum + storedRisk;

    const entry = getTradeEntry(trade);
    const stopLoss = getTradeStop(trade);
    const direction = getTradeDirection(trade);
    const positionValue = numberOrNull(trade.positionSize);
    if (!entry || !stopLoss || !positionValue) return sum;

    const riskPerUnit = direction === "short" ? stopLoss - entry : entry - stopLoss;
    if (riskPerUnit <= 0) return sum;

    // Existing app stores positionSize as notional value, so convert to units.
    const units = positionValue / entry;
    return sum + units * riskPerUnit;
  }, 0);

  return {
    openPositions: openTrades.length,
    openRiskAmount,
    openPortfolioRiskPct: capital > 0 ? (openRiskAmount / capital) * 100 : 0,
  };
}

export function calculateDailyPnL({ trades = [], date = new Date() } = {}) {
  const target = new Date(date);
  const day = target.toISOString().slice(0, 10);
  const closedToday = Array.isArray(trades)
    ? trades.filter((trade) => {
        if (String(trade.status || "").toLowerCase() !== "closed") return false;
        const closedDate = trade.closeDate || trade.closedAt || trade.exitDate || trade.date;
        if (!closedDate) return false;
        return new Date(closedDate).toISOString().slice(0, 10) === day;
      })
    : [];

  const dailyPnL = closedToday.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  return { dailyPnL, closedTradesToday: closedToday.length };
}

export function calculateTotalDrawdown({ currentCapital = 0, initialCapital = 0 } = {}) {
  const current = Number(currentCapital || 0);
  const initial = Number(initialCapital || 0);
  if (initial <= 0) return 0;
  return Math.max(0, ((initial - current) / initial) * 100);
}

const pushCheck = (checks, { id, label, status, message }) => {
  checks.push({ id, label, status, message });
};

const addWarning = (warnings, recommendations, message, recommendation) => {
  warnings.push(message);
  if (recommendation) recommendations.push(recommendation);
};

const addBlocker = (blockers, recommendations, message, recommendation) => {
  blockers.push(message);
  if (recommendation) recommendations.push(recommendation);
};

export function getRiskDecision(validation = {}) {
  if ((validation.blockers || []).length > 0) return "BLOCKED";
  if ((validation.warnings || []).length > 0) return "WARNING";
  return "APPROVED";
}

export function validateTradeRisk(input = {}) {
  const config = mergeConfig(input.config);
  const trades = Array.isArray(input.trades) ? input.trades : [];
  const trade = input.trade || {};
  const currentCapital = Number(input.currentCapital || config.initialCapital || 0);
  const activeChallenge = input.activeChallenge || null;
  const checks = [];
  const blockers = [];
  const warnings = [];
  const recommendations = [];

  const risk = calculateTradeRisk({ trade, config, currentCapital });
  if (risk.error) {
    addBlocker(blockers, recommendations, risk.error, "Fix entry, stop loss and direction before saving the trade.");
  }

  const portfolio = calculateOpenPortfolioRisk({ trades, currentCapital });
  const daily = calculateDailyPnL({ trades, date: new Date() });
  const dailyPnLPct = currentCapital > 0 ? (daily.dailyPnL / currentCapital) * 100 : 0;
  const dailyLossPct = Math.max(0, Math.abs(Math.min(0, daily.dailyPnL)) / Math.max(1, currentCapital) * 100);
  const totalDrawdownPct = calculateTotalDrawdown({
    currentCapital,
    initialCapital: config.initialCapital,
  });

  const projectedPortfolioRiskPct = portfolio.openPortfolioRiskPct + (risk.actualRiskPct || 0);

  if (!risk.error) {
    const stopOk = risk.stopDistancePct <= Number(config.maxStopDistancePct);
    pushCheck(checks, {
      id: "stop_distance",
      label: "Stop distance within allowed limit",
      status: stopOk ? "pass" : "fail",
      message: stopOk
        ? `Stop distance ${round(risk.stopDistancePct, 2)}% is within ${config.maxStopDistancePct}%.`
        : `Stop distance ${round(risk.stopDistancePct, 2)}% exceeds ${config.maxStopDistancePct}%.`,
    });
    if (!stopOk) addBlocker(blockers, recommendations, "Stop distance exceeds the configured limit.", "Move the stop to a valid technical level or skip the setup.");

    const riskOk = risk.actualRiskPct <= Number(config.riskPctPerTrade);
    pushCheck(checks, {
      id: "trade_risk",
      label: "Risk per trade within limit",
      status: riskOk ? "pass" : "fail",
      message: riskOk
        ? `Actual trade risk ${round(risk.actualRiskPct, 2)}% is within ${config.riskPctPerTrade}%.`
        : `Actual trade risk ${round(risk.actualRiskPct, 2)}% exceeds ${config.riskPctPerTrade}%.`,
    });
    if (!riskOk) addBlocker(blockers, recommendations, "Trade risk exceeds configured risk per trade.", "Reduce position size or skip the trade.");

    const rrValue = Number(risk.rrTp1);
    if (!Number.isFinite(rrValue)) {
      pushCheck(checks, {
        id: "reward_risk",
        label: "Reward/risk to TP1 available",
        status: "warning",
        message: "TP1 is missing or invalid, so R:R cannot be confirmed.",
      });
      addWarning(warnings, recommendations, "TP1 is missing or invalid.", "Define TP1 before treating this as a complete plan.");
    } else if (rrValue < 1) {
      pushCheck(checks, {
        id: "reward_risk",
        label: "Reward/risk to TP1 acceptable",
        status: "fail",
        message: `R:R to TP1 is ${round(rrValue, 2)}, below 1.0.`,
      });
      addBlocker(blockers, recommendations, "R:R to TP1 is below 1.0.", "Reject trades where downside is larger than planned upside.");
    } else if (rrValue < Number(config.minRewardRisk)) {
      pushCheck(checks, {
        id: "reward_risk",
        label: "Reward/risk to TP1 meets minimum",
        status: "warning",
        message: `R:R to TP1 is ${round(rrValue, 2)}, below ${config.minRewardRisk}.`,
      });
      addWarning(warnings, recommendations, "R:R to TP1 is below the configured minimum.", "Improve entry, reduce stop distance, or wait for a better setup.");
    } else {
      pushCheck(checks, {
        id: "reward_risk",
        label: "Reward/risk to TP1 meets minimum",
        status: "pass",
        message: `R:R to TP1 is ${round(rrValue, 2)}.`,
      });
    }
  }

  const maxOpenPositions = Number(config.maxOpenPositions);
  const positionsOk = portfolio.openPositions < maxOpenPositions;
  pushCheck(checks, {
    id: "max_open_positions",
    label: "Open positions below max",
    status: positionsOk ? "pass" : "fail",
    message: positionsOk
      ? `${portfolio.openPositions}/${maxOpenPositions} open positions before this trade.`
      : `${portfolio.openPositions}/${maxOpenPositions} open positions already in use.`,
  });
  if (!positionsOk) addBlocker(blockers, recommendations, "Maximum open positions reached.", "Close or manage existing positions before adding a new one.");

  const portfolioOk = projectedPortfolioRiskPct <= Number(config.maxPortfolioRiskPct);
  pushCheck(checks, {
    id: "portfolio_risk",
    label: "Projected portfolio risk within limit",
    status: portfolioOk ? "pass" : "fail",
    message: portfolioOk
      ? `Projected risk ${round(projectedPortfolioRiskPct, 2)}% is within ${config.maxPortfolioRiskPct}%.`
      : `Projected risk ${round(projectedPortfolioRiskPct, 2)}% exceeds ${config.maxPortfolioRiskPct}%.`,
  });
  if (!portfolioOk) addBlocker(blockers, recommendations, "Projected portfolio risk exceeds limit.", "Reduce risk or wait until open exposure decreases.");

  const dailyStopPct = Number(config.dailyStopPct);
  const dailyOk = dailyLossPct < dailyStopPct;
  pushCheck(checks, {
    id: "daily_stop",
    label: "Daily stop not reached",
    status: dailyOk ? "pass" : "fail",
    message: dailyOk
      ? `Daily loss used ${round(dailyLossPct, 2)}% of ${dailyStopPct}%.`
      : `Daily loss ${round(dailyLossPct, 2)}% reached/exceeded ${dailyStopPct}%.`,
  });
  if (!dailyOk) addBlocker(blockers, recommendations, "Daily stop has been reached.", "Stop trading for the day and review execution.");

  const challengeTotalLimit = Number(activeChallenge?.maxTotalDDPct || 0);
  if (activeChallenge && challengeTotalLimit > 0) {
    const challengeOk = totalDrawdownPct <= challengeTotalLimit;
    pushCheck(checks, {
      id: "challenge_total_drawdown",
      label: "Challenge total drawdown within limit",
      status: challengeOk ? "pass" : "fail",
      message: challengeOk
        ? `Total drawdown ${round(totalDrawdownPct, 2)}% is within challenge limit ${challengeTotalLimit}%.`
        : `Total drawdown ${round(totalDrawdownPct, 2)}% exceeds challenge limit ${challengeTotalLimit}%.`,
    });
    if (!challengeOk) addBlocker(blockers, recommendations, "Active challenge total drawdown limit is exceeded.", "Do not add risk while the challenge is violated.");
  }

  const checklist = trade.checklist || {};
  Object.entries(CHECKLIST_LABELS).forEach(([key, label]) => {
    const passed = checklist[key] === true;
    let status = passed ? "pass" : "warning";
    let message = passed ? `${label} confirmed.` : `${label} is not confirmed.`;

    if (!passed && ["validStop", "emotionalStateOk"].includes(key)) status = "fail";
    if (!passed && key === "rrMin" && Number(risk.rrTp1) < 1) status = "fail";

    pushCheck(checks, {
      id: `checklist_${key}`,
      label,
      status,
      message,
    });

    if (status === "fail") {
      addBlocker(blockers, recommendations, message, "Complete the critical checklist before saving the trade.");
    } else if (status === "warning") {
      addWarning(warnings, recommendations, message, "Document the missing checklist item before entry.");
    }
  });

  const emotion = String(trade.emotion || "calm").toLowerCase();
  const emotionRule = EMOTION_RULES[emotion] || EMOTION_RULES.doubt;
  pushCheck(checks, {
    id: "emotion",
    label: "Emotional state",
    status: emotionRule.status,
    message: emotionRule.message,
  });
  if (emotionRule.status === "fail") {
    addBlocker(blockers, recommendations, emotionRule.message, "Step away and do not register a new trade from this state.");
  } else if (emotionRule.status === "warning") {
    addWarning(warnings, recommendations, emotionRule.message, "Wait for clarity or reduce discretion before proceeding.");
  }

  const draft = {
    blockers,
    warnings,
    recommendations: [...new Set(recommendations)],
  };
  const status = getRiskDecision(draft);
  const score = Math.max(0, Math.min(100, 100 - warnings.length * 8 - blockers.length * 22));

  const metrics = {
    entry: round(risk.entry),
    stopLoss: round(risk.stopLoss),
    tp1: round(risk.tp1),
    riskPerUnit: round(risk.riskPerUnit),
    stopDistancePct: round(risk.stopDistancePct, 2),
    allowedRiskAmount: round(risk.allowedRiskAmount, 2),
    suggestedPositionSize: round(risk.suggestedPositionSize, 8),
    actualRiskAmount: round(risk.actualRiskAmount, 2),
    actualRiskPct: round(risk.actualRiskPct, 2),
    notionalValue: round(risk.notionalValue, 2),
    rrTp1: round(risk.rrTp1, 2),
    openPortfolioRiskPct: round(portfolio.openPortfolioRiskPct, 2),
    projectedPortfolioRiskPct: round(projectedPortfolioRiskPct, 2),
    openPositions: portfolio.openPositions,
    dailyPnLPct: round(dailyPnLPct, 2),
    dailyLossPct: round(dailyLossPct, 2),
    totalDrawdownPct: round(totalDrawdownPct, 2),
  };

  return {
    status,
    score,
    summary: status === "APPROVED"
      ? "Trade risk is approved within the configured educational rules."
      : status === "WARNING"
        ? "Trade can be saved with caution, but warnings should be reviewed first."
        : "Trade is blocked by critical risk rules and should not be saved.",
    metrics,
    checks,
    blockers,
    warnings,
    recommendations: [...new Set(recommendations)],
  };
}
