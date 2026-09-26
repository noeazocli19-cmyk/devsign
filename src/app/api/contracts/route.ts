// ─── GET /api/contracts?status= — liste filtrée ──────────────

import { db } from "@/lib/db";
import { ok, fail, handleApiError, requireApiUser } from "@/lib/api-utils";

const VALID_STATUSES = ["DRAFT", "SENT", "VIEWED", "SIGNED", "EXPIRED", "CANCELLED"];

export async function GET(req: Request) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const valid = status && VALID_STATUSES.includes(status) ? status : undefined;

    const contracts = await db.contract.findMany({
      where: { userId: user.id, ...(valid ? { status: valid } : {}) },
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok({ contracts });
  } catch (e) {
    return handleApiError(e, "GET /api/contracts");
  }
}
