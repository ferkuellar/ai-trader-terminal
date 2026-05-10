# Arquitectura general

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Resumen

TRADING.TERMINAL usa actualmente una app web publica en `apps/web`. El producto futuro contempla una terminal privada, backend, auth, billing, market data, AI Analysis y observabilidad real.

## Estado actual

Implementado:

- Landing publica React/Vite.
- Pricing cockpit.
- Site Health Widget con datos mock.
- Status Page Preview en `/status`.
- Datos mock locales en `src/data`.

Planeado o futuro:

- Terminal privada.
- Backend API.
- Autenticacion.
- Pagos.
- Journal persistente.
- AI Analysis real.
- Observabilidad conectada a backend.

## Diagrama

```mermaid
flowchart TD
  User[Usuario] --> Web[Landing publica apps/web]
  Web --> Waitlist[Waitlist futura]
  Web --> Status[/status Status Page Preview]
  Web --> Widget[Site Health Widget]
  Web --> Pricing[Pricing Cockpit]

  FutureApp[Terminal privada futura] --> FutureAPI[Backend API futuro]
  FutureAPI --> Auth[Auth]
  FutureAPI --> MarketData[Market Data]
  FutureAPI --> AI[AI Analysis]
  FutureAPI --> Billing[Billing]
  FutureAPI --> Observability[Observability]
```

## Separacion esperada

| Capa | Estado | Responsabilidad |
|---|---|---|
| Web publica | Implementado | Landing, pricing, status preview |
| Terminal privada | Futuro | App autenticada del trader |
| Backend API | Futuro | Datos, auth, billing, AI, observabilidad |
| Observabilidad | Preview | Health widget y status page mock |
