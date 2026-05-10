# Site Health Widget

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Que es

Widget flotante de salud del sitio ubicado en la esquina inferior derecha.

## Funciones actuales

- Estado colapsado/expandido.
- Servicios mock.
- `Last check` dinamico.
- Refresh manual.
- Auto-refresh cada 30s.
- Build version desde env.
- `View Status` conectado a `/status`.

## Estados

- `OPERATIONAL`
- `MONITORING`
- `DEGRADED`
- `Checking...`

## Futuro

Conectar con:

```text
GET /api/health
```

## Riesgos

Datos mock no deben comunicarse como uptime real.
