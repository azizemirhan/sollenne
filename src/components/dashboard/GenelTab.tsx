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
import { Wallet, FileText, Building2, Boxes, BarChart3, Scale } from "lucide-react";
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
    setDrillDown({ title: `Tutar aralığı: ${entry.range}`, items: filtered });
  };

  const budgetGeneral = budget?.general || 0;
  const budgetUsed = budgetGeneral > 0 ? (stats.totalSpend / budgetGeneral) * 100 : 0;
  const budgetRemaining = budgetGeneral > 0 ? budgetGeneral - stats.totalSpend : 0;

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <KPICard
          icon={<Wallet size={28} />}
          label="Toplam Harcama"
          value={`${formatFull(Math.round(stats.totalSpend))} ₺`}
          sub="Aylık bütçe"
          changePct={compareStats ? pctChange(stats.totalSpend, compareStats.totalSpend) : null}
        />
        <KPICard
          icon={<FileText size={28} />}
          label="İşlem Sayısı"
          value={stats.txCount}
          sub="Toplam belge"
          changePct={compareStats ? pctChange(stats.txCount, compareStats.txCount) : null}
        />
        <KPICard
          icon={<Building2 size={28} />}
          label="Tedarikçi"
          value={stats.suppliers}
          sub="Aktif firma"
          changePct={compareStats ? pctChange(stats.suppliers, compareStats.suppliers) : null}
        />
        <KPICard
          icon={<Boxes size={28} />}
          label="Ürün Çeşidi"
          value={stats.products}
          sub="Farklı kalem"
          changePct={compareStats ? pctChange(stats.products, compareStats.products) : null}
        />
        <KPICard
          icon={<BarChart3 size={28} />}
          label="Ortalama İşlem"
          value={`${formatFull(Math.round(stats.avg))} ₺`}
          sub="İşlem başına"
          changePct={compareStats ? pctChange(stats.avg, compareStats.avg) : null}
        />
        <KPICard
          icon={<Scale size={28} />}
          label="Medyan İşlem"
          value={`${formatFull(Math.round(stats.median))} ₺`}
          sub="Ortanca değer"
          changePct={compareStats ? pctChange(stats.median, compareStats.median) : null}
        />
      </div>

      {budgetGeneral > 0 && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            border: "1px solid #E5E0D8",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ flex: "1 1 auto" }}>
            <div style={{ fontSize: 12, color: "#9B9590", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Bütçe Durumu
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "#9B9590" }}>Bütçe</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#6B6560" }}>
                  {formatFull(budgetGeneral)} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9B9590" }}>Gerçekleşen</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#AA5930" }}>
                  {formatFull(Math.round(stats.totalSpend))} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9B9590" }}>Kalan</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: budgetRemaining >= 0 ? "#4A7C59" : "#B54242",
                  }}
                >
                  {budgetRemaining >= 0 ? "" : "-"}{formatFull(Math.abs(Math.round(budgetRemaining)))} ₺
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9B9590" }}>Kullanım</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: budgetUsed > 100 ? "#B54242" : budgetUsed > 80 ? "#C9A227" : "#4A7C59",
                  }}
                >
                  %{budgetUsed.toFixed(1)}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                height: 10,
                background: "#F8F6F3",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(budgetUsed, 100)}%`,
                  background:
                    budgetUsed > 100
                      ? "#B54242"
                      : budgetUsed > 80
                        ? "#C9A227"
                        : "#4A7C59",
                  borderRadius: 5,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <ChartCard title="Haftalık Harcama Karşılaştırması">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B6560", fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#6B6560", fontSize: 11 }}
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
              <PolarGrid stroke="#E5E0D8" />
              <PolarAngleAxis dataKey="day" tick={{ fill: "#6B6560", fontSize: 12 }} />
              <PolarRadiusAxis
                tick={{ fill: "#9B9590", fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Radar
                name="Harcama"
                dataKey="value"
                stroke="#AA5930"
                fill="#AA5930"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ r: 4, fill: "#AA5930" }}
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
                  formatter={(val) => <span style={{ color: "#6B6560" }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="İşlem Tutarı Dağılımı (Histogram)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="range" tick={{ fill: "#6B6560", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6B6560", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v} işlem`} />} />
              <Bar
                dataKey="count"
                name="İşlem Sayısı"
                fill="#AA5930"
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
