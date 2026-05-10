import { ArrowRight, ShieldAlert } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="border-b border-cockpit-border bg-cockpit-bg2/50 py-20">
      <div className="section-shell terminal-card p-6 text-center md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cockpit-cyan">EXEC-10 · Ejecutar</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-cockpit-text md:text-4xl">
          Listo para operar tu proceso?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cockpit-dim">
          Empieza con journal, reglas, riesgo y analitica. Sin tarjeta. Sin promesas de ganancias.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 bg-cockpit-cyan px-5 py-3 text-sm font-bold text-cockpit-bg"
          >
            $ open --terminal <ArrowRight size={16} />
          </a>
          <span className="inline-flex items-center gap-2 text-xs text-cockpit-dim">
            <ShieldAlert size={14} className="text-cockpit-amber" />
            Train the trader. Not just the trade.
          </span>
        </div>
      </div>
    </section>
  );
}
