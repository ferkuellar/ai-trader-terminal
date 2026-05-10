export const billingOptions = {
  monthly: {
    label: "Mensual",
    suffix: "USD / mes",
  },
  annual: {
    label: "Anual",
    suffix: "USD / mes",
  },
};

export const pricingPlans = [
  {
    id: "trader",
    tier: "PLN - 01",
    name: "TRADER",
    description: "Para traders que estan construyendo su proceso desde cero.",
    monthly: 19,
    annual: 15,
    annualNote: "-> $180/ano · ahorras $48",
    cta: "-> Empezar gratis",
    subcopy: "14 dias sin tarjeta de credito",
    tone: "cyan",
    featured: false,
    featuresLabel: "INCLUYE",
    features: [
      {
        name: "Metricas base",
        description: "Win rate, R promedio, operaciones por sesion y PnL acumulado.",
        included: true,
      },
      {
        name: "Retos completos",
        description: "Acceso a formatos de challenge y retos custom.",
        included: true,
      },
      {
        name: "AI Coach basico",
        description: "Analisis post-trade con resumen de errores recurrentes.",
        included: true,
      },
      {
        name: "Analytics estandar",
        description: "Dashboard con equity curve, drawdown y distribucion de R-multiplos.",
        included: true,
      },
      {
        name: "Playbooks de setup",
        description: "Disponible en PRO y TEAM.",
        included: false,
      },
      {
        name: "Mistake Tax",
        description: "Disponible en PRO y TEAM.",
        included: false,
      },
    ],
  },
  {
    id: "pro",
    tier: "PLN - 02",
    name: "PRO",
    description: "Para el trader que ya opera y quiere medir consistencia con mas precision.",
    monthly: 39,
    annual: 31,
    annualNote: "-> $372/ano · ahorras $96",
    cta: "-> Elegir PRO",
    subcopy: "14 dias sin tarjeta de credito",
    tone: "amber",
    featured: true,
    popularLabel: "MAS POPULAR",
    featuresLabel: "TODO TRADER, MAS:",
    features: [
      {
        name: "Todo lo del plan Trader",
        description: "Metricas, retos, AI Coach basico y analytics.",
        included: true,
        inherited: true,
      },
      {
        name: "AI Coach avanzado",
        description: "Analisis de confluencias, sesgo direccional y revision del plan.",
        included: true,
      },
      {
        name: "Playbooks de setup",
        description: "Biblioteca etiquetada con entrada, invalidacion y target por setup.",
        included: true,
      },
      {
        name: "Mistake Tax",
        description: "Cuantifica el costo de operar fuera del plan en R-multiplos.",
        included: true,
      },
      {
        name: "Readiness Score",
        description: "Indice pre-sesion: estado mental, contexto y alineacion al plan.",
        included: true,
      },
      {
        name: "Plan Compliance Impact",
        description: "Relacion entre adherencia al plan y resultados medibles en R.",
        included: true,
      },
    ],
  },
  {
    id: "team",
    tier: "PLN - 03",
    name: "TEAM / ACADEMY",
    description: "Para academias, grupos y equipos que revisan multiples cuentas.",
    monthly: 99,
    annual: 79,
    annualNote: "-> $948/ano · ahorras $240",
    cta: "-> Hablar con ventas",
    subcopy: "Demo personalizada disponible",
    tone: "green",
    featured: false,
    team: true,
    featuresLabel: "TODO PRO, MAS:",
    periodNote: "desde 3 usuarios",
    features: [
      {
        name: "Todo lo del plan PRO",
        description: "AI Coach, Playbooks, Mistake Tax, Readiness Score y mas.",
        included: true,
        inherited: true,
      },
      {
        name: "Multiusuario",
        description: "Panel de admin con visibilidad sobre todos los traders del grupo.",
        included: true,
      },
      {
        name: "Metricas grupales",
        description: "Analisis comparativo y distribucion de errores por trader.",
        included: true,
      },
      {
        name: "Retos personalizados",
        description: "Configura reglas, drawdown y objetivos propios para tus alumnos.",
        included: true,
      },
      {
        name: "Panel de administrador",
        description: "Gestiona usuarios, permisos, cohortes y revision de desempeno.",
        included: true,
      },
      {
        name: "Soporte prioritario",
        description: "Canal dedicado y onboarding asistido para tu academia.",
        included: true,
      },
    ],
  },
];

