# Troubleshooting

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## VS Code abre `D:\projects` completo

Abrir `D:\projects\tradingterminal` para evitar confundir rutas.

## Repo Git accidental en carpeta padre

Ejecutar:

```bash
git status
```

Confirmar que se esta en la raiz correcta antes de commits.

## `npm install` falla

- Verificar Node.js LTS.
- Borrar `node_modules` solo si es necesario.
- Reinstalar desde `apps/web`.

## Tailwind no aplica estilos

- Revisar `tailwind.config.js`.
- Confirmar imports en `src/styles/globals.css`.
- Reiniciar Vite.

## Build falla por import incorrecto

- Revisar rutas relativas.
- Confirmar que el archivo exporta default/named correctamente.

## `/status` no carga

- En dev Vite debe responder.
- En hosting estatico configurar fallback a `index.html`.

## Env vars no aparecen

- Deben empezar con `VITE_`.
- Reiniciar servidor dev tras editar `.env`.

## Widget tapa contenido

- Ajustar `bottom/right`, ancho o z-index.
- Verificar CTAs en mobile.
