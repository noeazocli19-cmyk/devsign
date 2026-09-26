import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError, parseBody } from "@/lib/api-utils";
import { clientSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id }> };

/** GET /api/clients/[id] — détail d'un client (ownership vérifié) + ses contrats. */
export async function GET(_req: Request, { params }: Ctx) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const { id } = await params;
    const client = await db.client.findFirst({
      where: { id, userId: user.id },
      include: {
        projects: { select: { id: true, name: true, status: true } },
        contracts: {
          select: { id: true, reference: true, title: true, status: true, totalAmount: true, currency: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!client) return fail("Client introuvable.", 404);
    return ok({ client });
  } catch (e) {
    return handleApiError(e, "CLIENT_GET");
  }
}

/** PATCH /api/clients/[id] — met à jour un client (ownership vérifié). */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const { id } = await params;
    const existing = await db.client.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!existing) return fail("Client introuvable.", 404);

    const { data, error } = await parseBody(req, clientSchema);
    if (error) return error;

    const client = await db.client.update({
      where: { id },
      data: {
        firstName: data!.firstName,
        lastName: data!.lastName,
        email: data!.email,
        phone: data!.phone ?? null,
        company: data!.company ?? null,
        notes: data!.notes ?? null,
      },
    });

    return ok({ client });
  } catch (e) {
    return handleApiError(e, "CLIENT_PATCH");
  }
}

/**
 * DELETE /api/clients/[id] — suppression autorisée uniquement si le client
 * n'est lié à aucun contrat (sinon 409 pour préserver l'historique).
 */
export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const { id } = await params;
    const client = await db.client.findFirst({
      where: { id, userId: user.id },
      include: { contracts: { select: { id: true }, take: 1 } },
    });
    if (!client) return fail("Client introuvable.", 404);

    if (client.contracts.length > 0) {
      return fail("Impossible de supprimer un client lié à des contrats.", 409);
    }

    await db.client.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return handleApiError(e, "CLIENT_DELETE");
  }
}
