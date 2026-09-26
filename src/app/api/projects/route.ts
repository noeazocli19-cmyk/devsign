// ─── POST /api/projects — création complète (wizard) ─────────
// Délègue tout au moteur workflow.createFullContract (calculs serveur).

import { db } from "@/lib/db";
import { ok, fail, handleApiError, requireApiUser, parseBody } from "@/lib/api-utils";
import { projectCreateSchema } from "@/lib/validations";
import { createFullContract } from "@/lib/workflow";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);

    const projects = await db.project.findMany({
      where: { userId: user.id },
      include: {
        client: true,
        contracts: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok({ projects });
  } catch (e) {
    return handleApiError(e, "GET /api/projects");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);

    const { data, error } = await parseBody(req, projectCreateSchema);
    if (error || !data) return error ?? fail("Données invalides.", 422);

    const created = await createFullContract({ userId: user.id, ...data });

    return ok({ id: created.id, reference: created.reference, publicId: created.publicId }, 201);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "CLIENT_REQUIRED") return fail("Les informations du client sont requises pour créer le contrat.", 422);
      if (e.message === "NOT_FOUND") return fail("Ressource introuvable.", 404);
    }
    return handleApiError(e, "POST /api/projects");
  }
}
