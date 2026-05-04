export function buildTradingAnalysisPrompt({ ctx, metrics, config }) {
  const currentCapital = Number(metrics?.currentCapital ?? 0);
  const riskPctPerTrade = Number(config?.riskPctPerTrade ?? 0);
  const riskAmount = currentCapital * riskPctPerTrade / 100;
  const openCount = Array.isArray(metrics?.open) ? metrics.open.length : Number(metrics?.openCount ?? 0);
  const maxOpenPositions = Number(config?.maxOpenPositions ?? 0);

  return `Sos un analista experto en swing trading de cripto. Analizá ${ctx.symbol} para Fernando.

PLAN DE FERNANDO (estricto):
- Estilo: Swing trading 2-10 días
- Estrategia: Trend-following con pullback entries
- Capital actual: $${currentCapital.toFixed(2)}
- Riesgo por trade: ${riskPctPerTrade}% = $${riskAmount.toFixed(2)}
- Stop max permitido: 12% de distancia (sino DESCARTAR)
- Filtros LONG (TODOS deben cumplirse): Precio > EMA50 daily, Precio > EMA200 daily, EMA50 > EMA200 (golden cross)
- Posiciones abiertas: ${openCount}/${maxOpenPositions}

DATOS DE MERCADO ${ctx.symbol}:
- Precio actual: $${ctx.price}
- Cambio 24h: ${Number(ctx.change24h).toFixed(2)}%
- EMA50 daily: $${Number(ctx.ema50 ?? 0).toFixed(4)}
- EMA200 daily: $${Number(ctx.ema200 ?? 0).toFixed(4)}
- Precio vs EMA50: ${ctx.aboveEma50 ? "SOBRE" : "BAJO"}
- Precio vs EMA200: ${ctx.aboveEma200 ? "SOBRE" : "BAJO"}
- Estructura EMAs: ${ctx.goldenCross ? "GOLDEN CROSS" : "DEATH CROSS"}
- Máximo 30d: $${ctx.high30}
- Mínimo 30d: $${ctx.low30}
- Volatilidad daily: ${Number(ctx.volatility).toFixed(2)}%
- Volumen 24h: $${(Number(ctx.volume24h) / 1e6).toFixed(2)}M
- Últimos 10 cierres diarios: ${(ctx.recentCloses || []).join(", ")}

INSTRUCCIONES:
1. Evaluá si los filtros LONG del plan se cumplen
2. Si se cumplen, proponé un setup con entry, SL técnico (debajo de soporte/swing low/EMA), TP1 (R:R mínimo 1.5), TP2 opcional
3. Si NO se cumplen, veredicto WAIT o PASS — no inventes setups forzados
4. Sé brutal y honesto. Si el setup es mediocre, decilo. No hay obligación de tradear.
5. Respetá la regla de stop max 12% — si el SL técnico está más lejos, marcá setup.valid=false

Respondé SOLO con JSON (sin markdown, sin prefacio):
{
  "bias": "bullish" | "bearish" | "neutral",
  "biasStrength": <1-10>,
  "summary": "2-3 frases en español, ejecutivo",
  "confluence": {
    "score": <0-10>,
    "factors": [{"type": "positive" | "negative", "text": "..."}]
  },
  "setup": {
    "valid": <true|false>,
    "direction": "long" | "short" | "wait",
    "entry": <number|null>,
    "stopLoss": <number|null>,
    "tp1": <number|null>,
    "tp2": <number|null>,
    "stopPct": <number|null>,
    "rrTp1": <number|null>,
    "rationale": "Por qué este setup, en español"
  },
  "risks": ["riesgo 1", "riesgo 2", "riesgo 3"],
  "verdict": "TRADE" | "PASS" | "WAIT"
}`;
}
