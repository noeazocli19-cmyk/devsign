import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError, parseBody } from "@/lib/api-utils";

const prefsSchema = z.object({
  contractViewed: z.boolean().optional(),
  contractSigned: z.boolean().optional(),
  paymentReceived: z.boolean().optional(),
  reminders: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

/** Met à jour les préférences de notifications. */
export async function PUT(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);

  try {
    const { data, error } = await parseBody(req, prefsSchema);
    if (error) return error;

    const current = await db.user.findUnique({ where: { id: user.id }, select: { notificationPrefs: true } });
    let merged: Record<string, boolean> = {};
    try {
      merged = JSON.parse(current?.notificationPrefs ?? "{}");
    } catch {
      /* défauts */
    }

    await db.user.update({
      where: { id: user.id },
      data: { notificationPrefs: JSON.stringify({ ...merged, ...data }) },
    });

    return ok({ updated: true });
  } catch (e) {
    return handleApiError(e, "SETTINGS_NOTIFICATIONS");
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
