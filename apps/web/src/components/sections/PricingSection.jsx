import { useState } from "react";
import { pricingPlans, pricingProof, pricingTestimonials } from "../../data/pricing";
import { legalNotices } from "../../data/legalDisclaimers";
import BillingToggle from "../pricing/BillingToggle";
import ComparisonTable from "../pricing/ComparisonTable";
import PlanCard from "../pricing/PlanCard";
import PricingFAQ from "../pricing/PricingFAQ";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <section id="pricing" className="relative overflow-hidden border-b border-cockpit-border bg-cockpit-bg py-20">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:48px_48px] opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.1),rgba(5,8,20,0)_65%)]" />

      <div className="section-shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 border border-cockpit-cyan/25 bg-cockpit-cyan/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-cockpit-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cockpit-cyan shadow-[0_0_10px_rgba(0,212,255,0.7)]" />
            Estructura de precios
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-[0.04em] text-cockpit-text md:text-4xl">
            Elige tu nivel de <span className="text-cockpit-amber">disciplina</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-cockpit-dim">
            Tres planes para distintos estadios del trader. Sin compromisos ocultos. Sin promesas de ganancias.
          </p>
        </div>

        <div className="mt-9 flex justify-center">
          <BillingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
        </div>

        <div className="mx-auto mt-14 grid max-w-[1100px] gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} />
          ))}
        </div>
        <p className="mx-auto mt-5 max-w-[900px] border border-cockpit-border bg-cockpit-bg2/70 px-4 py-3 text-center text-[11px] leading-5 text-cockpit-dim">
          {legalNotices.pricing}
        </p>

        <ComparisonTable />

        <section className="mx-auto mt-20 max-w-[1100px]">
          <p className="mb-7 text-center text-[9px] uppercase tracking-[0.25em] text-cockpit-dim">
            // Resultados - beta cerrada
          </p>
          <div className="grid overflow-hidden border border-cockpit-border md:grid-cols-4">
            {pricingProof.map((item) => (
              <div key={item.label} className="border-b border-cockpit-border bg-cockpit-bg2 p-7 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <span className="block text-3xl font-bold tracking-[0.04em] text-cockpit-cyan">{item.value}</span>
                <span className="mt-2 block text-[10px] text-cockpit-dim">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {pricingTestimonials.map((item) => (
              <article key={item.author} className="border border-cockpit-border border-l-cockpit-amber bg-cockpit-bg2 p-6">
                <p className="text-xs leading-7 text-cockpit-dim">"{item.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-cockpit-border2 bg-cockpit-bg3 text-[10px] text-cockpit-amber">
                    {item.initials}
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-cockpit-text">{item.author}</span>
                    <span className="block text-[10px] text-cockpit-dim">{item.meta}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <PricingFAQ />

        <div id="final-cta" className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-cockpit-dim">// Decision</p>
          <h3 className="mt-4 text-3xl font-bold leading-tight text-cockpit-text">
            Deja de operar por instinto. Empieza a operar <span className="text-cockpit-amber">con datos</span>.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cockpit-dim">
            Trading Terminal ayuda a construir un proceso medible operacion por operacion. No ejecuta trades, no da
            asesoria financiera y no promete rendimientos.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@tradingterminal.example?subject=TRADING.TERMINAL%20demo"
              className="inline-flex items-center justify-center bg-cockpit-amber px-6 py-3 text-sm font-bold text-cockpit-bg transition hover:bg-cockpit-text"
            >
              $ iniciar prueba gratuita {">"}
            </a>
            <a
              href="#analytics"
              className="inline-flex items-center justify-center border border-cockpit-border2 px-6 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
            >
              Ver demo
            </a>
          </div>
          <p className="mt-4 text-[11px] text-cockpit-dim">Sin tarjeta. Sin compromisos. Sin promesas de ganancias.</p>
        </div>
      </div>
    </section>
  );
}
