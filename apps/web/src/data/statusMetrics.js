export const statusServices = [
  {
    name: "Web App",
    status: "Operational",
    level: "ok",
    latency: 42,
    uptime: "99.99%",
    description: "Frontend publico de TRADING.TERMINAL, incluyendo landing, rutas publicas y recursos estaticos.",
    metricExplanation: "Mide disponibilidad de la interfaz publica, tiempo de carga y respuesta basica del sitio.",
  },
  {
    name: "Market Data",
    status: "Operational",
    level: "ok",
    latency: 88,
    uptime: "99.95%",
    description: "Capa responsable de consumir y normalizar datos de mercado para dashboards y analisis.",
    metricExplanation: "Mide latencia de consulta, disponibilidad de fuentes de datos y respuesta del adaptador de mercado.",
  },
  {
    name: "AI Analysis",
    status: "Operational",
    level: "ok",
    latency: 126,
    uptime: "99.90%",
    description: "Servicio encargado de generar analisis asistido por IA, resumenes operativos y contexto del trader.",
    metricExplanation: "Mide disponibilidad del motor de analisis, cola de procesamiento y tiempo estimado de respuesta.",
  },
  {
    name: "Auth Gateway",
    status: "Operational",
    level: "ok",
    latency: 51,
    uptime: "99.99%",
    description: "Capa futura de autenticacion, sesiones, acceso de usuarios y autorizacion de modulos privados.",
    metricExplanation: "Mide disponibilidad del inicio de sesion, validacion de tokens y respuesta del gateway.",
  },
  {
    name: "Billing",
    status: "Monitoring",
    level: "warn",
    latency: 73,
    uptime: "99.92%",
    description: "Capa futura para suscripciones, pagos, planes y estado de facturacion.",
    metricExplanation: "Mide disponibilidad de checkout, portal de cliente, webhooks de pago y sincronizacion de suscripciones.",
  },
];

export const metricGlossary = [
  {
    name: "Uptime",
    description:
      "Porcentaje de tiempo en que un servicio permanece disponible durante un periodo determinado. En produccion se calculara usando checks externos e internos.",
  },
  {
    name: "Latency",
    description:
      "Tiempo que tarda un servicio en responder. Latencias bajas indican mejor experiencia del usuario y menor friccion operativa.",
  },
  {
    name: "Incident",
    description: "Evento que afecta disponibilidad, rendimiento, integridad de datos o experiencia del usuario.",
  },
  {
    name: "Degraded Performance",
    description:
      "Estado donde el servicio sigue disponible, pero con lentitud, errores parciales o comportamiento inferior al esperado.",
  },
  {
    name: "Operational",
    description: "Estado esperado donde el servicio responde correctamente y no presenta afectacion conocida.",
  },
  {
    name: "Monitoring",
    description:
      "Estado preventivo. El servicio esta disponible, pero se observa algun comportamiento que requiere seguimiento.",
  },
  {
    name: "Error Rate",
    description:
      "Porcentaje de solicitudes que fallan contra el total procesado. En produccion sera una metrica clave para detectar fallos silenciosos.",
  },
  {
    name: "Data Freshness",
    description:
      "Tiempo transcurrido desde la ultima actualizacion valida de datos. Es critica para market data, dashboards y analisis.",
  },
];

export const incidentTimeline = [
  {
    date: "Today",
    title: "No active incidents",
    status: "resolved",
    level: "ok",
    description: "All preview services are currently operating within expected thresholds.",
  },
  {
    date: "Previous 7 days",
    title: "Market Data latency monitoring",
    status: "monitoring",
    level: "warn",
    description: "Synthetic checks detected minor latency variance in the market data preview layer. No user impact.",
  },
  {
    date: "Previous 30 days",
    title: "Status page preview initialized",
    status: "info",
    level: "info",
    description: "Public status page model created with mock telemetry before backend observability integration.",
  },
];

export const monitoringPipeline = [
  {
    name: "/api/health endpoint",
    description: "Endpoint interno que reportara salud basica de servicios criticos.",
  },
  {
    name: "Synthetic uptime checks",
    description: "Pruebas externas programadas para confirmar disponibilidad publica.",
  },
  {
    name: "Market data adapter checks",
    description: "Validacion de respuesta, frescura y disponibilidad de fuentes de mercado.",
  },
  {
    name: "AI analysis queue health",
    description: "Seguimiento de cola, procesamiento y tiempos de respuesta del motor de analisis.",
  },
  {
    name: "Auth and billing probes",
    description: "Pruebas controladas para login, sesiones, checkout y webhooks de suscripcion.",
  },
  {
    name: "Error rate tracking",
    description: "Medicion del porcentaje de errores sobre el total de solicitudes procesadas.",
  },
  {
    name: "Latency percentiles",
    description: "Medicion p50, p95 y p99 para detectar degradaciones reales.",
  },
  {
    name: "Incident history",
    description: "Registro publico de incidentes, actualizaciones, mitigacion y resolucion.",
  },
  {
    name: "Build and deployment metadata",
    description: "Version, entorno y datos de despliegue para diagnosticar regresiones.",
  },
];
