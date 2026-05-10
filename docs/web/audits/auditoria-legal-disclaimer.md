# Auditoria legal disclaimer

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## 1. Auditoria inicial

- El proyecto tenia disclaimers breves en algunas zonas, pero no una pagina legal dedicada.
- No existia `src/data/legalDisclaimers.js`.
- No existia ruta `/legal-disclaimer`.
- No existia documentacion legal dedicada en `docs/legal`.

## 2. Problema detectado

TRADING.TERMINAL toca trading, crypto, datos, IA, pricing y status preview. El producto necesitaba un sistema legal visible, reutilizable y consistente para evitar claims ambiguos y separar herramienta educativa de asesoria financiera.

## 3. Plan tecnico

- Crear data centralizada de avisos legales.
- Crear pagina React `/legal-disclaimer`.
- Integrar aviso corto en footer.
- Agregar nota legal en pricing.
- Agregar nota de AI Coach.
- Agregar nota de status preview.
- Documentar aviso legal y reglas de copy.
- Validar lint, build, rutas y busquedas de claims.

## 4. Archivos creados

- `ai-trader-terminal/apps/web/src/data/legalDisclaimers.js`
- `ai-trader-terminal/apps/web/src/pages/LegalDisclaimerPage.jsx`
- `docs/legal/legal-disclaimer.md`
- `docs/legal/legal-copy-guidelines.md`
- `docs/audits/auditoria-legal-disclaimer.md`

## 5. Archivos modificados

- `ai-trader-terminal/apps/web/src/App.jsx`
- `ai-trader-terminal/apps/web/src/components/layout/Footer.jsx`
- `ai-trader-terminal/apps/web/src/components/sections/PricingSection.jsx`
- `ai-trader-terminal/apps/web/src/components/sections/AnalyticsPreview.jsx`
- `ai-trader-terminal/apps/web/src/pages/StatusPage.jsx`
- `docs/architecture/routing.md`
- `docs/architecture/component-map.md`
- `docs/README.md`

## 6. Implementacion

- Ruta `/legal-disclaimer` agregada al routing minimo de `App.jsx`.
- Pagina legal con hero, resumen ejecutivo, secciones legales y footer de revision legal.
- Data legal reutilizable en `legalDisclaimers.js`.
- Footer enlaza a aviso legal y muestra disclaimer corto.
- Pricing muestra nota de no garantia de resultados.
- AI Coach muestra nota sobre uso educativo y posibles errores.
- Status page refuerza que el preview no representa SLA.

## 7. Validacion

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm run dev -- --port 5185`: correcto.
- Smoke HTTP `/`: `200`.
- Smoke HTTP `/status`: `200`.
- Smoke HTTP `/legal-disclaimer`: `200`.
- Busqueda de morado/lila en archivos legales e integraciones: sin coincidencias.
- Frases prohibidas aparecen solo en `legal-copy-guidelines.md` como ejemplos de copy no permitido.
- Footer enlaza a `/legal-disclaimer`.
- Pricing muestra nota legal breve.
- Status page muestra nota de preview/SLA.
- AI Coach queda cubierto por disclaimer especifico.

## 8. Riesgos

- El texto no sustituye revision legal profesional.
- Puede requerir adaptacion por jurisdiccion.
- Los terminos y privacidad completos siguen pendientes.

## 9. Auditoria final

- Sistema legal base implementado con pagina dedicada, data reutilizable, integraciones visibles y documentacion Markdown.
- La implementacion mantiene el posicionamiento educativo/analitico y evita presentarse como asesoria financiera, broker, exchange o sistema de ejecucion.
- Quedan pendientes terminos completos, privacidad, cookies y revision por abogado antes de uso comercial formal.

## 10. Enunciado del commit

```text
feat(web): add global legal disclaimer and risk disclosure
```
