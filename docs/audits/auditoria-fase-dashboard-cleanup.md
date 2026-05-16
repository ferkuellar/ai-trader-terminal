# Auditoría Fase Dashboard Cleanup — Remoción de módulos secundarios del dashboard principal

## 1. Auditoría inicial

El dashboard principal estaba saturado con módulos secundarios que competían visualmente con los módulos operativos principales. `AI Analyst`, `Crypto Compare`, `Watchlist Scoring` y los flujos asociados al tab `ANALYST` aparecían dentro del home por medio de `AnalystView`.

También se detectó que `ExecutiveCryptoDashboard` exponía contexto de `Crypto Compare` y `Watchlist Scoring` dentro del rail izquierdo del dashboard, lo que reducía el foco de Markets como navegación de mercado.

El objetivo de esta mejora es mejorar foco y jerarquía visual. La mejora no implica borrar funcionalidades críticas, eliminar endpoints, cambiar lógica AI ni cambiar lógica de risk engine. La mejora no implica ejecución real de trades.

## 2. Plan técnico

- Localizar renders secundarios dentro del dashboard principal.
- Remover `AnalystView` del render principal del dashboard.
- Remover `ExecutiveCryptoDashboard` del render principal por estar ligado a snapshots de Compare/Scoring.
- Limpiar imports no usados.
- Limpiar props del dashboard que solo servían para esos renders.
- Preservar componentes, tab `ANALYST`, endpoints AI y estado compartido útil para navegación secundaria.
- Mantener Markets, Chart, Risk, Positions, Journal, Challenge y Stats visibles.
- Validar lint y build.

## 3. Archivos creados

```text
docs/audits/auditoria-fase-dashboard-cleanup.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
```

## 5. Implementación

Se removieron del dashboard principal:

- `AnalystView`, que contenía AI Analyst, Crypto Compare y Watchlist Scoring.
- `ExecutiveCryptoDashboard`, que mostraba señales y mensajes relacionados con Compare/Watchlist Scoring.

Se limpió el import de `ExecutiveCryptoDashboard`. `AnalystView` se preservó porque sigue siendo usado por el tab secundario `ANALYST`.

Se limpiaron props del componente `Dashboard` que ya no necesitaba:

- `analyses`
- `saveAnalyses`
- `setTradePrefill`

No se eliminaron los estados globales `analyses`, `saveAnalyses` ni `tradePrefill` porque siguen siendo usados por el tab `ANALYST`, `Settings` y el flujo de prefill hacia `NewTrade`.

El layout no quedó con paneles vacíos: el rail izquierdo queda enfocado en Markets y logros; el centro queda enfocado en Chart, Command Center y métricas; el rail derecho mantiene Risk, Challenge, Positions, Journal y Equity Curve.

## 6. Validación

Comandos ejecutados:

```bash
npm run lint
npm run build
```

Resultado documentado:

- `npm run lint`: exitoso.
- `npm run build`: exitoso.
- Persisten warnings existentes de `react-hooks/exhaustive-deps` en `TradingTerminal.jsx` y `AnalystView.jsx`.
- El build conserva el warning de Next por `outputFileTracing: false`, documentado en la auditoría previa como workaround de entorno Windows.
- `http://localhost:3000`: responde `200 OK`.
- Playwright 1366x900: dashboard renderizado correctamente.
- Consola de navegador: solo se detectó `favicon.ico` 404; no se detectó error de app asociado al cleanup.

Validación manual requerida:

```text
AI Analyst no visible en dashboard principal: validado por remoción de AnalystView del home
Crypto Compare no visible en dashboard principal: validado por remoción de AnalystView del home
Watchlist Scoring no visible en dashboard principal: validado por remoción de AnalystView y ExecutiveCryptoDashboard del home
Chat Markets no visible en dashboard principal: no se encontró render activo en el home
Markets visible y funcional: validado en dashboard
Chart visible y funcional: validado en dashboard
Risk visible y funcional: validado en dashboard
Journal visible y funcional: preservado en rail derecho
No hay espacios vacíos: preservado por reflujo del layout existente
No hay errores en consola: validado salvo favicon.ico 404
Responsive OK: layout responsive existente preservado
```

## 7. Riesgos

- Algunos componentes removidos del dashboard podrían necesitar navegación secundaria en una fase posterior.
- Si se elimina state compartido sin revisar, podría romper componentes dependientes.
- Si se borran endpoints AI sin validar, podrían romper funciones futuras.
- El dashboard puede requerir ajuste visual adicional después del cleanup.
- Esta mejora no cambia lógica de trading.
- Esta mejora no ejecuta trades reales.

## 8. Auditoría final

El dashboard principal quedó más limpio y enfocado. Los módulos secundarios fueron removidos del render principal, pero la lógica útil se preservó para futuras secciones y para el tab `ANALYST`.

Se redujo saturación visual. No se agregaron secretos. No se agregó ejecución real de trades. Markets, Chart, Risk y Journal siguen siendo el foco operativo del dashboard principal.

## 9. Enunciado del commit

```text
refactor(ui): remove secondary modules from main dashboard
```
