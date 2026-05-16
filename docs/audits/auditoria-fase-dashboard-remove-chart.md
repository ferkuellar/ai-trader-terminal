# Auditoría Fase Dashboard Remove Chart

## 1. Auditoría inicial

El dashboard principal todavía renderizaba `ChartView` dentro del workspace central. El usuario pidió quitar Chart de la página principal, manteniendo el resto del sistema funcional.

`ChartView` debe conservarse como tab dedicado para no romper visualización de activo, selección de símbolo, TradingView, ni flujo de análisis manual.

## 2. Plan técnico

- Remover `ChartView` del render principal de `Dashboard`.
- Preservar el tab `CHART`.
- Limpiar props del dashboard que solo servían al render de Chart.
- Mantener Risk, Open Positions, Journal, Challenge, Stats y métricas en el dashboard.
- No tocar endpoints, risk engine, journal, trading logic ni providers de mercado.

## 3. Archivos creados

```text
docs/audits/auditoria-fase-dashboard-remove-chart.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
```

## 5. Implementación

Se eliminó `ChartView` del dashboard principal. El tab `CHART` sigue renderizando `ChartView` con `selectedSymbol`, `setSelectedSymbol`, `trades`, `watchlist` y `setTab`.

Se limpiaron las props `watchlist`, `selectedSymbol` y `setSelectedSymbol` del componente `Dashboard`, porque ya no eran necesarias dentro del home después de quitar Markets y Chart.

El dashboard principal queda enfocado en disciplina operativa, risk, challenge, journal, positions y stats.

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
Chart no visible en dashboard principal: validado por remoción del render en Dashboard
Tab CHART sigue disponible: validado por render dedicado fuera del dashboard
Risk visible: preservado
Open Positions visible cuando existan: preservado
Journal visible: preservado
Challenge/Stats visibles: preservado
No hay panel vacío: validado por remoción completa del componente
No hay ejecución real de trades: validado por alcance del cambio
```

## 7. Riesgos

- El dashboard principal pierde visualización directa de mercado; queda enfocada en operación y disciplina.
- Si se necesita contexto de mercado en home después, conviene usar un resumen compacto, no el chart completo.
- Esta mejora no cambia lógica de trading.
- Esta mejora no ejecuta trades reales.

## 8. Auditoría final

Chart fue removido del dashboard principal y preservado en el tab `CHART`. No se agregaron secretos, no se agregaron API keys, no se agregó ejecución real de trades y no se modificó lógica crítica.

## 9. Enunciado del commit

```text
refactor(ui): remove chart from main dashboard
```
