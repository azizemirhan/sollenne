"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
} from "recharts";
import { CHART_COLORS } from "@/constants/charts";
import { CustomTooltip } from "./CustomTooltip";

/* ─── Weekly Chart ─── */
export function WeeklyChart({ data }: { data: Array<{ name: string; value: number }> }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: "#6B6560", fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                />
                <YAxis
                    tick={{ fill: "#6B6560", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="value"
                    name="Harcama"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

/* ─── Day of Week Chart ─── */
export function DayOfWeekChart({ data }: { data: Array<{ day: string; value: number }> }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data} cx="50%" cy="50%">
                <PolarGrid stroke="#E5E0D8" />
                <PolarAngleAxis dataKey="day" tick={{ fill: "#6B6560", fontSize: 12 }} />
                <PolarRadiusAxis
                    tick={{ fill: "#9B9590", fontSize: 10 }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Radar
                    name="Harcama"
                    dataKey="value"
                    stroke="#AA5930"
                    fill="#AA5930"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#AA5930" }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

/* ─── Category Pie Chart ─── */
export function CategoryPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="35%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        paddingAngle={2}
                        label={false}
                        cursor="pointer"
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: 11, lineHeight: "18px", paddingLeft: 10 }}
                        formatter={(val) => <span style={{ color: "#6B6560" }}>{val}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ─── Histogram Chart ─── */
export function HistogramChart({ data }: { data: Array<{ range: string; count: number }> }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                <XAxis dataKey="range" tick={{ fill: "#6B6560", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6B6560", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip formatter={(v: number) => `${v} işlem`} />} />
                <Bar
                    dataKey="count"
                    name="İşlem Sayısı"
                    fill="#AA5930"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
