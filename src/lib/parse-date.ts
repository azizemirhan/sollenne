/**
 * Normalizes date strings from CSV (DD.MM.YYYY or "DD,MM,YYYY") to DD.MM.YYYY.
 */
export function parseDate(value: string | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value).trim().replace(/^["']|["']$/g, "");
  const parts = raw.split(/[.,]/).map((p) => p.trim());
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  const day = d.length === 1 ? `0${d}` : d;
  const month = m.length === 1 ? `0${m}` : m;
  return `${day}.${month}.${y}`;
}
