import { NextRequest, NextResponse } from "next/server";
import { loadTransactionsFromCsv } from "@/lib/csv";
import type { Transaction } from "@/types/transaction";

function parseDateToComparable(dateStr: string): number {
  const parts = dateStr.trim().split(".");
  if (parts.length < 3) return 0;
  const [d, m, y] = parts;
  return parseInt(y + m.padStart(2, "0") + d.padStart(2, "0"), 10);
}

function filterByRange(
  transactions: Transaction[],
  startDate: string | null,
  endDate: string | null,
  categories: string[]
): Transaction[] {
  let result = transactions;
  if (categories.length > 0) {
    const set = new Set(categories);
    result = result.filter((t) => set.has(t.category));
  }
  if (startDate) {
    const start = parseDateToComparable(startDate);
    result = result.filter((t) => parseDateToComparable(t.date) >= start);
  }
  if (endDate) {
    const end = parseDateToComparable(endDate);
    result = result.filter((t) => parseDateToComparable(t.date) <= end);
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.getAll("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const compareStart = searchParams.get("compareStart");
    const compareEnd = searchParams.get("compareEnd");

    const allTransactions: Transaction[] = loadTransactionsFromCsv({ includeTumList: false });
    const current = filterByRange(allTransactions, startDate, endDate, categories);

    if (compareStart && compareEnd) {
      const compare = filterByRange(allTransactions, compareStart, compareEnd, categories);
      return NextResponse.json({ current, compare });
    }

    return NextResponse.json(current);
  } catch (e) {
    console.error("Transactions API error:", e);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}
