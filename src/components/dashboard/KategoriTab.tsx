"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { formatFull, formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";

export interface KategoriTabProps {
  categoryData: Array<{ name: string; value: number }>;
  totalSpend: number;
}

export function KategoriTab({ categoryData, totalSpend }: KategoriTabProps) {
  return (
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
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
            const pct = totalSpend ? ((cat.value / totalSpend) * 100).toFixed(1) : "0";
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
                    background: CHART_COLORS[i % CHART_COLORS.length],
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
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
