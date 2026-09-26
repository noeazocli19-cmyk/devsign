import Link from "next/link";
import { Eye, FileDown, FolderOpen, PenLine } from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatAmount, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Documents — DevSign" };

export default async function DocumentsPage() {
  const user = await requireUser();

  const contracts = await db.contract.findMany({
    where: { userId: user.id, status: "SIGNED" },
    include: { client: true, project: true, signatures: true },
    orderBy: { signedAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader title="Documents" description="Tous vos contrats signés, prêts à télécharger." />

      {contracts.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document signé"
          description="Dès qu'un client signe un contrat, le document finalisé apparaît ici, prêt à être téléchargé en PDF."
          actionLabel="Créer un contrat"
          actionHref="/projects/new"
        />
      ) : (
        <ul className="space-y-3">
          {contracts.map((contract) => {
            const signature = contract.signatures[0];
            return (
              <li key={contract.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-emerald-300 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium text-muted-foreground">{contract.reference}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                      <PenLine className="h-3 w-3" aria-hidden /> Signé
                    </span>
                  </div>
                  <h2 className="truncate font-semibold">{contract.title}</h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {contract.client.firstName} {contract.client.lastName} · {contract.project.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signé le {formatDate(signature?.signedAt ?? contract.signedAt)}
                    {signature?.signerName ? ` par ${signature.signerName}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                  <p className="text-sm font-semibold tabular-nums">{formatAmount(contract.totalAmount, contract.currency)}</p>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/c/${contract.publicId}/pdf`} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-4 w-4" aria-hidden /> Télécharger PDF
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/contracts/${contract.id}`}>
                        <Eye className="h-4 w-4" aria-hidden /> Voir
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
