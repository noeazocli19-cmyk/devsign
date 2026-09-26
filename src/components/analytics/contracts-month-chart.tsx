"use client";

// ─── BarChart — contrats créés par mois (6 mois) ─────────────

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type MonthPoint = { label: string; count: number };

export function ContractsMonthChart({ data }: { data: MonthPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground, #71717a)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground, #71717a)" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border, #e4e4e7)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: 13,
            }}
            formatter={(value) => [`${value} contrat${Number(value) > 1 ? "s" : ""}`, "Créés"]}
          />
          <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
