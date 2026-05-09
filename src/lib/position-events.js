export const POSITION_EVENT_TYPES = {
  CLOSE: "close",
  REDUCE: "reduce",
  INCREASE: "increase",
  MOVE_STOP: "move_stop",
};

export const POSITION_EVENT_DISCLAIMER =
  "Registro educativo local. No ejecuta órdenes reales.";

const EMOTIONS = ["calm", "focused", "doubt", "fomo", "fear", "revenge"];

const numberOrNull = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const makeId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const symbolOf = (trade = {}) =>
  String(trade.symbol || trade.pair || trade.asset || "").replace("/", "").toUpperCase() || "UNKNOWN";

const directionOf = (trade = {}) =>
  String(trade.direction || trade.side || "long").toLowerCase() === "short" ? "short" : "long";

const positionSizeOf = (trade = {}) =>
  numberOrNull(trade.positionUnits) ?? numberOrNull(trade.positionSize);

const positionUnitsOf = (trade = {}) => {
  const explicitUnits = numberOrNull(trade.positionUnits);
  if (explicitUnits !== null) return explicitUnits;
  const entry = numberOrNull(trade.entry ?? trade.entryPrice);
  const notionalSize = numberOrNull(trade.positionSize);
  if (!entry || !notionalSize) return null;
  return notionalSize / entry;
};

const calculateRiskAmount = (trade = {}) => {
  const entry = numberOrNull(trade.entry ?? trade.entryPrice);
  const stopLoss = numberOrNull(trade.stopLoss ?? trade.sl);
  const units = positionUnitsOf(trade);
  if (!entry || !stopLoss || !units) return numberOrNull(trade.riskAmount) || 0;

  const riskPerUnit = directionOf(trade) === "short" ? stopLoss - entry : entry - stopLoss;
  if (riskPerUnit <= 0) return numberOrNull(trade.riskAmount) || 0;
  return units * riskPerUnit;
};

const shouldUpdatePositionSize = (type) =>
  type === POSITION_EVENT_TYPES.REDUCE || type === POSITION_EVENT_TYPES.INCREASE;

const buildPositionSizingPatch = (trade = {}, newPositionSize) => {
  const nextSize = numberOrNull(newPositionSize);
  if ("positionUnits" in trade) {
    const entry = numberOrNull(trade.entry ?? trade.entryPrice);
    return {
      positionUnits: nextSize,
      positionSize: entry && nextSize ? entry * nextSize : trade.positionSize,
      ...("notionalValue" in trade ? { notionalValue: entry && nextSize ? entry * nextSize : trade.notionalValue } : {}),
    };
  }
  const patch = { positionSize: nextSize };
  if ("notionalValue" in trade) {
    patch.notionalValue = nextSize;
  }
  return patch;
};

export function validatePositionEvent(input = {}) {
  const type = input.type || input.action;
  if (!input.tradeId) throw new Error("tradeId is required.");
  if (!Object.values(POSITION_EVENT_TYPES).includes(type)) {
    throw new Error("Invalid position event type.");
  }
  if (!String(input.reason || "").trim()) {
    throw new Error("Reason is required.");
  }
  if (!EMOTIONS.includes(String(input.emotionalState || ""))) {
    throw new Error(`emotionalState must be one of: ${EMOTIONS.join(", ")}.`);
  }
  if (input.followedPlan === false && !String(input.planDeviationReason || "").trim()) {
    throw new Error("Plan deviation reason is required when the action does not follow the plan.");
  }
  if (type === POSITION_EVENT_TYPES.CLOSE && numberOrNull(input.exitPrice) === null) {
    throw new Error("Exit price is required to register a manual close.");
  }
  if (type === POSITION_EVENT_TYPES.CLOSE && numberOrNull(input.realizedPnl) === null) {
    throw new Error("Realized P&L is required to register a manual close.");
  }
  if ([POSITION_EVENT_TYPES.REDUCE, POSITION_EVENT_TYPES.INCREASE].includes(type)) {
    const currentSize = positionSizeOf(input.trade);
    const newPositionSize = numberOrNull(input.newPositionSize);
    if (currentSize === null) {
      throw new Error("Position size is required to register a size adjustment.");
    }
    if (newPositionSize === null || newPositionSize <= 0) {
      throw new Error("New position size must be greater than zero.");
    }
    if (type === POSITION_EVENT_TYPES.REDUCE && newPositionSize >= currentSize) {
      throw new Error("A reduction must set a position size below the current size.");
    }
    if (type === POSITION_EVENT_TYPES.INCREASE && newPositionSize <= currentSize) {
      throw new Error("An increase must set a position size above the current size.");
    }
  }
  if (type === POSITION_EVENT_TYPES.MOVE_STOP) {
    const newStopLoss = numberOrNull(input.newStopLoss);
    const currentPrice = numberOrNull(input.currentPrice);
    const direction = directionOf(input.trade);
    if (newStopLoss === null) {
      throw new Error("New stop loss is required.");
    }
    if (currentPrice !== null && direction === "long" && newStopLoss >= currentPrice) {
      throw new Error("For LONG, the new stop must be below current price.");
    }
    if (currentPrice !== null && direction === "short" && newStopLoss <= currentPrice) {
      throw new Error("For SHORT, the new stop must be above current price.");
    }
  }
  return true;
}

