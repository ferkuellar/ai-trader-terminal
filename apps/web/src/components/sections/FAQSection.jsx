import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { faqItems } from "../../data/faq";
import SectionHeading from "./SectionHeading";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="border-b border-cockpit-border py-20">
      <div className="section-shell">
        <SectionHeading
          eyebrow="FAQ"
          title="Preguntas clave antes de entrar al cockpit."
          copy="El producto es una herramienta de medicion y revision operativa. Mantiene una frontera clara con ejecucion y asesoria financiera."
        />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-cockpit-border overflow-hidden border border-cockpit-border bg-cockpit-bg2">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-cockpit-text"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <ChevronDown className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`} size={18} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm leading-7 text-cockpit-dim">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
