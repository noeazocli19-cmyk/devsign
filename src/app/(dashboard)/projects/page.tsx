import Link from "next/link";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatAmount, timeAgo } from "@/lib/format";
import { PROJECT_TYPES } from "@/lib/status";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Projets — DevSign" };

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await db.project.findMany({
    where: { userId: user.id },
    include: {
      client: true,
      contracts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Projets"
        description="Transformez vos prospects en projets signés, puis suivez-les jusqu'à la livraison."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4" aria-hidden /> Nouveau projet
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet pour le moment"
          description="Créez votre premier projet en 4 étapes : client, projet, devis et contrat prêts à être signés."
          actionLabel="Créer un projet"
          actionHref="/projects/new"
        />
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => {
            const contract = project.contracts[0];
            const row = (
              <div
                className={cn(
                  "flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all sm:flex-row sm:items-center sm:justify-between",
                  contract ? "hover:border-emerald-300 hover:shadow-sm" : ""
                )}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">{project.name}</h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                      {PROJECT_TYPES[project.type] ?? project.type}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {project.client.firstName} {project.client.lastName}
                    {project.client.company ? ` · ${project.client.company}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Créé {timeAgo(project.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatAmount(project.totalPrice, project.currency)}</p>
                    <p className="text-xs text-muted-foreground">Acompte {formatAmount(project.depositAmount, project.currency)}</p>
                  </div>
                  <StatusBadge status={project.status} kind="project" />
                  {contract && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                </div>
              </div>
            );

            return (
              <li key={project.id}>
                {contract ? (
                  <Link href={`/contracts/${contract.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl" aria-label={`Ouvrir le contrat du projet ${project.name}`}>
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
