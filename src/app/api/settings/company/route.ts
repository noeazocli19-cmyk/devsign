import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireApiUser, handleApiError, parseBody } from "@/lib/api-utils";
import { companySchema } from "@/lib/validations";

/** Met à jour le profil d'entreprise (personnalisation de l'espace client). */
export async function PUT(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);

  try {
    const { data, error } = await parseBody(req, companySchema);
    if (error) return error;

    await db.companyProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessName: data.businessName ?? "Mon entreprise",
        logoUrl: data.logoUrl ?? null,
        description: data.description ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        country: data.country ?? null,
        currency: data.currency ?? "XOF",
        brandColor: data.brandColor ?? "#059669",
        footerText: data.footerText ?? null,
        welcomeMessage: data.welcomeMessage ?? null,
      },
      update: {
        businessName: data.businessName ?? undefined,
        logoUrl: data.logoUrl ?? null,
        description: data.description ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        country: data.country ?? null,
        currency: data.currency ?? undefined,
        brandColor: data.brandColor ?? undefined,
        footerText: data.footerText ?? null,
        welcomeMessage: data.welcomeMessage ?? null,
      },
    });

    return ok({ updated: true });
  } catch (e) {
    return handleApiError(e, "SETTINGS_COMPANY");
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
