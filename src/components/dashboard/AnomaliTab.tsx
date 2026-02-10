"use client";

import { ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { formatFull } from "@/lib/format";
import type { Transaction } from "@/types/transaction";

export interface AnomaliTabProps {
  threshold: number;
  items: Transaction[];
}

export function AnomaliTab({ threshold, items }: AnomaliTabProps) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard
        title={`Olağandışı İşlemler (Eşik: ${formatFull(Math.round(threshold))} ₺ üzeri)`}
        fullWidth
      >
        <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          Ortalama + 2 standart sapma üzerindeki işlemler anomali olarak işaretlenmiştir. Toplam{" "}
          <span style={{ color: "#f15bb5", fontWeight: 700 }}>{items.length} adet</span> olağandışı
          işlem tespit edildi.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
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
            <Scatter name="Anomali İşlemleri" data={items} fill="#f15bb5">
              {items.map((_, i) => (
                <Cell key={i} fill="#f15bb5" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
