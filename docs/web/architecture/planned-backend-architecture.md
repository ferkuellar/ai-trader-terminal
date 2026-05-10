# Arquitectura backend planeada

Estado del documento: Propuesta  
Ultima actualizacion: 2026-05-10

## Alcance

No hay backend implementado actualmente. Este documento describe una arquitectura candidata para fases futuras.

## Modulos planeados

| Modulo | Responsabilidad | Estado |
|---|---|---|
| Auth | Login, sesiones, permisos | Futuro |
| Users | Perfil y preferencias | Futuro |
| Market Data | Adaptadores y normalizacion | Futuro |
| AI Analysis | Analisis asistido y colas | Futuro |
| Billing | Suscripciones y webhooks | Futuro |
| Journal | Registro de operaciones | Futuro |
| Challenges | Retos y reglas | Futuro |
| Analytics | Metricas y reportes | Futuro |
| Observability | Health, logs, incidentes | Futuro |

## Tecnologias candidatas

| Area | Opciones | Estado |
|---|---|---|
| API | FastAPI, Node.js/NestJS | Pendiente de decision |
| Base de datos | PostgreSQL, Supabase | Pendiente de decision |
| Pagos | Stripe | Propuesto |
| Cache/colas | Redis, workers | Futuro |
| Observabilidad | Health endpoint, logs, checks externos | Futuro |

## Riesgos

- Elegir stack backend antes de validar dominio real puede generar sobrearquitectura.
- AI Analysis requiere control de costos, seguridad y privacidad.
- Market data debe manejar limites, fallos y frescura de datos.
