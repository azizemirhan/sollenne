"use client";

import { useState } from "react";
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
import { DrillDownModal } from "./DrillDownModal";
import { formatFull, formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";

export interface KategoriTabProps {
  categoryData: Array<{ name: string; value: number }>;
  totalSpend: number;
  transactions: Transaction[];
}

export function KategoriTab({ categoryData, totalSpend, transactions }: KategoriTabProps) {
  const [drillDown, setDrillDown] = useState<{ title: string; items: Transaction[] } | null>(null);

  const handleBarClick = (idx: number) => {
    const entry = categoryData[idx];
    if (!entry?.name) return;
    const filtered = transactions.filter((t) => getCategoryLabel(t.category) === entry.name);
    setDrillDown({ title: `Kategori: ${entry.name}`, items: filtered });
  };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <ChartCard title="Kategori Harcama Sıralaması" fullWidth>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
            <XAxis
              type="number"
              tick={{ fill: "#6B6560", fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#6B6560", fontSize: 11 }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Harcama"
              radius={[0, 6, 6, 0]}
              onClick={(_: unknown, idx: number) => handleBarClick(idx)}
              cursor="pointer"
            >
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
                onClick={() => handleBarClick(i)}
                style={{
                  background: "#F8F6F3",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.2s",
                  border: "1px solid #E5E0D8",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F8F6F3";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 44,
                    borderRadius: 5,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#2D2A26",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9B9590" }}>
                    {formatFull(Math.round(cat.value))} ₺
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
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

      {drillDown && (
        <DrillDownModal
          title={drillDown.title}
          items={drillDown.items}
          onClose={() => setDrillDown(null)}
        />
      )}
    </div>
  );
}
