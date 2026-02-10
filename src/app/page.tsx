"use client";

import { useState, useMemo, useEffect } from "react";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";
import {
  GenelTab,
  KategoriTab,
  TedarikciTab,
  TrendlerTab,
  AnomaliTab,
} from "@/components/dashboard";

const TABS = [
  { id: "genel", label: "Genel Bakış", icon: "📊" },
  { id: "kategori", label: "Kategoriler", icon: "📦" },
  { id: "tedarikci", label: "Tedarikçiler", icon: "🏢" },
  { id: "trendler", label: "Trendler", icon: "📈" },
  { id: "anomali", label: "Anomaliler", icon: "⚠️" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("genel");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("01.01.2026");
  const [endDate, setEndDate] = useState("31.01.2026");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        filterCategories.forEach((c) => params.append("category", c));
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error("Veri yüklenemedi");
        const data: Transaction[] = await res.json();
        setTransactions(data);
        setAvailableCategories((prev) => {
          const cats = [...new Set(data.map((t) => t.category))].sort();
          return prev.length ? prev : cats;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bir hata oluştu");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterCategories, startDate, endDate]);

  const stats = useMemo(() => {
    if (!transactions.length)
      return {
        totalSpend: 0,
        txCount: 0,
        suppliers: 0,
        products: 0,
        avg: 0,
        median: 0,
      };
    const totalSpend = transactions.reduce((s, t) => s + t.total, 0);
    const txCount = transactions.length;
    const suppliers = new Set(transactions.map((t) => t.supplier)).size;
    const products = new Set(transactions.map((t) => t.product)).size;
    const avg = totalSpend / txCount;
    const sorted = [...transactions].sort((a, b) => a.total - b.total);
    const median = sorted[Math.floor(txCount / 2)]?.total ?? 0;
    return { totalSpend, txCount, suppliers, products, avg, median };
  }, [transactions]);

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
      .sort((a, b) => {
        const [da, ma] = a.date.split(".");
        const [db, mb] = b.date.split(".");
        return parseInt(ma + da, 10) - parseInt(mb + db, 10);
      });
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
    if (!transactions.length) return { threshold: 0, items: [] };
    const mean = stats.avg;
    const variance =
      transactions.reduce((s, t) => s + Math.pow(t.total - mean, 2), 0) / transactions.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2 * stdDev;
    return {
      threshold,
      items: transactions.filter((t) => t.total > threshold).sort((a, b) => b.total - a.total),
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
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#12121e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef476f",
        }}
      >
        {error}
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

      <div style={{ background: "#1a1a2e", padding: "32px 24px 24px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#00f5d4" }}>
          🏭 Ocak 2026 Satın Alma Analizi
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
          01 - 31 Ocak 2026
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 24px",
          background: "#161625",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Filtreler:</span>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Başlangıç</span>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="DD.MM.YYYY"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1e1e2e",
              color: "#e0e0e0",
              fontSize: 12,
              width: 100,
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Bitiş</span>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="DD.MM.YYYY"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1e1e2e",
              color: "#e0e0e0",
              fontSize: 12,
              width: 100,
            }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Kategori:</span>
          <select
            multiple
            value={filterCategories}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions, (o) => o.value);
              setFilterCategories(opts);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1e1e2e",
              color: "#e0e0e0",
              fontSize: 12,
              minWidth: 180,
              maxHeight: 120,
            }}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setFilterCategories([]);
              setStartDate("01.01.2026");
              setEndDate("31.01.2026");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: "#333",
              color: "#ccc",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Sıfırla
          </button>
        </div>
      </div>

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

      <div style={{ padding: "16px 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "genel" && (
          <GenelTab
            stats={stats}
            weeklyData={weeklyData}
            dayOfWeekData={dayOfWeekData}
            categoryData={categoryData}
            histogramData={histogramData}
          />
        )}
        {activeTab === "kategori" && (
          <KategoriTab categoryData={categoryData} totalSpend={stats.totalSpend} />
        )}
        {activeTab === "tedarikci" && (
          <TedarikciTab supplierData={supplierData} totalSpend={stats.totalSpend} />
        )}
        {activeTab === "trendler" && (
          <TrendlerTab
            dailyData={dailyData}
            weeklyData={weeklyData}
            transactions={transactions}
          />
        )}
        {activeTab === "anomali" && (
          <AnomaliTab threshold={anomalies.threshold} items={anomalies.items} />
        )}
      </div>

      <div style={{ textAlign: "center", padding: "24px", color: "#444", fontSize: 12 }}>
        Ocak 2026 Satın Alma Raporu • Veri kaynağı: veriler/*.csv • {transactions.length} işlem
        analiz edildi
      </div>
    </div>
  );
}
