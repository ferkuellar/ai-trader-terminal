# Auditoría Fase 6 — Portfolio Exposure & Risk Dashboard

## 1. Auditoría inicial

El proyecto ya contaba con el Risk Engine de Fase 5, validación local de trades, AI Analyst, Crypto Compare, Watchlist Scoring y Executive Crypto Dashboard.

Archivos revisados:

- `components/TradingTerminal.jsx`
- `src/lib/risk-engine.js`
- `src/lib/risk-engine-validation.js`
- `app/api/risk/validate/route.js`
- `README.md`

Dependencias relevantes:

- Next.js 14
- React 18
- TailwindCSS
- Recharts ya instalado, aunque esta fase no requirio graficas nuevas.

Riesgos iniciales:

- El proyecto guarda `positionSize` historicamente como nocional aproximado, mientras algunos payloads externos pueden usarlo como unidades.
- Trades antiguos pueden no tener `stopLoss`, `positionSize` o fechas de cierre normalizadas.
- Un dashboard de riesgo puede subestimar exposicion si no grita datos faltantes.

## 2. Plan técnico

Estrategia:

- Crear calculos de portafolio fuera del JSX en `src/lib/portfolio-risk-dashboard.js`.
- Crear validacion manual en `src/lib/portfolio-risk-validation.js`.
- Crear API local deterministica `POST /api/risk/portfolio`.
- Crear componente visual `components/risk/PortfolioRiskDashboard.jsx`.
- Integrar el dashboard en el tab `DASH`.
- Mantener compatibilidad con el modelo actual de trades.

Funciones principales:

- `normalizeTradeForRisk`
- `calculateTradeOpenRisk`
- `calculateTradeNotionalExposure`
- `groupRiskBySymbol`
- `groupRiskByDirection`
- `calculatePortfolioExposure`
- `calculateDailyRiskState`
- `calculateDrawdownState`
- `generateCapitalPreservationAlerts`
- `getPortfolioRiskStatus`
- `buildPortfolioRiskDashboard`

Criterios de aceptación:

- No agregar dependencias.
- No agregar trading real.
- No agregar llaves privadas.
- Mostrar SAFE/CAUTION/DANGER/LOCKDOWN.
- Mostrar riesgo por simbolo, direccion, daily stop, drawdown, alertas y data quality.

## 3. Archivos creados

- `src/lib/portfolio-risk-dashboard.js`: motor local de exposicion, riesgo, alertas y estado global.
- `src/lib/portfolio-risk-validation.js`: validacion de input y output del dashboard.
- `app/api/risk/portfolio/route.js`: endpoint local deterministico.
- `components/risk/PortfolioRiskDashboard.jsx`: UI del dashboard de riesgo de portafolio.
- `docs/audits/auditoria-fase6.md`: auditoria formal de esta fase.

## 4. Archivos modificados

- `components/TradingTerminal.jsx`: integracion del dashboard en el tab `DASH`.
- `README.md`: documentacion de `/api/risk/portfolio`, llaves y checklist de calidad.

## 5. Implementación

Riesgo por simbolo:

- Se filtran trades abiertos.
- Se normaliza simbolo, direccion, entry, stopLoss y position size.
- Se agrupa por simbolo y se ordena por `openRiskPct` descendente.
- Se marca `missingRiskData` cuando faltan datos criticos.

Riesgo long/short:

- Se agrupan trades abiertos por direccion `long` y `short`.
- Se calcula risk amount, risk pct, notional exposure y exposure pct.

Exposicion nocional:

- Si hay `units`, `quantity`, `qty`, `amount` o `size`, se tratan como unidades.
- Si solo existe `positionSize`, se infiere si es nocional o unidades.
- Para trades existentes de la app con `riskAmount`, `positionSize` se trata como nocional para preservar compatibilidad.

Daily stop:

- Se consideran trades cerrados del dia.
- Se soportan `pnl`, `pnlAmount`, `profit`, `realizedPnl` y `netPnl`.
- Se calcula P&L diario cerrado, porcentaje usado del daily stop y estado.

Drawdown:

