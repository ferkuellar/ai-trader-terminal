# Desarrollo local

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Comandos

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Variables

Crear `.env` desde `.env.example` si se requieren overrides locales.

```env
VITE_APP_BUILD_VERSION=WEB_0.1.0
VITE_STATUS_PAGE_URL=/status
```

## Flujo recomendado

1. Trabajar por componente.
2. Mantener data mock separada.
3. Revisar mobile y desktop.
4. Ejecutar lint/build.
5. Actualizar auditoria/documentacion si el cambio es significativo.
