# Auditoría Fase Dashboard Layout Review — Revisión y redistribución de componentes

## 1. Auditoría inicial

El dashboard principal estaba concentrado en una composición de contenido larga donde los módulos competían por jerarquía vertical. Markets, Chart, AI Analyst, Risk, Positions, Journal, Stats y Challenge Mode existían, pero no estaban agrupados por intención operativa.

Problemas detectados:

- Uso insuficiente del ancho disponible en desktop.
- Markets funcionaba como sección completa, pero no como navegación lateral dentro del dashboard.
- Chart no tenía suficiente prioridad visual como área principal de análisis.
- Risk, Positions, Challenge y Journal no estaban agrupados como zona de disciplina operativa.
- Algunos paneles estaban optimizados para ancho completo y se comprimían mal cuando se movían a una columna lateral.
- La tabla de Markets tenía demasiadas columnas para una zona estrecha.
- El dashboard podía sentirse como una cascada larga en desktop.

La mejora es estrictamente visual y de distribución. No implica ejecución real de trades, órdenes reales, llaves privadas, Binance Private API ni cambios de lógica crítica de risk engine.

## 2. Plan técnico

Estrategia aplicada:

- Crear un shell reutilizable para separar el dashboard en navegación de mercado, workspace de inteligencia y zona de riesgo/disciplina.
- Crear un panel reusable para estandarizar bordes, fondo, padding, headers y composición visual.
- Usar una distribución responsive mobile-first:
  - Mobile: una columna.
  - Tablet: dos zonas cuando el ancho lo permite.
  - Desktop: tres columnas.
  - Wide desktop: columnas laterales más cómodas y centro flexible.
- Mantener Markets -> selected asset -> Chart intacto.
- No tocar cálculos de trading, risk engine, endpoints, Journal, Challenge Mode ni data flow crítico.
- Ajustar componentes que tenían layout interno demasiado ancho para que funcionen dentro de rails laterales.

## 3. Archivos creados

```text
components/layout/TerminalShell.jsx
components/layout/TerminalPanel.jsx
docs/audits/auditoria-fase-dashboard-layout-review.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
components/risk/PortfolioRiskDashboard.jsx
src/components/markets/MarketsSection.jsx
src/components/markets/MarketsTable.jsx
next.config.js
```

## 5. Implementación

Se reorganizó el dashboard en tres zonas funcionales:

- Columna izquierda: Markets, watchlist/contexto de mercado y logros.
- Área central: Chart, Command Center, métricas y AI Analyst.
- Columna derecha: Portfolio Risk, Challenge Status, Open Positions, Journal reciente y equity curve.

Se creó `TerminalShell` para controlar el ancho útil y la distribución general del dashboard con grid responsive. Se creó `TerminalPanel` para reducir duplicación visual y mantener un estilo consistente de terminal.

Markets recibió modo compacto para funcionar como navegación lateral sin romper la vista completa de mercados. En el dashboard, seleccionar un par actualiza el activo seleccionado sin forzar navegación de pestaña, preservando el flujo Markets -> Chart.

Portfolio Risk se ajustó visualmente para evitar grids demasiado anchos dentro del rail derecho. No se modificaron fórmulas, límites, reglas ni cálculos.

`next.config.js` se ajustó con `outputFileTracing: false` para permitir que `npm run build` complete en este entorno Windows, donde Next estaba fallando con un error `EISDIR` al resolver `_app.js` dentro de `node_modules`.

## 6. Validación

Comandos ejecutados:

```bash
npm run lint
npm run build
```

Resultado:

- `npm run lint`: exitoso.
- `npm run build`: exitoso.
- Persisten warnings de dependencias de hooks en componentes existentes.
- Persisten warnings de snapshot/cache de webpack.
- Next muestra advertencia por `outputFileTracing: false`, documentada como workaround de entorno.

Validación visual/manual realizada con capturas:

```text
Desktop 1366px: validado
Desktop 1440px: validado
Wide desktop 1920px: validado
Mobile 390px: validado
Tablet 768px: validado
Markets visible: validado
Chart visible: validado
AI Analyst visible: validado
Risk visible: validado
Open Positions visible: validado
Journal visible: validado
Stats visible: validado
No overflow horizontal evidente: validado
No errores de consola de app detectados: validado
Realtime Markets intacto: sin cambios de lógica
Selección de par intacta: validado por preservación de estado seleccionado
```

Capturas generadas:

```text
.playwright-mcp/dashboard-1366.png
.playwright-mcp/dashboard-1440.png
.playwright-mcp/dashboard-1920.png
.playwright-mcp/dashboard-768.png
.playwright-mcp/dashboard-390.png
```

## 7. Riesgos

- Algunos componentes pueden requerir refactor posterior si tienen ancho fijo interno.
- Tablas grandes pueden necesitar overflow horizontal controlado en vistas completas.
- El layout de tres columnas puede requerir ajustes finos según contenido real y datos en vivo.
- El exceso de scroll interno puede afectar UX si se aplica sin criterio en futuros módulos.
- `outputFileTracing: false` es un workaround de build para este entorno y Next advierte que no será una opción en el próximo major.
- Esta mejora no cambia lógica de trading.
- Esta mejora no ejecuta trades reales.

## 8. Auditoría final

El dashboard ahora usa mejor el espacio disponible en desktop y wide desktop. La jerarquía visual quedó más clara: Markets como navegación, Chart como foco principal, AI Analyst cerca del análisis y Risk/Positions/Journal agrupados por disciplina operativa.

Se mantuvo comportamiento responsive mobile-first. No se agregaron secretos. No se agregó ejecución real de trades. No se agregaron órdenes reales. No se agregó Binance Private API. Se preservaron los módulos existentes y el flujo central de selección de activo hacia Chart.

## 9. Enunciado del commit

```text
refactor(ui): improve dashboard component layout and visual hierarchy
```
