/**
 * Build-time script: load CSV from veriler/ and write public/transactions.json.
 * Run before next build so static deploy (e.g. Cloudflare) can serve data.
 *
 * Merges new CSV data with existing transactions.json so that periods
 * whose CSVs are not present in veriler/ are not lost.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadTransactionsFromCsv } from "../src/lib/csv";
import type { Transaction } from "../src/types/transaction";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const outPath = path.join(publicDir, "transactions.json");

// Load from CSVs
const fromCsv = loadTransactionsFromCsv({ includeTumList: false });

// Load existing transactions.json (if present) to preserve data not in veriler/
let existing: Transaction[] = [];
if (existsSync(outPath)) {
  try {
    existing = JSON.parse(readFileSync(outPath, "utf-8"));
  } catch { /* ignore */ }
}

// Determine which periods are covered by CSV files
const csvPeriods = new Set(
  fromCsv.map((t) => {
    const [, m, y] = t.date.split(".");
    return `${y}-${m.padStart(2, "0")}`;
  })
);

// Keep existing records whose period is NOT covered by fresh CSV data
const preserved = existing.filter((t) => {
  const [, m, y] = t.date.split(".");
  return !csvPeriods.has(`${y}-${m.padStart(2, "0")}`);
});

// Merge and sort
const combined = [...preserved, ...fromCsv].sort((a, b) => {
  const [da, ma, ya] = a.date.split(".");
  const [db, mb, yb] = b.date.split(".");
  return (
    parseInt(ya + ma.padStart(2, "0") + da.padStart(2, "0"), 10) -
    parseInt(yb + mb.padStart(2, "0") + db.padStart(2, "0"), 10)
  );
});

mkdirSync(publicDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(combined, null, 0), "utf-8");
console.log(
  `Wrote ${combined.length} transactions to ${outPath} ` +
  `(${preserved.length} preserved + ${fromCsv.length} from CSV)`
);
