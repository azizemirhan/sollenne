/**
 * Build-time script: load CSV from veriler/ and write public/transactions.json.
 * Run before next build so static deploy (e.g. Cloudflare) can serve data.
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadTransactionsFromCsv } from "../src/lib/csv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const outPath = path.join(publicDir, "transactions.json");

const transactions = loadTransactionsFromCsv({ includeTumList: false });
mkdirSync(publicDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(transactions), "utf-8");
console.log(`Wrote ${transactions.length} transactions to ${outPath}`);
