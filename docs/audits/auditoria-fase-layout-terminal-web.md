# Auditoría Fase Layout Terminal Web — Ampliación y reorganización visual

## 1. Auditoría inicial

* la terminal ocupaba poco ancho útil;
* el contenido se veía angosto dentro del viewport;
* algunos contenedores podían estar limitando el layout;
* el diseño necesitaba una estructura más profesional tipo terminal financiera;
* la mejora es visual y estructural;
* no implica ejecución de trades.

## 2. Plan técnico

* revisión del contenedor principal;
* eliminación o ajuste de `max-width` excesivo;
* implementación de grid responsive;
* decisión de usar 3 columnas como layout base;
* posibilidad de 4 zonas solo en pantallas grandes;
* separación de panel izquierdo, central y derecho;
* conservación de mobile-first.

## 3. Archivos creados

```text
docs/audits/auditoria-fase-layout-terminal-web.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
```

## 5. Implementación

* Se amplió el ancho general reemplazando el límite `max-w-6xl` del shell principal, ticker, header, navegación y footer por `max-w-[1800px]`.
* Se aplicó un grid responsive en el dashboard con `grid-cols-1`, `xl:grid-cols-12` y `2xl:grid-cols-16`.
* La distribución base de desktop quedó en 3 columnas: izquierda `xl:col-span-3`, centro `xl:col-span-6`, derecha `xl:col-span-3`.
* En pantallas muy grandes se amplía el espacio operativo sin usar columnas iguales: izquierda `2xl:col-span-3`, centro `2xl:col-span-8`, derecha `2xl:col-span-5`.
* Se evitó saturar la interfaz manteniendo los módulos existentes y moviéndolos por jerarquía, sin duplicarlos.
* Se conservó responsive mobile-first: en mobile todo cae en una sola columna.
* Los módulos principales se organizaron así: contexto/mercado y logros a la izquierda; análisis operativo, performance y curva al centro; riesgo, posiciones abiertas y últimos cierres a la derecha.

## 6. Validación

Ejecutar:

```bash
npm run lint
npm run build
```

Resultado local:

```text
npm run lint: OK, con warnings existentes de react-hooks/exhaustive-deps.
npm run build: ejecutado, pero no completó dentro de la ventana de 5 minutos; el primer intento encontró EPERM escribiendo .next/trace y los reintentos elevados quedaron en timeout.
```

Validar manualmente:

```text
Mobile: una columna sin overflow horizontal
Tablet: layout legible
Desktop: tres columnas balanceadas
Wide desktop: mejor uso de ancho
No hay cards angostas innecesarias
No hay scroll horizontal
No se rompe posiciones abiertas
No se rompe watchlist
No se rompe AI analysis
No se rompe risk dashboard
```

## 7. Riesgos

* En pantallas pequeñas, demasiados paneles pueden generar scroll vertical.
* En pantallas muy grandes, cuatro zonas pueden saturar si no se jerarquiza.
* Si existen componentes con ancho fijo, pueden necesitar refactor posterior.
* Si hay tablas grandes, pueden requerir overflow controlado.
* La mejora visual no cambia lógica de trading ni análisis.
* No se ejecutan trades reales.

## 8. Auditoría final

* la terminal ahora aprovecha mejor el espacio disponible;
* la estructura base recomendada es 3 columnas;
* las 4 zonas quedan reservadas para pantallas grandes;
* se mejora legibilidad y sensación de terminal profesional;
* no se agregaron secretos;
* no se agregó ejecución real de trades.

## 9. Enunciado del commit

```text
feat(ui): expand terminal layout with responsive multi-column shell
```
