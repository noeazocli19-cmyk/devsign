import { PageHeader } from "@/components/shared/page-header";
import { ClientsBrowser, type ClientListItem } from "@/components/clients/clients-browser";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await requireUser();

  const clients = await db.client.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      company: true,
      updatedAt: true,
      projects: { select: { id: true } },
      contracts: {
        select: { status: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats calculées côté JS (liste petite) — pas d'agrégation SQL nécessaire.
  const items: ClientListItem[] = clients.map((c) => {
    const last = c.contracts[0];
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      company: c.company,
      projectsCount: c.projects.length,
      contractsCount: c.contracts.length,
      totalBilled: c.contracts.reduce((sum, k) => sum + k.totalAmount, 0),
      lastContractStatus: last?.status ?? null,
      lastActivityAt: (last?.createdAt ?? c.updatedAt).toISOString(),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Clients"
        description="Vos contacts, leur historique de facturation et l'état de leur dernier contrat."
      />
      <ClientsBrowser items={items} />
    </div>
  );
}
