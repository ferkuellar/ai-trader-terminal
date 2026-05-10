# TRADING.TERMINAL

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

TRADING.TERMINAL es una plataforma tipo trading cockpit enfocada en disciplina, journaling, retos, analytics y AI Coach para traders. No ejecuta operaciones, no ofrece asesoria financiera y no promete rendimientos.

## Estado actual

El proyecto contiene una landing publica en `ai-trader-terminal/apps/web`, construida con React, Vite y TailwindCSS. La app privada, backend, autenticacion, pagos, journal real, AI Analysis real y observabilidad real estan planeados, no implementados.

## Estructura

```text
ai-trader-terminal/
  apps/
    web/
docs/
```

## Stack actual

- React 19
- Vite 6
- TailwindCSS
- Framer Motion
- Lucide React
- ESLint
- npm

## Instalacion y ejecucion

```bash
cd ai-trader-terminal/apps/web
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Servidor local Vite |
| `npm run build` | Build de produccion |
| `npm run preview` | Preview del build |
| `npm run lint` | Validacion ESLint |

## Variables de entorno

Ver [docs/architecture/environment-variables.md](docs/architecture/environment-variables.md).

```env
VITE_APP_BUILD_VERSION=WEB_0.1.0
VITE_STATUS_PAGE_URL=/status
```

## Documentacion

Indice principal: [docs/README.md](docs/README.md)

Lecturas clave:

- [Vision de producto](docs/product/product-vision.md)
- [Arquitectura general](docs/architecture/overview.md)
- [Arquitectura frontend](docs/architecture/frontend-architecture.md)
- [Setup](docs/development/setup.md)
- [Checklist de validacion](docs/development/validation-checklist.md)
- [Observabilidad](docs/operations/observability.md)

## Roadmap resumido

1. Landing publica y pricing cockpit.
2. Widget de salud del sitio y status page preview.
3. Waitlist, SEO, legal y performance.
4. Deploy en Vercel.
5. Terminal privada MVP.
6. Backend, auth, billing, journal, challenges, AI Coach y observabilidad real.

## Disclaimer financiero

TRADING.TERMINAL es una herramienta educativa, analitica y de registro operativo. No constituye asesoria financiera, no ejecuta operaciones y no garantiza resultados. Toda decision de trading es responsabilidad exclusiva del usuario.

## Convencion de commits

Formato recomendado:

```text
feat(scope): descripcion
fix(scope): descripcion
docs: descripcion
refactor(scope): descripcion
chore(scope): descripcion
```