export function classifyPositionDiscipline(input = {}) {
  const type = input.type || input.action;
  const emotionalState = String(input.emotionalState || "calm");
  const highRiskEmotion = ["fomo", "revenge", "fear"].includes(emotionalState);
  const riskyIncrease = type === POSITION_EVENT_TYPES.INCREASE && input.followedPlan === false;
  const riskyStopMove = type === POSITION_EVENT_TYPES.MOVE_STOP && input.riskExpanded && input.followedPlan === false;

  if (highRiskEmotion || riskyIncrease || riskyStopMove) {
    return {
      disciplineStatus: "HIGH_RISK_DEVIATION",
      disciplineScoreImpact: -2,
      disciplineMessage: "Acción de alto riesgo para la disciplina operativa.",
    };
  }

  if (input.followedPlan === false) {
    return {
      disciplineStatus: "DEVIATION",
      disciplineScoreImpact: -1,
      disciplineMessage: "La acción se desvió del plan original.",
    };
  }

  return {
    disciplineStatus: "ALIGNED",
    disciplineScoreImpact: 0,
    disciplineMessage: "La acción está alineada con el plan original.",
  };
}

function buildAfterState(trade, input) {
  const type = input.type || input.action;
  if (type === POSITION_EVENT_TYPES.CLOSE) {
    return {
      positionSize: numberOrNull(trade.positionSize),
      stopLoss: numberOrNull(trade.stopLoss),
      status: "closed",
      exitPrice: numberOrNull(input.exitPrice),
      pnl: numberOrNull(input.realizedPnl),
    };
  }

  if (type === POSITION_EVENT_TYPES.MOVE_STOP) {
    return {
      positionSize: numberOrNull(trade.positionSize),
      stopLoss: numberOrNull(input.newStopLoss),
      status: trade.status || "open",
    };
  }

  const sizingPatch = buildPositionSizingPatch(trade, input.newPositionSize);
  return {
    ...sizingPatch,
    stopLoss: numberOrNull(trade.stopLoss),
    status: trade.status || "open",
  };
}

export function createPositionEvent(input = {}) {
  validatePositionEvent(input);
  const trade = input.trade || {};
  const type = input.type || input.action;
  const previousRiskAmount = numberOrNull(input.previousRiskAmount) ?? calculateRiskAmount(trade);
  const afterTrade = {
    ...trade,
    ...(shouldUpdatePositionSize(type) ? buildPositionSizingPatch(trade, input.newPositionSize) : {}),
    stopLoss: type === POSITION_EVENT_TYPES.MOVE_STOP ? numberOrNull(input.newStopLoss) : trade.stopLoss,
    status: type === POSITION_EVENT_TYPES.CLOSE ? "closed" : trade.status,
  };
  const newRiskAmount = type === POSITION_EVENT_TYPES.CLOSE ? 0 : calculateRiskAmount(afterTrade);
  const riskExpanded = newRiskAmount > previousRiskAmount;
  const discipline = classifyPositionDiscipline({ ...input, type, riskExpanded });

  return {
    id: input.id || makeId("evt"),
    tradeId: input.tradeId,
    symbol: input.symbol || symbolOf(trade),
    type,
    timestamp: input.timestamp || new Date().toISOString(),
    before: {
      positionSize: numberOrNull(trade.positionSize),
      positionUnits: numberOrNull(trade.positionUnits),
      notionalValue: numberOrNull(trade.notionalValue),
      stopLoss: numberOrNull(trade.stopLoss),
      status: trade.status || "open",
    },
    after: buildAfterState(trade, input),
    reason: String(input.reason || "").trim(),
    followedPlan: input.followedPlan === true,
    planDeviationReason: String(input.planDeviationReason || "").trim(),
    emotionalState: input.emotionalState,
    notes: String(input.notes || "").trim(),
    exitPrice: numberOrNull(input.exitPrice),
    realizedPnl: numberOrNull(input.realizedPnl),
    reduceAmount: numberOrNull(input.reduceAmount),
    increaseAmount: numberOrNull(input.increaseAmount),
    previousStopLoss: numberOrNull(input.previousStopLoss ?? trade.stopLoss),
    newStopLoss: numberOrNull(input.newStopLoss),
    riskImpact: {
      previousRiskAmount,
      newRiskAmount,
      riskReduced: newRiskAmount < previousRiskAmount,
      riskExpanded,
    },
    ...discipline,
    source: "manual_position_management",
    disclaimer: POSITION_EVENT_DISCLAIMER,
  };
}

