import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError, parseBody } from "@/lib/api-utils";
import { clientSchema } from "@/lib/validations";

/** GET /api/clients — liste des clients de l'utilisateur + stats (projets, contrats, facturé). */
export async function GET() {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const clients = await db.client.findMany({
      where: { userId: user.id },
      include: {
        projects: { select: { id: true } },
        contracts: {
          select: { status: true, totalAmount: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats construites côté JS (listes petites) — pas d'agrégation SQL complexe.
    const items = clients.map((c) => {
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
        createdAt: c.createdAt.toISOString(),
      };
    });

    return ok({ items });
  } catch (e) {
    return handleApiError(e, "CLIENTS_GET");
  }
}

/** POST /api/clients — crée un client pour l'utilisateur connecté. */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const { data, error } = await parseBody(req, clientSchema);
    if (error) return error;

    const client = await db.client.create({
      data: {
        userId: user.id,
        firstName: data!.firstName,
        lastName: data!.lastName,
        email: data!.email,
        phone: data!.phone ?? null,
        company: data!.company ?? null,
        notes: data!.notes ?? null,
      },
    });

    return ok({ client }, 201);
  } catch (e) {
    return handleApiError(e, "CLIENTS_POST");
  }
}
