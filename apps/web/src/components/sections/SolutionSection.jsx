import { solutionCards } from "../../data/features";
import SectionHeading from "./SectionHeading";

export default function SolutionSection() {
  return (
    <section id="solution" className="border-b border-cockpit-border bg-cockpit-bg2/45 py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="MOD-05 · La respuesta"
          title="No te damos senales. Te ayudamos a medir tu proceso."
          copy="Cinco modulos conectados. Cada uno mide algo distinto. Juntos forman un sistema operativo para journal, riesgo, retos, analytics y coaching de comportamiento."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {solutionCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="terminal-card p-6 transition hover:border-cockpit-cyan/50">
                <Icon className="text-cockpit-cyan" size={26} />
                <h3 className="mt-6 text-lg font-semibold text-cockpit-text">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-cockpit-dim">{card.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
