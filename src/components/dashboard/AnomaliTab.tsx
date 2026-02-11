"use client";

import { useState } from "react";
import { ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, FileText, Info } from "lucide-react";
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
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <ChartCard title="İş Kuralı Eşiği (Opsiyonel)" fullWidth>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <label style={{ fontSize: 14, color: "#6B6560", fontWeight: 500 }}>
            İş kuralı eşiği (₺):
          </label>
          <input
            type="text"
            value={businessThreshold}
            onChange={(e) => setBusinessThreshold(e.target.value)}
            placeholder="Örn: 50000"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #E5E0D8",
              background: "#FFFFFF",
              color: "#2D2A26",
              fontSize: 14,
              width: 160,
              outline: "none",
            }}
          />
          {btVal > 0 && (
            <span style={{ fontSize: 14, color: "#9B9590", fontWeight: 500 }}>
              {businessRuleItems.length} ek işlem bu eşiği aşıyor
            </span>
          )}
        </div>
      </ChartCard>

      <ChartCard
        title={`İstatistiksel Anomaliler (Eşik: ${formatFull(Math.round(threshold))} ₺ üzeri)`}
        fullWidth
      >
        <div style={{ fontSize: 14, color: "#6B6560", marginBottom: 20 }}>
          Ortalama + 2 standart sapma üzerindeki işlemler anomali olarak işaretlenmiştir.
          (Ort: {formatFull(Math.round(mean))} ₺, Std Sapma: {formatFull(Math.round(stdDev))} ₺)
          {" "}Toplam{" "}
          <span style={{ color: "#B54242", fontWeight: 700 }}>{items.length} adet</span> olağandışı
          işlem tespit edildi.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 12,
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#B54242",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={18} />
                {item.product}
              </div>
              <div style={{ fontSize: 13, color: "#9B9590", marginTop: 6 }}>
                Tarih: {item.date} | Tedarikçi: {item.supplier}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#B54242", marginTop: 8 }}>
                {formatFull(Math.round(item.total))} ₺
              </div>
              <div style={{ fontSize: 12, color: "#9B9590", marginTop: 6, fontStyle: "italic" }}>
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
          <div style={{ fontSize: 14, color: "#6B6560", marginBottom: 20 }}>
            Belirlenen iş kuralı eşiğini ({formatFull(btVal)} ₺) aşan ancak istatistiksel anomali
            olmayan işlemler. Toplam{" "}
            <span style={{ color: "#C9A227", fontWeight: 700 }}>{businessRuleItems.length} adet</span>{" "}
            işlem.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {businessRuleItems.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  borderRadius: 12,
                  padding: "18px 22px",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#92400E",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FileText size={18} />
                  {item.product}
                </div>
                <div style={{ fontSize: 13, color: "#B45309", marginTop: 6 }}>
                  Tarih: {item.date} | Tedarikçi: {item.supplier}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#92400E", marginTop: 8 }}>
                  {formatFull(Math.round(item.total))} ₺
                </div>
                <div style={{ fontSize: 12, color: "#B45309", marginTop: 6, fontStyle: "italic" }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
            <XAxis dataKey="date" name="Tarih" tick={{ fill: "#6B6560", fontSize: 11 }} />
            <YAxis
              dataKey="total"
              name="Tutar"
              tick={{ fill: "#6B6560", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Anomali İşlemleri" data={allAnomalies} fill="#B54242">
              {allAnomalies.map((item, i) => (
                <Cell
                  key={i}
                  fill={items.includes(item) ? "#B54242" : "#C9A227"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
