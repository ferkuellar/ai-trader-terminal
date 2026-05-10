# Auditoria terms of service

Estado del documento: Vigente
Ultima actualizacion: 2026-05-10

## 1. Auditoria inicial

TRADING.TERMINAL ya contaba con aviso legal y politica de privacidad, pero el footer todavia mantenia terminos como funcionalidad futura. Faltaba una pagina formal para reglas de uso, cuentas, suscripciones futuras, AI Coach, datos de mercado, propiedad intelectual y limitacion de responsabilidad.

## 2. Problema detectado

El producto necesitaba cerrar la base legal publica con `/terms-of-service` antes de waitlist, pagos, cuentas, IA o datos reales. Sin esta pagina, los usuarios no tenian reglas claras de uso aceptable ni condiciones preliminares del servicio.

## 3. Plan tecnico

- Crear `src/data/termsOfService.js` con resumen, secciones, indice y notices.
- Crear `src/pages/TermsOfServicePage.jsx`.
- Conectar ruta `/terms-of-service` en `App.jsx`.
- Actualizar `Footer.jsx` con enlace real y copy corto.
- Agregar enlaces cruzados desde aviso legal y privacidad.
- Crear documentacion Markdown y auditoria.

## 4. Archivos creados

- `ai-trader-terminal/apps/web/src/data/termsOfService.js`
- `ai-trader-terminal/apps/web/src/pages/TermsOfServicePage.jsx`
- `docs/legal/terms-of-service.md`
- `docs/legal/terms-copy-guidelines.md`
- `docs/audits/auditoria-terms-of-service.md`

## 5. Archivos modificados

- `ai-trader-terminal/apps/web/src/App.jsx`
- `ai-trader-terminal/apps/web/src/components/layout/Footer.jsx`
- `ai-trader-terminal/apps/web/src/pages/LegalDisclaimerPage.jsx`
- `ai-trader-terminal/apps/web/src/pages/PrivacyPolicyPage.jsx`

## 6. Implementacion

Se implemento una pagina responsive con hero, resumen ejecutivo, indice navegable, secciones legales, advertencia de seguridad, CTA hacia documentos legales relacionados y contacto `legal@tradingterminal.com`.

## 7. Validacion

- `npm run lint`: correcto.
- `npm run build`: correcto.
- `npm run dev`: Vite arranco correctamente en entorno local temporal.
- Smoke test HTTP:
  - `/`: 200.
  - `/legal-disclaimer`: 200.
  - `/privacy-policy`: 200.
  - `/terms-of-service`: 200.
- Footer: enlaza a Aviso legal, Politica de Privacidad y Terminos de Servicio.
- Enlaces cruzados: aviso legal y privacidad enlazan hacia terminos.
- Revision de colores prohibidos en archivos de terminos: sin coincidencias.
- Revision de claims prohibidos literales: sin coincidencias.

## 8. Riesgos

- Requiere revision legal profesional antes de uso comercial.
- Entidad legal, jurisdiccion, direccion y politicas de reembolso siguen pendientes.
- Los terminos deberan actualizarse cuando existan pagos, cuentas reales, backend, IA productiva o market data real.

## 9. Auditoria final

Los Terminos de Servicio quedaron implementados como pagina interna, datos reutilizables y documentacion legal base. El contenido cubre naturaleza del servicio, uso aceptable, AI Coach, datos de mercado, beta/preview, pagos futuros, propiedad intelectual, limitacion de responsabilidad, indemnidad, suspension y contacto legal. Sigue pendiente revision por asesoria legal antes de uso comercial formal.

## 10. Enunciado del commit

`feat(web): add terms of service page`
