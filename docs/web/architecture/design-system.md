# Design system

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Concepto

El sistema visual se basa en una estetica dark trading cockpit: terminal, paneles tecnicos, metricas, cards sobrias, bordes finos y microinteracciones limpias.

## Paleta documentada

```css
--bg:        #0f1318;
--bg2:       #161b22;
--bg3:       #1c2330;
--border:    #252f3e;
--border2:   #334155;
--cyan:      #00c8ff;
--amber:     #f0b90b;
--green:     #0ecb81;
--red:       #e84142;
--text:      #c8d6e0;
--text-dim:  #6a7f90;
```

Nota: la implementacion actual usa tokens equivalentes tipo `cockpit.*` y `Deep Space Terminal`. Mantener coherencia semantica: cian para accion, verde para ok/profit, amber para monitoring/risk, rojo para error/loss.

## Prohibido como branding

- `purple`
- `violet`
- `lila`
- `morado`
- gradientes morados

## UI

- Cards: bordes finos, fondo oscuro, sombra moderada.
- Botones: texto claro, estados hover visibles, buen contraste.
- Badges: estado por color y texto.
- Iconografia: Lucide React.
- Tipografia: monoespaciada para cockpit/terminal.
- Animaciones: Framer Motion o CSS sutil; evitar movimientos exagerados.

## Accesibilidad

- No depender solo del color.
- Usar `aria-label` en botones iconicos.
- Mantener contraste en textos pequeños.
- Respetar `prefers-reduced-motion` cuando aplique.
