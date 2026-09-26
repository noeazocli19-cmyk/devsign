"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatAmount, formatDate, timeAgo } from "@/lib/format";
import { PAYMENT_TYPES } from "@/lib/status";
import { cn } from "@/lib/utils";

export type PaymentListItem = {
  id: string;
  reference: string;
  providerTxId: string | null;
  type: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  contractId: string | null;
  contractReference: string | null;
};

type Filter = "all" | "success" | "pending" | "failed";

const FILTERS: { value: Filter; label: string; match: (p: PaymentListItem) => boolean }[] = [
  { value: "all", label: "Tous", match: () => true },
  { value: "success", label: "Payés", match: (p) => p.status === "SUCCESS" },
  { value: "pending", label: "En attente", match: (p) => ["PENDING", "PROCESSING"].includes(p.status) },
  { value: "failed", label: "Échoués", match: (p) => ["FAILED", "CANCELLED"].includes(p.status) },
];

/** Liste des paiements : tableau sur desktop, cartes empilées sur mobile, filtres par statut. */
export function PaymentsList({ items }: { items: PaymentListItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: items.length,
      success: items.filter((p) => p.status === "SUCCESS").length,
      pending: items.filter((p) => ["PENDING", "PROCESSING"].includes(p.status)).length,
      failed: items.filter((p) => ["FAILED", "CANCELLED"].includes(p.status)).length,
    }),
    [items],
  );

  const visible = useMemo(
    () => items.filter(FILTERS.find((f) => f.value === filter)!.match),
    [items, filter],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Aucune transaction pour le moment"
        description="Les paiements de vos contrats signés apparaîtront ici, avec leur référence SaaSPay et leur statut en temps réel."
        className="border-solid"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="h-10 w-full justify-start overflow-x-auto sm:w-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="min-h-9 px-3">
              {f.label}
              <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">{counts[f.value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tableau — desktop */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-5">Référence</TableHead>
              <TableHead>Transaction SaaSPay</TableHead>
              <TableHead>Contrat</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="pr-5">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((p) => (
              <TableRow key={p.id} className="h-14">
                <TableCell className="pl-5 font-mono text-sm font-medium">{p.reference}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{p.providerTxId ?? "—"}</TableCell>
                <TableCell>
                  {p.contractId && p.contractReference ? (
                    <Link href={`/contracts/${p.contractId}`} className="font-mono text-sm font-medium text-primary hover:underline">
                      {p.contractReference}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{PAYMENT_TYPES[p.type] ?? p.type}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatAmount(p.amount, p.currency)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} kind="payment" />
                </TableCell>
                <TableCell className="pr-5 text-sm text-muted-foreground" title={formatDate(p.createdAt)}>
                  {timeAgo(p.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Aucune transaction dans ce filtre.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cartes — mobile */}
      <ul className="space-y-3 md:hidden">
        {visible.map((p) => (
          <li key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{p.reference}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{p.providerTxId ?? "—"}</p>
              </div>
              <StatusBadge status={p.status} kind="payment" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="space-y-0.5 text-sm">
                <p className="text-lg font-bold tabular-nums">{formatAmount(p.amount, p.currency)}</p>
                <p className="text-muted-foreground">
                  {PAYMENT_TYPES[p.type] ?? p.type} · {timeAgo(p.createdAt)}
                </p>
                {p.contractId && p.contractReference && (
                  <Link href={`/contracts/${p.contractId}`} className={cn("font-mono text-xs font-medium text-primary hover:underline")}>
                    Contrat {p.contractReference}
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Aucune transaction dans ce filtre.
          </li>
        )}
      </ul>
    </div>
  );
}
