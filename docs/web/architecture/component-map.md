# Mapa de componentes

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Layout

| Componente | Responsabilidad | Estado interno | Riesgos |
|---|---|---|---|
| `Navbar` | Navegacion principal | Menu mobile | Links futuros pueden no existir |
| `Footer` | Cierre y disclaimers | No | Mantener legal visible |
| `TickerBar` | Cinta de pares Binance live | Ticker y websocket | Fallos de red/API externa |

## Sections

| Componente | Responsabilidad | Estado interno |
|---|---|---|
| `Hero` | Primera vista y posicionamiento | No |
| `ProblemSection` | Problemas del trader | No |
| `SolutionSection` | Propuesta de solucion | No |
| `ModulesSection` | Modulos del producto | No |
| `JournalPreview` | Preview de journal | No |
| `ChallengesSection` | Retos y progreso | No |
| `StatsStrip` | Metricas agregadas | No |
| `AnalyticsPreview` | AI Coach y niveles | No |
| `PricingSection` | Pricing cockpit | `billingCycle` |
| `FAQSection` | Preguntas frecuentes | Item abierto |
| `FinalCTA` | CTA final | No |

## Widgets

| Componente | Responsabilidad | Estado interno | Dependencias |
|---|---|---|---|
| `SiteHealthWidget` | Salud del sitio mock, refresh y acceso a `/status` | expandido, servicios, timers | Framer Motion, Lucide |

## Pages

| Pagina | Responsabilidad | Estado interno |
|---|---|---|
| `StatusPage` | Status page preview con mock telemetry | servicios, last check, checking |
| `LegalDisclaimerPage` | Aviso legal y divulgacion de riesgos | No |
| `PrivacyPolicyPage` | Politica de privacidad, resumen, indice y advertencias de datos sensibles | No |
| `TermsOfServicePage` | Terminos de Servicio, uso aceptable y condiciones del producto | No |

## Pricing

| Componente | Responsabilidad |
|---|---|
| `BillingToggle` | Toggle mensual/anual |
| `PlanCard` | Card de plan |
| `ComparisonTable` | Tabla comparativa expandible |
| `PricingFAQ` | FAQ de pricing |

## Status planeado

Actualmente la status page esta en un solo archivo `StatusPage.jsx`. Si crece, extraer:

- `StatusHeader`
- `OverallStatusGrid`
- `ServiceStatusRow`
- `MetricGlossary`
- `IncidentTimeline`
- `FutureMonitoringPipeline`
- `StatusCTA`
