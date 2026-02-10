import { readdirSync, readFileSync } from "fs";
import path from "path";
import { parseNumber } from "./parse-number";
import { parseDate } from "./parse-date";
import type { Transaction } from "@/types/transaction";

const VERILER_DIR = "veriler";
const CATEGORY_FILE_PREFIX = "ocak ayı rapor.XLS - ";
const TUM_LIST_PATTERN = "tüm list";

export interface CsvRow {
  BELGE_NO: string;
  TARIH: string;
  STOK_KODU: string;
  STOK_ADI: string;
  MIKTAR: string;
  BİRİM: string;
  BR_FIYAT: string;
  TOPLAM_FIYAT: string;
  CARI_ISIM: string;
}

/**
 * Extract category slug from filename.
 * "ocak ayı rapor.XLS - sunta&mdf-kontra-pvc.csv" -> "sunta&mdf-kontra-pvc"
 */
export function getCategoryFromFilename(filename: string): string {
  const base = filename.replace(/\.csv$/i, "").trim();
  if (base.startsWith(CATEGORY_FILE_PREFIX)) {
    return base.slice(CATEGORY_FILE_PREFIX.length).trim();
  }
  return "";
}

/**
 * Simple CSV line parser that respects quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvContent(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  return lines.map((l) => parseCsvLine(l));
}

function rowToTransaction(row: string[], headers: string[], category: string): Transaction | null {
  const get = (key: string): string => {
    const i = headers.indexOf(key);
    if (i < 0) return "";
    return (row[i] ?? "").trim().replace(/^["']|["']$/g, "");
  };

  const date = parseDate(get("TARIH"));
  const total = parseNumber(get("TOPLAM_FIYAT"));
  const unitPrice = parseNumber(get("BR_FIYAT"));
  const qty = parseNumber(get("MIKTAR"));

  if (!date) return null;

  const supplier = get("CARI_ISIM");
  const product = get("STOK_ADI");
  const unit = get("BİRİM");
  const belgeNo = get("BELGE_NO");
  const stokKodu = get("STOK_KODU");

  return {
    date,
    category,
    supplier,
    product,
    qty,
    unit,
    unitPrice,
    total,
    belgeNo,
    stokKodu,
  };
}

/**
 * Read all category CSV files from veriler/ and return merged transactions.
 * Skips "ocak rapor tüm list..csv" to avoid double-counting.
 * Deduplicates by belgeNo+stokKodu+product+date+total to keep first occurrence.
 */
export function loadTransactionsFromCsv(options?: {
  dataDir?: string;
  includeTumList?: boolean;
}): Transaction[] {
  const dataDir = options?.dataDir ?? path.join(process.cwd(), VERILER_DIR);
  const includeTumList = options?.includeTumList ?? false;

  let files: string[];
  try {
    files = readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith(".csv"));
  } catch {
    return [];
  }

  const seen = new Set<string>();
  const transactions: Transaction[] = [];

  for (const file of files) {
    if (!includeTumList && file.toLowerCase().includes(TUM_LIST_PATTERN)) continue;

    const category = getCategoryFromFilename(file);
    if (!category && !includeTumList) continue;

    const filePath = path.join(dataDir, file);
    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    const rows = parseCsvContent(content);
    if (rows.length < 2) continue;

    const headers = rows[0].map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const cat = category || "tümü";
      const tx = rowToTransaction(row, headers, cat);
      if (!tx || tx.total <= 0) continue;

      const key = `${tx.belgeNo ?? ""}|${tx.stokKodu ?? ""}|${tx.date}|${tx.product}|${tx.total}`;
      if (seen.has(key)) continue;
      seen.add(key);

      transactions.push(tx);
    }
  }

  return transactions.sort((a, b) => {
    const [da, ma] = a.date.split(".");
    const [db, mb] = b.date.split(".");
    const cmp = parseInt(ma + da, 10) - parseInt(mb + db, 10);
    return cmp !== 0 ? cmp : a.total - b.total;
  });
}
