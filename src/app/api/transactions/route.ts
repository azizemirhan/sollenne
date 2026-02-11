import { NextRequest, NextResponse } from "next/server";
import { loadTransactionsFromCsv } from "@/lib/csv";
import { filterByRange } from "@/lib/filter-transactions";
import type { Transaction } from "@/types/transaction";

export const dynamic = "force-static";
export const revalidate = 0;

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
