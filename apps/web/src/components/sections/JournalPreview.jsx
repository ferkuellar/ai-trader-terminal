import { journalRows } from "../../data/features";
import TerminalPanel from "../ui/TerminalPanel";

export default function JournalPreview() {
  return (
    <section id="journal" className="border-b border-cockpit-border py-20">
      <div className="section-shell">
        <TerminalPanel code="JRN-05" title="Journal · Ultimas operaciones" status={{ label: "SYNC", tone: "green" }} tone="amber">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cockpit-amber">M-01 · Journal</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight text-cockpit-text md:text-3xl">
                Cada trade queda listo para revision.
              </h3>
              <p className="mt-4 text-sm leading-7 text-cockpit-dim">
                Entrada, salida, R-multiple, setup, tamano, nota y evidencia. El objetivo es auditar el proceso con datos,
                no perseguir senales.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-cockpit-dim">
                <li>
                  <span className="text-cockpit-green">✓</span> Captura automatica de contexto
                </li>
                <li>
                  <span className="text-cockpit-green">✓</span> Etiquetas de setup y sesion
                </li>
                <li>
                  <span className="text-cockpit-green">✓</span> Evidencia para revision semanal
                </li>
              </ul>
            </div>
            <div className="w-full overflow-x-auto border border-cockpit-border bg-cockpit-bg">
              <div className="grid min-w-[620px] grid-cols-[64px_1.5fr_1fr_72px_72px_44px] border-b border-cockpit-border px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-cockpit-dim">
                <span>#</span>
                <span>Par</span>
                <span>Setup</span>
                <span>Size</span>
                <span>R</span>
                <span>Res</span>
              </div>
              {journalRows.map((row) => (
                <div
                  key={row.id}
                  className="grid min-w-[620px] grid-cols-[64px_1.5fr_1fr_72px_72px_44px] border-b border-cockpit-border px-4 py-3 text-xs last:border-b-0"
                >
                  <span className="text-cockpit-dim">#{row.id}</span>
                  <span className="text-cockpit-text">{row.pair}</span>
                  <span className="text-cockpit-dim">{row.setup}</span>
                  <span className="text-cockpit-dim">{row.size}</span>
                  <span className={row.positive ? "text-cockpit-green" : "text-cockpit-red"}>{row.result}</span>
                  <span className={row.positive ? "text-cockpit-green" : "text-cockpit-red"}>●</span>
                </div>
              ))}
            </div>
          </div>
        </TerminalPanel>
      </div>
    </section>
  );
}
