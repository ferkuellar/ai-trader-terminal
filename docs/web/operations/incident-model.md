# Modelo de incidentes

Estado del documento: Propuesta  
Ultima actualizacion: 2026-05-10

## Estados

- Operational
- Monitoring
- Degraded
- Partial outage
- Major outage
- Resolved

## Campos propuestos

| Campo | Descripcion |
|---|---|
| `id` | Identificador unico |
| `service` | Servicio afectado |
| `severity` | Severidad |
| `status` | Estado actual |
| `startedAt` | Inicio |
| `resolvedAt` | Resolucion |
| `summary` | Resumen |
| `impact` | Impacto |
| `updates` | Actualizaciones |

## Reglas

- No publicar incidentes sin contexto.
- Separar degradacion de outage.
- Mantener timeline claro.
