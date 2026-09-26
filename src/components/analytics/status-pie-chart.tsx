"use client";

// ─── PieChart — répartition des contrats par statut ──────────

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type StatusSlice = { label: string; value: number; color: string };

export function StatusPieChart({ data }: { data: StatusSlice[] }) {
  const visible = data.filter((d) => d.value > 0);
  const total = visible.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex h-64 flex-col sm:flex-row sm:items-center">
      <div className="relative h-44 w-full sm:h-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border, #e4e4e7)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: 13,
              }}
              formatter={(value, name) => [`${value} contrat${Number(value) > 1 ? "s" : ""}`, String(name)]}
            />
            <Pie data={visible} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="85%" paddingAngle={2} strokeWidth={0}>
              {visible.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">contrats</span>
        </div>
      </div>

      <ul className="mt-4 w-full space-y-2 sm:mt-0 sm:w-1/2 sm:pl-4">
        {visible.length === 0 && <li className="text-sm text-muted-foreground">Aucune donnée pour le moment.</li>}
        {visible.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden />
              {slice.label}
            </span>
            <span className="font-medium tabular-nums">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
