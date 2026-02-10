/**
 * Parses numeric strings that may be in TR (1.234,56) or EN (1,234.56) format.
 */
export function parseNumber(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const raw = String(value).trim().replace(/^["']|["']$/g, "");
  if (raw === "") return 0;

  const tryEn = (): number => {
    const s = raw.replace(/,/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const tryTr = (): number => {
    const s = raw.replace(/\./g, "").replace(/,/, ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  let n = tryEn();
  if (!Number.isFinite(n)) n = tryTr();
  if (!Number.isFinite(n)) n = tryTr(); // try TR if EN had comma as decimal in weird case
  return Number.isFinite(n) ? n : 0;
}