export function applyPositionEventToTrade(trade = {}, event = {}) {
  const next = {
    ...trade,
    positionEvents: [...(trade.positionEvents || []), event],
  };

  if (event.type === POSITION_EVENT_TYPES.CLOSE) {
    next.status = "closed";
    next.exitPrice = event.after.exitPrice;
    next.closeDate = event.timestamp;
    next.closedAt = event.timestamp;
    next.pnl = numberOrNull(event.after.pnl) ?? 0;
    next.rResult = next.riskAmount ? next.pnl / next.riskAmount : null;
    next.followedPlan = event.followedPlan;
    next.lesson = event.reason;
  }

  if (event.type === POSITION_EVENT_TYPES.REDUCE || event.type === POSITION_EVENT_TYPES.INCREASE) {
    next.positionSize = event.after.positionSize;
    if ("positionUnits" in next) next.positionUnits = event.after.positionUnits ?? event.after.positionSize;
    if ("notionalValue" in next) next.notionalValue = event.after.notionalValue ?? event.after.positionSize;
    next.riskAmount = event.riskImpact.newRiskAmount;
  }

  if (event.type === POSITION_EVENT_TYPES.MOVE_STOP) {
    next.stopLoss = event.after.stopLoss;
    next.riskAmount = event.riskImpact.newRiskAmount;
  }

  return next;
}

export function buildJournalEntryFromPositionEvent(trade = {}, event = {}) {
  const actionLabel = {
    [POSITION_EVENT_TYPES.CLOSE]: "Cierre manual",
    [POSITION_EVENT_TYPES.REDUCE]: "Reducción de posición",
    [POSITION_EVENT_TYPES.INCREASE]: "Aumento de posición",
    [POSITION_EVENT_TYPES.MOVE_STOP]: "Movimiento de Stop Loss",
  }[event.type] || "Gestión de posición";

  const summaryByType = {
    [POSITION_EVENT_TYPES.CLOSE]: `Cierre registrado en ${event.after?.exitPrice ?? "precio N/A"} con P&L local ${event.after?.pnl ?? "N/A"}.`,
    [POSITION_EVENT_TYPES.REDUCE]: `Tamaño reducido de ${event.before?.positionSize ?? "N/A"} a ${event.after?.positionSize ?? "N/A"}.`,
    [POSITION_EVENT_TYPES.INCREASE]: `Tamaño aumentado de ${event.before?.positionSize ?? "N/A"} a ${event.after?.positionSize ?? "N/A"}.`,
    [POSITION_EVENT_TYPES.MOVE_STOP]: `Stop movido de ${event.before?.stopLoss ?? "N/A"} a ${event.after?.stopLoss ?? "N/A"}.`,
  };

  return {
    id: makeId("journal"),
    tradeId: event.tradeId,
    symbol: event.symbol || symbolOf(trade),
    type: "position_management",
    action: event.type,
    timestamp: event.timestamp,
    title: `${actionLabel} en ${event.symbol || symbolOf(trade)}`,
    summary: `${summaryByType[event.type] || actionLabel} Acción ${event.followedPlan ? "alineada" : "no alineada"} al plan.`,
    followedPlan: event.followedPlan,
    emotionalState: event.emotionalState,
    reason: event.reason,
    planDeviationReason: event.planDeviationReason,
    before: event.before,
    after: event.after,
    riskImpact: event.riskImpact,
    disciplineStatus: event.disciplineStatus,
    disciplineScoreImpact: event.disciplineScoreImpact,
    disciplineMessage: event.disciplineMessage,
    auditTags: ["manual", "position-management", "plan-discipline"],
    disclaimer: POSITION_EVENT_DISCLAIMER,
  };
}
