# Estrategia de testing

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Actual

- `npm run lint`.
- `npm run build`.
- Validacion manual responsive.
- Revision de consola del navegador.
- Smoke de rutas con Vite cuando aplica.

## Futuro

- Vitest para helpers y logica.
- React Testing Library para componentes.
- Playwright para flujos landing/pricing/status.
- Tests de accesibilidad.
- Lighthouse para performance.

## Componentes criticos

- Pricing toggle.
- ComparisonTable.
- SiteHealthWidget.
- StatusPage.
- TickerBar.
