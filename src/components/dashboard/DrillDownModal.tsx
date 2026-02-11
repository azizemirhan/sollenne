"use client";

import { useState } from "react";
import { formatFull } from "@/lib/format";
import { getCategoryLabel } from "@/constants/categories";
import type { Transaction } from "@/types/transaction";

type SortKey = "date" | "total" | "unitPrice" | "qty";
type SortDir = "asc" | "desc";

export interface DrillDownModalProps {
  title: string;
  items: Transaction[];
  onClose: () => void;
}

export function DrillDownModal({ title, items, onClose }: DrillDownModalProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const PAGE_SIZE = 100;
  const [page, setPage] = useState(0);

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") {
      const [da, ma, ya] = a.date.split(".");
      const [db, mb, yb] = b.date.split(".");
      cmp =
        parseInt(ya + ma + da, 10) - parseInt(yb + mb + db, 10);
    } else {
      cmp = a[sortKey] - b[sortKey];
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const totalSum = items.reduce((s, t) => s + t.total, 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(45, 42, 38, 0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          maxWidth: 1100,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #E5E0D8",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #E5E0D8",
            background: "#F8F6F3",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: "#2D2A26", fontWeight: 700 }}>
              {title}
            </h3>
            <div style={{ fontSize: 13, color: "#9B9590", marginTop: 4 }}>
              {items.length} işlem • Toplam: {formatFull(Math.round(totalSum))} TL
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E0D8",
              color: "#6B6560",
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F8F6F3";
              e.currentTarget.style.color = "#2D2A26";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.color = "#6B6560";
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflow: "auto", flex: 1, padding: "0 24px 20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              marginTop: 16,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #E5E0D8" }}>
                <th
                  onClick={() => toggleSort("date")}
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    color: "#6B6560",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tarih{arrow("date")}
                </th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B6560", fontWeight: 600 }}>
                  Kategori
                </th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B6560", fontWeight: 600 }}>
                  Tedarikçi
                </th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B6560", fontWeight: 600 }}>
                  Ürün
                </th>
                <th
                  onClick={() => toggleSort("qty")}
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    color: "#6B6560",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Miktar{arrow("qty")}
                </th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B6560", fontWeight: 600 }}>
                  Birim
                </th>
                <th
                  onClick={() => toggleSort("unitPrice")}
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    color: "#6B6560",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Birim Fiyat{arrow("unitPrice")}
                </th>
                <th
                  onClick={() => toggleSort("total")}
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    color: "#6B6560",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Toplam{arrow("total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((t, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #F0EDE8",
                    background: i % 2 === 0 ? "transparent" : "#FDFCFB",
                  }}
                >
                  <td style={{ padding: "10px 8px", color: "#2D2A26", whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ padding: "10px 8px", color: "#6B6560" }}>{getCategoryLabel(t.category)}</td>
                  <td
                    style={{
                      padding: "10px 8px",
                      color: "#2D2A26",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.supplier}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      color: "#2D2A26",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.product}
                  </td>
                  <td style={{ padding: "10px 8px", color: "#2D2A26", textAlign: "right" }}>
                    {formatFull(t.qty)}
                  </td>
                  <td style={{ padding: "10px 8px", color: "#9B9590" }}>{t.unit}</td>
                  <td style={{ padding: "10px 8px", color: "#2D2A26", textAlign: "right" }}>
                    {formatFull(Math.round(t.unitPrice))} TL
                  </td>
                  <td style={{ padding: "10px 8px", color: "#AA5930", textAlign: "right", fontWeight: 600 }}>
                    {formatFull(Math.round(t.total))} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              padding: "16px 24px",
              borderTop: "1px solid #E5E0D8",
              background: "#F8F6F3",
              borderRadius: "0 0 16px 16px",
            }}
          >
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #E5E0D8",
                background: "#FFFFFF",
                color: page === 0 ? "#9B9590" : "#2D2A26",
                cursor: page === 0 ? "default" : "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Önceki
            </button>
            <span style={{ fontSize: 13, color: "#6B6560", lineHeight: "36px", fontWeight: 500 }}>
              {page + 1} / {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #E5E0D8",
                background: "#FFFFFF",
                color: page >= pageCount - 1 ? "#9B9590" : "#2D2A26",
                cursor: page >= pageCount - 1 ? "default" : "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
