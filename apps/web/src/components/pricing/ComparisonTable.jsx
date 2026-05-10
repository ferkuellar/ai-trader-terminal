import { ChevronDown } from "lucide-react";
import { Fragment } from "react";
import { useState } from "react";
import { comparisonSections } from "../../data/pricing";

function CellValue({ value }) {
  if (value === true) return <span className="text-cockpit-green">✔</span>;
  if (value === false) return <span className="text-lg leading-none text-cockpit-border2">-</span>;
  return <span className="text-cockpit-amber">{value}</span>;
}

export default function ComparisonTable() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-auto mt-10 max-w-[1100px]">
      <div className="text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-cockpit-border px-5 py-2 text-xs uppercase tracking-[0.1em] text-cockpit-dim transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
        >
          {isOpen ? "Cerrar tabla comparativa" : "Ver tabla comparativa completa"}
          <ChevronDown className={`transition ${isOpen ? "rotate-180" : ""}`} size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border border-cockpit-border bg-cockpit-bg2 text-xs">
            <thead>
              <tr className="border-b-2 border-cockpit-border2 bg-cockpit-bg3 text-[10px] uppercase tracking-[0.12em] text-cockpit-dim">
                <th className="w-[38%] px-4 py-4 text-left">Feature</th>
                <th className="px-4 py-4 text-center">TRADER</th>
                <th className="px-4 py-4 text-center text-cockpit-amber">PRO</th>
                <th className="px-4 py-4 text-center text-cockpit-green">TEAM</th>
              </tr>
            </thead>
            <tbody>
              {comparisonSections.map((section) => (
                <Fragment key={section.label}>
                  <tr className="bg-cockpit-bg3 text-[9px] uppercase tracking-[0.2em] text-cockpit-dim">
                    <td colSpan="4" className="px-4 py-2">
                      {section.label}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-cockpit-border transition hover:bg-cockpit-text/[0.018]">
                      <td className="px-4 py-3 text-left text-cockpit-dim">{row.feature}</td>
                      <td className="px-4 py-3 text-center">
                        <CellValue value={row.trader} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue value={row.pro} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CellValue value={row.team} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
