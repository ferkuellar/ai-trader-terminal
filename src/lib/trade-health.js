export const TRADE_HEALTH_STATUS = {
  HEALTHY: "HEALTHY",
  CAUTION: "CAUTION",
  DANGER: "DANGER",
  STOP_ZONE: "STOP_ZONE",
  UNKNOWN: "UNKNOWN",
};

const SEGMENTS = [
  { level: "safe" },
  { level: "safe" },
  { level: "safe" },
  { level: "warning" },
  { level: "warning" },
  { level: "danger" },
  { level: "danger" },
  { level: "danger" },
];

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

const numberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
};

const getEntry = (trade = {}) => numberOrNull(trade.entry ?? trade.entryPrice);
const getStopLoss = (trade = {}) => numberOrNull(trade.stopLoss ?? trade.sl);
const getTp1 = (trade = {}) => numberOrNull(trade.tp1 ?? trade.takeProfit ?? trade.target);
const getCurrentPrice = (trade = {}) =>
  numberOrNull(trade.currentPrice ?? trade.price ?? trade.markPrice ?? trade.lastPrice);
const getDirection = (trade = {}) =>
  String(trade.direction ?? trade.side ?? "long").toLowerCase() === "short" ? "short" : "long";

function buildUnknown(message, warnings = []) {
  return {
    status: TRADE_HEALTH_STATUS.UNKNOWN,
    label: "Sin datos",
    riskConsumedPct: null,
    distanceToStopAmount: null,
    distanceToStopPct: null,
    progressToTp1Pct: null,
    direction: null,
    message,
    segments: getTradeHealthSegments({ status: TRADE_HEALTH_STATUS.UNKNOWN, riskConsumedPct: null }),
    warnings,
  };
}

export function getTradeHealthLabel(health) {
  const status = typeof health === "string" ? health : health?.status;
  if (status === TRADE_HEALTH_STATUS.HEALTHY) return "Sana";
  if (status === TRADE_HEALTH_STATUS.CAUTION) return "Precaución";
  if (status === TRADE_HEALTH_STATUS.DANGER) return "Peligro";
  if (status === TRADE_HEALTH_STATUS.STOP_ZONE) return "Zona de stop";
  return "Sin datos";
}

export function getTradeHealthColorClass(health) {
  const status = typeof health === "string" ? health : health?.status;
  if (status === TRADE_HEALTH_STATUS.HEALTHY) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
  if (status === TRADE_HEALTH_STATUS.CAUTION) return "text-amber-400 border-amber-500/30 bg-amber-950/20";
  if (status === TRADE_HEALTH_STATUS.DANGER) return "text-red-400 border-red-500/30 bg-red-950/20";
  if (status === TRADE_HEALTH_STATUS.STOP_ZONE) return "text-red-300 border-red-500/50 bg-red-950/40";
  return "text-zinc-400 border-zinc-700 bg-zinc-900/60";
}

export function getTradeHealthSegments(health = {}) {
  const status = health.status || TRADE_HEALTH_STATUS.UNKNOWN;
  if (status === TRADE_HEALTH_STATUS.UNKNOWN) {
    return SEGMENTS.map((segment, index) => ({
      ...segment,
      id: `${segment.level}-${index}`,
      active: false,
    }));
  }

  const riskConsumedPct = clamp(health.riskConsumedPct ?? 0);
  const activeSafe = status === TRADE_HEALTH_STATUS.HEALTHY ? 3 : 0;
  const activeWarning = status === TRADE_HEALTH_STATUS.CAUTION ? 5 : 0;
  const activeDanger = status === TRADE_HEALTH_STATUS.DANGER ? 7 : status === TRADE_HEALTH_STATUS.STOP_ZONE ? 8 : 0;
  const threshold = Math.max(activeSafe, activeWarning, activeDanger);

  return SEGMENTS.map((segment, index) => ({
    ...segment,
    id: `${segment.level}-${index}`,
    active: index < threshold || riskConsumedPct === 0,
  }));
}

export function calculateTradeHealth(trade = {}) {
  const entry = getEntry(trade);
  const stopLoss = getStopLoss(trade);
  const tp1 = getTp1(trade);
  const currentPrice = getCurrentPrice(trade);
  const direction = getDirection(trade);
  const warnings = [];

  if (!entry || entry <= 0) {
    return buildUnknown("Faltan entry o stop loss para calcular la salud del trade.", ["Missing entry price."]);
  }

  if (!stopLoss || stopLoss <= 0) {
    return buildUnknown("Faltan entry o stop loss para calcular la salud del trade.", ["Missing stop loss."]);
  }

  if (!currentPrice || currentPrice <= 0) {
    return buildUnknown("Falta precio actual para calcular la salud del trade.", ["Missing current price."]);
  }

  if (direction === "long" && stopLoss >= entry) {
    return buildUnknown("Stop loss inválido para una posición long.", ["LONG requires stopLoss below entry."]);
  }

  if (direction === "short" && stopLoss <= entry) {
    return buildUnknown("Stop loss inválido para una posición short.", ["SHORT requires stopLoss above entry."]);
  }

  const totalRiskDistance = direction === "long" ? entry - stopLoss : stopLoss - entry;
  const consumedRiskDistance = direction === "long" ? entry - currentPrice : currentPrice - entry;
  const rawRiskConsumedPct = (consumedRiskDistance / totalRiskDistance) * 100;
  const riskConsumedPct = clamp(rawRiskConsumedPct);
  const distanceToStopAmount = direction === "long" ? currentPrice - stopLoss : stopLoss - currentPrice;
  const distanceToStopPct = entry > 0 ? Math.max(0, (distanceToStopAmount / entry) * 100) : 0;

  let progressToTp1Pct = null;
  if (tp1 && tp1 > 0) {
    const rewardDistance = direction === "long" ? tp1 - entry : entry - tp1;
    const progressDistance = direction === "long" ? currentPrice - entry : entry - currentPrice;
    if (rewardDistance > 0) {
      progressToTp1Pct = clamp((progressDistance / rewardDistance) * 100);
    } else {
      warnings.push("Invalid TP1 for selected direction.");
    }
  }

  let status = TRADE_HEALTH_STATUS.HEALTHY;
  if (riskConsumedPct >= 100) status = TRADE_HEALTH_STATUS.STOP_ZONE;
  else if (riskConsumedPct > 65) status = TRADE_HEALTH_STATUS.DANGER;
  else if (riskConsumedPct > 30) status = TRADE_HEALTH_STATUS.CAUTION;

  const label = getTradeHealthLabel(status);
  const message = status === TRADE_HEALTH_STATUS.HEALTHY
    ? "La posición sigue sana."
    : status === TRADE_HEALTH_STATUS.CAUTION
      ? "La posición está consumiendo riesgo y requiere atención."
      : status === TRADE_HEALTH_STATUS.DANGER
        ? "La posición está cerca del stop."
        : "La posición está en zona de stop o invalidación.";

  const health = {
    status,
    label,
    riskConsumedPct: round(riskConsumedPct, 2),
    distanceToStopAmount: round(Math.max(0, distanceToStopAmount), 8),
    distanceToStopPct: round(distanceToStopPct, 2),
    progressToTp1Pct: progressToTp1Pct === null ? null : round(progressToTp1Pct, 2),
    direction,
    message,
    warnings,
  };

  return {
    ...health,
    segments: getTradeHealthSegments(health),
  };
}
