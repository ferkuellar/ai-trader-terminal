export const normalizeUiToken = (value) =>
  String(value || "")
    .trim()
    .replace(/^\//, "")
    .replace(/\/USDT$/i, "")
    .replace(/USDT$/i, "")
    .toUpperCase();

export const parseWatchlistInput = (value) =>
  String(value || "")
    .split(/[,\n ]+/)
    .map(normalizeUiToken)
    .filter(Boolean)
    .filter((token, index, arr) => arr.indexOf(token) === index);

export const riskClass = (risk) => {
  if (risk === "Low") return "text-emerald-400";
  if (risk === "Medium") return "text-amber-400";
  if (risk === "High") return "text-red-400";
  return "text-zinc-400";
};

export const signalAccent = (signal) => {
  if (signal === "BUY" || signal === "ACCUMULATE") return "emerald";
  if (signal === "WATCH" || signal === "HOLD") return "amber";
  if (signal === "AVOID") return "red";
  return "zinc";
};

export const watchlistSignalClass = (signal) => {
  if (signal === "BUY") return "text-emerald-400";
  if (signal === "ACCUMULATE") return "text-cyan-400";
  if (signal === "HOLD") return "text-zinc-300";
  if (signal === "WATCH") return "text-amber-400";
  if (signal === "AVOID") return "text-red-400";
  return "text-zinc-400";
};
