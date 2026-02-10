"use client";

import { useState } from "react";
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
  Legend,
} from "recharts";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { DrillDownModal } from "./DrillDownModal";
import { formatFull } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";

interface CompareStats {
  totalSpend: number;
  txCount: number;
  suppliers: number;
  products: number;
  avg: number;
  median: number;
}

export interface BudgetInfo {
  general: number;
  byCategory: Record<string, number>;
}

export interface GenelTabProps {
  stats: {
    totalSpend: number;
    txCount: number;
    suppliers: number;
    products: number;
    avg: number;
    median: number;
  };
  compareStats?: CompareStats | null;
  budget?: BudgetInfo | null;
  weeklyData: Array<{ name: string; value: number }>;
  dayOfWeekData: Array<{ day: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
  histogramData: Array<{ range: string; count: number }>;
  transactions: Transaction[];
}

function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function GenelTab({
  stats,
  compareStats,
  budget,
  weeklyData,
  dayOfWeekData,
  categoryData,
  histogramData,
  transactions,
}: GenelTabProps) {
  const [drillDown, setDrillDown] = useState<{ title: string; items: Transaction[] } | null>(null);

  const handleWeeklyClick = (idx: number) => {
    const entry = weeklyData[idx];
    if (!entry?.name) return;
    const weekName = entry.name;
    const filtered = transactions.filter((t) => {
      const day = parseInt(t.date.split(".")[0], 10);
      if (weekName.includes("1-5")) return day <= 5;
      if (weekName.includes("6-12")) return day >= 6 && day <= 12;
      if (weekName.includes("13-19")) return day >= 13 && day <= 19;
      if (weekName.includes("20-26")) return day >= 20 && day <= 26;
      return day >= 27;
    });
    setDrillDown({ title: weekName, items: filtered });
  };

  const handleCategoryClick = (idx: number) => {
    const entry = categoryData[idx];
    if (!entry?.name) return;
    const catName = entry.name;
    const filtered = transactions.filter((t) => getCategoryLabel(t.category) === catName);
    setDrillDown({ title: `Kategori: ${catName}`, items: filtered });
  };

  const handleHistogramClick = (idx: number) => {
    const entry = histogramData[idx];
    if (!entry?.range) return;
    const bins: Record<string, [number, number]> = {
      "0-5K": [0, 5000],
      "5K-10K": [5000, 10000],
      "10K-25K": [10000, 25000],
      "25K-50K": [25000, 50000],
      "50K-100K": [50000, 100000],
      "100K-250K": [100000, 250000],
      "250K+": [250000, Infinity],
    };
    const [min, max] = bins[entry.range] || [0, Infinity];
    const filtered = transactions.filter((t) => t.total >= min && t.total < max);
    setDrillDown({ title: `Tutar araligi: ${entry.range}`, items: filtered });
  };

  const budgetGeneral = budget?.general || 0;
  const budgetUsed = budgetGeneral > 0 ? (stats.totalSpend / budgetGeneral) * 100 : 0;
  const budgetRemaining = budgetGeneral > 0 ? budgetGeneral - stats.totalSpend : 0;

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <KPICard
          icon="💰"
          label="Toplam Harcama"
          value={`${formatFull(Math.round(stats.totalSpend))} ₺`}
          sub="Aylık bütçe"
          changePct={compareStats ? pctChange(stats.totalSpend, compareStats.totalSpend) : null}
        />
        <KPICard
          icon="📋"
          label="İşlem Sayısı"
          value={stats.txCount}
          sub="Toplam belge"
          changePct={compareStats ? pctChange(stats.txCount, compareStats.txCount) : null}
        />
        <KPICard
          icon="🏢"
          label="Tedarikçi"
          value={stats.suppliers}
          sub="Aktif firma"
          changePct={compareStats ? pctChange(stats.suppliers, compareStats.suppliers) : null}
        />
        <KPICard
          icon="📦"
          label="Ürün Çeşidi"
          value={stats.products}
          sub="Farklı kalem"
          changePct={compareStats ? pctChange(stats.products, compareStats.products) : null}
        />
        <KPICard
          icon="📊"
          label="Ortalama İşlem"
          value={`${formatFull(Math.round(stats.avg))} ₺`}
          sub="İşlem başına"
          changePct={compareStats ? pctChange(stats.avg, compareStats.avg) : null}
        />
        <KPICard
          icon="📉"
          label="Medyan İşlem"
          value={`${formatFull(Math.round(stats.median))} ₺`}
          sub="Ortanca değer"
          changePct={compareStats ? pctChange(stats.median, compareStats.median) : null}
        />
      </div>

      {budgetGeneral > 0 && (
        <div
          style={{
            background: "#1e1e2e",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 auto" }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Bütçe Durumu
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "#666" }}>Bütçe</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00bbf9" }}>
                  {formatFull(budgetGeneral)} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#666" }}>Gerçekleşen</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00f5d4" }}>
                  {formatFull(Math.round(stats.totalSpend))} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#666" }}>Kalan</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: budgetRemaining >= 0 ? "#06d6a0" : "#ef476f",
                  }}
                >
                  {budgetRemaining >= 0 ? "" : "-"}{formatFull(Math.abs(Math.round(budgetRemaining)))} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#666" }}>Kullanım</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: budgetUsed > 100 ? "#ef476f" : budgetUsed > 80 ? "#fee440" : "#06d6a0",
                  }}
                >
                  %{budgetUsed.toFixed(1)}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                height: 8,
                background: "#333",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(budgetUsed, 100)}%`,
                  background:
                    budgetUsed > 100
                      ? "#ef476f"
                      : budgetUsed > 80
                        ? "#fee440"
                        : "#06d6a0",
                  borderRadius: 4,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        </div>
      )}

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
              <Bar
                dataKey="value"
                name="Harcama"
                radius={[6, 6, 0, 0]}
                onClick={(_: unknown, idx: number) => handleWeeklyClick(idx)}
                cursor="pointer"
              >
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
                  onClick={(_: unknown, idx: number) => handleCategoryClick(idx)}
                  cursor="pointer"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
              <Bar
                dataKey="count"
                name="İşlem Sayısı"
                fill="#00bbf9"
                radius={[6, 6, 0, 0]}
                onClick={(_: unknown, idx: number) => handleHistogramClick(idx)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {drillDown && (
        <DrillDownModal
          title={drillDown.title}
          items={drillDown.items}
          onClose={() => setDrillDown(null)}
        />
      )}
    </>
  );
}
