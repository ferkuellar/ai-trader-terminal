const STATUSES = ["SAFE", "CAUTION", "DANGER", "LOCKDOWN"];

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const requireNumber = (value, label, { positive = false } = {}) => {
  if (!isFiniteNumber(value)) throw new Error(`${label} must be a number`);
  if (positive && Number(value) <= 0) throw new Error(`${label} must be greater than 0`);
};

export function validatePortfolioRiskInput(input) {
  if (!isObject(input)) throw new Error("Portfolio risk input must be an object");
  if (!Array.isArray(input.trades)) throw new Error("trades must be an array");
  if (!isObject(input.config)) throw new Error("config must be an object");

  requireNumber(input.currentCapital, "currentCapital", { positive: true });
  requireNumber(input.config.initialCapital, "config.initialCapital", { positive: true });

  ["riskPctPerTrade", "maxOpenPositions", "maxPortfolioRiskPct", "dailyStopPct"].forEach((key) => {
    if (input.config[key] !== undefined) {
      requireNumber(input.config[key], `config.${key}`, { positive: true });
    }
  });

  return true;
}

export function validatePortfolioRiskDashboard(output) {
  if (!isObject(output)) throw new Error("Portfolio risk dashboard output must be an object");
  if (!STATUSES.includes(output.status)) {
    throw new Error(`output.status must be one of: ${STATUSES.join(", ")}`);
  }
  if (typeof output.generatedAt !== "string" || !output.generatedAt) {
    throw new Error("output.generatedAt must be a string");
  }
  if (!isObject(output.summary)) throw new Error("output.summary must be an object");
  if (!Array.isArray(output.bySymbol)) throw new Error("output.bySymbol must be an array");
  if (!isObject(output.byDirection)) throw new Error("output.byDirection must be an object");
  if (!isObject(output.byDirection.long)) throw new Error("output.byDirection.long must be an object");
  if (!isObject(output.byDirection.short)) throw new Error("output.byDirection.short must be an object");
  if (!isObject(output.dailyState)) throw new Error("output.dailyState must be an object");
  if (!isObject(output.drawdownState)) throw new Error("output.drawdownState must be an object");
  if (!Array.isArray(output.alerts)) throw new Error("output.alerts must be an array");
  if (!isObject(output.dataQuality)) throw new Error("output.dataQuality must be an object");

  [
    "currentCapital",
    "initialCapital",
    "totalOpenRiskAmount",
    "totalOpenRiskPct",
    "totalNotionalExposure",
    "totalNotionalExposurePct",
    "openPositionsCount",
    "maxOpenPositions",
    "maxPortfolioRiskPct",
    "riskCapacityRemainingPct",
    "riskCapacityRemainingAmount",
  ].forEach((key) => {
    requireNumber(output.summary[key], `output.summary.${key}`);
  });

  if (!STATUSES.includes(output.dailyState.status)) {
    throw new Error("output.dailyState.status is invalid");
  }
  if (!STATUSES.includes(output.drawdownState.status)) {
    throw new Error("output.drawdownState.status is invalid");
  }

  output.alerts.forEach((alert, index) => {
    if (!isObject(alert)) throw new Error(`output.alerts[${index}] must be an object`);
    if (typeof alert.id !== "string" || !alert.id) throw new Error(`output.alerts[${index}].id is required`);
    if (!["info", "warning", "danger", "lockdown"].includes(alert.severity)) {
      throw new Error(`output.alerts[${index}].severity is invalid`);
    }
  });

  ["measurableTrades", "unmeasurableTrades", "missingStopLoss", "missingPositionSize"].forEach((key) => {
    requireNumber(output.dataQuality[key], `output.dataQuality.${key}`);
  });

  return true;
}
