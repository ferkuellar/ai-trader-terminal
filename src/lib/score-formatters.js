export const fmt = (n, d = 2) =>
  Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export const fmtPrice = (n) => {
  const v = Number(n);
  if (v >= 1000) return fmt(v, 2);
  if (v >= 1) return fmt(v, 4);
  return fmt(v, 6);
};

export const fmtVolume = (n) => {
  const v = Number(n);
  if (v >= 1e9) return `${fmt(v / 1e9, 2)}B`;
  if (v >= 1e6) return `${fmt(v / 1e6, 2)}M`;
  if (v >= 1e3) return `${fmt(v / 1e3, 2)}K`;
  return fmt(v, 0);
};

export const scoreValue = (value) =>
  typeof value === "number" ? fmt(value, 0) : "-";

export const sign = (n) => (n > 0 ? "+" : "");
