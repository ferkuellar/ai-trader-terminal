export default function BillingToggle({ billingCycle, onChange }) {
  const annual = billingCycle === "annual";

  return (
    <button
      type="button"
      className="inline-flex flex-wrap items-center justify-center gap-3 border border-cockpit-border bg-cockpit-bg2 px-4 py-3 text-xs text-cockpit-dim transition hover:border-cockpit-cyan/50"
      onClick={() => onChange(annual ? "monthly" : "annual")}
      aria-pressed={annual}
      aria-label={`Cambiar a plan ${annual ? "mensual" : "anual"}`}
    >
      <span className={annual ? "text-cockpit-dim" : "text-cockpit-text"}>Mensual</span>
      <span
        className={`relative h-[22px] w-[42px] rounded-full border transition ${
          annual ? "border-cockpit-amber bg-cockpit-amber/20" : "border-cockpit-border2 bg-cockpit-border"
        }`}
      >
        <span
          className={`absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full transition ${
            annual ? "translate-x-[22px] bg-cockpit-amber" : "translate-x-0 bg-cockpit-dim"
          }`}
        />
      </span>
      <span className={annual ? "text-cockpit-text" : "text-cockpit-dim"}>Anual</span>
      <span className="border border-cockpit-green/30 bg-cockpit-green/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cockpit-green">
        Ahorra 20%
      </span>
    </button>
  );
}
