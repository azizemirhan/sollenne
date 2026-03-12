import { loadTransactionsFromCsv } from "../src/lib/csv";

console.log("Loading transactions...");
const transactions = loadTransactionsFromCsv();
console.log(`Total transactions: ${transactions.length}`);

// Group by month
const byMonth: Record<string, number> = {};
transactions.forEach(t => {
    const [d, m, y] = t.date.split(".");
    const key = `${y}-${m}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
});

console.log("Transactions by month:", byMonth);

// Group by category
const byCategory: Record<string, number> = {};
transactions.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
});
console.log("Transactions by category:", byCategory);
