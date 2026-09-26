import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleApiError, requireApiUser, parseBody } from "@/lib/api-utils";
import { onboardingSchema } from "@/lib/validations";

/** Finalise l'onboarding : profession + profil d'entreprise + drapeau onboardingCompleted. */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);

  try {
    const { data, error } = await parseBody(req, onboardingSchema);
    if (error) return error;

    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { profession: data.profession, onboardingCompleted: true } }),
      db.companyProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          businessName: data.businessName,
          logoUrl: data.logoUrl ?? null,
          description: data.description ?? null,
          country: data.country,
          currency: data.currency,
          phone: data.phone ?? null,
        },
        update: {
          businessName: data.businessName,
          logoUrl: data.logoUrl ?? null,
          description: data.description ?? null,
          country: data.country,
          currency: data.currency,
          phone: data.phone ?? null,
        },
      }),
      db.notification.create({
        data: {
          userId: user.id,
          title: "Bienvenue sur DevSign 👋",
          message: "Créez votre premier contrat et envoyez-le à votre prochain client.",
          type: "INFO",
          link: "/projects/new",
        },
      }),
    ]);

    return ok({ done: true });
  } catch (e) {
    return handleApiError(e, "ONBOARDING");
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
