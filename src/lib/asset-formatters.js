export function formatCurrencyCompact(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return `$${formatNumberCompact(number)}`;
}

export function formatNumberCompact(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";

  const abs = Math.abs(number);
  const units = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];
  const unit = units.find(item => abs >= item.value);
  if (!unit) return number.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return `${(number / unit.value).toLocaleString("en-US", { maximumFractionDigits: 2 })}${unit.suffix}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

export function formatSupply(value, symbol) {
  const formatted = formatNumberCompact(value);
  return formatted === "N/A" ? "N/A" : `${formatted} ${symbol || ""}`.trim();
}

export function formatNullable(value, formatter = value => value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return formatter(value);
}
