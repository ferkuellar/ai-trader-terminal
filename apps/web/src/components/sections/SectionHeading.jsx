export default function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cockpit-cyan">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-cockpit-text md:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-sm leading-7 text-cockpit-dim md:text-base">{copy}</p>}
    </div>
  );
}
