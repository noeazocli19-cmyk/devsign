"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export type ChartPoint = { month: string; count: number };

/**
 * Mini graphique en barres : contrats créés sur les 6 derniers mois.
 * Client component (recharts) — couleur émeraude via var(--chart-1).
 */
export function ContractsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[240px] w-full" role="img" aria-label="Contrats créés par mois sur les 6 derniers mois">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            dy={8}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 13,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
            formatter={(value) => [`${value} contrat${Number(value) > 1 ? "s" : ""}`, "Créés"]}
          />
          <Bar dataKey="count" name="Contrats" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
