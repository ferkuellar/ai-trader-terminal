# ADR-0004: Status page preview

Estado del documento: Aceptado  
Ultima actualizacion: 2026-05-10

## Contexto

El producto aun no tiene backend real de observabilidad, pero la landing puede preparar un modelo serio de disponibilidad, latencia e incidentes.

## Decision

Crear status page preview antes de tener backend real.

## Razon

- Refuerza percepcion de producto serio.
- Prepara integracion futura de observabilidad.
- Documenta el modelo operacional esperado.

## Riesgo

Confundir datos mock con uptime real.

## Mitigacion

Mostrar badge `STATUS PREVIEW` y aclarar que los datos son mock.
