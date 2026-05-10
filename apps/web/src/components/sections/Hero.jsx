import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Bot, ShieldCheck } from "lucide-react";

const MotionDiv = motion.div;

const stats = [
  { label: "TRADERS", value: "1,200+", tone: "text-cockpit-cyan" },
  { label: "TRADES REGISTRADOS", value: "48,000+", tone: "text-cockpit-green" },
  { label: "RETOS COMPLETADOS", value: "320+", tone: "text-cockpit-amber" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-cockpit-border terminal-grid">
      <div className="section-shell grid min-h-[calc(100vh-6.25rem)] items-center gap-10 py-14 md:grid-cols-[1fr_0.86fr] md:py-20">
        <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="mb-4 inline-flex items-center gap-2 border border-cockpit-border bg-cockpit-bg2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cockpit-cyan">
            <ShieldCheck size={14} /> HERO-00 · Mission · LIVE
          </p>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cockpit-dim">
            Plataforma de entrenamiento cripto
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-cockpit-text md:text-6xl">
            Convierte tu trading en un sistema medible.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-cockpit-dim md:text-lg">
            Registra operaciones, controla riesgo, completa retos y entrena disciplina con datos verificables. Un
            cockpit para revisar proceso, no para prometer resultados.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-cockpit-cyan px-5 py-3 text-sm font-bold text-cockpit-bg transition hover:bg-cockpit-text"
            >
              Acceder a la terminal <ArrowRight size={16} />
            </a>
            <a
              href="#analytics"
              className="inline-flex items-center justify-center gap-2 border border-cockpit-border2 px-5 py-3 text-sm font-semibold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
            >
              Ver demo
            </a>
          </div>
          <p className="mt-5 flex max-w-2xl items-start gap-2 text-xs leading-6 text-cockpit-dim">
            <AlertTriangle className="mt-1 shrink-0 text-cockpit-amber" size={14} />
            Plataforma educativa. No ejecuta trades. No da asesoria financiera. El trading conlleva riesgo de perdida.
          </p>
        </MotionDiv>

        <MotionDiv
          className="terminal-card scanline relative overflow-hidden p-4"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div className="flex items-center justify-between border-b border-cockpit-border pb-3 text-xs text-cockpit-dim">
            <span>MKT-01 // BTC/USDT · 1H</span>
            <span className="text-cockpit-green">SYNCED</span>
          </div>
          <div className="mt-4 grid gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-cockpit-border bg-cockpit-bg/80 p-4">
                <p className="text-xs uppercase text-cockpit-dim">{stat.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border border-cockpit-border bg-cockpit-bg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-cockpit-text">
              <Bot size={18} className="text-cockpit-cyan" />
              AIC-07 · Coach output
            </div>
            <p className="mt-3 text-sm leading-6 text-cockpit-dim">
              En 4 operaciones cerraste antes del TP1 por miedo. Recomendacion de proceso: activa el reto Respeta el
              plan de salida para la proxima semana.
            </p>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