- Se calcula contra `config.initialCapital`.
- Si existe limite en `activeChallenge.config.maxTotalDDPct` o `activeChallenge.maxTotalDDPct`, se evalua contra ese limite.

Alertas:

- Riesgo de portafolio alto.
- Demasiadas posiciones abiertas.
- Daily stop cerca o alcanzado.
- Drawdown cerca o alcanzado.
- Trades sin stop loss.
- Trades sin position size.
- Concentracion por simbolo.
- Concentracion por direccion.

Estado global:

- `LOCKDOWN` si hay alerta lockdown o daily/drawdown en lockdown.
- `DANGER` si hay alerta danger.
- `CAUTION` si hay alerta warning.
- `SAFE` si no hay alertas relevantes.

Integracion:

- La UI calcula el dashboard con `useMemo` usando `buildPortfolioRiskDashboard`.
- La API `/api/risk/portfolio` usa el mismo motor para pruebas y futuras integraciones.

## 6. Validación

Comandos ejecutados:

- `npm install`: paso; warning `EBADENGINE` por `eslint-visitor-keys`, Node actual `v20.12.2`.
- `npm run lint`: paso con warnings existentes de `react-hooks/exhaustive-deps`.
- `npm run build`: paso fuera del sandbox despues de cerrar el dev server que bloqueaba `.next`.
- `npm run dev`: app levantada en `http://localhost:3000`.

Pruebas API:

- sin trades abiertos: `200`, `SAFE`.
- un trade long valido: `200`, `CAUTION` por concentracion.
- un trade short valido: `200`, `CAUTION` por concentracion.
- trade sin stopLoss: `200`, `DANGER`, alerta `missing_stop_loss`.
- trade sin positionSize: `200`, `CAUTION`, alerta `missing_position_size`.
- riesgo concentrado por simbolo: `200`, `DANGER`.
- daily stop cerca del limite: `200`, `CAUTION`.
- drawdown cerca del limite: `200`, `DANGER`.
- posiciones abiertas al maximo: `200`, `DANGER`.
- input invalido con `currentCapital = 0`: `400`.

Prueba UI:

- `GET /` respondio `200`.
- El dashboard se renderiza dentro del tab `DASH`.
- Muestra empty state cuando no hay posiciones abiertas.
- Muestra tablas con `overflow-x-auto`.
- Muestra alertas y data quality.

## 7. Riesgos

Riesgos tecnicos:

- Inferir si `positionSize` es nocional o unidades depende de heuristicas para compatibilidad.
- Trades importados por CSV pueden traer campos incompletos.
- El daily stop depende de fechas de cierre confiables.

Riesgos de UX:

- El dashboard puede mostrar CAUTION en un solo trade valido por concentracion; esto es conservador pero puede sentirse estricto.
- Hay mucha informacion en una sola vista; podria necesitar refinamiento visual posterior.

Limitaciones conocidas:

- No calcula correlacion entre activos.
- No calcula beta ni volatilidad.
- No incluye fees, slippage, funding ni margen.
- No netea exposicion por hedge real.

## 8. Auditoría final

Seguridad confirmada:

- No se agregaron llaves privadas.
- No se agrego conexion privada a exchanges.
- No se agrego ejecucion de ordenes.
- No se agrego logica de trading real.
- No se agrego manejo de fondos.
- `/api/risk/portfolio` no requiere API keys.
- `ANTHROPIC_API_KEY` sigue solo en endpoints AI server-side.
- No hay secretos hardcodeados.

Calidad confirmada:

- No se agregaron dependencias.
- La logica de portafolio vive fuera del JSX.
- Las funciones tienen nombres claros.
- Los calculos toleran datos faltantes.
- No se modificaron `/api/ai/analyze`, `/api/ai/compare`, `/api/ai/watchlist` ni `/api/risk/validate`.

Resultado:

La Fase 6 agrega observabilidad real de exposicion, riesgo abierto, daily stop, drawdown, concentracion y calidad de datos. El sistema sigue siendo educativo y no ejecuta operaciones.

Recomendacion:

La siguiente fase recomendada es Fase 7 — Trade Journal Intelligence & Mistake Tax.
