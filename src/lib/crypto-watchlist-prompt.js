const MAX_WATCHLIST_TOKENS = 25;

export function normalizeWatchlistToken(value) {
  const token = String(value ?? "")
    .trim()
    .replace(/^\//, "")
    .replace(/\/USDT$/i, "")
    .replace(/USDT$/i, "")
    .toUpperCase();

  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(token)) {
    throw new Error("Invalid crypto token symbol");
  }

  return token;
}

export function normalizeWatchlistTokens(tokens) {
  if (!Array.isArray(tokens)) {
    throw new Error("tokens must be an array");
  }

  const normalized = tokens
    .map(normalizeWatchlistToken)
    .filter(Boolean)
    .filter((token, index, arr) => arr.indexOf(token) === index);

  if (normalized.length > MAX_WATCHLIST_TOKENS) {
    throw new Error(`Maximum ${MAX_WATCHLIST_TOKENS} tokens per watchlist scoring request`);
  }

  return normalized;
}

export function buildCryptoWatchlistPrompt({ tokens, market = {}, context = {} }) {
  const normalizedTokens = normalizeWatchlistTokens(tokens);

  if (normalizedTokens.length < 2) {
    throw new Error("At least 2 tokens are required");
  }

  const marketJson = JSON.stringify(market ?? {}, null, 2);
  const contextJson = JSON.stringify(context ?? {}, null, 2);

  return `You are a senior crypto research analyst for an educational trading terminal.

Rank this crypto watchlist by Composite Crypto Score:
${normalizedTokens.join(", ")}

Methodology:
- Composite Crypto Score is 0 to 100.
- Score every asset across 5 equal dimensions:
  1. On-Chain Health
  2. Tokenomics Quality
  3. Sentiment & Momentum
  4. Technical Setup
  5. Fundamental Strength
- Composite score = average of the 5 dimensions.
- Grades:
  A+ = 85-100
  A = 70-84
  B = 55-69
  C = 40-54
  D = 25-39
  F = 0-24
- Educational signals allowed only: BUY, HOLD, ACCUMULATE, WATCH, AVOID.
- Do not recommend leverage.
- Do not guarantee returns.
- Do not use hype or promotional language.
- Be explicit about uncertainty and missing data.
- Return assets sorted by compositeScore descending.
- Return strict JSON only. No markdown, no commentary, no code fences.

Optional market data:
${marketJson}

Optional local context:
${contextJson}

Required JSON schema. Use exactly these top-level keys and include every token exactly once:
{
  "generatedAt": "ISO_DATE",
  "assets": [
    {
      "symbol": "${normalizedTokens[0]}",
      "rank": 1,
      "compositeScore": 0,
      "grade": "A+ | A | B | C | D | F",
      "signal": "BUY | HOLD | ACCUMULATE | WATCH | AVOID",
      "scores": {
        "onChainHealth": 0,
        "tokenomicsQuality": 0,
        "sentimentMomentum": 0,
        "technicalSetup": 0,
        "fundamentalStrength": 0
      },
      "riskLevel": "Low | Medium | High",
      "confidence": "Low | Medium | High",
      "summary": "string",
      "keyStrength": "string",
      "keyWeakness": "string",
      "invalidation": "string"
    }
  ],
  "summary": {
    "bestOverall": "string",
    "bestMomentum": "string",
    "lowestRisk": "string",
    "highestRisk": "string",
    "marketRegimeNote": "string"
  },
  "dataQuality": {
    "freshness": "Low | Medium | High",
    "missingData": ["string"],
    "uncertaintyNote": "string"
  },
  "disclaimer": "Educational analysis only. This is not financial advice. Crypto assets are highly volatile and can lose significant value. Always verify data, manage risk, and do your own research."
}`;
}
