"use client";

// ─── AreaChart — montants encaissés par mois (paiements réussis) ───

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatAmount } from "@/lib/format";

export type RevenuePoint = { label: string; amount: number };

export function RevenueMonthChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground, #71717a)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fontSize: 11, fill: "var(--muted-foreground, #71717a)" }}
            tickFormatter={(value: number) =>
              value >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("fr-FR")} M` : value >= 1000 ? `${Math.round(value / 1000)} k` : String(value)
            }
          />
          <Tooltip
            cursor={{ stroke: "#10b981", strokeOpacity: 0.25 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border, #e4e4e7)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: 13,
            }}
            formatter={(value) => [formatAmount(Number(value)), "Encaissé"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#059669" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
