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
