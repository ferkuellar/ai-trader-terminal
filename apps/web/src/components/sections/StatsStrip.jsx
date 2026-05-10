import { statsStrip } from "../../data/features";

const toneClass = {
  amber: "text-cockpit-amber",
  cyan: "text-cockpit-cyan",
  green: "text-cockpit-green",
  text: "text-cockpit-text",
};

export default function StatsStrip() {
  return (
    <section className="border-b border-cockpit-border py-12">
      <div className="section-shell grid border border-cockpit-border bg-cockpit-border md:grid-cols-4">
        {statsStrip.map((stat) => (
          <div key={stat.label} className="bg-cockpit-bg p-7 md:p-8">
            <p className={`text-3xl font-bold md:text-5xl ${toneClass[stat.tone]}`}>{stat.value}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-cockpit-dim">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
