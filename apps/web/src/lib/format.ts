const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Whole-number formatting with thousands separators. */
export function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

/** USD amount, e.g. "USD 24,500". Kept as a prefix (not a currency symbol) to
 *  match how the API and the rest of the product talk about money. */
export function formatCurrency(value: number | null | undefined) {
  return `USD ${formatNumber(value)}`;
}

/** Medium-style date, e.g. "12 Mar 2027". Falls back to "Rolling" when empty. */
export function formatDate(value?: string | Date | null, fallback = "Rolling") {
  if (!value) {
    return fallback;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Relative time for feeds, e.g. "3h ago". */
export function formatTimeAgo(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
