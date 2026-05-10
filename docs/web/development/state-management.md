# State management

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Actual

- `useState` local.
- `useEffect` para timers, websocket y listeners.
- Datos mock en archivos JS.
- No hay estado global.

## Futuro

Evaluar Context, Zustand o Redux solo si:

- varias rutas comparten usuario/sesion;
- hay cache de API;
- la terminal privada requiere estado complejo;
- se necesita sincronizar journal, retos y analytics.

## Decision actual

No introducir Redux ni estado global antes de tener app privada y backend.
