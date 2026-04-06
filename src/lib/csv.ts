import fs, { readdirSync, readFileSync } from "fs";
import path from "path";
import { parseNumber } from "./parse-number";
import { parseDate } from "./parse-date";
import type { Transaction } from "@/types/transaction";

const VERILER_DIR = "veriler";
const CATEGORY_FILE_PREFIX = "ocak ayı rapor.XLS - ";
const TUM_LIST_PATTERN = /t[uü]m[\s_]*list/i;

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

  // 1. Try hardcoded prefix (legacy)
  if (base.startsWith(CATEGORY_FILE_PREFIX)) {
    return base.slice(CATEGORY_FILE_PREFIX.length).trim();
  }

  // 2. Try generic separators
  // "ocak ayı rapor.XLS - ambalaj.csv" -> "ambalaj"
  if (base.includes(" - ")) {
    return base.split(" - ").pop()?.trim() || "";
  }

  // "ocak_ayi_rapor.XLS_-_ambalaj.csv" -> "ambalaj"
  if (base.includes("_-_")) {
    return base.split("_-_").pop()?.trim() || "";
  }

  // "ocak_ayi_rapor.XLS-ambalaj.csv" -> "ambalaj"
  if (base.includes(".XLS-")) {
    return base.split(".XLS-").pop()?.trim() || "";
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
  let total = parseNumber(get("TOPLAM_FIYAT"));
  const unitPrice = parseNumber(get("BR_FIYAT"));
  const qty = parseNumber(get("MIKTAR"));
  if (total <= 0 && unitPrice > 0 && qty > 0) total = Math.round(unitPrice * qty * 100) / 100;

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

function isTumListFile(fileName: string): boolean {
  return TUM_LIST_PATTERN.test(fileName);
}

/**
 * Read all CSV files from veriler/ and return merged transactions.
 * Per period folder: if "tüm list" file exists, use it as sole source (correct total).
 * Otherwise use category files.
 * Deduplicates by belgeNo+stokKodu+product+date+total.
 */
export function loadTransactionsFromCsv(options?: {
  dataDir?: string;
  includeTumList?: boolean;
}): Transaction[] {
  const dataDir = options?.dataDir ?? path.join(process.cwd(), VERILER_DIR);

  function getFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    try {
      const list = readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFilesRecursively(filePath));
        } else if (file.toLowerCase().endsWith(".csv")) {
          results.push(filePath);
        }
      });
    } catch {
      return [];
    }
    return results;
  }

  const files = getFilesRecursively(dataDir);

  // Group files by parent directory (period folder)
  const filesByDir = new Map<string, string[]>();
  for (const filePath of files) {
    const dir = path.dirname(filePath);
    if (!filesByDir.has(dir)) filesByDir.set(dir, []);
    filesByDir.get(dir)!.push(filePath);
  }

  const seen = new Set<string>();
  const transactions: Transaction[] = [];

  for (const [dir, dirFiles] of filesByDir) {
    const tumListFile = dirFiles.find((f) => isTumListFile(path.basename(f)));
    const categoryFiles = dirFiles.filter((f) => !isTumListFile(path.basename(f)));

    if (tumListFile && categoryFiles.length > 0) {
      // Both tüm list AND category files exist:
      // Build a category lookup map from category files (belgeNo|stokKodu|date|qty|unitPrice → category)
      // Then load tüm list rows with category enrichment from the map.
      const categoryMap = new Map<string, string>();
      for (const filePath of categoryFiles) {
        const fileName = path.basename(filePath);
        const cat = getCategoryFromFilename(fileName);
        if (!cat) continue;
        let content: string;
        try { content = readFileSync(filePath, "utf-8"); } catch { continue; }
        const rows = parseCsvContent(content);
        if (rows.length < 2) continue;
        const headers = rows[0].map((h) => h.trim().replace(/^["']|["']$/g, ""));
        for (const row of rows.slice(1)) {
          const tx = rowToTransaction(row, headers, cat);
          if (!tx || tx.total <= 0) continue;
          const key = `${tx.belgeNo ?? ""}|${tx.stokKodu ?? ""}|${tx.date}|${tx.qty}|${tx.unitPrice}`;
          if (!categoryMap.has(key)) categoryMap.set(key, cat);
        }
      }

      // Load tüm list rows, assign category from map or fall back to "tümü"
      let content: string;
      try { content = readFileSync(tumListFile, "utf-8"); } catch { continue; }
      const rows = parseCsvContent(content);
      if (rows.length < 2) continue;
      const headers = rows[0].map((h) => h.trim().replace(/^["']|["']$/g, ""));
      for (const row of rows.slice(1)) {
        const tx = rowToTransaction(row, headers, "tümü");
        if (!tx || tx.total <= 0) continue;
        const lookupKey = `${tx.belgeNo ?? ""}|${tx.stokKodu ?? ""}|${tx.date}|${tx.qty}|${tx.unitPrice}`;
        tx.category = categoryMap.get(lookupKey) ?? "tümü";
        transactions.push(tx);
      }
    } else {
      // Only one source available: use tüm list or category files
      const filesToLoad = tumListFile
        ? [tumListFile]
        : categoryFiles;

      for (const filePath of filesToLoad) {
        const fileName = path.basename(filePath);
        const category = tumListFile ? "tümü" : getCategoryFromFilename(fileName);
        if (!tumListFile && !category) continue;

        let content: string;
        try { content = readFileSync(filePath, "utf-8"); } catch { continue; }

        const rows = parseCsvContent(content);
        if (rows.length < 2) continue;

        const headers = rows[0].map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const dataRows = rows.slice(1);

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const cat = category || "tümü";
          const tx = rowToTransaction(row, headers, cat);
          if (!tx || tx.total <= 0) continue;

          if (tumListFile) {
            transactions.push(tx);
          } else {
            const key = `${tx.belgeNo ?? ""}|${tx.stokKodu ?? ""}|${tx.date}|${tx.product}|${tx.total}|${tx.qty}|${tx.unitPrice}`;
            if (seen.has(key)) continue;
            seen.add(key);
            transactions.push(tx);
          }
        }
      }
    }
  }

  return transactions.sort((a, b) => {
    const [da, ma, ya] = a.date.split(".");
    const [db, mb, yb] = b.date.split(".");
    const cmp = parseInt(ya + ma.padStart(2, "0") + da.padStart(2, "0"), 10) -
                parseInt(yb + mb.padStart(2, "0") + db.padStart(2, "0"), 10);
    return cmp !== 0 ? cmp : a.total - b.total;
  });
}
