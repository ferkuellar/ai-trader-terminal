const DIRECTIONS = ["long", "short"];
const EMOTIONS = ["calm", "focused", "doubt", "fomo", "revenge"];
const STATUSES = ["APPROVED", "WARNING", "BLOCKED"];
const CHECK_STATUSES = ["pass", "warning", "fail"];

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const requireNumber = (value, label, { positive = false } = {}) => {
  if (!isFiniteNumber(value)) {
    throw new Error(`${label} must be a number`);
  }
  if (positive && Number(value) <= 0) {
    throw new Error(`${label} must be greater than 0`);
  }
};

export function validateRiskEngineInput(input) {
  if (!isObject(input)) {
    throw new Error("Risk validation input must be an object");
  }

  if (!isObject(input.trade)) {
    throw new Error("trade must be an object");
  }

  if (!isObject(input.config)) {
    throw new Error("config must be an object");
  }

  if (!Array.isArray(input.trades)) {
    throw new Error("trades must be an array");
  }

  const entry = input.trade.entry ?? input.trade.entryPrice;
  requireNumber(entry, "trade.entry", { positive: true });
  requireNumber(input.trade.stopLoss, "trade.stopLoss", { positive: true });

  if (input.trade.tp1 !== undefined && input.trade.tp1 !== null && input.trade.tp1 !== "") {
    requireNumber(input.trade.tp1, "trade.tp1", { positive: true });
  }

  const direction = String(input.trade.direction || "").toLowerCase();
  if (!DIRECTIONS.includes(direction)) {
    throw new Error("trade.direction must be long or short");
  }

  const emotion = String(input.trade.emotion || "calm").toLowerCase();
  if (!EMOTIONS.includes(emotion)) {
    throw new Error(`trade.emotion must be one of: ${EMOTIONS.join(", ")}`);
  }

  if (input.trade.checklist !== undefined && !isObject(input.trade.checklist)) {
    throw new Error("trade.checklist must be an object when provided");
  }

  requireNumber(input.currentCapital, "currentCapital", { positive: true });

  [
    "initialCapital",
    "riskPctPerTrade",
    "maxOpenPositions",
    "maxPortfolioRiskPct",
    "dailyStopPct",
  ].forEach((key) => {
    if (input.config[key] !== undefined) {
      requireNumber(input.config[key], `config.${key}`, { positive: true });
    }
  });

  if (input.config.maxStopDistancePct !== undefined) {
    requireNumber(input.config.maxStopDistancePct, "config.maxStopDistancePct", { positive: true });
  }

  if (input.config.minRewardRisk !== undefined) {
    requireNumber(input.config.minRewardRisk, "config.minRewardRisk", { positive: true });
  }

  return true;
}

export function validateRiskEngineOutput(output) {
  if (!isObject(output)) {
    throw new Error("Risk validation output must be an object");
  }

  if (!STATUSES.includes(output.status)) {
    throw new Error(`output.status must be one of: ${STATUSES.join(", ")}`);
  }

  requireNumber(output.score, "output.score");
  if (Number(output.score) < 0 || Number(output.score) > 100) {
    throw new Error("output.score must be between 0 and 100");
  }

  if (typeof output.summary !== "string" || !output.summary.trim()) {
    throw new Error("output.summary must be a non-empty string");
  }

  if (!isObject(output.metrics)) {
    throw new Error("output.metrics must be an object");
  }

  if (!Array.isArray(output.checks)) {
    throw new Error("output.checks must be an array");
  }

  output.checks.forEach((check, index) => {
    if (!isObject(check)) throw new Error(`output.checks[${index}] must be an object`);
    if (typeof check.id !== "string" || !check.id) throw new Error(`output.checks[${index}].id is required`);
    if (typeof check.label !== "string" || !check.label) throw new Error(`output.checks[${index}].label is required`);
    if (!CHECK_STATUSES.includes(check.status)) {
      throw new Error(`output.checks[${index}].status must be pass, warning or fail`);
    }
    if (typeof check.message !== "string") throw new Error(`output.checks[${index}].message must be a string`);
  });

  ["blockers", "warnings", "recommendations"].forEach((key) => {
    if (!Array.isArray(output[key])) {
      throw new Error(`output.${key} must be an array`);
    }
  });

  return true;
}
