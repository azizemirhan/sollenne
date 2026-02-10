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
  AreaChart,
  Area,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { CHART_COLORS } from "@/constants/charts";
import type { Transaction } from "@/types/transaction";

export interface TrendlerTabProps {
  dailyData: Array<{ date: string; total: number }>;
  weeklyData: Array<{ name: string; value: number }>;
  transactions: Transaction[];
}

export function TrendlerTab({ dailyData, weeklyData, transactions }: TrendlerTabProps) {
  const cumulativeData = dailyData.reduce(
    (acc, d) => {
      const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
      acc.push({ ...d, cumulative: prev + d.total });
      return acc;
    },
    [] as Array<{ date: string; total: number; cumulative: number }>
  );

  const weeklyCountData = weeklyData.map((w, i) => {
    const weekTxs = transactions.filter((t) => {
      const day = parseInt(t.date.split(".")[0], 10);
      if (i === 0) return day <= 5;
      if (i === 1) return day >= 6 && day <= 12;
      if (i === 2) return day >= 13 && day <= 19;
      if (i === 3) return day >= 20 && day <= 26;
      return day >= 27;
    });
    return { ...w, count: weekTxs.length };
  });

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ChartCard title="Günlük Harcama Trendi (Detaylı)" fullWidth>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Harcama" radius={[4, 4, 0, 0]}>
              {dailyData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Kümülatif Harcama Trendi">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="gradCum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f5d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Kümülatif"
              stroke="#00f5d4"
              fill="url(#gradCum)"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00f5d4" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Haftalık İşlem Yoğunluğu">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyCountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#888", fontSize: 10 }}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip formatter={(v) => `${v} işlem`} />} />
            <Bar dataKey="count" name="İşlem Sayısı" fill="#9b5de5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
