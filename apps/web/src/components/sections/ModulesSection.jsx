import { moduleCards } from "../../data/features";
import SectionHeading from "./SectionHeading";

export default function ModulesSection() {
  return (
    <section id="modules" className="border-b border-cockpit-border py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="M-01 · Journal"
          title="Cada trade, registrado."
          copy="La landing toma el formato de paneles cockpit del archivo fuente: secciones narrativas, metricas compactas y modulos como instrumentos de terminal."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {moduleCards.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="terminal-card group p-5">
                <div className="flex items-start justify-between gap-4">
                  <Icon className="text-cockpit-cyan transition group-hover:scale-105" size={24} />
                  <span className="border border-cockpit-border px-2 py-1 text-xs text-cockpit-dim">{module.metric}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-cockpit-text">{module.title}</h3>
                <p className="mt-3 text-sm leading-7 text-cockpit-dim">{module.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
