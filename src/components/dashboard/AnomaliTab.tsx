"use client";

import { useState } from "react";
import { ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { formatFull } from "@/lib/format";
import type { Transaction } from "@/types/transaction";

export interface AnomaliTabProps {
  threshold: number;
  items: Transaction[];
  allTransactions: Transaction[];
  mean: number;
  stdDev: number;
}

export function AnomaliTab({ threshold, items, allTransactions, mean, stdDev }: AnomaliTabProps) {
  const [businessThreshold, setBusinessThreshold] = useState<string>("");

  const btVal = parseFloat(businessThreshold.replace(/[^0-9]/g, "")) || 0;

  const businessRuleItems = btVal > 0
    ? allTransactions
        .filter((t) => t.total > btVal && !items.some((a) => a === t))
        .sort((a, b) => b.total - a.total)
    : [];

  const allAnomalies = [...items];
  businessRuleItems.forEach((t) => {
    if (!allAnomalies.includes(t)) allAnomalies.push(t);
  });
  allAnomalies.sort((a, b) => b.total - a.total);

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="İş Kuralı Eşiği (Opsiyonel)" fullWidth>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>
            İş kuralı eşiği (₺):
          </label>
          <input
            type="text"
            value={businessThreshold}
            onChange={(e) => setBusinessThreshold(e.target.value)}
            placeholder="Örn: 50000"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#161625",
              color: "#e0e0e0",
              fontSize: 12,
              width: 140,
            }}
          />
          {btVal > 0 && (
            <span style={{ fontSize: 12, color: "#888" }}>
              {businessRuleItems.length} ek işlem bu eşiği aşıyor
            </span>
          )}
        </div>
      </ChartCard>

      <ChartCard
        title={`İstatistiksel Anomaliler (Eşik: ${formatFull(Math.round(threshold))} ₺ üzeri)`}
        fullWidth
      >
        <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          Ortalama + 2 standart sapma üzerindeki işlemler anomali olarak işaretlenmiştir.
          (Ort: {formatFull(Math.round(mean))} ₺, Std Sapma: {formatFull(Math.round(stdDev))} ₺)
          {" "}Toplam{" "}
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
              <div style={{ fontSize: 11, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                Neden: Ortalama + 2 standart sapma ({formatFull(Math.round(threshold))} ₺) üzeri
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {btVal > 0 && businessRuleItems.length > 0 && (
        <ChartCard
          title={`İş Kuralı Aşımı (Eşik: ${formatFull(btVal)} ₺ üzeri)`}
          fullWidth
        >
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
            Belirlenen iş kuralı eşiğini ({formatFull(btVal)} ₺) aşan ancak istatistiksel anomali
            olmayan işlemler. Toplam{" "}
            <span style={{ color: "#fee440", fontWeight: 700 }}>{businessRuleItems.length} adet</span>{" "}
            işlem.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {businessRuleItems.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "linear-gradient(135deg, #2a2a1e 0%, #1e1e2e 100%)",
                  border: "1px solid #443322",
                  borderRadius: 10,
                  padding: "14px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fee440",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  📋 {item.product}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  Tarih: {item.date} | Tedarikçi: {item.supplier}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#ffbe0b", marginTop: 6 }}>
                  {formatFull(Math.round(item.total))} ₺
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                  Neden: İş kuralı eşiği ({formatFull(btVal)} ₺) aşıldı
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

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
            <Scatter name="Anomali İşlemleri" data={allAnomalies} fill="#f15bb5">
              {allAnomalies.map((item, i) => (
                <Cell
                  key={i}
                  fill={items.includes(item) ? "#f15bb5" : "#fee440"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
