const SIGNALS = new Set(["BUY", "HOLD", "ACCUMULATE", "WATCH", "AVOID"]);
const GRADES = new Set(["A+", "A", "B", "C", "D", "F"]);
const RISK_LEVELS = new Set(["Low", "Medium", "High"]);
const CONFIDENCE = new Set(["Low", "Medium", "High"]);
const SCORE_KEYS = [
  "onChainHealth",
  "tokenomicsQuality",
  "sentimentMomentum",
  "technicalSetup",
  "fundamentalStrength",
];

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Crypto watchlist response is missing ${label}`);
  }
}

function assertString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Crypto watchlist response is missing ${label}`);
  }
}

function assertAllowed(value, allowed, label) {
  if (!allowed.has(value)) {
    throw new Error(`Crypto watchlist response has invalid ${label}`);
  }
}

function assertScore(value, label) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 100) {
    throw new Error(`Crypto watchlist response has invalid score for ${label}`);
  }
}

export function validateCryptoWatchlistPayload(payload, { tokens } = {}) {
  assertObject(payload, "payload");

  if (!Array.isArray(payload.assets) || payload.assets.length === 0) {
    throw new Error("Crypto watchlist response is missing assets");
  }

  const expectedTokens = Array.isArray(tokens) ? new Set(tokens) : null;
  const seen = new Set();

  for (const asset of payload.assets) {
    assertObject(asset, "asset");
    assertString(asset.symbol, "asset.symbol");
    if (expectedTokens && !expectedTokens.has(asset.symbol)) {
      throw new Error(`Crypto watchlist response includes unexpected token ${asset.symbol}`);
    }
    if (seen.has(asset.symbol)) {
      throw new Error(`Crypto watchlist response includes duplicate token ${asset.symbol}`);
    }
    seen.add(asset.symbol);

    if (!Number.isInteger(asset.rank) || asset.rank < 1) {
      throw new Error(`Crypto watchlist response has invalid rank for ${asset.symbol}`);
    }
    assertScore(asset.compositeScore, `${asset.symbol}.compositeScore`);
    assertAllowed(asset.grade, GRADES, `${asset.symbol}.grade`);
    assertAllowed(asset.signal, SIGNALS, `${asset.symbol}.signal`);
    assertObject(asset.scores, `${asset.symbol}.scores`);
    for (const key of SCORE_KEYS) {
      assertScore(asset.scores[key], `${asset.symbol}.scores.${key}`);
    }
    assertAllowed(asset.riskLevel, RISK_LEVELS, `${asset.symbol}.riskLevel`);
    assertAllowed(asset.confidence, CONFIDENCE, `${asset.symbol}.confidence`);
    assertString(asset.summary, `${asset.symbol}.summary`);
  }

  if (expectedTokens && seen.size !== expectedTokens.size) {
    throw new Error("Crypto watchlist response does not include every requested token");
  }

  assertObject(payload.summary, "summary");
  assertObject(payload.dataQuality, "dataQuality");
  assertAllowed(payload.dataQuality.freshness, CONFIDENCE, "dataQuality.freshness");
  if (!Array.isArray(payload.dataQuality.missingData)) {
    throw new Error("Crypto watchlist response has invalid dataQuality.missingData");
  }
  assertString(payload.dataQuality.uncertaintyNote, "dataQuality.uncertaintyNote");
  assertString(payload.disclaimer, "disclaimer");

  return payload;
}
