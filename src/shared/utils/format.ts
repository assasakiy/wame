export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function timeAgo(value: Date | string | null | undefined): string {
  if (!value) return "never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export const limitLabel = (n: number) => (n >= 1_000_000 ? "Unlimited" : formatNumber(n));

/** Returns the number of calendar days remaining, rounded up for an expiry banner. */
export const daysUntil = (value: Date | string) =>
  Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
