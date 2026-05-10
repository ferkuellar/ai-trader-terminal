# Variables de entorno

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Variables actuales

| Variable | Requerida | Ejemplo | Uso |
|---|---:|---|---|
| `VITE_APP_BUILD_VERSION` | No | `WEB_0.1.0` | Version visible en status/widget |
| `VITE_STATUS_PAGE_URL` | No | `/status` | Destino de View Status |

## Variables futuras

| Variable | Estado | Uso esperado |
|---|---|---|
| `VITE_API_BASE_URL` | Futuro | URL base de backend |
| `VITE_SUPABASE_URL` | Futuro | Supabase si se adopta |
| `VITE_SUPABASE_ANON_KEY` | Futuro | Cliente publico Supabase |
| `VITE_STRIPE_PUBLIC_KEY` | Futuro | Stripe Checkout/Elements |

## Ejemplo

```env
VITE_APP_BUILD_VERSION=WEB_0.1.0
VITE_STATUS_PAGE_URL=/status
```
