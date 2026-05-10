import { AlertCircle } from "lucide-react";
import { problemPoints } from "../../data/features";
import SectionHeading from "./SectionHeading";

export default function ProblemSection() {
  return (
    <section id="problem" className="border-b border-cockpit-border py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="DGN-04 · El diagnostico"
          title="Muchos traders pierden por disciplina, no por analisis."
          copy="La mayoria no necesita una estrategia nueva. Necesita ejecutar la que ya tiene, registrar lo que ocurre y medir las trampas que se repiten."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problemPoints.map((point) => (
            <article key={point} className="terminal-card p-5">
              <AlertCircle className="mb-4 text-cockpit-amber" size={22} />
              <p className="text-sm leading-7 text-cockpit-text">{point}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
