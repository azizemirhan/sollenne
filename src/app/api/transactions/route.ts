import { NextRequest, NextResponse } from "next/server";
import { loadTransactionsFromCsv } from "@/lib/csv";
import type { Transaction } from "@/types/transaction";

function parseDateToComparable(dateStr: string): number {
  const parts = dateStr.trim().split(".");
  if (parts.length < 3) return 0;
  const [d, m, y] = parts;
  return parseInt(y + m.padStart(2, "0") + d.padStart(2, "0"), 10);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.getAll("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let transactions: Transaction[] = loadTransactionsFromCsv({ includeTumList: false });

    if (categories.length > 0) {
      const set = new Set(categories);
      transactions = transactions.filter((t) => set.has(t.category));
    }

    if (startDate) {
      const start = parseDateToComparable(startDate);
      transactions = transactions.filter((t) => parseDateToComparable(t.date) >= start);
    }
    if (endDate) {
      const end = parseDateToComparable(endDate);
      transactions = transactions.filter((t) => parseDateToComparable(t.date) <= end);
    }

    return NextResponse.json(transactions);
  } catch (e) {
    console.error("Transactions API error:", e);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}
