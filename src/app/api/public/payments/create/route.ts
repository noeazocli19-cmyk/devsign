// ─── POST /api/public/payments/create ────────────────────────
// Crée la transaction d'acompte SaaSPay pour un contrat signé (public).

import { db } from "@/lib/db";
import { ok, fail, handleApiError, parseBody } from "@/lib/api-utils";
import { createPaymentSchema } from "@/lib/validations";
import { createDepositPayment } from "@/lib/workflow";
import { isSimulationMode } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const { data, error } = await parseBody(req, createPaymentSchema);
    if (error) return error;
    if (!data) return fail("Données invalides.", 400);

    const contract = await db.contract.findUnique({
      where: { publicId: data.publicId },
      select: { id: true, status: true },
    });
    if (!contract) return fail("Contrat introuvable.", 404);
    if (contract.status !== "SIGNED") return fail("Le contrat doit être signé avant le paiement.", 409);

    try {
      const payment = await createDepositPayment(contract.id);
      return ok({
        reference: payment.reference,
        checkoutUrl: payment.checkoutUrl,
        simulated: isSimulationMode(),
      });
    } catch (e) {
      if (e instanceof Error && e.message === "ALREADY_PAID") return fail("Ce contrat est déjà payé.", 409);
      if (e instanceof Error && e.message === "INVALID_STATUS") return fail("Le contrat doit être signé avant le paiement.", 409);
      throw e;
    }
  } catch (e) {
    return handleApiError(e, "PUBLIC/PAYMENTS/CREATE");
  }
}

export function GET() {
  return fail("Méthode non autorisée.", 405);
}
