# Auditoría Fase Visual — Visual Health Bar para posiciones abiertas

## 1. Auditoría inicial

Antes de esta mejora, las posiciones abiertas mostraban datos clave como entry, stop loss, TP1, size, riesgo y P&L flotante, pero no tenian un indicador visual gradual de salud.

El usuario tenia que interpretar manualmente:

- entry,
- stop loss,
- precio actual,
- avance o deterioro del trade,
- cercania al stop,
- estado operativo del trade.

La mejora es estrictamente visual y educativa. No ejecuta trades, no envia ordenes, no maneja fondos y no usa llaves privadas.

## 2. Plan técnico

- Crear utilidad pura `src/lib/trade-health.js`.
- Crear componente reusable `src/components/TradeHealthBar.jsx`.
- Integrar el componente dentro de `OpenTradeRow` en `components/TradingTerminal.jsx`.
- Soportar trades `LONG` y `SHORT`.
- Tolerar campos legacy como `entryPrice`, `sl`, `takeProfit`, `target`, `markPrice` y `lastPrice`.
- Mostrar estado `UNKNOWN` cuando falten datos criticos.
- Validar con `npm run lint`, `npm run build` y carga local de la app.

No se agregaron dependencias ni se forzo configuracion nueva de testing.

## 3. Archivos creados

- `src/lib/trade-health.js`: utilidad pura para calcular salud visual del trade.
- `src/components/TradeHealthBar.jsx`: componente visual reusable de barra segmentada.
- `docs/audits/auditoria-fase-visual-health-bar.md`: auditoria de la mejora.

## 4. Archivos modificados

- `components/TradingTerminal.jsx`: integracion de `TradeHealthBar` en cada posicion abierta.

No se modifico `package.json` porque el proyecto no tenia testing configurado y no se agregaron dependencias nuevas.

## 5. Implementación

`calculateTradeHealth(trade)` normaliza los campos del trade:

- `entry` o `entryPrice`,
- `stopLoss` o `sl`,
- `tp1`, `takeProfit` o `target`,
- `currentPrice`, `price`, `markPrice` o `lastPrice`,
- `direction` o `side`.

El calculo principal es `riskConsumedPct`:

- Para `LONG`: `(entry - currentPrice) / (entry - stopLoss)`.
- Para `SHORT`: `(currentPrice - entry) / (stopLoss - entry)`.

Ese valor se normaliza entre `0` y `100`.

Estados:

- `HEALTHY`: riesgo consumido hasta 30%.
- `CAUTION`: riesgo consumido mayor a 30% y hasta 65%.
- `DANGER`: riesgo consumido mayor a 65% y menor a 100%.
- `STOP_ZONE`: riesgo consumido igual o mayor a 100%.
- `UNKNOWN`: datos insuficientes o stop invalido.

La barra visual usa segmentos sobrios:

- verde para sano,
- amarillo para precaucion,
- rojo para peligro,
- gris para datos faltantes.

La UI no contiene calculos complejos; solo renderiza el resultado de la utilidad pura.

## 6. Validación

Comandos ejecutados:

- `npm run lint`: paso con warnings existentes de `react-hooks/exhaustive-deps`.
- `npm run build`: paso correctamente fuera del sandbox.
- `npm run dev`: app levantada en `http://localhost:3000`.

Validacion manual:

- `GET /` respondio `200`.
- La integracion compila en Next.js.
- El componente se renderiza dentro de posiciones abiertas.
- Si falta precio actual, la barra muestra estado `Sin datos`.
- La logica soporta `LONG` y `SHORT`.
- No se agregaron secretos.
- No se agrego ejecucion real de trades.
- No se agregaron llamadas privadas a exchanges.

Nota sobre tests:

El proyecto no tiene script de test configurado ni Vitest instalado. Se evito agregar una dependencia nueva para esta mejora visual. La utilidad quedo separada y lista para cubrirse con tests cuando el proyecto incorpore runner de pruebas.

## 7. Riesgos

- Si no existe `currentPrice`, la barra no puede calcular salud real.
- Si el precio no viene de una fuente live, la visualizacion puede estar desactualizada.
- Si entry, stop loss o TP1 estan mal capturados, la lectura puede ser equivocada.
- La barra no sustituye la validacion completa del Risk Engine.
- La barra es educativa y visual, no una recomendacion financiera.
- El sistema no ejecuta cierres automaticos ni ordenes reales.

## 8. Auditoría final

La mejora quedo implementada correctamente como utilidad visual independiente de las fases principales.

Confirmaciones:

- El calculo esta separado de la UI.
- El componente es reusable.
- Funciona para `LONG` y `SHORT`.
- Maneja datos insuficientes con estado gris `Sin datos`.
- No agrega llaves privadas.
- No agrega ejecucion real de trades.
- No rompe endpoints existentes.
- Mantiene el enfoque educativo del sistema.

## 9. Enunciado del commit

```text
feat(ui): add visual health bar for open positions
```