export const comparisonSections = [
  {
    label: "CORE",
    rows: [
      { feature: "Metricas base (win rate, R, PnL)", trader: true, pro: true, team: true },
      { feature: "Retos individuales y custom", trader: true, pro: true, team: true },
      { feature: "Analytics - equity curve & drawdown", trader: true, pro: true, team: true },
      { feature: "AI Coach basico", trader: true, pro: true, team: true },
    ],
  },
  {
    label: "PRO",
    rows: [
      { feature: "AI Coach avanzado", trader: false, pro: true, team: true },
      { feature: "Playbooks de setup", trader: false, pro: true, team: true },
      { feature: "Mistake Tax", trader: false, pro: true, team: true },
      { feature: "Readiness Score", trader: false, pro: true, team: true },
      { feature: "Plan Compliance Impact", trader: false, pro: true, team: true },
      { feature: "Soporte email", trader: false, pro: "Email", team: true },
    ],
  },
  {
    label: "TEAM / ACADEMY",
    rows: [
      { feature: "Multiusuario", trader: false, pro: false, team: true },
      { feature: "Metricas grupales", trader: false, pro: false, team: true },
      { feature: "Retos personalizados", trader: false, pro: false, team: true },
      { feature: "Panel de administrador", trader: false, pro: false, team: true },
      { feature: "Soporte prioritario + onboarding", trader: false, pro: false, team: true },
    ],
  },
];

export const pricingProof = [
  { value: "312", label: "traders en beta cerrada" },
  { value: "+34%", label: "mejora en plan compliance" },
  { value: "2.1R", label: "R promedio documentado" },
  { value: "89%", label: "redujeron errores en 30 dias" },
];

export const pricingTestimonials = [
  {
    initials: "CV",
    author: "@CarlosV_FX",
    meta: "Forex swing trader · Beta PRO",
    text: "Por primera vez tengo datos reales de que me esta costando operar fuera del plan. El Mistake Tax me cambio la perspectiva.",
  },
  {
    initials: "DF",
    author: "@Daniela_Futures",
    meta: "Crypto futures · Beta TRADER",
    text: "Usaba una hoja de calculo para journaling. Los retos integrados me ayudaron a revisar disciplina con mas orden.",
  },
  {
    initials: "TM",
    author: "@TradingAcademyMX",
    meta: "Academia · Beta TEAM",
    text: "Las metricas grupales permiten detectar patrones comunes de error que antes tardabamos semanas en identificar.",
  },
];

export const pricingFaq = [
  {
    question: "Los 14 dias gratis requieren tarjeta de credito?",
    answer:
      "No. El periodo de prueba es gratuito y no pedimos datos de pago para iniciar la revision del proceso.",
  },
  {
    question: "Puedo cambiar de plan en cualquier momento?",
    answer:
      "Si. Puedes subir o bajar de plan desde el panel de cuenta. Los cambios se aplican al siguiente ciclo de facturacion.",
  },
  {
    question: "Que mercados son compatibles con los retos?",
    answer:
      "El sistema puede usarse para Forex, futuros, crypto y CFDs siempre que registres tus operaciones y reglas de riesgo.",
  },
  {
    question: "Como funciona el plan TEAM / Academy?",
    answer:
      "Incluye panel de administrador, metricas grupales, retos personalizados y onboarding asistido para equipos o academias.",
  },
  {
    question: "El AI Coach tiene acceso a mis operaciones reales?",
    answer:
      "Analiza los datos que registras en el journal. No conecta con tu broker, no ejecuta operaciones y no ofrece asesoria financiera.",
  },
];
