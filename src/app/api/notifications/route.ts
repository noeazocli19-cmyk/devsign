import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError } from "@/lib/api-utils";

/** Liste des notifications de l'utilisateur connecté. */
export async function GET() {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const [items, unreadCount] = await Promise.all([
      db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
      db.notification.count({ where: { userId: user.id, read: false } }),
    ]);
    return ok({ items, unreadCount });
  } catch (e) {
    return handleApiError(e, "NOTIFICATIONS_GET");
  }
}

/** Marque comme lues : toutes (body { all: true }) ou une seule (body { id }). */
export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.all) {
      await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
      return ok({ updated: "all" });
    }
    if (typeof body?.id === "string") {
      await db.notification.updateMany({ where: { id: body.id, userId: user.id }, data: { read: true } });
      return ok({ updated: body.id });
    }
    return fail("Requête invalide.", 400);
  } catch (e) {
    return handleApiError(e, "NOTIFICATIONS_PATCH");
  }
}

export function POST() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
