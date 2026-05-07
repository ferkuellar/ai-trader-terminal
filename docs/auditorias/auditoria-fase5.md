# Auditoría Fase 5 — Risk Engine + Trade Validation

## 1. Auditoría inicial

El proyecto ya contaba con AI Analyst, Crypto Compare, Watchlist Scoring, Executive Crypto Dashboard, persistencia local en JSON y un flujo de nuevo trade dentro de `components/TradingTerminal.jsx`.

Archivos revisados:

- `components/TradingTerminal.jsx`
- `src/lib/storage-client.js`
- `src/lib/defaults.js`
- `app/api/ai/analyze/route.js`
- `app/api/ai/compare/route.js`
- `app/api/ai/watchlist/route.js`
- `README.md`

Riesgos iniciales:

- El formulario de nuevo trade calculaba position sizing de forma local dentro del JSX.
- No existia un motor de riesgo reutilizable y auditable.
- El flujo permitia depender de checks visuales y calculos embebidos.
- El modelo actual guarda `positionSize` como valor nocional aproximado, no como unidades del activo, por lo que la integracion debia preservar compatibilidad.

## 2. Plan técnico

Estrategia:

- Crear un Risk Engine puro en `src/lib/risk-engine.js`.
- Crear validadores manuales en `src/lib/risk-engine-validation.js`.
- Crear API local `POST /api/risk/validate`.
- Crear panel visual reutilizable para mostrar resultado de riesgo.
- Integrar el panel dentro del flujo de nuevo trade.
- Bloquear guardado normal cuando el Risk Engine devuelve `BLOCKED`.
- Permitir guardado con confirmacion cuando devuelve `WARNING`.
- Mantener compatibilidad con trades existentes.

Criterios de aceptación:

- No agregar dependencias.
- No agregar llaves privadas.
- No ejecutar ordenes.
- No llamar Anthropic desde Risk Engine.
- Validar input invalido con `400`.
- Mostrar `APPROVED`, `WARNING` o `BLOCKED`.
- Explicar blockers, warnings y recomendaciones.

## 3. Archivos creados

- `src/lib/risk-engine.js`: motor deterministico de riesgo, position sizing, R:R, riesgo abierto, daily stop, drawdown y decision final.
- `src/lib/risk-engine-validation.js`: validacion manual de input y output.
- `app/api/risk/validate/route.js`: endpoint local de validacion de riesgo.
- `components/risk/RiskValidationPanel.jsx`: panel visual para estado, metricas, checks, blockers, warnings y recomendaciones.
- `docs/audits/auditoria-fase5.md`: auditoria formal de la fase.

## 4. Archivos modificados

- `components/TradingTerminal.jsx`: integracion del Risk Engine en el flujo `NEW TRADE`, bloqueo de guardado si el resultado es `BLOCKED` y confirmacion si es `WARNING`.
- `src/lib/defaults.js`: defaults nuevos `maxStopDistancePct` y `minRewardRisk`.
- `README.md`: documentacion de `/api/risk/validate`, llaves faltantes/futuras y checklist de calidad.

## 5. Implementación

El Risk Engine calcula:

- riesgo por unidad segun direccion long/short,
- distancia del stop loss en porcentaje,
- riesgo permitido por trade,
- position size sugerido en unidades,
- valor nocional aproximado,
- riesgo real,
- R:R hacia TP1,
- riesgo abierto del portafolio,
- riesgo proyectado,
- P&L diario cerrado,
- daily stop usado,
- drawdown total.

Decision:

- `BLOCKED` si existe cualquier blocker critico.
- `WARNING` si no hay blockers pero existen warnings.
- `APPROVED` si todas las reglas pasan.

Reglas criticas:

- stop invalido bloquea,
- stop distance mayor al limite bloquea,
- riesgo por trade mayor al limite bloquea,
- R:R menor a 1 bloquea,
- R:R menor al minimo configurado genera warning,
- maximo de posiciones abiertas bloquea,
- riesgo proyectado de portafolio bloquea,
- daily stop alcanzado bloquea,
- emotion `fomo` o `revenge` bloquea,
- checklist critico incompleto bloquea.

Integracion UI/API:

- La UI importa `validateTradeRisk` directamente para feedback inmediato.
- `/api/risk/validate` expone la misma validacion para pruebas y futuras integraciones.
- La API no requiere llaves, no llama Anthropic y no usa endpoints privados de exchanges.
- El guardado conserva el modelo actual de `positionSize` como nocional para no romper P&L existente.

## 6. Validación

Comandos ejecutados:

- `npm run lint`: paso con warnings existentes de `react-hooks/exhaustive-deps`.
- `npm run build`: fallo dentro del sandbox con `spawn EPERM`; repetido fuera del sandbox, paso correctamente.
- `npm run dev`: app levanto en `http://localhost:3001` para pruebas manuales/API.

Pruebas API:

- trade valido: `200`, `APPROVED`, score `100`.
- stop invalido: `200`, `BLOCKED`, blocker de stop invalido.
- R:R bajo: `200`, `BLOCKED`, blocker de R:R menor a 1.
- emotion `fomo`: `200`, `BLOCKED`.
- emotion `revenge`: `200`, `BLOCKED`.
- exceso de posiciones abiertas: `200`, `BLOCKED`.
- exceso de riesgo de portafolio: `200`, `BLOCKED`.
- daily stop alcanzado: `200`, `BLOCKED`.
- input invalido sin stopLoss: `400`, error claro `trade.stopLoss must be a number`.

Prueba UI:

- La app respondio `200`.
- El panel de Risk Validation se renderiza dentro de `NEW TRADE`.
- El boton de abrir posicion queda deshabilitado si `status === "BLOCKED"`.
- El estado `WARNING` muestra advertencia y pide confirmacion antes de guardar.

## 7. Riesgos

Riesgos tecnicos:

- El modelo historico guarda `positionSize` como nocional, mientras el Risk Engine tambien calcula unidades; se mantuvo compatibilidad, pero conviene documentar mejor el contrato de trades.
- Persisten warnings de hooks existentes.
- Algunos calculos dependen de que trades cerrados tengan `pnl` y fecha utilizable.

Riesgos de UX:

- El panel agrega informacion densa; puede requerir refinamiento visual despues de observar uso real.
- El estado `WARNING` permite guardar con confirmacion, lo cual es correcto para educacion, pero puede necesitar politicas mas estrictas por challenge.

Limitaciones conocidas:

- Risk Engine no calcula fees, slippage ni funding.
- No valida correlacion entre activos.
- No calcula exposicion neta long/short por simbolo.

## 8. Auditoría final

Seguridad confirmada:

- No se agregaron llaves privadas.
- No se agrego conexion privada a exchanges.
- No se agrego ejecucion de ordenes.
- No se agrego manejo de fondos.
- `/api/risk/validate` no requiere API keys.
- `ANTHROPIC_API_KEY` sigue limitado a endpoints AI server-side.
- No hay secretos hardcodeados.

Calidad confirmada:

- No se agregaron dependencias.
- La logica de riesgo vive fuera del JSX.
- Los errores de input son claros.
- Los casos invalidos no rompen la API.
- No se modificaron `/api/ai/analyze`, `/api/ai/compare` ni `/api/ai/watchlist`.

Resultado:

La Fase 5 agrega un motor local y deterministico de validacion de riesgo antes de registrar trades. El sistema sigue siendo educativo y no ejecuta operaciones reales.

Recomendacion:

La siguiente fase recomendada es Fase 6 — Portfolio Exposure & Risk Dashboard.
