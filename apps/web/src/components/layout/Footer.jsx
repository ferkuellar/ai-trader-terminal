import { legalNotices } from "../../data/legalDisclaimers";
import { privacyNotices } from "../../data/privacyPolicy";
import { termsNotices } from "../../data/termsOfService";

export default function Footer() {
  return (
    <footer className="border-t border-cockpit-border bg-cockpit-bg2 py-8">
      <div className="section-shell grid gap-4 text-sm text-cockpit-dim md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-semibold text-cockpit-text">TRADING.TERMINAL</p>
          <p className="mt-2 max-w-3xl">PLATAFORMA LOCAL · TUS DATOS SON TUYOS.</p>
          <p className="mt-2 max-w-3xl">{legalNotices.footerShort}</p>
          <p className="mt-2 max-w-3xl">{termsNotices.footerShort}</p>
          <p className="mt-2 max-w-3xl">{privacyNotices.footerShort}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cockpit-amber">
            El trading conlleva riesgo de perdida total del capital.
          </p>
        </div>
        <nav className="flex flex-col items-start gap-2 text-sm md:items-end" aria-label="Footer legal navigation">
          <a href="#pricing" className="hover:text-cockpit-text">
            Pricing
          </a>
          <a href="#faq" className="hover:text-cockpit-text">
            FAQ
          </a>
          <a href="/legal-disclaimer" className="hover:text-cockpit-text">
            Aviso legal
          </a>
          <a href="/privacy-policy" className="hover:text-cockpit-text">
            Politica de Privacidad
          </a>
          <a href="/terms-of-service" className="hover:text-cockpit-text">
            Terminos de Servicio
          </a>
        </nav>
      </div>
    </footer>
  );
}
