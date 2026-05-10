# LEGAL — TRADING.TERMINAL

**Estado del paquete legal:** Borrador corregido v1.0  
**Fecha:** 2026-05-10  
**Preparado para:** Implementación via Codex  

> ⚠️ Todos los documentos de este directorio son borradores revisados técnicamente. Deben ser aprobados por asesoría legal calificada antes de uso comercial formal.

---

## Documentos incluidos

| Archivo | Documento | Estado | Prioridad |
|---|---|---|---|
| `privacy-policy.md` | Política de Privacidad | Corregido v1 | Alta |
| `risk-disclosure.md` | Aviso Legal y Divulgación de Riesgos | Corregido v1 | Alta |
| `terms-of-service.md` | Términos de Servicio | Borrador inicial v1 | Alta |

---

## Pendientes globales (bloquean lanzamiento comercial)

Estos puntos están marcados como `[pendiente]` en los tres documentos. Deben resolverse antes de publicar en producción:

- [ ] **Entidad legal:** Definir nombre legal de la empresa y formalizar constitución.
- [ ] **Dirección legal:** Dirección física o fiscal registrada.
- [ ] **Jurisdicción y ley aplicable:** Definir con asesoría legal (recomendado: México como base).
- [ ] **Foro de resolución de disputas:** Ciudad y estado para litigios.
- [ ] **Revisión legal profesional:** Los tres documentos deben ser revisados por abogado calificado.

---

## Instrucciones para Codex

### Ruta de destino recomendada

```
/app
  /legal
    privacy-policy.md        ← este archivo
    risk-disclosure.md        ← este archivo
    terms-of-service.md       ← este archivo
```

O si el proyecto usa `/content/legal/` o `/public/legal/` según la arquitectura Next.js:

```
/content/legal/
  privacy-policy.md
  risk-disclosure.md
  terms-of-service.md
```

### Páginas a implementar en Next.js

Crear las siguientes rutas:

```
/app/privacy-policy/page.tsx     → renderiza privacy-policy.md
/app/legal/page.tsx              → renderiza risk-disclosure.md
/app/terms-of-service/page.tsx   → renderiza terms-of-service.md
```

### Componente recomendado para renderizar Markdown

```tsx
// app/legal/page.tsx — ejemplo base
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

export default function LegalPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/legal/risk-disclosure.md'),
    'utf-8'
  )
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 prose prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </main>
  )
}
```

Dependencia necesaria:
```bash
npm install react-markdown
```

### Links de navegación entre documentos

Los tres documentos se referencian entre sí. Verificar que las rutas internas sean consistentes con la estructura del proyecto:

| Referencia en documento | Ruta esperada |
|---|---|
| `/privacy-policy` | `/app/privacy-policy/page.tsx` |
| `/legal` | `/app/legal/page.tsx` |
| `/terms-of-service` | `/app/terms-of-service/page.tsx` |
| `/cookies` | Pendiente de implementar |
| `/refunds` | Pendiente de implementar (activar al lanzar billing) |

### Footer links recomendados

Agregar en el footer de la landing y del dashboard:

```tsx
<footer>
  <a href="/privacy-policy">Privacidad</a>
  <a href="/legal">Aviso Legal</a>
  <a href="/terms-of-service">Términos de Servicio</a>
</footer>
```

### Aviso de disclaimer en páginas sensibles

Agregar en el AI Coach, dashboard y formulario de nuevo trade:

```tsx
<p className="text-xs text-muted-foreground mt-2">
  TRADING.TERMINAL es una herramienta educativa. No constituye asesoría financiera.
  El trading implica riesgo de pérdida.{' '}
  <a href="/legal" className="underline">Ver aviso legal completo.</a>
</p>
```

---

## Checklist pre-lanzamiento legal

### Documentos
- [ ] Privacy Policy revisada por abogado
- [ ] Aviso Legal revisado por abogado
- [ ] Terms of Service revisados por abogado
- [ ] Entidad legal formalizada y reflejada en los tres documentos
- [ ] Jurisdicción y ley aplicable definidas

### Implementación técnica
- [ ] Páginas legales accesibles desde footer en landing y dashboard
- [ ] Links entre documentos funcionando
- [ ] Fecha de última actualización visible y correcta
- [ ] Email de contacto legal funcional (legal@, privacy@, support@)
- [ ] Aviso de no asesoría financiera en AI Coach
- [ ] Aviso de no asesoría financiera en formulario de nuevo trade
- [ ] Cookie banner implementado antes de activar cookies no esenciales (si aplica GDPR)

### Al activar billing
- [ ] Política de reembolso independiente creada
- [ ] Link a política de Stripe en sección de pagos
- [ ] Términos de suscripción detallados en TOS actualizados
- [ ] Comprobantes de pago configurados

### Al activar cuentas de usuario
- [ ] Flujo de aceptación de TOS en registro
- [ ] Checkbox de aceptación de Privacy Policy en registro
- [ ] Email de confirmación de cuenta con links a documentos legales

---

## Copy legal reutilizable

### Disclaimer corto (para footers y formularios)

```
TRADING.TERMINAL es una herramienta educativa y analítica. No constituye asesoría financiera, no ejecuta operaciones y no garantiza resultados. El trading implica riesgo elevado de pérdida.
```

### Disclaimer IA (para AI Coach)

```
El AI Coach genera contenido educativo orientativo. Puede contener errores. No constituye asesoría financiera. El usuario es responsable de sus decisiones operativas.
```

### Aviso de seguridad (para formularios y onboarding)

```
Nunca compartas claves privadas, seed phrases, contraseñas de exchanges, códigos 2FA ni ninguna información que permita acceder a tus activos. TRADING.TERMINAL nunca te solicitará esta información.
```

### Badge para landing page

```
Plataforma educativa · Sin asesoría financiera · Sin ejecución de operaciones
```

---

## Historial de revisiones

| Versión | Fecha | Cambios |
|---|---|---|
| v1.0 | 2026-05-10 | Borrador inicial de los tres documentos |
| v1.1 corregido | 2026-05-10 | Correcciones post-auditoría: limitación de responsabilidad, IA, jurisdicción, indemnidad, menores, edad mínima, sin afiliación, contacto legal |
