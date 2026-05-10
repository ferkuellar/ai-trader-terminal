export function formatRelativeTime(date, now = new Date()) {
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (seconds < 3) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.max(1, Math.floor(seconds / 60));
  return `${minutes}m ago`;
}
