# Auditoria Site Health Widget Live - TRADING.TERMINAL

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## 1. Auditoria inicial

- Proyecto objetivo: `ai-trader-terminal/apps/web`.
- Componente existente: `src/components/widgets/SiteHealthWidget.jsx`.
- Data mock existente: `src/data/siteHealth.js`.
- El widget tenia buena presentacion visual, pero usaba textos estaticos para `Last check`, `BUILD` y `View Status`.

## 2. Problema detectado

- `Last check: 32s ago` no se actualizaba.
- `BUILD WEB_0.1.0` estaba hardcodeado dentro de data mock.
- `View Status` era un enlace muerto con `href="#"`.
- Los servicios no simulaban nuevas verificaciones ni variaciones de latencia.

## 3. Plan tecnico

- Convertir servicios mock a valores numericos para latencia.
- Mover build y status URL a variables `import.meta.env`.
- Implementar `formatRelativeTime(date)` y estado de tiempo actual.
- Agregar `runMockHealthCheck()` con delay simulado de 600ms a 900ms.
- Agregar refresh automatico cada 30 segundos y clock cada segundo.
- Agregar refresh manual con estado `Checking...`.
- Dar feedback local cuando no exista status page real.
- Mantener limpieza de intervalos/timeouts en `useEffect`.

## 4. Archivos creados

- `ai-trader-terminal/apps/web/.env.example`
- `docs/audits/auditoria-site-health-widget-live.md`

## 5. Archivos modificados

- `ai-trader-terminal/apps/web/src/components/widgets/SiteHealthWidget.jsx`
- `ai-trader-terminal/apps/web/src/data/siteHealth.js`

## 6. Implementacion

- `lastCheckedAt` se inicializa con `new Date()`.
- `currentTime` se actualiza cada segundo para refrescar el texto relativo.
- `runMockHealthCheck()` actualiza latencias con variaciones pequenas y limites de 25ms a 220ms.
- `Billing` permanece en `Monitoring` como caso mock de observacion.
- El estado general se calcula como `OPERATIONAL`, `MONITORING` o `DEGRADED`.
- Durante una verificacion aparece `Checking...` y el boton `Refresh` queda deshabilitado.
- `BUILD` usa `VITE_APP_BUILD_VERSION || "WEB_0.1.0"`.
- `View Status` usa `VITE_STATUS_PAGE_URL || "#"`.
- Si no hay URL real, el widget muestra `Public status page coming soon.` por 3 segundos.
- Se mantiene TODO para futura integracion: `GET /api/health`.

## 7. Validacion

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm run dev -- --port 5182`: correcto.
- Smoke HTTP `http://127.0.0.1:5182`: `200`.
- Busqueda de colores morados en widget/data/env: sin coincidencias.
- Busqueda de textos estaticos anteriores (`32s ago`, `siteHealthMeta`, `Last check: 32s`): sin coincidencias.
- `Last check` se actualiza por estado `currentTime` cada segundo.
- Health check automatico configurado cada 30 segundos.
- Refresh manual implementado con `Checking...`, boton deshabilitado e icono con `animate-spin`.
- `BUILD` se lee desde `import.meta.env.VITE_APP_BUILD_VERSION`.
- `View Status` se lee desde `import.meta.env.VITE_STATUS_PAGE_URL` y muestra feedback interno cuando no hay URL real.

## 8. Riesgos

- Sigue siendo mock; no representa salud real de infraestructura.
- La variacion de latencias usa `Math.random()`, suficiente para demo visual pero no auditable como telemetria real.
- La interaccion visual requiere revision manual en navegador si no hay herramienta browser automatizada disponible.

## 9. Auditoria final

- El widget dejo de ser estatico: ahora tiene reloj relativo, refresh automatico, refresh manual y latencias mock variables.
- La implementacion mantiene limpieza de intervalos y timeouts en el cleanup de `useEffect`.
- La UI conserva la estetica cockpit, usa estados semanticos y no introduce colores morados.
- El componente queda preparado para sustituir la simulacion por `GET /api/health` sin rehacer la interfaz.
- Riesgo residual: sin navegador automatizado disponible en esta sesion, los clicks de expandir/refresh/status requieren confirmacion visual manual; lint/build/dev smoke pasaron correctamente.

## 10. Enunciado del commit

```text
feat(web): make site health widget dynamic
```
