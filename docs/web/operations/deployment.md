# Deployment

Estado del documento: Planeado  
Ultima actualizacion: 2026-05-10

## Plataforma recomendada

Vercel para `apps/web`.

## Configuracion esperada

| Campo | Valor |
|---|---|
| Root directory | `ai-trader-terminal/apps/web` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

## Variables

```env
VITE_APP_BUILD_VERSION=WEB_0.1.0
VITE_STATUS_PAGE_URL=/status
```

## Pendiente

- Dominio.
- Preview deployments.
- Produccion.
- Fallback SPA para `/status`.
- Headers de seguridad.
