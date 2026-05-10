const toneClass = {
  cyan: {
    text: "text-cockpit-cyan",
    icon: "text-cockpit-cyan",
    border: "hover:border-cockpit-cyan/60",
    button: "border-cockpit-border2 text-cockpit-text hover:border-cockpit-cyan hover:bg-cockpit-cyan/10 hover:text-cockpit-cyan",
  },
  amber: {
    text: "text-cockpit-amber",
    icon: "text-cockpit-amber",
    border: "border-cockpit-amber/50 shadow-[0_0_50px_rgba(255,179,0,0.1)] hover:border-cockpit-amber",
    button: "border-cockpit-amber bg-cockpit-amber text-cockpit-bg hover:bg-cockpit-text",
  },
  green: {
    text: "text-cockpit-green",
    icon: "text-cockpit-green",
    border: "border-cockpit-green/25 hover:border-cockpit-green/60",
    button: "border-cockpit-green/40 text-cockpit-text hover:border-cockpit-green hover:bg-cockpit-green/10 hover:text-cockpit-green",
  },
};

export default function PlanCard({ plan, billingCycle }) {
  const price = plan[billingCycle];
  const annual = billingCycle === "annual";
  const tone = toneClass[plan.tone];

  return (
    <article
      className={`relative flex h-full flex-col border bg-cockpit-bg2 p-7 transition hover:-translate-y-1 hover:shadow-terminal ${
        plan.featured
          ? `bg-gradient-to-br from-cockpit-bg3 to-cockpit-bg2 ${tone.border}`
          : `border-cockpit-border ${tone.border}`
      }`}
    >
      {plan.featured && (
        <>
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-cockpit-amber/15 to-cockpit-bg2/0" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-cockpit-amber px-4 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-cockpit-bg shadow-[0_0_20px_rgba(255,179,0,0.5)]">
            {plan.popularLabel}
          </div>
        </>
      )}

      <p className="text-[9px] uppercase tracking-[0.28em] text-cockpit-dim">{plan.tier}</p>
      <h3 className={`mt-2 text-xl font-bold tracking-[0.06em] ${plan.featured || plan.team ? tone.text : "text-cockpit-text"}`}>
        {plan.name}
      </h3>
      <p className="mt-3 min-h-14 text-xs leading-6 text-cockpit-dim">{plan.description}</p>

      <div className="mt-7">
        <div className="flex items-start gap-1">
          <span className={`pt-1 text-lg ${plan.featured ? tone.text : "text-cockpit-dim"}`}>$</span>
          <span className={`text-5xl font-bold leading-none ${plan.featured ? tone.text : "text-cockpit-text"}`}>
            {price}
          </span>
        </div>
        <p className="mt-2 text-xs text-cockpit-dim">
          USD / mes{plan.periodNote ? ` · ${plan.periodNote}` : ""}
        </p>
        <p className={`mt-2 min-h-5 text-xs ${annual ? "text-cockpit-green" : "text-cockpit-dim"}`}>
          {annual ? plan.annualNote : plan.team ? "Precio por seat - consulta" : "\u00a0"}
        </p>
      </div>

      <hr className="my-6 border-cockpit-border" />
      <p className={`mb-4 text-[9px] uppercase tracking-[0.22em] ${plan.featured || plan.team ? tone.text : "text-cockpit-dim"}`}>
        {plan.featuresLabel}
      </p>

      <ul className="grid flex-1 gap-3">
        {plan.features.map((feature) => (
          <li key={feature.name} className={`flex gap-3 ${feature.inherited ? "opacity-65" : ""}`}>
            <span className={`mt-0.5 text-xs ${feature.included ? tone.icon : "text-cockpit-border2"}`}>
              {feature.included ? "◆" : "◇"}
            </span>
            <span>
              <span className={`block text-xs font-semibold ${feature.included ? "text-cockpit-text" : "text-cockpit-dim"}`}>
                {feature.name}
              </span>
              <span className="mt-1 block text-[11px] leading-5 text-cockpit-dim">{feature.description}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <a
          href="#final-cta"
          className={`block border px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] transition ${tone.button}`}
        >
          {plan.cta}
        </a>
        <p className="mt-3 text-center text-[10px] tracking-[0.06em] text-cockpit-dim">{plan.subcopy}</p>
      </div>
    </article>
  );
}
