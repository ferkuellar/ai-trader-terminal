# ADR-0001: Monorepo structure

Estado del documento: Aceptado  
Ultima actualizacion: 2026-05-10

## Contexto

TRADING.TERMINAL puede crecer hacia landing, terminal privada, backend y documentacion operativa.

## Decision

Usar estructura tipo monorepo. Actualmente se implementa `apps/web`; `apps/terminal` y backend estan planeados.

## Consecuencias

- Mejor organizacion.
- Permite crecer por apps.
- Evita mezclar landing y app privada.
- Requiere convenciones claras para carpetas y docs.
