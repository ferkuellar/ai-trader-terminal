# Trading Terminal Local

Produccion local migrable del prototipo `trading_terminal_v5.jsx`.

## Run

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`.

## Local Data

Los endpoints `/api/config`, `/api/trades`, `/api/watchlist`, `/api/analyses`, `/api/challenges` y `/api/achievements` guardan estado en `data/local-state.json`.

Este adapter evita dependencias nativas y permisos especiales en Windows. Para migrar a SQLite/Postgres mas adelante, cambia solo `src/lib/local-state.js`; el frontend ya consume API y no depende de almacenamiento browser.

## AI Analyst

Configura `ANTHROPIC_API_KEY` en `.env.local`. La llamada a Anthropic pasa por `POST /api/ai/analyze`, nunca desde el navegador.

## Environment Variables and API Keys

| Variable | Required | Used by | Description |
|---|---|---|---|
| ANTHROPIC_API_KEY | Yes | /api/ai/analyze, /api/ai/compare, /api/ai/watchlist | Server-side Anthropic API key for AI analysis. Never expose in browser. |
| ANTHROPIC_MODEL | No | /api/ai/analyze, /api/ai/compare, /api/ai/watchlist | Optional Anthropic model override. Uses default fallback if missing. |

Do not commit `.env.local`.
Keep all private keys server-side.
This project does not require private exchange API keys because it does not execute trades.
Public Binance market endpoints do not require API keys.
If future APIs are added, document the required environment variables here before implementing the feature.

## Missing or Future APIs / Keys

Current phase does not require new external API keys.

Risk Engine is local and deterministic:

- `/api/risk/validate` does not require API keys.
- It does not call Anthropic.
- It does not call Binance private APIs.
- It does not execute trades.

Future phases must document any required API key before implementation.
Never commit `.env.local`.
Keep all private keys server-side.
This project does not require private exchange API keys because it does not execute trades.
Public Binance market endpoints do not require API keys.

## AI APIs

### POST /api/ai/analyze

Individual educational trading setup analysis.

### POST /api/ai/compare

Head-to-head crypto comparison using Composite Crypto Score.

Endpoint local:

```http
POST /api/ai/compare
```

Body:

```json
{
  "tokenA": "BTC",
  "tokenB": "ETH",
  "market": {},
  "context": {}
}
```

Requires:

```env
ANTHROPIC_API_KEY=.env.local
```

### POST /api/ai/watchlist

Ranks multiple crypto assets by Composite Crypto Score and returns educational signals.

Example body:

```json
{
  "tokens": ["BTC", "ETH", "SOL", "ADA"],
  "context": {
    "source": "watchlist-scoring-ui",
    "educationalOnly": true
  }
}
```

## Local APIs

### POST /api/risk/validate

Validates a proposed trade against local risk rules.

This endpoint is deterministic and does not require external API keys.

Example body:

```json
{
  "trade": {
    "symbol": "BTCUSDT",
    "direction": "long",
    "entry": 100000,
    "stopLoss": 97000,
    "tp1": 106000,
    "emotion": "calm"
  },
  "config": {
    "initialCapital": 1000,
    "riskPctPerTrade": 1.5,
    "maxOpenPositions": 3,
    "maxPortfolioRiskPct": 6,
    "dailyStopPct": 3,
    "maxStopDistancePct": 12,
    "minRewardRisk": 1.5
  },
  "trades": [],
  "activeChallenge": null,
  "currentCapital": 1000
}
```

## Code Quality and Audit Checklist

- No private API keys in client-side code.
- No hardcoded secrets.
- No trading execution logic.
- No exchange private key handling.
- Risk Engine is deterministic and local.
- Risk validation handles invalid input safely.
- Blocked trades are clearly explained.
- AI responses validated server-side.
- UI handles loading and error states.
- Watchlist input validates minimum and maximum assets.
- Snapshots do not overwrite previous analyses.
- Educational disclaimer visible.
- npm run lint executed.
- npm run build executed.
- `docs/audits/auditoria-fase5.md` created.
