export function TerminalPanel({ title, subtitle, action, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/70 shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="min-w-0">
            {title && (
              <div className="truncate text-[11px] tracking-[0.2em] text-zinc-300">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="mt-0.5 truncate text-[10px] text-zinc-500">
                {subtitle}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
