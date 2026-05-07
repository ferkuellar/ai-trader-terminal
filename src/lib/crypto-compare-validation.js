const SIGNALS = new Set(["BUY", "HOLD", "ACCUMULATE", "WATCH", "AVOID"]);
const CONFIDENCE = new Set(["Low", "Medium", "High"]);
const RISK_LEVELS = new Set(["Low", "Medium", "High"]);
const GRADES = new Set(["A+", "A", "B", "C", "D", "F"]);
const SCORE_KEYS = [
  "onChainHealth",
  "tokenomicsQuality",
  "sentimentMomentum",
  "technicalSetup",
  "fundamentalStrength",
];
const RISK_KEYS = [
  "volatilityRisk",
  "liquidityRisk",
  "dilutionUnlockRisk",
  "regulatoryRisk",
  "smartContractRisk",
  "narrativeRisk",
  "centralizationRisk",
  "drawdownRisk",
];
const FINAL_DECISION_KEYS = [
  "bestOverallAsset",
  "bestLongTermHoldThesis",
  "bestShortTermTradeSetup",
  "bestRiskReward",
  "bestTokenomics",
  "bestFundamentals",
  "bestMomentum",
  "lowerRiskAsset",
];

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Crypto compare response is missing ${label}`);
  }
}

function assertAllowed(value, allowed, label) {
  if (!allowed.has(value)) {
    throw new Error(`Crypto compare response has invalid ${label}`);
  }
}

function assertScore(value, label) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 100) {
    throw new Error(`Crypto compare response has invalid score for ${label}`);
  }
}

function assertWinner(value, tokenA, tokenB, label) {
  const allowed = new Set([tokenA, tokenB, "Tie"]);
  assertAllowed(value, allowed, label);
}

function assertString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Crypto compare response is missing ${label}`);
  }
}

export function validateCryptoComparePayload(payload, { tokenA, tokenB } = {}) {
  assertObject(payload, "payload");

  const expectedA = tokenA ? String(tokenA).toUpperCase() : payload.tokenA;
  const expectedB = tokenB ? String(tokenB).toUpperCase() : payload.tokenB;

  if (payload.tokenA !== expectedA) {
    throw new Error("Crypto compare response has invalid tokenA");
  }
  if (payload.tokenB !== expectedB) {
    throw new Error("Crypto compare response has invalid tokenB");
  }
  if (payload.tokenA === payload.tokenB) {
    throw new Error("Crypto compare response tokens must be different");
  }

  assertObject(payload.executiveVerdict, "executiveVerdict");
  assertWinner(payload.executiveVerdict.winner, expectedA, expectedB, "executiveVerdict.winner");
  assertAllowed(payload.executiveVerdict.confidence, CONFIDENCE, "executiveVerdict.confidence");
  assertWinner(payload.executiveVerdict.betterLongTermThesis, expectedA, expectedB, "executiveVerdict.betterLongTermThesis");
  assertWinner(payload.executiveVerdict.betterShortTermSetup, expectedA, expectedB, "executiveVerdict.betterShortTermSetup");
  assertWinner(payload.executiveVerdict.betterRiskAdjustedProfile, expectedA, expectedB, "executiveVerdict.betterRiskAdjustedProfile");
  assertAllowed(payload.executiveVerdict.signalA, SIGNALS, "executiveVerdict.signalA");
  assertAllowed(payload.executiveVerdict.signalB, SIGNALS, "executiveVerdict.signalB");
  assertString(payload.executiveVerdict.summary, "executiveVerdict.summary");

  assertObject(payload.scores, "scores");
  for (const key of SCORE_KEYS) {
    const score = payload.scores[key];
    assertObject(score, `scores.${key}`);
    assertScore(score.tokenA, `scores.${key}.tokenA`);
    assertScore(score.tokenB, `scores.${key}.tokenB`);
    assertWinner(score.winner, expectedA, expectedB, `scores.${key}.winner`);
    assertString(score.reason, `scores.${key}.reason`);
  }

  assertObject(payload.composite, "composite");
  assertScore(payload.composite.tokenA, "composite.tokenA");
  assertScore(payload.composite.tokenB, "composite.tokenB");
  assertAllowed(payload.composite.gradeA, GRADES, "composite.gradeA");
  assertAllowed(payload.composite.gradeB, GRADES, "composite.gradeB");
  assertWinner(payload.composite.winner, expectedA, expectedB, "composite.winner");

  assertObject(payload.riskMatrix, "riskMatrix");
  for (const key of RISK_KEYS) {
    const risk = payload.riskMatrix[key];
    assertObject(risk, `riskMatrix.${key}`);
    assertAllowed(risk.tokenA, RISK_LEVELS, `riskMatrix.${key}.tokenA`);
    assertAllowed(risk.tokenB, RISK_LEVELS, `riskMatrix.${key}.tokenB`);
    assertWinner(risk.higherRisk, expectedA, expectedB, `riskMatrix.${key}.higherRisk`);
  }

  assertObject(payload.finalDecision, "finalDecision");
  for (const key of FINAL_DECISION_KEYS) {
    assertWinner(payload.finalDecision[key], expectedA, expectedB, `finalDecision.${key}`);
  }

  assertObject(payload.dataQuality, "dataQuality");
  assertAllowed(payload.dataQuality.freshness, CONFIDENCE, "dataQuality.freshness");
  if (!Array.isArray(payload.dataQuality.missingData)) {
    throw new Error("Crypto compare response has invalid dataQuality.missingData");
  }
  assertString(payload.dataQuality.uncertaintyNote, "dataQuality.uncertaintyNote");

  return payload;
}
