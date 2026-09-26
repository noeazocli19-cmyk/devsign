// ─── GET /api/templates — modèles système ────────────────────

import { db } from "@/lib/db";
import { ok, fail, handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);

    const templates = await db.contractTemplate.findMany({
      where: { isSystem: true },
      orderBy: { createdAt: "asc" },
    });

    return ok({ templates });
  } catch (e) {
    return handleApiError(e, "GET /api/templates");
  }
}
