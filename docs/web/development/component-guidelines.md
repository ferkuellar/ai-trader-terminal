# Guia de componentes

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Plantilla

```text
Nombre:
Responsabilidad:
Props:
Estado:
Dependencias:
Accesibilidad:
Responsive:
Riesgos:
```

## Ejemplo: SiteHealthWidget

Nombre: `SiteHealthWidget`  
Responsabilidad: Mostrar salud mock del sitio y acceso a `/status`.  
Props: ninguna.  
Estado: expandido, servicios, checking, last check.  
Dependencias: Framer Motion, Lucide React.  
Accesibilidad: botones con `aria-label`, estados por texto y color.  
Responsive: fixed bottom-right con ancho limitado.  
Riesgos: datos mock pueden confundirse con salud real si no se aclaran.
