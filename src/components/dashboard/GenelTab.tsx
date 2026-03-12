"use client";

import { useState } from "react";
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
  children?: React.ReactNode;
}

function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function GenelTab({
  stats,
  compareStats,
  budget,
  children,
}: GenelTabProps) {

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

      {/* Charts (passed as children) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {children}
      </div>
    </>
  );
}
