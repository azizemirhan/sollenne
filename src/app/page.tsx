"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M ₺`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K ₺`;
  return `${val.toFixed(0)} ₺`;
};

const formatFull = (val: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

const COLORS = [
  "#00f5d4",
  "#00bbf9",
  "#fee440",
  "#f15bb5",
  "#9b5de5",
  "#fb5607",
  "#80ed99",
  "#ff006e",
  "#3a86ff",
  "#ffbe0b",
  "#8338ec",
  "#06d6a0",
  "#ef476f",
];

const TABS = [
  { id: "genel", label: "Genel Bakış", icon: "📊" },
  { id: "kategori", label: "Kategoriler", icon: "📦" },
  { id: "tedarikci", label: "Tedarikçiler", icon: "🏢" },
  { id: "trendler", label: "Trendler", icon: "📈" },
  { id: "anomali", label: "Anomaliler", icon: "⚠️" },
];

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1e1e2e",
        border: "1px solid #333",
        borderRadius: 8,
        padding: "10px 14px",
        color: "#e0e0e0",
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4, color: "#ccc" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || "#00f5d4" }}>
          {p.name}: {formatter ? formatter(p.value) : formatFull(p.value) + " ₺"}
        </p>
      ))}
    </div>
  );
}

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

  const KPICard = ({
    icon,
    label,
    value,
    sub,
  }: {
    icon: string;
    label: string;
    value: string | number;
    sub?: string;
  }) => (
    <div
      style={{
        background: "#1e1e2e",
        borderRadius: 12,
        padding: "20px 16px",
        flex: "1 1 150px",
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: "#888",
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#00f5d4", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const ChartCard = ({
    title,
    children,
    fullWidth,
  }: {
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
  }) => (
    <div
      style={{
        background: "#1e1e2e",
        borderRadius: 12,
        padding: "20px",
        flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 8px)",
        minWidth: 320,
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: 16,
          fontWeight: 600,
          color: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 4,
            height: 20,
            background: "#00f5d4",
            borderRadius: 2,
            display: "inline-block",
          }}
        />
        {title}
      </h3>
      {children}
    </div>
  );

  const renderGenel = () => (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <KPICard
          icon="💰"
          label="Toplam Harcama"
          value={`${formatFull(Math.round(stats.totalSpend))} ₺`}
          sub="Aylık bütçe"
        />
        <KPICard icon="📋" label="İşlem Sayısı" value={stats.txCount} sub="Toplam belge" />
        <KPICard icon="🏢" label="Tedarikçi" value={stats.suppliers} sub="Aktif firma" />
        <KPICard icon="📦" label="Ürün Çeşidi" value={stats.products} sub="Farklı kalem" />
        <KPICard
          icon="📊"
          label="Ortalama İşlem"
          value={`${formatFull(Math.round(stats.avg))} ₺`}
          sub="İşlem başına"
        />
        <KPICard
          icon="📉"
          label="Medyan İşlem"
          value={`${formatFull(Math.round(stats.median))} ₺`}
          sub="Ortanca değer"
        />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="Haftalık Harcama Karşılaştırması">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#888", fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#888", fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Harcama" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Gün Bazlı Harcama Dağılımı">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dayOfWeekData} cx="50%" cy="50%">
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="day" tick={{ fill: "#ccc", fontSize: 12 }} />
              <PolarRadiusAxis
                tick={{ fill: "#666", fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Radar
                name="Harcama"
                dataKey="value"
                stroke="#00f5d4"
                fill="#00f5d4"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ r: 4, fill: "#00f5d4" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Kategori Bazlı Dağılım">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="35%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                  label={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 11, lineHeight: "18px", paddingLeft: 10 }}
                  formatter={(val) => <span style={{ color: "#ccc" }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="İşlem Tutarı Dağılımı (Histogram)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="range" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v} işlem`} />} />
              <Bar dataKey="count" name="İşlem Sayısı" fill="#00bbf9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );

  const renderKategori = () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="Kategori Harcama Sıralaması" fullWidth>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#ccc", fontSize: 11 }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Harcama" radius={[0, 6, 6, 0]}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Kategori Yüzde Dağılımı" fullWidth>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {categoryData.map((cat, i) => {
            const pct = stats.totalSpend
              ? ((cat.value / stats.totalSpend) * 100).toFixed(1)
              : "0";
            return (
              <div
                key={i}
                style={{
                  background: "#161625",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 40,
                    borderRadius: 4,
                    background: COLORS[i % COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e0e0e0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    {formatFull(Math.round(cat.value))} ₺
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );

  const renderTedarikci = () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="En Büyük 10 Tedarikçi" fullWidth>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={supplierData.slice(0, 10)} layout="vertical" margin={{ left: 160 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#ccc", fontSize: 11 }}
              width={180}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Harcama" radius={[0, 6, 6, 0]}>
              {supplierData.slice(0, 10).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Tedarikçi Konsantrasyon Analizi" fullWidth>
        <div style={{ padding: "0 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              padding: "12px 16px",
              background: "#161625",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ color: "#fee440", fontWeight: 600, fontSize: 14 }}>
                Tedarikçi Yoğunlaşma Uyarısı
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>
                İlk 3 tedarikçi toplam harcamanın %
                {stats.totalSpend
                  ? (
                      (supplierData
                        .slice(0, 3)
                        .reduce((s, d) => s + d.value, 0) /
                        stats.totalSpend) *
                      100
                    ).toFixed(1)
                  : 0}
                ini oluşturuyor
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 8,
            }}
          >
            {supplierData.slice(0, 15).map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "#161625",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: COLORS[i % COLORS.length] + "22",
                    color: COLORS[i % COLORS.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#ddd",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {formatFull(Math.round(s.value))} ₺
                  </div>
                </div>
                <div
                  style={{
                    background: COLORS[i % COLORS.length] + "22",
                    color: COLORS[i % COLORS.length],
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {s.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  );

  const renderTrendler = () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="Günlük Harcama Trendi (Detaylı)" fullWidth>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Harcama" radius={[4, 4, 0, 0]}>
              {dailyData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Kümülatif Harcama Trendi">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={dailyData.reduce(
              (acc, d) => {
                const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
                acc.push({ ...d, cumulative: prev + d.total });
                return acc;
              },
              [] as Array<{ date: string; total: number; cumulative: number }>
            )}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="gradCum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f5d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Kümülatif"
              stroke="#00f5d4"
              fill="url(#gradCum)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00f5d4" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Haftalık İşlem Yoğunluğu">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={weeklyData.map((w, i) => {
              const weekTxs = transactions.filter((t) => {
                const day = parseInt(t.date.split(".")[0], 10);
                if (i === 0) return day <= 5;
                if (i === 1) return day >= 6 && day <= 12;
                if (i === 2) return day >= 13 && day <= 19;
                if (i === 3) return day >= 20 && day <= 26;
                return day >= 27;
              });
              return { ...w, count: weekTxs.length };
            })}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip formatter={(v) => `${v} işlem`} />} />
            <Bar dataKey="count" name="İşlem Sayısı" fill="#9b5de5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );

  const renderAnomali = () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard
        title={`Olağandışı İşlemler (Eşik: ${formatFull(Math.round(anomalies.threshold))} ₺ üzeri)`}
        fullWidth
      >
        <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          Ortalama + 2 standart sapma üzerindeki işlemler anomali olarak işaretlenmiştir. Toplam{" "}
          <span style={{ color: "#f15bb5", fontWeight: 700 }}>{anomalies.items.length} adet</span>{" "}
          olağandışı işlem tespit edildi.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {anomalies.items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, #2a1a1e 0%, #1e1e2e 100%)",
                border: "1px solid #442233",
                borderRadius: 10,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#f15bb5",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ⚠️ {item.product}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                Tarih: {item.date} | Tedarikçi: {item.supplier}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ff6b6b", marginTop: 6 }}>
                {formatFull(Math.round(item.total))} ₺
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
      <ChartCard title="Anomali Dağılımı (Tarih Bazlı)" fullWidth>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" name="Tarih" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis
              dataKey="total"
              name="Tutar"
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Anomali İşlemleri" data={anomalies.items} fill="#f15bb5">
              {anomalies.items.map((_, i) => (
                <Cell key={i} fill="#f15bb5" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );

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

      {/* Filters */}
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
        {activeTab === "genel" && renderGenel()}
        {activeTab === "kategori" && renderKategori()}
        {activeTab === "tedarikci" && renderTedarikci()}
        {activeTab === "trendler" && renderTrendler()}
        {activeTab === "anomali" && renderAnomali()}
      </div>

      <div style={{ textAlign: "center", padding: "24px", color: "#444", fontSize: 12 }}>
        Ocak 2026 Satın Alma Raporu • Veri kaynağı: veriler/*.csv • {transactions.length} işlem
        analiz edildi
      </div>
    </div>
  );
}
