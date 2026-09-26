import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError, parseBody } from "@/lib/api-utils";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Le nom est requis (2 caractères minimum)."),
  phone: z.string().optional().nullable(),
});

/** Met à jour le profil utilisateur (nom + téléphone professionnel). */
export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);

  try {
    const { data, error } = await parseBody(req, profileUpdateSchema);
    if (error) return error;

    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { name: data.name } }),
      db.companyProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, phone: data.phone ?? null, businessName: data.name },
        update: { phone: data.phone ?? null },
      }),
    ]);

    return ok({ updated: true });
  } catch (e) {
    return handleApiError(e, "SETTINGS_PROFILE");
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
