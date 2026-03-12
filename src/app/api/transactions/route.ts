import { NextRequest, NextResponse } from "next/server";
import { loadTransactionsFromCsv } from "@/lib/csv";
import { filterByRange } from "@/lib/filter-transactions";

export const dynamic = 'force-dynamic'; // Disable caching for live updates

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categories = searchParams.getAll("category");
    const compareStart = searchParams.get("compareStart");
    const compareEnd = searchParams.get("compareEnd");

    // Read fresh data on every request
    const allTransactions = loadTransactionsFromCsv({ includeTumList: false });

    // Filter main dataset
    const current = filterByRange(allTransactions, startDate, endDate, categories);

    // Filter comparison dataset if requested
    let compare: typeof current = [];
    if (compareStart && compareEnd) {
      compare = filterByRange(allTransactions, compareStart, compareEnd, categories);
      return NextResponse.json({ current, compare });
    }

    // If no comparison, return just the filtered array (backward compatibility or simple mode)
    // The frontend expects array if not comparison, or { current, compare } if comparison.
    // However, looking at page.tsx:
    // setTransactions(data.current) if compareRange...
    // The page handles both { current: [...] } and [...]. 
    // BUT we must return the filtered list.

    return NextResponse.json(current);
  } catch (error) {
    console.error("Transaction load error:", error);
    return NextResponse.json({ error: "Veriler yüklenemedi." }, { status: 500 });
  }
}
