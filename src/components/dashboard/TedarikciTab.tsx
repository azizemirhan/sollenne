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
import { AlertTriangle } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { DrillDownModal } from "./DrillDownModal";
import { formatFull } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";
import type { Transaction } from "@/types/transaction";

export interface TedarikciTabProps {
  supplierData: Array<{ name: string; value: number; pct: string }>;
  totalSpend: number;
  transactions: Transaction[];
}

export function TedarikciTab({ supplierData, totalSpend, transactions }: TedarikciTabProps) {
  const [drillDown, setDrillDown] = useState<{ title: string; items: Transaction[] } | null>(null);

  const top3Share = totalSpend
    ? (
        (supplierData
          .slice(0, 3)
          .reduce((s, d) => s + d.value, 0) /
          totalSpend) *
        100
      ).toFixed(1)
    : "0";

  const handleBarClick = (idx: number) => {
    const entry = supplierData.slice(0, 10)[idx];
    if (!entry?.name) return;
    const filtered = transactions.filter((t) => t.supplier === entry.name);
    setDrillDown({ title: `Tedarikçi: ${entry.name}`, items: filtered });
  };

  const handleCardClick = (supplierName: string) => {
    const filtered = transactions.filter((t) => t.supplier === supplierName);
    setDrillDown({ title: `Tedarikçi: ${supplierName}`, items: filtered });
  };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <ChartCard title="En Büyük 10 Tedarikçi" fullWidth>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={supplierData.slice(0, 10)} layout="vertical" margin={{ left: 160 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
            <XAxis
              type="number"
              tick={{ fill: "#6B6560", fontSize: 11 }}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
              }
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#6B6560", fontSize: 11 }}
              width={180}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Harcama"
              radius={[0, 6, 6, 0]}
              onClick={(_: unknown, idx: number) => handleBarClick(idx)}
              cursor="pointer"
            >
              {supplierData.slice(0, 10).map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
              gap: 16,
              marginBottom: 20,
              padding: "16px 20px",
              background: "#FEF3C7",
              borderRadius: 12,
              border: "1px solid #FDE68A",
            }}
          >
            <AlertTriangle size={28} color="#92400E" />
            <div>
              <div style={{ color: "#92400E", fontWeight: 600, fontSize: 15 }}>
                Tedarikçi Yoğunlaşma Uyarısı
              </div>
              <div style={{ color: "#B45309", fontSize: 13 }}>
                İlk 3 tedarikçi toplam harcamanın %{top3Share} ini oluşturuyor
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 10,
            }}
          >
            {supplierData.slice(0, 15).map((s, i) => (
              <div
                key={i}
                onClick={() => handleCardClick(s.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "#F8F6F3",
                  borderRadius: 10,
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
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: CHART_COLORS[i % CHART_COLORS.length] + "20",
                    color: CHART_COLORS[i % CHART_COLORS.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#2D2A26",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9B9590" }}>
                    {formatFull(Math.round(s.value))} ₺
                  </div>
                </div>
                <div
                  style={{
                    background: CHART_COLORS[i % CHART_COLORS.length] + "20",
                    color: CHART_COLORS[i % CHART_COLORS.length],
                    padding: "4px 12px",
                    borderRadius: 16,
                    fontSize: 13,
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
