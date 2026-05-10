import { ArrowLeft, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { privacyIndex, privacyNotices, privacySections, privacySummary } from "../data/privacyPolicy";

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function PrivacyPolicyPage() {
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
          <span className="border border-cockpit-cyan/30 bg-cockpit-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cockpit-cyan">
            PRIVACY & DATA PROTECTION
          </span>
        </header>

        <section className="terminal-card overflow-hidden">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 border border-cockpit-cyan/30 bg-cockpit-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cockpit-cyan">
                <ShieldCheck size={14} />
                PRIVACY & DATA PROTECTION
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-cockpit-text md:text-5xl">
                Politica de Privacidad
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-cockpit-dim md:text-base">
                Como recopilamos, usamos, protegemos y gestionamos informacion en TRADING.TERMINAL.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cockpit-dim">{privacyNotices.footerShort}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cockpit-dim">Ultima actualizacion: 2026-05-10</p>
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
                  onClick={() => navigateTo("/legal-disclaimer")}
                >
                  Ver aviso legal
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                  onClick={() => navigateTo("/terms-of-service")}
                >
                  Ver terminos de servicio
                </button>
                <a
                  href="mailto:privacy@tradingterminal.com"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                >
                  <Mail size={16} />
                  Contactar privacidad
                </a>
              </div>
            </div>

            <aside className="border border-cockpit-border bg-cockpit-bg/80 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cockpit-dim">Resumen ejecutivo</p>
              <div className="mt-5 grid gap-3">
                {privacySummary.map((item) => (
                  <article key={item.title} className="border border-cockpit-border bg-cockpit-bg2/70 p-3">
                    <h2 className="text-sm font-semibold text-cockpit-text">{item.title}</h2>
                    <p className="mt-2 text-xs leading-5 text-cockpit-dim">{item.description}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <nav className="terminal-card p-5 lg:sticky lg:top-6" aria-label="Indice de privacidad">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cockpit-text">Indice</h2>
            <div className="mt-4 grid gap-2">
              {privacyIndex.map(([label, id]) => (
                <a key={id} href={`#${id}`} className="text-sm text-cockpit-dim transition hover:text-cockpit-cyan">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div className="grid gap-4">
            <article className="border border-cockpit-amber/30 bg-cockpit-amber/10 p-5">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-1 shrink-0 text-cockpit-amber" size={20} />
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cockpit-amber">
                    Informacion que nunca debes compartir
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-cockpit-dim">
                    Nunca compartas claves privadas, seed phrases, contrasenas de exchanges, codigos 2FA, acceso remoto,
                    datos bancarios sensibles o informacion que permita acceder a tus activos.
                  </p>
                </div>
              </div>
            </article>

            {privacySections.map((section) => (
              <article key={section.id} id={section.id} className="terminal-card scroll-mt-6 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cockpit-cyan">{section.title}</h2>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-cockpit-dim">
                  {section.content.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cockpit-cyan" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <footer className="my-8 border border-cockpit-border bg-cockpit-bg2 p-5 text-sm leading-7 text-cockpit-dim">
          <p className="font-semibold text-cockpit-text">Nota interna</p>
          <p className="mt-2">
            Esta politica es una base inicial y debe ser revisada por asesoria legal calificada antes de uso comercial
            formal, especialmente si se capturan usuarios de la Union Europea, California, Mexico u otras jurisdicciones
            con regulacion especifica.
          </p>
        </footer>
      </div>
    </main>
  );
}
