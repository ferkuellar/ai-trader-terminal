# Routing

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Rutas actuales

| Ruta | Estado | Descripcion |
|---|---|---|
| `/` | Implementado | Landing publica |
| `/status` | Implementado | Status Page Preview con datos mock |
| `/legal-disclaimer` | Implementado | Aviso legal y divulgacion de riesgos |
| `/privacy-policy` | Implementado | Politica de privacidad y proteccion de datos |
| `/terms-of-service` | Implementado | Terminos de Servicio y reglas de uso |

## Implementacion actual

No se usa React Router. `App.jsx` implementa una navegacion minima con `window.location.pathname`, `history.pushState` y evento `popstate`.

## Rutas futuras

| Ruta | Estado | Uso esperado |
|---|---|---|
| `/app` | Futuro | Terminal privada |
| `/login` | Futuro | Autenticacion |
| `/pricing` | Futuro | Pagina dedicada de pricing |
| `/blog` | Futuro | SEO/contenido |
| `/dashboard` | Futuro | Dashboard privado |
| `/journal` | Futuro | Journal de operaciones |
| `/challenges` | Futuro | Retos |
| `/analytics` | Futuro | Analitica privada |
| `/settings` | Futuro | Configuracion |

## Nota de deploy

Para carga directa de `/status`, `/legal-disclaimer`, `/privacy-policy` o `/terms-of-service` en hosting estatico se debe configurar fallback a `index.html`.
