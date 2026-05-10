import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { pricingFaq } from "../../data/pricing";

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto mt-20 max-w-[720px] px-4">
      <div className="mb-9 text-center">
        <p className="text-[9px] uppercase tracking-[0.25em] text-cockpit-dim">// Preguntas frecuentes</p>
        <h3 className="mt-4 text-2xl font-bold tracking-[0.04em] text-cockpit-text">
          Lo que necesitas saber antes de elegir
        </h3>
      </div>
      <div className="divide-y divide-cockpit-border">
        {pricingFaq.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <article key={item.question}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-cockpit-text transition hover:text-cockpit-cyan"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                {item.question}
                <ChevronRight className={`shrink-0 text-cockpit-dim transition ${isOpen ? "rotate-90 text-cockpit-cyan" : ""}`} size={16} />
              </button>
              {isOpen && <p className="pb-5 text-xs leading-7 text-cockpit-dim">{item.answer}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
