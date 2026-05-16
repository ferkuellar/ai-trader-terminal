# Auditoría Fase Dashboard Remove Markets

## 1. Auditoría inicial

El dashboard principal todavía mostraba `Markets` en la columna izquierda. Después del cleanup anterior, esa zona mantenía navegación de mercado en el home aunque el usuario pidió quitar Markets de la página principal.

`Markets` debe conservarse como tab dedicado para no romper realtime market data, watchlist, selección de pares ni la navegación completa de mercado.

## 2. Plan técnico

- Remover el render de `Markets` del dashboard principal.
- Preservar el tab `MARKETS`.
- Ajustar `TerminalShell` para soportar layout sin columna izquierda.
- Expandir el área principal del dashboard para Chart, Stats y Challenge.
- Mantener Risk, Positions y Journal en la columna derecha.
- No tocar endpoints, risk engine, chart, journal ni data providers.

## 3. Archivos creados

```text
docs/audits/auditoria-fase-dashboard-remove-markets.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
components/layout/TerminalShell.jsx
```

## 5. Implementación

Se eliminó `Markets` del render principal de `Dashboard`. El tab `MARKETS` sigue renderizando el componente completo y conserva `saveWatchlist`, `selectedSymbol`, `setSelectedSymbol` y `setTab`.

`TerminalShell` ahora soporta dos modos:

- Con `left`: layout de tres columnas.
- Sin `left`: layout de dos columnas con área principal expandida y rail derecho operativo.

Los logros que estaban en el rail izquierdo se movieron al workspace principal para evitar una columna vacía.

## 6. Validación

Comandos ejecutados:

```bash
npm run lint
npm run build
```

Resultado:

- `npm run lint`: exitoso.
- `npm run build`: exitoso.
- Persisten warnings existentes de `react-hooks/exhaustive-deps`.
- El build conserva el warning de Next por `outputFileTracing: false`, documentado como workaround de entorno.

Validación manual requerida:

```text
Markets no visible en dashboard principal: validado por remoción del render en Dashboard
Tab MARKETS sigue disponible: validado por render dedicado en tab markets
Chart visible y más amplio: validado por layout de dos columnas
Risk visible: preservado en rail derecho
Open Positions visible cuando existan: preservado en rail derecho
Journal visible: preservado en rail derecho
No hay columna izquierda vacía: validado por TerminalShell sin left
No hay ejecución real de trades: validado por alcance del cambio
```

## 7. Riesgos

- El usuario pierde navegación rápida de pares desde el home, pero Markets queda disponible en su tab dedicado.
- Si se requiere selección rápida desde el dashboard, conviene agregar después un selector compacto en Chart, no la tabla completa de Markets.
- Esta mejora no cambia lógica de trading.
- Esta mejora no ejecuta trades reales.

## 8. Auditoría final

El dashboard principal queda más limpio y centrado en Chart, Stats, Risk, Positions y Journal. Markets se preserva como sección secundaria accesible desde su tab dedicado.

No se agregaron secretos, no se agregaron API keys, no se agregó ejecución real de trades y no se modificó lógica crítica de trading.

## 9. Enunciado del commit

```text
refactor(ui): remove markets from main dashboard
```
