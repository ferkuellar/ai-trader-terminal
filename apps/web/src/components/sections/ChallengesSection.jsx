import { challenges } from "../../data/features";
import SectionHeading from "./SectionHeading";

const progressClass = {
  cyan: "bg-cockpit-cyan shadow-[0_0_10px_rgba(0,212,255,0.6)]",
  amber: "bg-cockpit-amber shadow-[0_0_10px_rgba(255,179,0,0.6)]",
  green: "bg-cockpit-green shadow-[0_0_10px_rgba(0,230,118,0.6)]",
};

const textClass = {
  cyan: "text-cockpit-cyan",
  amber: "text-cockpit-amber",
  green: "text-cockpit-green",
};

export default function ChallengesSection() {
  return (
    <section id="challenges" className="border-b border-cockpit-border bg-cockpit-bg2/45 py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="CHL-06 · Retos disponibles"
          title="Retos para formar traders con proceso."
          copy="Criterios claros, contador en tiempo real y validacion contra tu journal. Los retos no sustituyen gestion de riesgo ni asesoria profesional."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {challenges.map((challenge) => {
            const Icon = challenge.icon;
            const percent = Math.round((challenge.progress / challenge.total) * 100);
            return (
              <article key={challenge.title} className="terminal-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center border border-cockpit-border2 bg-cockpit-bg">
                    <Icon className={textClass[challenge.tone]} size={22} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">{challenge.status}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-cockpit-text">{challenge.title}</h3>
                <p className="mt-3 text-sm leading-7 text-cockpit-dim">{challenge.copy}</p>
                <div className="mt-5 h-1 bg-cockpit-text/[0.06]">
                  <div className={`h-full ${progressClass[challenge.tone]}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-3 flex justify-between text-xs text-cockpit-dim">
                  <span className={textClass[challenge.tone]}>
                    {challenge.progress}/{challenge.total}
                  </span>
                  <span>{percent}%</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
