"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";
import type { BudgetInfo } from "@/components/dashboard/GenelTab";
import {
  GenelTab,
  KategoriTab,
  TedarikciTab,
  TrendlerTab,
  AnomaliTab,
} from "@/components/dashboard";
import {
  Calendar,
  Package,
  RotateCcw,
  ChevronDown,
  BarChart3,
  Boxes,
  Building2,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  FileDown,
  Wallet,
  Check,
  X,
  Filter,
  Download,
  RefreshCw,
  BookOpen,
  LogOut,
} from "lucide-react";
import { QUICK_REPORT_TITLE, QUICK_REPORT_CONTENT } from "@/constants/quickReport";
import { filterByRange } from "@/lib/filter-transactions";
import { LoginScreen, getStoredAuth, setStoredAuth } from "@/components/auth/LoginScreen";

/* ─── helpers ─── */

/** DD.MM.YYYY → YYYY-MM-DD (for <input type="date">) */
function toIsoDate(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split(".");
  if (parts.length < 3) return "";
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

/** YYYY-MM-DD → DD.MM.YYYY */
function fromIsoDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** DD.MM.YYYY → comparable number */
function dateToNum(d: string): number {
  const parts = d.split(".");
  if (parts.length < 3) return 0;
  return parseInt(parts[2] + parts[1] + parts[0], 10);
}

function getMonthName(month: number): string {
  const names = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return names[month] || "";
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function exportCsv(transactions: Transaction[]) {
  const header = "Tarih,Kategori,Tedarikci,Urun,Miktar,Birim,Birim Fiyat,Toplam\n";
  const rows = transactions.map(
    (t) =>
      `${t.date},"${getCategoryLabel(t.category)}","${t.supplier}","${t.product}",${t.qty},"${t.unit}",${t.unitPrice},${t.total}`
  );
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "satin-alma-rapor.csv";
  a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(transactions: Transaction[]) {
  const XLSX = await import("xlsx");
  const data = transactions.map((t) => ({
    Tarih: t.date,
    Kategori: getCategoryLabel(t.category),
    "Tedarikçi": t.supplier,
    "Ürün": t.product,
    Miktar: t.qty,
    Birim: t.unit,
    "Birim Fiyat": t.unitPrice,
    Toplam: t.total,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "İşlemler");
  XLSX.writeFile(wb, "satin-alma-rapor.xlsx");
}

async function exportPdf(containerId: string, title: string) {
  const html2canvas = (await import("html2canvas")).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jspdfModule = await import("jspdf") as any;
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
  const el = document.getElementById(containerId);
  if (!el) return;
  const canvas = await html2canvas(el, { backgroundColor: "#FFFFFF", scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.setFontSize(14);
  pdf.text(title, 10, 12);
  let y = 18;
  const pageHeight = pdf.internal.pageSize.getHeight() - 20;
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
  } else {
    let srcY = 0;
    while (srcY < canvas.height) {
      const sliceHeight = Math.min(
        canvas.height - srcY,
        (pageHeight * canvas.width) / imgWidth
      );
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, sliceCanvas.width, sliceHeight);
      const sliceImg = sliceCanvas.toDataURL("image/png");
      const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
      if (srcY > 0) pdf.addPage();
      pdf.addImage(sliceImg, "PNG", 10, srcY === 0 ? y : 10, imgWidth, sliceImgHeight);
      srcY += sliceHeight;
    }
  }
  pdf.save("satin-alma-rapor.pdf");
}

/* ─── presets ─── */

const DATE_PRESETS = [
  { label: "Bu ay", getRange: () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return {
      start: `01.${String(m + 1).padStart(2, "0")}.${y}`,
      end: `${daysInMonth(y, m)}.${String(m + 1).padStart(2, "0")}.${y}`,
    };
  }},
  { label: "Geçen ay", getRange: () => {
    const now = new Date();
    let y = now.getFullYear();
    let m = now.getMonth() - 1;
    if (m < 0) { m = 11; y--; }
    return {
      start: `01.${String(m + 1).padStart(2, "0")}.${y}`,
      end: `${daysInMonth(y, m)}.${String(m + 1).padStart(2, "0")}.${y}`,
    };
  }},
  { label: "Son 3 ay", getRange: () => {
    const now = new Date();
    const endY = now.getFullYear();
    const endM = now.getMonth();
    let startY = endY;
    let startM = endM - 2;
    if (startM < 0) { startM += 12; startY--; }
    return {
      start: `01.${String(startM + 1).padStart(2, "0")}.${startY}`,
      end: `${daysInMonth(endY, endM)}.${String(endM + 1).padStart(2, "0")}.${endY}`,
    };
  }},
  { label: "Ocak 2026", getRange: () => ({ start: "01.01.2026", end: "31.01.2026" }) },
];

const COMPARE_OPTIONS = [
  { value: "", label: "Karşılaştırma yok" },
  { value: "prev_month", label: "Önceki ay" },
  { value: "prev_year", label: "Önceki yıl aynı dönem" },
  { value: "custom", label: "Özel tarih aralığı" },
];

const MONTH_OPTIONS = (() => {
  const months: Array<{ label: string; year: number; month: number }> = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 0; m < 12; m++) {
      months.push({ label: `${getMonthName(m)} ${y}`, year: y, month: m });
    }
  }
  return months;
})();

/* ─── tabs with icons ─── */
const TABS = [
  { id: "genel", label: "Genel Bakış", Icon: BarChart3 },
  { id: "kategori", label: "Kategoriler", Icon: Boxes },
  { id: "tedarikci", label: "Tedarikçiler", Icon: Building2 },
  { id: "trendler", label: "Trendler", Icon: TrendingUp },
  { id: "anomali", label: "Anomaliler", Icon: AlertTriangle },
];

export default function Dashboard() {
  /* ─── auth: sessionStorage ile giriş kontrolü ─── */
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    setAuthenticated(getStoredAuth());
  }, []);

  /* ─── core state ─── */
  const [activeTab, setActiveTab] = useState("genel");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [compareTransactions, setCompareTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  /* ─── filter state ─── */
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("01.01.2026");
  const [endDate, setEndDate] = useState("31.01.2026");
  const [dateError, setDateError] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  /* ─── comparison state ─── */
  const [compareMode, setCompareMode] = useState("");
  const [customCompareStart, setCustomCompareStart] = useState("");
  const [customCompareEnd, setCustomCompareEnd] = useState("");

  /* ─── budget state ─── */
  const [budget, setBudget] = useState<BudgetInfo>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sollenne_budget");
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return { general: 0, byCategory: {} };
  });
  const [budgetInput, setBudgetInput] = useState(budget.general > 0 ? String(budget.general) : "");

  /* ─── refs ─── */
  const dashboardRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  /* ─── close category dropdown on outside click ─── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ─── persist budget ─── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sollenne_budget", JSON.stringify(budget));
    }
  }, [budget]);

  /* ─── date validation ─── */
  useEffect(() => {
    if (startDate && endDate) {
      if (dateToNum(startDate) > dateToNum(endDate)) {
        setDateError("Başlangıç tarihi bitiş tarihinden sonra olamaz");
        return;
      }
    }
    setDateError(null);
  }, [startDate, endDate]);

  /* ─── compute compare date range ─── */
  const compareRange = useMemo(() => {
    if (!compareMode) return null;
    if (compareMode === "custom") {
      if (customCompareStart && customCompareEnd) {
        return { start: customCompareStart, end: customCompareEnd };
      }
      return null;
    }
    const [sd, sm, sy] = startDate.split(".").map(Number);
    const [ed, em, ey] = endDate.split(".").map(Number);
    if (!sd || !sm || !sy || !ed || !em || !ey) return null;

    if (compareMode === "prev_month") {
      let nm = sm - 1;
      let ny = sy;
      if (nm < 1) { nm = 12; ny--; }
      const maxDay = daysInMonth(ny, nm - 1);
      return {
        start: `01.${String(nm).padStart(2, "0")}.${ny}`,
        end: `${Math.min(ed, maxDay)}.${String(nm).padStart(2, "0")}.${ny}`,
      };
    }
    if (compareMode === "prev_year") {
      const maxDayS = daysInMonth(sy - 1, sm - 1);
      const maxDayE = daysInMonth(ey - 1, em - 1);
      return {
        start: `${Math.min(sd, maxDayS)}.${String(sm).padStart(2, "0")}.${sy - 1}`,
        end: `${Math.min(ed, maxDayE)}.${String(em).padStart(2, "0")}.${ey - 1}`,
      };
    }
    return null;
  }, [compareMode, startDate, endDate, customCompareStart, customCompareEnd]);

  /* ─── data fetch ─── */
  const fetchData = useCallback(async () => {
    if (dateError) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      filterCategories.forEach((c) => params.append("category", c));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (compareRange) {
        params.set("compareStart", compareRange.start);
        params.set("compareEnd", compareRange.end);
      }
      let data: Transaction[] | { current: Transaction[]; compare?: Transaction[] };
      const apiRes = await fetch(`/api/transactions?${params.toString()}`).catch(() => null);
      if (apiRes?.ok) {
        data = await apiRes.json();
      } else {
        /* Static deploy (e.g. Cloudflare): API yok, public/transactions.json kullan */
        const staticRes = await fetch("/transactions.json");
        if (!staticRes.ok) throw new Error("Veri yüklenemedi");
        const allTx: Transaction[] = await staticRes.json();
        const current = filterByRange(allTx, startDate || null, endDate || null, filterCategories);
        const compare =
          compareRange?.start && compareRange?.end
            ? filterByRange(allTx, compareRange.start, compareRange.end, filterCategories)
            : [];
        data = compareRange?.start && compareRange?.end ? { current, compare } : current;
        setAvailableCategories((prev) => {
          const cats = [...new Set(allTx.map((t) => t.category))].sort() as string[];
          return prev.length ? prev : cats;
        });
      }

      if (compareRange && data && !Array.isArray(data) && "current" in data) {
        setTransactions(data.current);
        setCompareTransactions(data.compare || []);
      } else {
        const list = Array.isArray(data) ? data : (data as { current?: Transaction[] }).current || [];
        setTransactions(list);
        setCompareTransactions([]);
      }

      setAvailableCategories((prev) => {
        const txList =
          Array.isArray(data) ? data : (data as { current?: Transaction[] }).current || [];
        const cats = [...new Set(txList.map((t: Transaction) => t.category))].sort() as string[];
        return prev.length ? prev : cats;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filterCategories, startDate, endDate, compareRange, dateError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── derived data ─── */
  const stats = useMemo(() => {
    if (!transactions.length)
      return { totalSpend: 0, txCount: 0, suppliers: 0, products: 0, avg: 0, median: 0 };
    const totalSpend = transactions.reduce((s, t) => s + t.total, 0);
    const txCount = transactions.length;
    const suppliers = new Set(transactions.map((t) => t.supplier)).size;
    const products = new Set(transactions.map((t) => t.product)).size;
    const avg = totalSpend / txCount;
    const sorted = [...transactions].sort((a, b) => a.total - b.total);
    const median = sorted[Math.floor(txCount / 2)]?.total ?? 0;
    return { totalSpend, txCount, suppliers, products, avg, median };
  }, [transactions]);

  const compareStats = useMemo(() => {
    if (!compareTransactions.length) return null;
    const totalSpend = compareTransactions.reduce((s, t) => s + t.total, 0);
    const txCount = compareTransactions.length;
    const suppliers = new Set(compareTransactions.map((t) => t.supplier)).size;
    const products = new Set(compareTransactions.map((t) => t.product)).size;
    const avg = totalSpend / txCount;
    const sorted = [...compareTransactions].sort((a, b) => a.total - b.total);
    const median = sorted[Math.floor(txCount / 2)]?.total ?? 0;
    return { totalSpend, txCount, suppliers, products, avg, median };
  }, [compareTransactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      const label = getCategoryLabel(t.category);
      map[label] = (map[label] || 0) + t.total;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const supplierData = useMemo(() => {
    const map: Record<string, { value: number; pct: string }> = {};
    transactions.forEach((t) => {
      const prev = map[t.supplier];
      const value = (prev?.value ?? 0) + t.total;
      map[t.supplier] = {
        value,
        pct: stats.totalSpend ? ((value / stats.totalSpend) * 100).toFixed(1) : "0",
      };
    });
    return Object.entries(map)
      .map(([name, obj]) => ({ name, value: obj.value, pct: obj.pct }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, stats.totalSpend]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      map[t.date] = (map[t.date] || 0) + t.total;
    });
    return Object.entries(map)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => dateToNum(a.date) - dateToNum(b.date));
  }, [transactions]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {
      "Hafta 1 (1-5 Ocak)": 0,
      "Hafta 2 (6-12 Ocak)": 0,
      "Hafta 3 (13-19 Ocak)": 0,
      "Hafta 4 (20-26 Ocak)": 0,
      "Hafta 5 (27-31 Ocak)": 0,
    };
    transactions.forEach((t) => {
      const day = parseInt(t.date.split(".")[0], 10);
      if (day <= 5) weeks["Hafta 1 (1-5 Ocak)"] += t.total;
      else if (day <= 12) weeks["Hafta 2 (6-12 Ocak)"] += t.total;
      else if (day <= 19) weeks["Hafta 3 (13-19 Ocak)"] += t.total;
      else if (day <= 26) weeks["Hafta 4 (20-26 Ocak)"] += t.total;
      else weeks["Hafta 5 (27-31 Ocak)"] += t.total;
    });
    return Object.entries(weeks).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const dayOfWeekData = useMemo(() => {
    const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const map: Record<string, number> = {};
    dayNames.forEach((d) => (map[d] = 0));
    transactions.forEach((t) => {
      const [d, m, y] = t.date.split(".");
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      const dayName = dayNames[dateObj.getDay()];
      map[dayName] += t.total;
    });
    return dayNames.filter((d) => map[d] > 0).map((day) => ({ day, value: map[day] }));
  }, [transactions]);

  const anomalies = useMemo(() => {
    if (!transactions.length) return { threshold: 0, items: [], mean: 0, stdDev: 0 };
    const mean = stats.avg;
    const variance =
      transactions.reduce((s, t) => s + Math.pow(t.total - mean, 2), 0) / transactions.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2 * stdDev;
    return {
      threshold,
      items: transactions.filter((t) => t.total > threshold).sort((a, b) => b.total - a.total),
      mean,
      stdDev,
    };
  }, [transactions, stats.avg]);

  const histogramData = useMemo(() => {
    const bins = [
      { range: "0-5K", min: 0, max: 5000, count: 0 },
      { range: "5K-10K", min: 5000, max: 10000, count: 0 },
      { range: "10K-25K", min: 10000, max: 25000, count: 0 },
      { range: "25K-50K", min: 25000, max: 50000, count: 0 },
      { range: "50K-100K", min: 50000, max: 100000, count: 0 },
      { range: "100K-250K", min: 100000, max: 250000, count: 0 },
      { range: "250K+", min: 250000, max: Infinity, count: 0 },
    ];
    transactions.forEach((t) => {
      const bin = bins.find((b) => t.total >= b.min && t.total < b.max);
      if (bin) bin.count++;
    });
    return bins;
  }, [transactions]);

  /* ─── dynamic title ─── */
  const periodTitle = useMemo(() => {
    if (!startDate || !endDate) return "Satın Alma Analizi";
    const [sd, sm, sy] = startDate.split(".");
    const [ed, em, ey] = endDate.split(".");
    if (sm === em && sy === ey) {
      return `${getMonthName(parseInt(sm, 10) - 1)} ${sy} Satın Alma Analizi`;
    }
    return `${sd}.${sm}.${sy} - ${ed}.${em}.${ey} Satın Alma Analizi`;
  }, [startDate, endDate]);

  const periodBadge = useMemo(() => {
    if (!startDate || !endDate) return "";
    const [sd, sm, sy] = startDate.split(".");
    const [ed, em, ey] = endDate.split(".");
    if (sm === em && sy === ey) {
      return `${sd} - ${ed} ${getMonthName(parseInt(sm, 10) - 1)} ${sy}`;
    }
    return `${startDate} - ${endDate}`;
  }, [startDate, endDate]);

  /* ─── category filter handlers ─── */
  const toggleCategory = (cat: string) => {
    setFilterCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectAllCategories = () => setFilterCategories([...availableCategories]);
  const clearAllCategories = () => setFilterCategories([]);

  /* ─── budget handler ─── */
  const applyBudget = () => {
    const val = parseFloat(budgetInput.replace(/[^0-9.]/g, "")) || 0;
    setBudget((prev) => ({ ...prev, general: val }));
  };

  /* ─── month select handler ─── */
  const handleMonthSelect = (year: number, month: number) => {
    const days = daysInMonth(year, month);
    const m = String(month + 1).padStart(2, "0");
    setStartDate(`01.${m}.${year}`);
    setEndDate(`${days}.${m}.${year}`);
  };

  /* ─── auth gate: giriş yapılmamışsa login ekranı ─── */
  if (authenticated === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F6F3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#9B9590", fontSize: 14 }}>Yükleniyor...</span>
      </div>
    );
  }
  if (authenticated === false) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
  }

  /* ─── initial loading ─── */
  if (loading && !transactions.length) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6B6560",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid #E5E0D8",
            borderTopColor: "#AA5930",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 16, fontWeight: 500 }}>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#F8F6F3",
        minHeight: "100vh",
        color: "#2D2A26",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ─── Top accent bar ─── */}
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #AA5930, #D8BF9F, #AA5930)",
        }}
      />

      {/* ─── Header ─── */}
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E0D8" }}>
        <div className="dashboard-header-inner">
          {/* Logo & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <Image
              src="/logo.png"
              alt="Solenne"
              width={160}
              height={50}
              style={{ objectFit: "contain", height: 45, width: "auto" }}
              priority
            />
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, color: "#2D2A26" }}>
                {periodTitle}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#9B9590", fontSize: 14 }}>
                Kapsamlı veri analizi ve görselleştirme raporu
              </p>
            </div>
          </div>
          
          {/* Period badge & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                background: "#AA5930",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Calendar size={16} />
              {periodBadge}
            </div>
            <button
              type="button"
              onClick={() => {
                setStoredAuth(false);
                setAuthenticated(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid #E5E0D8",
                background: "#FFFFFF",
                color: "#6B6560",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
              title="Çıkış yap"
            >
              <LogOut size={16} />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* ─── Filter Bar ─── */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E0D8" }}>
        <div className="dashboard-filter-bar">
          {/* Row 1: Date Filters & Presets */}
          <div className="dashboard-filter-row-1">
            {/* Date Range */}
            <div className="dashboard-date-range-group">
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B6560", fontSize: 13, fontWeight: 600 }}>
                <Calendar size={14} />
                Tarih Aralığı
              </div>
              <div className="dashboard-filter-date-inputs">
                <input
                  type="date"
                  value={toIsoDate(startDate)}
                  onChange={(e) => setStartDate(fromIsoDate(e.target.value))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E0D8",
                    background: "#FFFFFF",
                    color: "#2D2A26",
                    fontSize: 13,
                    outline: "none",
                    minWidth: 130,
                    width: "100%",
                    maxWidth: 160,
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ color: "#9B9590", flexShrink: 0 }}>—</span>
                <input
                  type="date"
                  value={toIsoDate(endDate)}
                  onChange={(e) => setEndDate(fromIsoDate(e.target.value))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E0D8",
                    background: "#FFFFFF",
                    color: "#2D2A26",
                    fontSize: 13,
                    outline: "none",
                    minWidth: 130,
                    width: "100%",
                    maxWidth: 160,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Dönem seç + Quick Presets */}
            <div className="dashboard-filter-period-group">
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const [y, m] = val.split("-").map(Number);
                  handleMonthSelect(y, m);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #E5E0D8",
                  background: "#FFFFFF",
                  color: "#2D2A26",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                  minWidth: 140,
                  maxWidth: 180,
                  boxSizing: "border-box",
                }}
              >
                <option value="">Dönem seç...</option>
                {MONTH_OPTIONS.map((opt) => (
                  <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="dashboard-filter-presets">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const r = preset.getRange();
                    setStartDate(r.start);
                    setEndDate(r.end);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #E5E0D8",
                    background: "#F8F6F3",
                    color: "#6B6560",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#AA5930";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#AA5930";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F8F6F3";
                    e.currentTarget.style.color = "#6B6560";
                    e.currentTarget.style.borderColor = "#E5E0D8";
                  }}
                >
                  {preset.label}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Row 2: Categories, Comparison, Budget, Export */}
          <div className="dashboard-filter-row-2">
            {/* Category Filter */}
            <div ref={categoryRef} style={{ position: "relative" }}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: filterCategories.length > 0 ? "1px solid #AA5930" : "1px solid #E5E0D8",
                  background: filterCategories.length > 0 ? "#AA593015" : "#FFFFFF",
                  color: filterCategories.length > 0 ? "#AA5930" : "#6B6560",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Package size={16} />
                Kategoriler
                {filterCategories.length > 0 && (
                  <span
                    style={{
                      background: "#AA5930",
                      color: "#FFFFFF",
                      borderRadius: 10,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {filterCategories.length}
                  </span>
                )}
                <ChevronDown size={14} style={{ transform: categoryDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              
              {categoryDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    background: "#FFFFFF",
                    border: "1px solid #E5E0D8",
                    borderRadius: 12,
                    padding: 16,
                    zIndex: 100,
                    minWidth: 280,
                    maxHeight: 320,
                    overflowY: "auto",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <button
                      onClick={selectAllCategories}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #E5E0D8",
                        background: "#F8F6F3",
                        color: "#6B6560",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Tümünü seç
                    </button>
                    <button
                      onClick={clearAllCategories}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #E5E0D8",
                        background: "#F8F6F3",
                        color: "#6B6560",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Temizle
                    </button>
                  </div>
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#2D2A26",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filterCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        style={{ accentColor: "#AA5930", width: 16, height: 16, cursor: "pointer" }}
                      />
                      {getCategoryLabel(cat)}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selected category chips */}
            {filterCategories.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {filterCategories.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      background: "#AA593015",
                      color: "#AA5930",
                      border: "1px solid #AA593030",
                    }}
                  >
                    {getCategoryLabel(cat)}
                    <X size={12} />
                  </span>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Comparison & Budget */}
            <div className="dashboard-comparison-budget-row">
              {/* Comparison */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#9B9590", fontWeight: 500 }}>Karşılaştır:</span>
                <select
                  value={compareMode}
                  onChange={(e) => setCompareMode(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E0D8",
                    background: "#FFFFFF",
                    color: "#2D2A26",
                    fontSize: 13,
                    outline: "none",
                    minWidth: 160,
                  }}
                >
                  {COMPARE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {compareMode === "custom" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="date"
                      value={toIsoDate(customCompareStart)}
                      onChange={(e) => setCustomCompareStart(fromIsoDate(e.target.value))}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #E5E0D8",
                        background: "#FFFFFF",
                        color: "#2D2A26",
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                    <input
                      type="date"
                      value={toIsoDate(customCompareEnd)}
                      onChange={(e) => setCustomCompareEnd(fromIsoDate(e.target.value))}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #E5E0D8",
                        background: "#FFFFFF",
                        color: "#2D2A26",
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Budget */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wallet size={14} style={{ color: "#9B9590" }} />
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Bütçe"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E0D8",
                    background: "#FFFFFF",
                    color: "#2D2A26",
                    fontSize: 13,
                    outline: "none",
                    width: 100,
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") applyBudget(); }}
                />
                <button
                  onClick={applyBudget}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#AA5930",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Uygula
                </button>
              </div>
            </div>

            {/* Export & Quick Report */}
            <div className="dashboard-filter-export-row">
              <button
                onClick={() => setReportModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#7C4A36",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <BookOpen size={14} />
                Hızlı raporu oku
              </button>
              <button
                onClick={() => exportExcel(transactions)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#4A7C59",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FileSpreadsheet size={14} />
                Excel
              </button>
              <button
                onClick={() => exportCsv(transactions)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2D2A26",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FileText size={14} />
                CSV
              </button>
              <button
                onClick={() => exportPdf("dashboard-content", periodTitle)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#D8BF9F",
                  color: "#2D2A26",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FileDown size={14} />
                PDF
              </button>
              <button
                onClick={() => {
                  setFilterCategories([]);
                  setStartDate("01.01.2026");
                  setEndDate("31.01.2026");
                  setCompareMode("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E0D8",
                  background: "#FFFFFF",
                  color: "#6B6560",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={14} />
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Quick Report Modal ─── */}
      {reportModalOpen && (
        <div
          className="dashboard-report-modal-overlay"
          onClick={() => setReportModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div
            className="dashboard-report-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-report-modal-header">
              <h2 id="report-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                {QUICK_REPORT_TITLE}
              </h2>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid #E5E0D8",
                  background: "#FFFFFF",
                  color: "#6B6560",
                  cursor: "pointer",
                }}
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>
            <div className="dashboard-report-modal-body">
              <pre className="report-pre">{QUICK_REPORT_CONTENT}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ─── Date validation error ─── */}
      {dateError && (
        <div style={{ padding: "12px 24px", background: "#FEF2F2", color: "#B54242", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #FECACA", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} />
          {dateError}
        </div>
      )}

      {/* ─── Loading overlay ─── */}
      {loading && transactions.length > 0 && (
        <div style={{ padding: "12px 24px", background: "#FEF3C7", display: "flex", alignItems: "center", gap: 10 }}>
          <RefreshCw size={16} style={{ color: "#92400E", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: 13, color: "#92400E", fontWeight: 500 }}>Güncelleniyor...</span>
        </div>
      )}

      {/* ─── Error banner ─── */}
      {error && (
        <div
          style={{
            padding: "16px 24px",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderBottom: "1px solid #FECACA",
          }}
        >
          <AlertTriangle size={20} color="#B54242" />
          <span style={{ color: "#B54242", fontSize: 14, fontWeight: 600, flex: 1 }}>
            {error}
          </span>
          <button
            onClick={fetchData}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#B54242",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yenile
          </button>
        </div>
      )}

      {/* ─── Tabs ─── */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E0D8" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 24,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: activeTab === tab.id ? "#AA5930" : "#F8F6F3",
                    color: activeTab === tab.id ? "#FFFFFF" : "#6B6560",
                    boxShadow: activeTab === tab.id ? "0 2px 8px rgba(170, 89, 48, 0.3)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Dashboard content ─── */}
      <div
        id="dashboard-content"
        ref={dashboardRef}
        style={{
          padding: "24px",
          maxWidth: 1400,
          margin: "0 auto",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {!loading && !error && transactions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#9B9590",
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E5E0D8",
            }}
          >
            <Filter size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#6B6560" }}>
              Seçilen filtreye uygun kayıt bulunamadı
            </div>
            <div style={{ fontSize: 14 }}>
              Tarih aralığını veya kategori filtrelerini değiştirmeyi deneyin.
            </div>
          </div>
        ) : (
          <>
            {activeTab === "genel" && (
              <GenelTab
                stats={stats}
                compareStats={compareStats}
                budget={budget}
                weeklyData={weeklyData}
                dayOfWeekData={dayOfWeekData}
                categoryData={categoryData}
                histogramData={histogramData}
                transactions={transactions}
              />
            )}
            {activeTab === "kategori" && (
              <KategoriTab
                categoryData={categoryData}
                totalSpend={stats.totalSpend}
                transactions={transactions}
              />
            )}
            {activeTab === "tedarikci" && (
              <TedarikciTab
                supplierData={supplierData}
                totalSpend={stats.totalSpend}
                transactions={transactions}
              />
            )}
            {activeTab === "trendler" && (
              <TrendlerTab
                dailyData={dailyData}
                weeklyData={weeklyData}
                transactions={transactions}
              />
            )}
            {activeTab === "anomali" && (
              <AnomaliTab
                threshold={anomalies.threshold}
                items={anomalies.items}
                allTransactions={transactions}
                mean={anomalies.mean}
                stdDev={anomalies.stdDev}
              />
            )}
          </>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer style={{ textAlign: "center", padding: "24px", color: "#9B9590", fontSize: 12, borderTop: "1px solid #E5E0D8", background: "#FFFFFF" }}>
        {periodTitle} • Veri kaynağı: veriler/*.csv • {transactions.length} işlem analiz edildi
        {startDate && endDate && ` • ${startDate} - ${endDate}`}
      </footer>
    </div>
  );
}
