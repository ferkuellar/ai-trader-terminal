# Auditoría Fase gestión-posiciones-abiertas — Gestión manual auditada de posiciones abiertas

## 1. Auditoría inicial

- Las posiciones abiertas no tenian un flujo claro para registrar cierre, reduccion, aumento o movimiento de stop.
- El usuario necesitaba auditar manualmente si seguia o no su plan de trading.
- No existia registro estructurado de cambios sobre una posicion abierta.
- No existia journal automatico para modificaciones de posicion.
- La mejora debe mantenerse como registro local educativo.
- No debe ejecutar ordenes reales.

## 2. Plan técnico

- Creacion de utilidad `position-events.js`.
- Creacion de componente `PositionManagementModal.jsx`.
- Integracion de boton "Gestionar" dentro de cada posicion abierta.
- Actualizacion local del trade.
- Creacion automatica de evento auditable.
- Creacion automatica de entrada de journal.
- Validaciones por tipo de accion.
- Clasificacion de disciplina operativa.
- Mensajes explicitos de no ejecucion real.

## 3. Archivos creados

```text
src/lib/position-events.js
src/components/PositionManagementModal.jsx
docs/audits/auditoria-fase-gestion-posiciones-abiertas.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
src/lib/defaults.js
```

## 5. Implementación

- El modal se abre desde el boton compacto "Gestionar" en cada posicion abierta.
- El usuario selecciona entre cierre manual, reduccion, aumento o movimiento de Stop Loss.
- La utilidad `position-events.js` valida identificador, razon, emocion, desviacion del plan, precio de salida, cambio de tamano y reglas de stop para LONG/SHORT.
- La posicion local se actualiza con `applyPositionEventToTrade`, cambiando `status`, `exitPrice`, `pnl`, `positionSize`, `positionUnits`, `notionalValue` o `stopLoss` segun corresponda.
- Cada accion genera un evento con `createPositionEvent` y se persiste en `positionEvents`.
- Cada accion genera una entrada con `buildJournalEntryFromPositionEvent` y se persiste en `journal`.
- El registro conserva `followedPlan`, `planDeviationReason`, `emotionalState`, `riskImpact` y `disciplineStatus`.
- La disciplina se clasifica como `ALIGNED`, `DEVIATION` o `HIGH_RISK_DEVIATION`.
- La UI muestra mensajes explicitos de que el registro no ejecuta ordenes reales y usa textos como "Guardar cierre en journal" y "Guardar ajuste en journal".

## 6. Validacion

Comandos ejecutados:

```bash
npm run lint
npm run build
```

- `npm run lint`: pasó con warnings existentes de `react-hooks/exhaustive-deps`.
- `npm run build`: el primer intento falló en sandbox por `spawn EPERM`; ejecutado fuera del sandbox pasó correctamente.
- `npm run test`: no se ejecutó porque no existe script de test configurado en `package.json`.

Revision de seguridad:

- No se agregaron API keys privadas.
- No se agregaron llamadas privadas a Binance o Bybit.
- No se agregaron endpoints de ejecucion de ordenes.
- El flujo de cierre solo registra estado local y journal.
- Los textos nuevos usan "Gestionar", "Guardar cierre en journal" y "Guardar ajuste en journal".

Validacion manual:

```text
Abrir modal desde posicion abierta
Registrar cierre
Registrar reduccion
Registrar aumento
Mover stop loss LONG
Mover stop loss SHORT
Guardar razon de accion
Marcar "sigue plan"
Marcar "no sigue plan" y exigir motivo
Registrar emocion FOMO/revenge/fear como desviacion fuerte
Confirmar que se crea log
Confirmar que se crea journal entry
Confirmar que no se ejecuta orden real
Confirmar que responsive no se rompe
Confirmar que la posicion cerrada deja de aparecer como abierta
```

## 7. Riesgos

- El cierre es solo registro local; no cierra posiciones reales en exchange.
- Si el usuario no actualiza manualmente el exchange, puede haber diferencia entre sistema y realidad.
- Si faltan datos de precio actual, el impacto de riesgo puede ser parcial.
- Si los trades legacy tienen datos incompletos, algunas acciones pueden requerir advertencias.
- La disciplina depende de que el usuario registre razones honestas.
- El journal no sustituye auditoria financiera real.
- No existe autenticacion ni multiusuario en esta mejora.
- El almacenamiento local no es base transaccional robusta.

## 8. Auditoría final

- Se agrego gestion manual auditada de posiciones abiertas.
- Cada accion genera evento y journal.
- Se fortalece la trazabilidad del plan de trading.
- Se mantiene el enfoque educativo.
- No se agrego ejecucion real de trades.
- No se agregaron secretos.
- La UI usa lenguaje seguro.
- La mejora queda lista para futuras metricas de disciplina.

## 9. Enunciado del commit

```text
feat(journal): add audited manual management for open positions
```
