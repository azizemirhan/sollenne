"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  const canvas = await html2canvas(el, { backgroundColor: "#12121e", scale: 2 });
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
    // multi-page
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
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
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

/* ─── component styles ─── */
const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#1e1e2e",
  color: "#e0e0e0",
  fontSize: 12,
};

const chipStyle = (active: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 14,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  border: active ? "1px solid #00f5d4" : "1px solid #333",
  background: active ? "#00f5d420" : "#1e1e2e",
  color: active ? "#00f5d4" : "#888",
  transition: "all 0.15s",
});

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

/* ─── tabs ─── */
const TABS = [
  { id: "genel", label: "Genel Bakış", icon: "📊" },
  { id: "kategori", label: "Kategoriler", icon: "📦" },
  { id: "tedarikci", label: "Tedarikçiler", icon: "🏢" },
  { id: "trendler", label: "Trendler", icon: "📈" },
  { id: "anomali", label: "Anomaliler", icon: "⚠️" },
];

export default function Dashboard() {
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
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Veri yüklenemedi");
      const data = await res.json();

      if (compareRange && data.current) {
        setTransactions(data.current);
        setCompareTransactions(data.compare || []);
      } else {
        setTransactions(Array.isArray(data) ? data : data.current || []);
        setCompareTransactions([]);
      }

      setAvailableCategories((prev) => {
        const txList = Array.isArray(data) ? data : data.current || [];
        const cats = [...new Set(txList.map((t: Transaction) => t.category))].sort() as string[];
        return prev.length ? prev : cats;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu");
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

  /* ─── initial loading ─── */
  if (loading && !transactions.length) {
    return (
      <div
        style={{
          background: "#12121e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #333",
            borderTopColor: "#00f5d4",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#12121e",
        minHeight: "100vh",
        color: "#e0e0e0",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #f15bb5, #fee440, #00f5d4, #00bbf9, #9b5de5)",
        }}
      />

      {/* ─── Header ─── */}
      <div style={{ background: "#1a1a2e", padding: "32px 24px 24px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#00f5d4" }}>
          🏭 {periodTitle}
        </h1>
        <p style={{ margin: "8px 0 0", color: "#888", fontSize: 14 }}>
          Kapsamlı veri analizi ve görselleştirme raporu
        </p>
        <div
          style={{
            display: "inline-block",
            background: "#00f5d4",
            color: "#12121e",
            padding: "6px 20px",
            borderRadius: 20,
            fontWeight: 700,
            fontSize: 14,
            marginTop: 12,
          }}
        >
          {periodBadge}
        </div>
      </div>

      {/* ─── Filter bar ─── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 24px",
          background: "#161625",
          alignItems: "flex-start",
        }}
      >
        {/* Date filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Filtreler:</span>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>Başlangıç</span>
            <input
              type="date"
              value={toIsoDate(startDate)}
              onChange={(e) => setStartDate(fromIsoDate(e.target.value))}
              style={{ ...inputStyle, width: 130 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>Bitiş</span>
            <input
              type="date"
              value={toIsoDate(endDate)}
              onChange={(e) => setEndDate(fromIsoDate(e.target.value))}
              style={{ ...inputStyle, width: 130 }}
            />
          </label>

          {/* Period selector */}
          <select
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const [y, m] = val.split("-").map(Number);
              handleMonthSelect(y, m);
            }}
            style={{ ...inputStyle, width: 140 }}
          >
            <option value="">Dönem seç...</option>
            {MONTH_OPTIONS.map((opt) => (
              <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date presets */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                const r = preset.getRange();
                setStartDate(r.start);
                setEndDate(r.end);
              }}
              style={{
                ...btnStyle,
                background: "#1e1e2e",
                color: "#aaa",
                border: "1px solid #333",
                fontSize: 11,
                padding: "4px 10px",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div ref={categoryRef} style={{ position: "relative" }}>
          <button
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            style={{
              ...btnStyle,
              background: "#1e1e2e",
              color: "#aaa",
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📦 Kategoriler{" "}
            {filterCategories.length > 0 && (
              <span
                style={{
                  background: "#00f5d4",
                  color: "#12121e",
                  borderRadius: 10,
                  padding: "0 6px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {filterCategories.length}
              </span>
            )}
          </button>
          {categoryDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                background: "#1e1e2e",
                border: "1px solid #333",
                borderRadius: 10,
                padding: 12,
                zIndex: 100,
                minWidth: 260,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <button
                  onClick={selectAllCategories}
                  style={{ ...btnStyle, background: "#333", color: "#ccc", fontSize: 11, padding: "3px 8px" }}
                >
                  Tümünü seç
                </button>
                <button
                  onClick={clearAllCategories}
                  style={{ ...btnStyle, background: "#333", color: "#ccc", fontSize: 11, padding: "3px 8px" }}
                >
                  Tümünü kaldır
                </button>
              </div>
              {availableCategories.map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#ccc",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filterCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ accentColor: "#00f5d4" }}
                  />
                  {getCategoryLabel(cat)}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selected category chips */}
        {filterCategories.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            {filterCategories.map((cat) => (
              <span
                key={cat}
                style={chipStyle(true)}
                onClick={() => toggleCategory(cat)}
              >
                {getCategoryLabel(cat)} ×
              </span>
            ))}
          </div>
        )}

        {/* Reset */}
        <button
          onClick={() => {
            setFilterCategories([]);
            setStartDate("01.01.2026");
            setEndDate("31.01.2026");
            setCompareMode("");
          }}
          style={{ ...btnStyle, background: "#333", color: "#ccc" }}
        >
          Sıfırla
        </button>
      </div>

      {/* ─── Date validation error ─── */}
      {dateError && (
        <div style={{ padding: "8px 24px", background: "#2a1a1e", color: "#ef476f", fontSize: 12, fontWeight: 600 }}>
          ⚠️ {dateError}
        </div>
      )}

      {/* ─── Second row: Comparison, Budget, Export ─── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          padding: "10px 24px 14px",
          background: "#161625",
          alignItems: "center",
          borderTop: "1px solid #222",
        }}
      >
        {/* Comparison selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Karşılaştırma:</span>
          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
            style={{ ...inputStyle, width: 180 }}
          >
            {COMPARE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {compareMode === "custom" && (
            <>
              <input
                type="date"
                value={toIsoDate(customCompareStart)}
                onChange={(e) => setCustomCompareStart(fromIsoDate(e.target.value))}
                style={{ ...inputStyle, width: 130 }}
              />
              <input
                type="date"
                value={toIsoDate(customCompareEnd)}
                onChange={(e) => setCustomCompareEnd(fromIsoDate(e.target.value))}
                style={{ ...inputStyle, width: 130 }}
              />
            </>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: "#333" }} />

        {/* Budget input */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Bütçe (₺):</span>
          <input
            type="text"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Örn: 5000000"
            style={{ ...inputStyle, width: 120 }}
            onKeyDown={(e) => { if (e.key === "Enter") applyBudget(); }}
          />
          <button
            onClick={applyBudget}
            style={{ ...btnStyle, background: "#00f5d420", color: "#00f5d4", border: "1px solid #00f5d4" }}
          >
            Uygula
          </button>
        </div>

        <div style={{ width: 1, height: 20, background: "#333" }} />

        {/* Export buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => exportExcel(transactions)}
            style={{ ...btnStyle, background: "#06d6a020", color: "#06d6a0", border: "1px solid #06d6a0" }}
          >
            Excel İndir
          </button>
          <button
            onClick={() => exportCsv(transactions)}
            style={{ ...btnStyle, background: "#00bbf920", color: "#00bbf9", border: "1px solid #00bbf9" }}
          >
            CSV İndir
          </button>
          <button
            onClick={() => exportPdf("dashboard-content", periodTitle)}
            style={{ ...btnStyle, background: "#9b5de520", color: "#9b5de5", border: "1px solid #9b5de5" }}
          >
            PDF Rapor İndir
          </button>
        </div>
      </div>

      {/* ─── Loading overlay ─── */}
      {loading && transactions.length > 0 && (
        <div style={{ padding: "8px 24px", background: "#1a1a2e", display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid #333",
              borderTopColor: "#00f5d4",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: 12, color: "#888" }}>Güncelleniyor...</span>
        </div>
      )}

      {/* ─── Error banner ─── */}
      {error && (
        <div
          style={{
            padding: "12px 24px",
            background: "#2a1a1e",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: "#ef476f", fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </span>
          <button
            onClick={fetchData}
            style={{ ...btnStyle, background: "#ef476f20", color: "#ef476f", border: "1px solid #ef476f" }}
          >
            Yenile
          </button>
        </div>
      )}

      {/* ─── Tabs ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "16px 24px",
          flexWrap: "wrap",
          background: "#161625",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              borderRadius: 24,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              transition: "all 0.2s",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #00f5d4, #00bbf9)"
                  : "#1e1e2e",
              color: activeTab === tab.id ? "#12121e" : "#888",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Dashboard content ─── */}
      <div
        id="dashboard-content"
        ref={dashboardRef}
        style={{
          padding: "16px 24px 40px",
          maxWidth: 1200,
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
              padding: "60px 20px",
              color: "#666",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Seçilen filtreye uygun kayıt bulunamadı
            </div>
            <div style={{ fontSize: 13 }}>
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
      <div style={{ textAlign: "center", padding: "24px", color: "#444", fontSize: 12 }}>
        {periodTitle} • Veri kaynağı: veriler/*.csv • {transactions.length} işlem analiz edildi
        {startDate && endDate && ` • ${startDate} - ${endDate}`}
      </div>
    </div>
  );
}
