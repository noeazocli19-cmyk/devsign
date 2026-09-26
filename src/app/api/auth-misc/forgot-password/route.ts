import { auth } from "@/lib/auth";
import { requestAppUrl } from "@/lib/email";
import { ok, handleApiError, parseBody } from "@/lib/api-utils";
import { forgotPasswordSchema } from "@/lib/validations";
import { db } from "@/lib/db";

/**
 * Réinitialisation de mot de passe — passe par Better Auth (forgetPassword).
 * En mode développement sans Resend, retourne le lien direct pour test (jamais en production).
 */
export async function POST(req: Request) {
  try {
    const { data, error } = await parseBody(req, forgotPasswordSchema);
    if (error) return error;

    const baseUrl = requestAppUrl(req);

    await auth.api.requestPasswordReset({
      body: { email: data.email, redirectTo: `${baseUrl}/reset-password` },
    });

    const payload: { devResetUrl?: string } = {};
    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      // Sandbox : aucun email réel n'est envoyé. On récupère le token créé par
      // Better Auth pour permettre de tester le parcours complet en développement.
      const verification = await db.verification.findFirst({
        where: { identifier: data.email },
        orderBy: { createdAt: "desc" },
      });
      if (verification) {
        let token = verification.value;
        try {
          const parsed = JSON.parse(verification.value);
          if (typeof parsed?.token === "string") token = parsed.token;
        } catch {
          /* valeur = token brut */
        }
        if (token && token.length > 5) payload.devResetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      }
    }

    // Réponse identique que l'email existe ou non (pas d'énumération de comptes).
    return ok({ sent: true, ...payload });
  } catch (e) {
    return handleApiError(e, "FORGOT_PASSWORD");
  }
}
