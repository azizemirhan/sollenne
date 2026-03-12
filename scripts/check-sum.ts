import fs from "fs";
import path from "path";
import { loadTransactionsFromCsv } from "../src/lib/csv";

const dataDir = path.join(process.cwd(), "veriler");
const transactions = loadTransactionsFromCsv({ dataDir });

const feb = transactions.filter((t) => t.date.endsWith(".02.2026"));
const total = feb.reduce((s, t) => s + t.total, 0);

const tumListPath = path.join(dataDir, "2026-02", "subat_ayi_rapor.XLS_-_tum_list.csv");
const csv = fs.existsSync(tumListPath) ? fs.readFileSync(tumListPath, "utf-8") : "";
const lines = csv.split(/\r?\n/).filter((l) => l.trim());
const csvRows = Math.max(0, lines.length - 1);

console.log("CSV rows (tum list):", csvRows);
console.log("February transactions loaded:", feb.length);
console.log("February total:", total.toLocaleString("tr-TR"));
