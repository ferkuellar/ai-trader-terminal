import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "../../data/features";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cockpit-border bg-cockpit-bg/90 backdrop-blur-xl">
      <nav className="section-shell flex min-h-16 items-center justify-between gap-6" aria-label="Principal">
        <a href="#top" className="flex items-center gap-3 font-semibold tracking-normal text-cockpit-text">
          <span className="grid h-8 w-8 place-items-center border border-cockpit-cyan/50 bg-cockpit-bg3 text-cockpit-cyan">
            TT
          </span>
          <span>TRADING.TERMINAL</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-cockpit-dim transition hover:text-cockpit-text">
              {item.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="border border-cockpit-cyan/50 px-4 py-2 text-sm font-semibold text-cockpit-cyan transition hover:bg-cockpit-cyan/10"
          >
            Ver planes
          </a>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center border border-cockpit-border text-cockpit-text md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {isOpen && (
        <div className="section-shell grid gap-2 border-t border-cockpit-border py-4 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-2 py-2 text-sm text-cockpit-text"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
