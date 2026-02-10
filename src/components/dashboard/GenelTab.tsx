"use client";

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
import { formatFull, formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";

export interface GenelTabProps {
  stats: {
    totalSpend: number;
    txCount: number;
    suppliers: number;
    products: number;
    avg: number;
    median: number;
  };
  weeklyData: Array<{ name: string; value: number }>;
  dayOfWeekData: Array<{ day: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
  histogramData: Array<{ range: string; count: number }>;
}

export function GenelTab({
  stats,
  weeklyData,
  dayOfWeekData,
  categoryData,
  histogramData,
}: GenelTabProps) {
  return (
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
              <Bar dataKey="count" name="İşlem Sayısı" fill="#00bbf9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
