"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ClientFormDialog } from "@/components/clients/client-form";
import { formatAmount, initials, timeAgo } from "@/lib/format";

export type ClientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  projectsCount: number;
  contractsCount: number;
  totalBilled: number;
  lastContractStatus: string | null;
  lastActivityAt: string;
};

/** Liste des clients : recherche instantanée (nom / email / entreprise), tableau desktop, cartes mobile. */
export function ClientsBrowser({ items }: { items: ClientListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [`${c.firstName} ${c.lastName}`, c.email, c.company ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client…"
            aria-label="Rechercher un client par nom, email ou entreprise"
            className="h-11 pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="min-h-11">
          <UserPlus className="h-4 w-4" aria-hidden />
          Nouveau client
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client pour le moment"
          description="Ajoutez votre premier client pour créer ses projets, lui envoyer des contrats et recevoir ses paiements."
          actionLabel="Nouveau client"
          onAction={() => setDialogOpen(true)}
          className="border-solid"
        />
      ) : (
        <>
          {/* Tableau — desktop */}
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-5">Client</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead className="text-center">Projets</TableHead>
                  <TableHead className="text-right">Total facturé</TableHead>
                  <TableHead>Dernier contrat</TableHead>
                  <TableHead className="pr-5">Dernière activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    className="h-16 cursor-pointer"
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-50 text-sm font-semibold text-emerald-700">
                            {initials(`${c.firstName} ${c.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/clients/${c.id}`}
                            className="block truncate font-medium hover:text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.company ?? "—"}</TableCell>
                    <TableCell className="text-center text-sm tabular-nums">{c.projectsCount}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatAmount(c.totalBilled)}
                    </TableCell>
                    <TableCell>
                      {c.lastContractStatus ? (
                        <StatusBadge status={c.lastContractStatus} kind="contract" />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-5 text-sm text-muted-foreground">{timeAgo(c.lastActivityAt)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Aucun client ne correspond à « {query} ».
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Cartes — mobile */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/clients/${c.id}`}
                  className="block rounded-xl border bg-card p-4 transition-colors hover:border-emerald-200"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-emerald-50 text-sm font-semibold text-emerald-700">
                        {initials(`${c.firstName} ${c.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        {c.lastContractStatus && <StatusBadge status={c.lastContractStatus} kind="contract" />}
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Entreprise</dt>
                          <dd className="truncate">{c.company ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Projets</dt>
                          <dd className="tabular-nums">{c.projectsCount}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Facturé</dt>
                          <dd className="font-semibold tabular-nums">{formatAmount(c.totalBilled)}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-xs text-muted-foreground">Activité {timeAgo(c.lastActivityAt)}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                Aucun client ne correspond à « {query} ».
              </li>
            )}
          </ul>

          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} client{filtered.length > 1 ? "s" : ""} sur {items.length}
            </p>
          )}
        </>
      )}

      {dialogOpen && <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  );
}
