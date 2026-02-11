import type { Transaction } from "@/types/transaction";

export function parseDateToComparable(dateStr: string): number {
  const parts = dateStr.trim().split(".");
  if (parts.length < 3) return 0;
  const [d, m, y] = parts;
  return parseInt(y + m.padStart(2, "0") + d.padStart(2, "0"), 10);
}

export function filterByRange(
  transactions: Transaction[],
  startDate: string | null,
  endDate: string | null,
  categories: string[]
): Transaction[] {
  let result = transactions;
  if (categories.length > 0) {
    const set = new Set(categories);
    result = result.filter((t) => set.has(t.category));
  }
  if (startDate) {
    const start = parseDateToComparable(startDate);
    result = result.filter((t) => parseDateToComparable(t.date) >= start);
  }
  if (endDate) {
    const end = parseDateToComparable(endDate);
    result = result.filter((t) => parseDateToComparable(t.date) <= end);
  }
  return result;
}
