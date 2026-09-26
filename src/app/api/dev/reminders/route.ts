import { ok, fail, requireApiUser, handleApiError } from "@/lib/api-utils";
import { processDueReminders } from "@/lib/workflow";

/**
 * POST /api/dev/reminders — traite les relances arrivées à échéance
 * (processDueReminders). Protégé par session : utile en démo pour
 * déclencher manuellement les relances automatiques.
 */
export async function POST() {
  const user = await requireApiUser();
  if (!user) return fail("Authentification requise.", 401);
  try {
    const sent = await processDueReminders();
    return ok({ sent });
  } catch (e) {
    return handleApiError(e, "DEV_REMINDERS");
  }
}

export function GET() {
  return fail("Méthode non autorisée.", 405);
}
