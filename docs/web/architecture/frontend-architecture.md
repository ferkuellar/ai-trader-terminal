# Arquitectura frontend

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Stack

- React + Vite para UI y build.
- TailwindCSS para estilos.
- Framer Motion para microinteracciones.
- Lucide React para iconografia.
- ESLint para calidad estatica.

## Estructura actual

```text
src/
  components/
    layout/
    sections/
    widgets/
    pricing/
    ui/
    visual/
  pages/
  data/
  utils/
  styles/
```

## Responsabilidades

| Carpeta | Responsabilidad |
|---|---|
| `components/layout` | Navbar, Footer, TickerBar |
| `components/sections` | Secciones de landing |
| `components/pricing` | UI de planes y tabla comparativa |
| `components/widgets` | Widgets flotantes como SiteHealthWidget |
| `components/ui` | Primitivos reutilizables |
| `components/visual` | Fondos y elementos visuales |
| `pages` | Vistas de nivel pagina, como `/status` |
| `data` | Datos mock/locales |
| `utils` | Helpers compartidos |
| `styles` | CSS global y tokens |

## Principios

- Separar data de UI.
- Mantener componentes pequeños.
- Usar estado local mientras no exista necesidad global.
- No introducir dependencias sin necesidad.
- Documentar mock data como mock.
- Validar cambios con `npm run lint` y `npm run build`.
