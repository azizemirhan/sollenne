/**
 * Normalizes date strings from CSV (DD.MM.YYYY, DD,MM,YYYY, DD-MM-YYYY) to DD.MM.YYYY.
 */
export function parseDate(value: string | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value).trim().replace(/^["']|["']$/g, "");
  const parts = raw.split(/[.,\-\s/]/).filter((p) => p.length > 0);
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!/^\d{1,4}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{2,4}$/.test(y)) return "";
  const day = d.length === 1 ? `0${d}` : d;
  const month = m.length === 1 ? `0${m}` : m;
  const year = y.length === 2 ? (parseInt(y, 10) >= 50 ? `19${y}` : `20${y}`) : y;
  return `${day}.${month}.${year}`;
}
