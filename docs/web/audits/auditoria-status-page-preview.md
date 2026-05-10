# Auditoria Status Page Preview - TRADING.TERMINAL

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## 1. Auditoria inicial

- Proyecto objetivo: `ai-trader-terminal/apps/web`.
- La landing no usaba React Router.
- Ya existia `SiteHealthWidget.jsx` con boton `View Status`.
- Existia `.env.example`, pero `VITE_STATUS_PAGE_URL` apuntaba a una URL externa placeholder.
- La app ya cuenta con React, Vite, TailwindCSS, Framer Motion y Lucide React.

## 2. Problema detectado

- No existia una ruta interna `/status`.
- `View Status` no llevaba a una experiencia real dentro del producto.
- La experiencia de status quedaba reducida al mensaje `Public status page coming soon.`
- No habia modelo de status page con metricas explicadas, servicios, timeline ni pipeline futuro.

## 3. Plan tecnico

- Crear data separada en `src/data/statusMetrics.js`.
- Crear helper compartido `src/utils/time.js`.
- Crear pagina `src/pages/StatusPage.jsx`.
- Implementar routing minimo con `window.location.pathname`, `pushState` y `popstate` en `App.jsx`.
- Conectar `SiteHealthWidget` para navegar internamente a `/status`.
- Mantener fallback externo si `VITE_STATUS_PAGE_URL` apunta a una URL real distinta.
- Validar lint, build, ruta `/status`, ausencia de morado y smoke de dev server.

## 4. Archivos creados

- `ai-trader-terminal/apps/web/src/pages/StatusPage.jsx`
- `ai-trader-terminal/apps/web/src/data/statusMetrics.js`
- `ai-trader-terminal/apps/web/src/utils/time.js`
- `docs/audits/auditoria-status-page-preview.md`

## 5. Archivos modificados

- `ai-trader-terminal/apps/web/src/App.jsx`
- `ai-trader-terminal/apps/web/src/components/widgets/SiteHealthWidget.jsx`
- `ai-trader-terminal/apps/web/.env.example`

## 6. Implementacion

- Ruta interna `/status` implementada sin dependencia nueva.
- Hero de status con `STATUS PREVIEW`, estado general, last check dinamico y build configurable.
- Overall System Status con metricas y explicaciones.
- Services Monitored con descripcion y explicacion por servicio.
- Metric Glossary con terminos de observabilidad.
- Incident Timeline Preview con eventos mock y nota de transparencia.
- Future Monitoring Pipeline con puntos tecnicos preparatorios.
- CTA final con regreso a landing y refresh del sistema.
- Refresh dinamico con `Checking...`, delay de 600ms a 900ms y variacion de latencias.
- `VITE_STATUS_PAGE_URL` actualizado a `/status` en `.env.example`.

## 7. Validacion

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm run dev -- --port 5183`: correcto.
- Smoke HTTP `/`: `200`.
- Smoke HTTP `/status`: `200`.
- Busqueda de colores morados en `src/pages`, `src/data/statusMetrics.js` y `SiteHealthWidget.jsx`: sin coincidencias.
- `View Status` usa `/status` por defecto y navega internamente con History API cuando `VITE_STATUS_PAGE_URL=/status`.
- `Last check` se actualiza con `useState/useEffect`.
- `Refresh Status` muestra `Checking...`, deshabilita accion y actualiza latencias mock.
- `BUILD` se muestra desde `VITE_APP_BUILD_VERSION || "WEB_0.1.0"`.
- La pagina declara que los datos son mock/preview y no uptime real.

## 8. Riesgos

- La ruta se implementa con routing minimo SPA. En hosting estatico de produccion se necesitara fallback a `index.html` para carga directa de `/status`.
- Las metricas son mock y no deben interpretarse como uptime real.
- Sin navegador automatizado disponible, las interacciones visuales requieren revision manual adicional.

## 9. Auditoria final

- La ruta `/status` queda disponible sin dependencias nuevas.
- La pagina presenta una experiencia creible de status preview: resumen, servicios monitoreados, glosario, timeline, pipeline futuro y CTA.
- La landing existente no se rompe; `/` y `/status` responden correctamente en Vite.
- La implementacion mantiene datos separados, helper de tiempo compartido y estado local para refresh dinamico.
- Riesgo residual: para hosting estatico real se debe configurar fallback a `index.html` para carga directa de `/status`.

## 10. Enunciado del commit

```text
feat(web): add public status page preview
```
