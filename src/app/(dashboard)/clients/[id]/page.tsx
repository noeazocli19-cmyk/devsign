import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  FolderKanban,
  Mail,
  Phone,
  Plus,
  StickyNote,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { EditClientButton } from "@/components/clients/client-form";
import { formatAmount, formatDate, initials } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id }> }) {
  const { id } = await params;
  const user = await requireUser();

  // Vérifie l'ownership : un utilisateur ne voit que ses propres clients.
  const client = await db.client.findFirst({ where: { id, userId: user.id } });
  if (!client) notFound();

  const [contracts, projects, payments] = await Promise.all([
    db.contract.findMany({
      where: { clientId: client.id, userId: user.id },
      select: { id: true, reference: true, title: true, status: true, totalAmount: true, currency: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.project.count({ where: { clientId: client.id, userId: user.id } }),
    db.payment.findMany({
      where: { userId: user.id, contract: { clientId: client.id } },
      select: { status: true, amount: true, currency: true },
    }),
  ]);

  const totalBilled = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);
  const signedCount = contracts.filter((c) => c.status === "SIGNED").length;
  const fullName = `${client.firstName} ${client.lastName}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Link href="/clients" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour aux clients
      </Link>

      {/* En-tête client */}
      <PageHeader
        title={fullName}
        description={client.company ?? undefined}
        actions={
          <>
            <EditClientButton
              client={{
                id: client.id,
                firstName: client.firstName,
                lastName: client.lastName,
                email: client.email,
                phone: client.phone,
                company: client.company,
                notes: client.notes,
              }}
            />
            <Link
              href="/projects/new"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouveau projet
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-emerald-50 text-base font-semibold text-emerald-700">
            {initials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`mailto:${client.email}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-sm transition-colors hover:border-emerald-200 hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {client.email}
          </a>
          {client.phone && (
            <a
              href={`tel:${client.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-sm transition-colors hover:border-emerald-200 hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              {client.phone}
            </a>
          )}
        </div>
      </div>

      {/* Mini statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projets" value={projects} icon={FolderKanban} hint={`${projects > 0 ? "projets liés à ce client" : "aucun projet pour l'instant"}`} />
        <StatCard label="Contrats" value={contracts.length} icon={FileText} hint={contracts.length > 0 ? `${signedCount} signé${signedCount > 1 ? "s" : ""}` : "aucun contrat"} />
        <StatCard label="Total facturé" value={formatAmount(totalBilled)} icon={FileText} hint="somme des contrats" />
        <StatCard
          label="Total payé"
          value={formatAmount(totalPaid)}
          icon={Wallet}
          tone="success"
          hint={totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)} % encaissé` : "—"}
        />
      </div>

      {/* Contrats du client */}
      <section>
        <h2 className="mb-3 text-sm font-semibold">Contrats ({contracts.length})</h2>
        {contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun contrat avec ce client"
            description="Créez un projet pour ce client : le devis, le contrat et les paiements seront rattachés automatiquement à sa fiche."
            actionLabel="Nouveau projet"
            actionHref="/projects/new"
            className="border-solid"
          />
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {contracts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contracts/${c.id}`}
                  className="flex min-h-14 flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {c.title}
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{c.reference}</span> · créé le {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="font-semibold tabular-nums">{formatAmount(c.totalAmount, c.currency)}</p>
                    <StatusBadge status={c.status} kind="contract" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes */}
      {client.notes && (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <StickyNote className="h-4 w-4 text-muted-foreground" aria-hidden />
            Notes
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{client.notes}</p>
        </section>
      )}
    </div>
  );
}
