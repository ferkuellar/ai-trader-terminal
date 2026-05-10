import { Activity, BarChart3, BrainCircuit, Gauge, ListChecks, ShieldCheck, Target, Trophy } from "lucide-react";

export const tickerItems = [
  { label: "SPOT BTC", value: "+2.3", tone: "green" },
  { label: "ETH", value: "+1.8", tone: "green" },
  { label: "SOL", value: "-0.4", tone: "red" },
  { label: "BNB", value: "+0.9", tone: "green" },
  { label: "XRP", value: "+0.3", tone: "green" },
  { label: "ADA", value: "-1.1", tone: "red" },
  { label: "RISK LOCK", value: "ON", tone: "amber" },
];

export const navItems = [
  { label: "Features", href: "#solution" },
  { label: "Retos", href: "#challenges" },
  { label: "Analytics", href: "#analytics" },
  { label: "AI Coach", href: "#coach" },
  { label: "Planes", href: "#pricing" },
];

export const problemPoints = [
  "Sobreapalancas sin darte cuenta y lo descubres tarde.",
  "Entras por impulso, no por plan documentado.",
  "Repites los mismos errores sin medir su costo.",
  "No sabes si tu estrategia funciona o solo tuvo una buena semana.",
  "Cierras ganancias por miedo antes de ejecutar el plan.",
  "No tienes registro claro de lo que haces bien.",
];

export const solutionCards = [
  {
    title: "No te damos senales",
    copy: "Trading Terminal no recomienda entradas ni salidas. Convierte tu operacion en datos revisables para que puedas auditar tu proceso.",
    icon: ListChecks,
  },
  {
    title: "Te hace medir mejor",
    copy: "Riesgo, retos, journal, analytics y AI Coach comparten la misma fuente: tu comportamiento operativo.",
    icon: ShieldCheck,
  },
  {
    title: "Entrena disciplina",
    copy: "El foco es ejecutar reglas, detectar friccion y sostener criterios verificables. Sin promesas de rendimiento.",
    icon: BrainCircuit,
  },
];

export const moduleCards = [
  {
    title: "M-01 · Journal",
    metric: "Trade context",
    copy: "Entrada, salida, R-multiple, screenshot, nota y emocion. Cada trade queda listo para revision.",
    icon: Activity,
  },
  {
    title: "M-02 · Riesgo",
    metric: "Risk control",
    copy: "Sizing, limites, drawdown y reglas rotas visibles antes de que se conviertan en patron.",
    icon: Gauge,
  },
  {
    title: "M-03 · Retos",
    metric: "Challenge engine",
    copy: "Criterios claros, contador en tiempo real y validacion contra tu journal.",
    icon: Trophy,
  },
  {
    title: "M-04 · Analytics",
    metric: "Performance system",
    copy: "Cruza setups, horarios, cumplimiento y resultados para separar proceso de ruido.",
    icon: BarChart3,
  },
  {
    title: "M-05 · AI Coach",
    metric: "Behavior review",
    copy: "Lee tu journal, detecta patrones y recomienda retos de proceso. No es un asesor financiero.",
    icon: BrainCircuit,
  },
];

export const challenges = [
  {
    code: "RC-01",
    title: "RC-01 · Riesgo controlado",
    copy: "20 trades sin exceder el limite de riesgo definido.",
    progress: 14,
    total: 20,
    status: "En curso",
    tone: "cyan",
    icon: Target,
  },
  {
    code: "RC-02",
    title: "RC-02 · Sin revenge trading",
    copy: "7 dias sin operar por impulso despues de una perdida.",
    progress: 4,
    total: 7,
    status: "Dia 4",
    tone: "amber",
    icon: Trophy,
  },
  {
    code: "RC-03",
    title: "RC-03 · Trader documentado",
    copy: "30 trades con nota, setup y evidencia visual.",
    progress: 22,
    total: 30,
    status: "En curso",
    tone: "green",
    icon: ShieldCheck,
  },
  {
    code: "RC-04",
    title: "RC-04 · Respeto al stop",
    copy: "10 trades sin mover el stop loss fuera del plan.",
    progress: 6,
    total: 10,
    status: "En curso",
    tone: "amber",
    icon: ShieldCheck,
  },
];

export const journalRows = [
  { id: "1042", pair: "BTC/USDT · LONG", setup: "Breakout", size: "0.05", result: "+2.3R", positive: true },
  { id: "1041", pair: "ETH/USDT · LONG", setup: "Pullback", size: "0.30", result: "+1.1R", positive: true },
  { id: "1040", pair: "SOL/USDT · SHORT", setup: "Reversal", size: "1.20", result: "-1.0R", positive: false },
  { id: "1039", pair: "BTC/USDT · LONG", setup: "Continuation", size: "0.04", result: "+3.2R", positive: true },
  { id: "1038", pair: "BNB/USDT · SHORT", setup: "Failed BO", size: "1.50", result: "-0.8R", positive: false },
];

export const statsStrip = [
  { value: "48,000+", label: "Trades registrados", tone: "amber" },
  { value: "320+", label: "Retos completados", tone: "cyan" },
  { value: "67%", label: "Muestra historica", tone: "green" },
  { value: "$0", label: "Senales vendidas", tone: "text" },
];

export const analyticsRows = [
  { label: "Trades revisados", value: "12", delta: "semana 18", tone: "cyan" },
  { label: "Win rate", value: "58%", delta: "+4 vs prev", tone: "green" },
  { label: "Salidas antes de TP1", value: "4", delta: "miedo", tone: "amber" },
  { label: "Mistake Tax estimado", value: "$180", delta: "USDT", tone: "red" },
];

export const levelRows = [
  { code: "N1", title: "Trader registrador", detail: "10 trades documentados", status: "Completado" },
  { code: "N2", title: "Riesgo definido", detail: "Sizing correcto en 20 trades", status: "Completado" },
  { code: "N3", title: "Disciplinado", detail: "Retos RC-01 + RC-04 completados", status: "En curso" },
  { code: "N4", title: "Consistente", detail: "50 trades con reglas respetadas", status: "Bloqueado" },
  { code: "N5", title: "Sistematico", detail: "Estrategia codificada y validada", status: "Bloqueado" },
];
