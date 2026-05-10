import { AlertTriangle, BrainCircuit, CheckCircle2, Lock, Radar, Target } from "lucide-react";
import { analyticsRows, levelRows } from "../../data/features";
import { legalNotices } from "../../data/legalDisclaimers";

const toneClass = {
  green: "text-cockpit-green",
  cyan: "text-cockpit-cyan",
  red: "text-cockpit-red",
  amber: "text-cockpit-amber",
};

const toneBorderClass = {
  green: "border-cockpit-green/35 bg-cockpit-green/5",
  cyan: "border-cockpit-cyan/35 bg-cockpit-cyan/5",
  red: "border-cockpit-red/35 bg-cockpit-red/5",
  amber: "border-cockpit-amber/35 bg-cockpit-amber/5",
};

const statusClass = {
  Completado: "border-cockpit-green/30 bg-cockpit-green/10 text-cockpit-green",
  "En curso": "border-cockpit-cyan/30 bg-cockpit-cyan/10 text-cockpit-cyan",
  Bloqueado: "border-cockpit-border bg-cockpit-bg text-cockpit-dim",
};

const statusIcon = {
  Completado: CheckCircle2,
  "En curso": Radar,
  Bloqueado: Lock,
};

export default function AnalyticsPreview() {
  return (
    <section id="analytics" className="border-b border-cockpit-border bg-cockpit-bg2/35 py-20">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cockpit-cyan">AIC-07 · AI Coach</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-cockpit-text md:text-4xl">
              Tu desempeno, analizado en lenguaje claro.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-cockpit-dim md:text-base">
              Lee tu journal, detecta patrones y recomienda retos. No es un chatbot de senales: es analisis
              estructurado de comportamiento operativo.
            </p>
            <p className="mt-4 border border-cockpit-border bg-cockpit-bg/70 p-3 text-xs leading-6 text-cockpit-dim">
              {legalNotices.aiCoach}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                <BrainCircuit className="text-cockpit-cyan" size={22} />
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">Pattern scan</p>
                <p className="mt-1 text-sm font-semibold text-cockpit-text">Behavior first</p>
              </div>
              <div className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                <AlertTriangle className="text-cockpit-amber" size={22} />
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">Risk context</p>
                <p className="mt-1 text-sm font-semibold text-cockpit-text">Mistake Tax</p>
              </div>
              <div className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                <Target className="text-cockpit-green" size={22} />
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">Next action</p>
                <p className="mt-1 text-sm font-semibold text-cockpit-text">Retos sugeridos</p>
              </div>
            </div>
          </div>

          <div id="coach" className="terminal-card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-cockpit-border bg-cockpit-bg2 px-4 py-3">
              <span className="text-xs text-cockpit-dim">$ coach.session --week 18 --mode audit</span>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-cockpit-green">
                <span className="h-1.5 w-1.5 rounded-full bg-cockpit-green shadow-[0_0_10px_rgba(0,230,118,0.7)]" />
                Ready
              </span>
            </div>

            <div className="grid gap-4 p-4 md:p-5">
              <div className="border border-cockpit-cyan/25 bg-cockpit-cyan/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cockpit-cyan">Coach insight</p>
                  <span className="border border-cockpit-border px-2 py-1 text-[10px] text-cockpit-dim">W18</span>
                </div>
                <p className="mt-4 text-lg font-semibold leading-7 text-cockpit-text">
                  Tus mejores entradas aparecen cuando respetas readiness y reduces salidas antes de TP1.
                </p>
                <p className="mt-3 text-sm leading-6 text-cockpit-dim">
                  Recomendacion: ejecutar un reto de 10 operaciones con regla de salida documentada antes de abrir la posicion.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {analyticsRows.map((row) => (
                  <article key={row.label} className={`border p-4 ${toneBorderClass[row.tone]}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[11px] font-semibold text-cockpit-text">{row.label}</span>
                      <span className="border border-cockpit-border bg-cockpit-bg px-2 py-1 text-[10px] text-cockpit-dim">
                        {row.delta}
                      </span>
                    </div>
                    <strong className={`mt-4 block text-3xl leading-none ${toneClass[row.tone]}`}>{row.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 terminal-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-cockpit-border bg-cockpit-bg2 px-4 py-3">
            <span className="text-xs text-cockpit-dim">RNK-08 // Niveles · Progress</span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-cockpit-cyan">Discipline ladder</span>
          </div>
          <div className="grid divide-y divide-cockpit-border lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {levelRows.map((level) => {
              const Icon = statusIcon[level.status] || Radar;
              return (
                <div key={level.code} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-cockpit-cyan">{level.code}</span>
                    <span className={`grid h-8 w-8 place-items-center border ${statusClass[level.status]}`}>
                      <Icon size={15} />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-cockpit-text">{level.title}</p>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-cockpit-dim">{level.detail}</p>
                  <span className={`mt-4 inline-flex border px-2 py-1 text-[10px] ${statusClass[level.status]}`}>
                    {level.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
