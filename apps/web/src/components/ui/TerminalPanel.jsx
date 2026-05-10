const accentClass = {
  cyan: "text-cockpit-cyan",
  amber: "text-cockpit-amber",
  green: "text-cockpit-green",
  red: "text-cockpit-red",
  text: "text-cockpit-text",
};

const dotClass = {
  cyan: "bg-cockpit-cyan shadow-[0_0_10px_rgba(0,212,255,0.7)]",
  amber: "bg-cockpit-amber shadow-[0_0_10px_rgba(255,179,0,0.7)]",
  green: "bg-cockpit-green shadow-[0_0_10px_rgba(0,230,118,0.7)]",
  red: "bg-cockpit-red shadow-[0_0_10px_rgba(255,59,48,0.7)]",
  text: "bg-cockpit-text",
};

export default function TerminalPanel({ code, title, status, tone = "amber", children, className = "", bodyClassName = "" }) {
  return (
    <section className={`overflow-hidden border border-cockpit-border bg-cockpit-bg2/90 shadow-terminal ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-cockpit-border bg-cockpit-text/[0.02] px-4 py-3 text-[10px] uppercase tracking-[0.18em]">
        <div className="flex min-w-0 items-center gap-4">
          <span className={`font-bold ${accentClass[tone]}`}>{code}</span>
          <span className="truncate text-cockpit-text">{title}</span>
        </div>
        {status && (
          <span className={`flex shrink-0 items-center gap-2 ${accentClass[status.tone || tone]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass[status.tone || tone]}`} />
            {status.label}
          </span>
        )}
      </header>
      <div className={`p-5 md:p-8 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
