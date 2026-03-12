"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { Filter, Calendar } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { filterByRange } from "@/lib/filter-transactions";

interface ComponentFilterProps {
    title: string;
    transactions: Transaction[];
    children: (filteredTransactions: Transaction[], periodLabel: string) => ReactNode;
    className?: string;
    initialStartDate?: string;
    initialEndDate?: string;
}

export function ComponentFilter({
    title,
    transactions,
    children,
    className = "",
    initialStartDate,
    initialEndDate,
}: ComponentFilterProps) {
    const [startDate, setStartDate] = useState(initialStartDate || "");
    const [endDate, setEndDate] = useState(initialEndDate || "");

    useEffect(() => {
        if (initialStartDate) setStartDate(initialStartDate);
        if (initialEndDate) setEndDate(initialEndDate);
    }, [initialStartDate, initialEndDate]);
    const [isOpen, setIsOpen] = useState(false);

    // Generate last 12 months for options
    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 18; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth();
            const lastDay = new Date(y, m + 1, 0).getDate();
            const label = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
            const start = `01.${String(m + 1).padStart(2, "0")}.${y}`;
            const end = `${lastDay}.${String(m + 1).padStart(2, "0")}.${y}`;
            options.push({ label, start, end });
        }
        return options;
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!startDate || !endDate) return transactions;
        return filterByRange(transactions, startDate, endDate, []);
    }, [transactions, startDate, endDate]);

    const currentLabel = useMemo(() => {
        if (!startDate || !endDate) return "Global Dönem";
        const opt = monthOptions.find((o) => o.start === startDate && o.end === endDate);
        return opt ? opt.label : `${startDate} - ${endDate}`;
    }, [startDate, endDate, monthOptions]);

    return (
        <div
            className={className}
            style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #E5E0D8",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#2D2A26" }}>{title}</h3>

                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid #E5E0D8",
                            background: startDate ? "#ecfdf5" : "#f9fafb",
                            color: startDate ? "#047857" : "#6B6560",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <Calendar size={14} />
                        {currentLabel}
                    </button>

                    {isOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: 4,
                                background: "#fff",
                                border: "1px solid #E5E0D8",
                                borderRadius: 8,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                zIndex: 50,
                                width: 200,
                                maxHeight: 300,
                                overflowY: "auto",
                            }}
                        >
                            <div
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: !startDate ? "#AA5930" : "#4B5563",
                                    fontWeight: !startDate ? 600 : 400,
                                    background: !startDate ? "#fff7ed" : "transparent",
                                }}
                            >
                                Global Dönem (Varsayılan)
                            </div>
                            {monthOptions.map((opt) => (
                                <div
                                    key={opt.label}
                                    onClick={() => {
                                        setStartDate(opt.start);
                                        setEndDate(opt.end);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        padding: "8px 12px",
                                        fontSize: 13,
                                        cursor: "pointer",
                                        color: startDate === opt.start ? "#AA5930" : "#4B5563",
                                        fontWeight: startDate === opt.start ? 600 : 400,
                                        background: startDate === opt.start ? "#fff7ed" : "transparent",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        startDate === opt.start ? "#fff7ed" : "transparent")
                                    }
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Render children with filtered data */}
            {children(filteredTransactions, currentLabel)}
        </div>
    );
}
