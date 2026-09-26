import Link from "next/link";
import { Eye, FileText } from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatAmount, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CopyContractLinkButton } from "@/components/contracts/copy-link-button";
import { ContractRowMenu } from "@/components/contracts/contract-row-menu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Contrats — DevSign" };

const FILTERS: { value: string; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "SENT", label: "Envoyés" },
  { value: "VIEWED", label: "Ouverts" },
  { value: "SIGNED", label: "Signés" },
  { value: "EXPIRED", label: "Expirés" },
  { value: "CANCELLED", label: "Annulés" },
];

const VALID_STATUSES = FILTERS.map((f) => f.value);

const EMPTY_COPY: Record<string, { title: string; description: string }> = {
  tous: { title: "Aucun contrat", description: "Créez votre premier contrat depuis un projet : devis, clauses et signature électronique inclus." },
  DRAFT: { title: "Aucun brouillon", description: "Les contrats en préparation apparaîtront ici, prêts à être relus puis envoyés." },
  SENT: { title: "Aucun contrat envoyé", description: "Envoyez un brouillon pour que votre client puisse le consulter et le signer en ligne." },
  VIEWED: { title: "Aucun contrat ouvert", description: "Vous serez notifié dès qu'un client ouvre votre proposition." },
  SIGNED: { title: "Aucun contrat signé", description: "Les contrats signés par vos clients apparaîtront ici, avec l'acompte à encaisser." },
  EXPIRED: { title: "Aucun contrat expiré", description: "Les propositions sans réponse après leur validité apparaîtront ici." },
  CANCELLED: { title: "Aucun contrat annulé", description: "Les contrats annulés apparaîtront ici." },
};

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status: statusParam } = await searchParams;

  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : "tous";

  const contracts = await db.contract.findMany({
    where: { userId: user.id, ...(status !== "tous" ? { status } : {}) },
    include: { client: true, project: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const empty = EMPTY_COPY[status] ?? EMPTY_COPY.tous;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader title="Contrats" description="Suivez chaque proposition de l'envoi à la signature." />

      {/* Filtres */}
      <nav aria-label="Filtrer par statut" className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "tous" ? "/contracts" : `/contracts?status=${f.value}`}
            scroll={false}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === f.value ? "bg-primary text-primary-foreground shadow-xs" : "border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-current={status === f.value ? "page" : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={empty.title}
          description={empty.description}
          actionLabel={status === "tous" ? "Créer un contrat" : undefined}
          actionHref={status === "tous" ? "/projects/new" : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {contracts.map((contract) => (
            <li key={contract.id} className="rounded-xl border bg-card p-4 transition-colors hover:border-emerald-300 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Infos principales */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium text-muted-foreground">{contract.reference}</span>
                    <StatusBadge status={contract.status} kind="contract" />
                  </div>
                  <Link href={`/contracts/${contract.id}`} className="block truncate font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" >
                    {contract.title}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {contract.client.firstName} {contract.client.lastName} · {contract.project.name}
                  </p>
                </div>

                {/* Montant + date */}
                <div className="flex items-center justify-between gap-4 lg:justify-end lg:gap-8">
                  <div className="lg:text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatAmount(contract.totalAmount, contract.currency)}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(contract.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/contracts/${contract.id}`}>
                        <Eye className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Voir</span>
                      </Link>
                    </Button>
                    <CopyContractLinkButton publicId={contract.publicId} size="icon" className="h-8 w-8" tooltip="Copier le lien client" />
                    <ContractRowMenu
                      contractId={contract.id}
                      publicId={contract.publicId}
                      status={contract.status}
                      clientFirstName={contract.client.firstName}
                      projectTitle={contract.title}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
