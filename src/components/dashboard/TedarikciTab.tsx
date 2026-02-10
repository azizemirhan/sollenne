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
import { formatFull } from "@/lib/format";
import { CHART_COLORS } from "@/constants/charts";

export interface TedarikciTabProps {
  supplierData: Array<{ name: string; value: number; pct: string }>;
  totalSpend: number;
}

export function TedarikciTab({ supplierData, totalSpend }: TedarikciTabProps) {
  const top3Share = totalSpend
    ? (
        (supplierData
          .slice(0, 3)
          .reduce((s, d) => s + d.value, 0) /
          totalSpend) *
        100
      ).toFixed(1)
    : "0";

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="En Büyük 10 Tedarikçi" fullWidth>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={supplierData.slice(0, 10)} layout="vertical" margin={{ left: 160 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
              }
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
                İlk 3 tedarikçi toplam harcamanın %{top3Share} ini oluşturuyor
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
                    background: CHART_COLORS[i % CHART_COLORS.length] + "22",
                    color: CHART_COLORS[i % CHART_COLORS.length],
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
                    background: CHART_COLORS[i % CHART_COLORS.length] + "22",
                    color: CHART_COLORS[i % CHART_COLORS.length],
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
}
