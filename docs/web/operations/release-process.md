# Release process

Estado del documento: Propuesta  
Ultima actualizacion: 2026-05-10

## Flujo recomendado

1. Crear branch.
2. Implementar cambio.
3. Ejecutar validaciones.
4. Actualizar docs.
5. Crear o actualizar auditoria.
6. Ejecutar build.
7. Commit.
8. PR futuro.
9. Deploy preview.
10. Deploy produccion.

## Validaciones minimas

```bash
npm run lint
npm run build
```

## Convencion

```text
feat(web): descripcion
fix(web): descripcion
docs: descripcion
```
