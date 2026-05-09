# Auditoría Fase Visual — Ajuste de Trade Health Bar Compacta

## 1. Auditoría inicial

La barra anterior podía encender demasiados segmentos a la vez porque usaba una lectura acumulativa. En estado sano podía verse como una barra casi completamente activa, lo que confundía la intención visual.

También la ubicación no era óptima: aparecía como bloque dentro del cuerpo de la posición, debajo de los datos principales, en lugar de vivir entre el par/símbolo y el PnL flotante.

Esta mejora no implica ejecución de trades. Es visual, educativa y orientada a legibilidad operativa.

## 2. Plan técnico

- Ajustar `src/lib/trade-health.js`.
- Agregar `getTradeHealthZone`.
- Agregar `getTradeHealthDisplayState`.
- Cambiar segmentos acumulativos por zonas exclusivas.
- Renderizar escala fija `rojo → amarillo → verde`.
- Reducir `TradeHealthBar.jsx` a una barra compacta.
- Mover el componente al header de `OpenTradeRow`, entre símbolo/par y PnL.
- Mantener soporte para `LONG`, `SHORT` y datos faltantes.

## 3. Archivos creados

- `docs/audits/auditoria-fase-visual-health-bar-ajuste.md`

## 4. Archivos modificados

- `src/lib/trade-health.js`
- `src/components/TradeHealthBar.jsx`
- `components/TradingTerminal.jsx`

## 5. Implementación

`riskConsumedPct` sigue midiendo cercanía al stop:

- `LONG`: `(entry - currentPrice) / (entry - stopLoss)`.
- `SHORT`: `(currentPrice - entry) / (stopLoss - entry)`.

Rangos:

- `HEALTHY`: menor a 35%.
- `CAUTION`: desde 35% hasta menos de 70%.
- `DANGER`: desde 70% hasta menos de 100%.
- `STOP_ZONE`: 100% o más.
- `UNKNOWN`: datos insuficientes o stop inválido.

La nueva propiedad `activeZone` evita render acumulativo:

- `HEALTHY` activa solo verde.
- `CAUTION` activa solo amarillo.
- `DANGER` y `STOP_ZONE` activan solo rojo.
- `UNKNOWN` queda gris.

La barra ahora renderiza tres segmentos compactos en orden fijo:

```text
rojo | amarillo | verde
```

En `OpenTradeRow`, la barra quedó junto al par/símbolo, antes del PnL flotante, manteniendo el layout responsivo.

## 6. Validación

Comandos ejecutados:

- `npm run lint`: pasó con warnings existentes de `react-hooks/exhaustive-deps`.
- `npm run build`: pasó correctamente fuera del sandbox.

Validación funcional esperada:

- `LONG` sano: solo verde activo.
- `LONG` precaución: solo amarillo activo.
- `LONG` peligro: solo rojo activo.
- `LONG` stop: solo rojo activo.
- `SHORT` sano: solo verde activo.
- `SHORT` precaución: solo amarillo activo.
- `SHORT` peligro: solo rojo activo.
- `SHORT` stop: solo rojo activo.
- Sin `currentPrice`: gris/UNKNOWN.
- Desktop: barra entre par y PnL.
- Móvil: barra compacta sin ocupar toda la card.

No se ejecutó `npm run test` porque el proyecto no tiene script de test configurado.

## 7. Riesgos

- Si `currentPrice` no está actualizado, la salud visual puede estar desfasada.
- Si el trade tiene datos legacy incompletos, puede mostrarse `UNKNOWN`.
- La barra no sustituye gestión de riesgo real.
- La barra no ejecuta cierres.
- La barra no es recomendación financiera.
- La interpretación depende de `entry`, `stopLoss` y `direction` correctos.
- Si el PnL se calcula con una fuente distinta al `currentPrice`, pueden existir diferencias visuales.

## 8. Auditoría final

La barra ahora es más compacta y visualmente correcta.

Confirmaciones:

- La dirección visual quedó `rojo → amarillo → verde`.
- El estado sano activa solo verde.
- Precaución activa solo amarillo.
- Peligro y stop activan solo rojo.
- UNKNOWN queda gris.
- La barra quedó posicionada entre símbolo/par y PnL.
- No se agregó ejecución de trades.
- No se agregaron secretos.
- La mejora mantiene el enfoque educativo del producto.

## 9. Enunciado del commit

```text
fix(ui): refine compact trade health bar placement and state colors
```
