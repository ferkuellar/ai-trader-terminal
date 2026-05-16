export function TerminalShell({ left, main, right, className = "" }) {
  if (!left) {
    return (
      <div
        className={`grid w-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_500px] ${className}`}
      >
        <main className="flex min-w-0 flex-col gap-4">
          {main}
        </main>

        <aside className="flex min-w-0 flex-col gap-4">
          {right}
        </aside>
      </div>
    );
  }

  return (
    <div
      className={`grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.4fr)] xl:grid-cols-[280px_minmax(0,1fr)_400px] 2xl:grid-cols-[320px_minmax(0,1fr)_500px] ${className}`}
    >
      <aside className="flex min-w-0 flex-col gap-4">
        {left}
      </aside>

      <main className="flex min-w-0 flex-col gap-4">
        {main}
      </main>

      <aside className="flex min-w-0 flex-col gap-4">
        {right}
      </aside>
    </div>
  );
}
