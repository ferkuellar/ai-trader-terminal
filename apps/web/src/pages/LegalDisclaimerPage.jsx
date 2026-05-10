import { ArrowLeft, FileWarning, ShieldAlert } from "lucide-react";
import { legalNotices, legalSections, legalSummary } from "../data/legalDisclaimers";

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function LegalDisclaimerPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cockpit-bg text-cockpit-text">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:48px_48px] opacity-[0.06]" />
      <div className="section-shell relative py-6 md:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-cockpit-border bg-cockpit-bg2/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cockpit-text transition hover:text-cockpit-cyan"
            onClick={() => navigateTo("/")}
          >
            <span className="grid h-8 w-8 place-items-center border border-cockpit-cyan/50 bg-cockpit-bg3 text-cockpit-cyan">
              TT
            </span>
            TRADING.TERMINAL
          </button>
          <span className="border border-cockpit-amber/30 bg-cockpit-amber/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cockpit-amber">
            GLOBAL RISK DISCLOSURE
          </span>
        </header>

        <section className="terminal-card overflow-hidden">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 border border-cockpit-amber/30 bg-cockpit-amber/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cockpit-amber">
                <ShieldAlert size={14} />
                GLOBAL RISK DISCLOSURE
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-cockpit-text md:text-5xl">
                Aviso legal y divulgacion de riesgos
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-cockpit-dim md:text-base">
                TRADING.TERMINAL es una herramienta educativa y analitica. No es asesor financiero, broker, exchange ni
                sistema de ejecucion de operaciones.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cockpit-dim">{legalNotices.footerShort}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-cockpit-cyan px-4 py-3 text-sm font-bold text-cockpit-bg transition hover:bg-cyan-300"
                  onClick={() => navigateTo("/")}
                >
                  <ArrowLeft size={16} />
                  Volver al inicio
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                  onClick={() => navigateTo("/status")}
                >
                  Ver estado del sistema
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                  onClick={() => navigateTo("/privacy-policy")}
                >
                  Ver politica de privacidad
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                  onClick={() => navigateTo("/terms-of-service")}
                >
                  Ver terminos de servicio
                </button>
              </div>
            </div>

            <aside className="border border-cockpit-border bg-cockpit-bg/80 p-5">
              <div className="flex items-center gap-3">
                <FileWarning className="text-cockpit-amber" size={24} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cockpit-dim">Resumen ejecutivo</p>
                  <p className="mt-1 text-sm font-semibold text-cockpit-text">Antes de usar esta plataforma</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-cockpit-dim">
                {legalSummary.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cockpit-amber" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {legalSections.map((section) => (
            <article key={section.title} className="terminal-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cockpit-cyan">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-cockpit-dim">{section.body}</p>
            </article>
          ))}
        </section>

        <footer className="my-8 border border-cockpit-border bg-cockpit-bg2 p-5 text-sm leading-7 text-cockpit-dim">
          <p className="font-semibold text-cockpit-text">Ultima actualizacion: 2026-05-10</p>
          <p className="mt-2">
            Este documento es una version inicial y debe ser revisado por asesoria legal calificada antes de uso
            comercial formal. No sustituye terminos y condiciones, politica de privacidad ni asesoramiento legal.
          </p>
        </footer>
      </div>
    </main>
  );
}
