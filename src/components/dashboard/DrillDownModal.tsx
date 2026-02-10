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
        background: "rgba(0,0,0,0.7)",
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
          background: "#1a1a2e",
          borderRadius: 12,
          maxWidth: 1100,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #333",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #333",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: "#00f5d4", fontWeight: 700 }}>
              {title}
            </h3>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {items.length} islem &bull; Toplam: {formatFull(Math.round(totalSum))} TL
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#333",
              border: "none",
              color: "#ccc",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            X
          </button>
        </div>

        <div style={{ overflow: "auto", flex: 1, padding: "0 20px 16px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #333" }}>
                <th
                  onClick={() => toggleSort("date")}
                  style={{
                    textAlign: "left",
                    padding: "8px 6px",
                    color: "#aaa",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tarih{arrow("date")}
                </th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#aaa", fontWeight: 600 }}>
                  Kategori
                </th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#aaa", fontWeight: 600 }}>
                  Tedarikci
                </th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#aaa", fontWeight: 600 }}>
                  Urun
                </th>
                <th
                  onClick={() => toggleSort("qty")}
                  style={{
                    textAlign: "right",
                    padding: "8px 6px",
                    color: "#aaa",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Miktar{arrow("qty")}
                </th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#aaa", fontWeight: 600 }}>
                  Birim
                </th>
                <th
                  onClick={() => toggleSort("unitPrice")}
                  style={{
                    textAlign: "right",
                    padding: "8px 6px",
                    color: "#aaa",
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
                    padding: "8px 6px",
                    color: "#aaa",
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
                    borderBottom: "1px solid #222",
                    background: i % 2 === 0 ? "transparent" : "#161625",
                  }}
                >
                  <td style={{ padding: "6px", color: "#ccc", whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ padding: "6px", color: "#ccc" }}>{getCategoryLabel(t.category)}</td>
                  <td
                    style={{
                      padding: "6px",
                      color: "#ccc",
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
                      padding: "6px",
                      color: "#ccc",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.product}
                  </td>
                  <td style={{ padding: "6px", color: "#ccc", textAlign: "right" }}>
                    {formatFull(t.qty)}
                  </td>
                  <td style={{ padding: "6px", color: "#888" }}>{t.unit}</td>
                  <td style={{ padding: "6px", color: "#ccc", textAlign: "right" }}>
                    {formatFull(Math.round(t.unitPrice))} TL
                  </td>
                  <td style={{ padding: "6px", color: "#00f5d4", textAlign: "right", fontWeight: 600 }}>
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
              gap: 8,
              padding: "12px 20px",
              borderTop: "1px solid #333",
            }}
          >
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                background: "#333",
                color: page === 0 ? "#555" : "#ccc",
                cursor: page === 0 ? "default" : "pointer",
                fontSize: 12,
              }}
            >
              Onceki
            </button>
            <span style={{ fontSize: 12, color: "#888", lineHeight: "28px" }}>
              {page + 1} / {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                background: "#333",
                color: page >= pageCount - 1 ? "#555" : "#ccc",
                cursor: page >= pageCount - 1 ? "default" : "pointer",
                fontSize: 12,
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
