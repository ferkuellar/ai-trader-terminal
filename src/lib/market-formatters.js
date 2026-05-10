export function formatCurrency(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: number >= 1000 ? 2 : number >= 1 ? 4 : 8,
  }).format(number);
}

export function formatCompactCurrency(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";

  return `$${formatCompactNumber(number)}`;
}

export function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";

  const abs = Math.abs(number);
  const units = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];
  const unit = units.find(item => abs >= item.value);
  if (!unit) return number.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return `${(number / unit.value).toLocaleString("en-US", {
    maximumFractionDigits: abs >= unit.value * 100 ? 1 : 2,
  })}${unit.suffix}`;
}

export function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

export function formatSupply(value, symbol) {
  const formatted = formatCompactNumber(value);
  return formatted === "-" ? "-" : `${formatted} ${symbol || ""}`.trim();
}

export function getPercentTone(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "text-zinc-400";
  return number > 0 ? "text-emerald-400" : "text-red-400";
}
