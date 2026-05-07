export function normalizeCryptoToken(value) {
  const token = String(value ?? "")
    .trim()
    .replace(/\/USDT$/i, "")
    .replace(/USDT$/i, "")
    .toUpperCase();

  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(token)) {
    throw new Error("Invalid crypto token symbol");
  }

  return token;
}

export function buildCryptoComparePrompt({ tokenA, tokenB, market = {}, context = {} }) {
  const normalizedA = normalizeCryptoToken(tokenA);
  const normalizedB = normalizeCryptoToken(tokenB);

  if (!normalizedA || !normalizedB) {
    throw new Error("tokenA and tokenB are required");
  }
  if (normalizedA === normalizedB) {
    throw new Error("tokenA and tokenB must be different");
  }

  const allowedAsset = `${normalizedA} | ${normalizedB} | Tie`;
  const marketJson = JSON.stringify(market ?? {}, null, 2);
  const contextJson = JSON.stringify(context ?? {}, null, 2);

  return `You are a senior crypto research analyst for an educational trading terminal.

Compare ${normalizedA} vs ${normalizedB} using a disciplined Composite Crypto Score from 0 to 100.

Methodology:
- Composite score has 5 equally weighted dimensions, each worth 20%.
- Score each dimension from 0 to 100.
- Dimensions:
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

Safety and quality rules:
- Educational analysis only. This is not financial advice.
- Do not recommend leverage.
- Do not suggest position sizing as a directive. Allocation bias must be illustrative only.
- Do not guarantee returns.
- Do not use hype, promotional language, moonshot framing, or certainty theater.
- Be explicit when data is missing or uncertain.
- If current market data is not provided, infer carefully from durable fundamentals and mark freshness accordingly.
- Use null for technical levels that cannot be estimated from the provided data.
- Return strict JSON only. No markdown, no commentary, no code fences.

Optional market data:
${marketJson}

Optional local context:
${contextJson}

Required JSON schema. Use exactly these top-level keys and replace all example values with your analysis:
{
  "tokenA": "${normalizedA}",
  "tokenB": "${normalizedB}",
  "executiveVerdict": {
    "winner": "${allowedAsset}",
    "confidence": "Low | Medium | High",
    "betterLongTermThesis": "${allowedAsset}",
    "betterShortTermSetup": "${allowedAsset}",
    "betterRiskAdjustedProfile": "${allowedAsset}",
    "signalA": "BUY | HOLD | ACCUMULATE | WATCH | AVOID",
    "signalB": "BUY | HOLD | ACCUMULATE | WATCH | AVOID",
    "summary": "3-5 concise sentences"
  },
  "marketSnapshot": {
    "assetClassA": "string",
    "assetClassB": "string",
    "notes": "string"
  },
  "scores": {
    "onChainHealth": {
      "tokenA": 0,
      "tokenB": 0,
      "winner": "${allowedAsset}",
      "reason": "string"
    },
    "tokenomicsQuality": {
      "tokenA": 0,
      "tokenB": 0,
      "winner": "${allowedAsset}",
      "reason": "string"
    },
    "sentimentMomentum": {
      "tokenA": 0,
      "tokenB": 0,
      "winner": "${allowedAsset}",
      "reason": "string"
    },
    "technicalSetup": {
      "tokenA": 0,
      "tokenB": 0,
      "winner": "${allowedAsset}",
      "reason": "string"
    },
    "fundamentalStrength": {
      "tokenA": 0,
      "tokenB": 0,
      "winner": "${allowedAsset}",
      "reason": "string"
    }
  },
  "composite": {
    "tokenA": 0,
    "tokenB": 0,
    "gradeA": "A+ | A | B | C | D | F",
    "gradeB": "A+ | A | B | C | D | F",
    "winner": "${allowedAsset}"
  },
  "technicalLevels": {
    "${normalizedA}": {
      "support": null,
      "resistance": null,
      "criticalInvalidation": null,
      "breakoutLevel": null
    },
    "${normalizedB}": {
      "support": null,
      "resistance": null,
      "criticalInvalidation": null,
      "breakoutLevel": null
    }
  },
  "riskMatrix": {
    "volatilityRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "liquidityRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "dilutionUnlockRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "regulatoryRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "smartContractRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "narrativeRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "centralizationRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    },
    "drawdownRisk": {
      "tokenA": "Low | Medium | High",
      "tokenB": "Low | Medium | High",
      "higherRisk": "${allowedAsset}"
    }
  },
  "biggestRisks": {
    "${normalizedA}": "string",
    "${normalizedB}": "string"
  },
  "marketRegimeFit": [
    {
      "regime": "Bull Market",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    },
    {
      "regime": "Bear Market",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    },
    {
      "regime": "Sideways Market",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    },
    {
      "regime": "Risk-On Environment",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    },
    {
      "regime": "Risk-Off Environment",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    },
    {
      "regime": "Altseason",
      "betterAsset": "${allowedAsset}",
      "reason": "string"
    }
  ],
  "educationalAllocationBias": {
    "conservative": {
      "tokenA": 0,
      "tokenB": 0,
      "rationale": "illustrative only"
    },
    "balanced": {
      "tokenA": 0,
      "tokenB": 0,
      "rationale": "illustrative only"
    },
    "aggressive": {
      "tokenA": 0,
      "tokenB": 0,
      "rationale": "illustrative only"
    },
    "speculative": {
      "tokenA": 0,
      "tokenB": 0,
      "rationale": "illustrative only"
    }
  },
  "finalDecision": {
    "bestOverallAsset": "${allowedAsset}",
    "bestLongTermHoldThesis": "${allowedAsset}",
    "bestShortTermTradeSetup": "${allowedAsset}",
    "bestRiskReward": "${allowedAsset}",
    "bestTokenomics": "${allowedAsset}",
    "bestFundamentals": "${allowedAsset}",
    "bestMomentum": "${allowedAsset}",
    "lowerRiskAsset": "${allowedAsset}"
  },
  "dataQuality": {
    "freshness": "Low | Medium | High",
    "missingData": ["string"],
    "uncertaintyNote": "string"
  },
  "disclaimer": "Educational analysis only. This is not financial advice. Crypto assets are highly volatile and can lose significant value. Always verify data, manage risk, and do your own research."
}`;
}
