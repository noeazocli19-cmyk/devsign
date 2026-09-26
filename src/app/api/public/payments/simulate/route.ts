// ─── POST /api/public/payments/simulate ──────────────────────
// Simulation de paiement SaaSPay — DEV UNIQUEMENT (sandbox sans clés).
// Réutilise le moteur idempotent processPaymentEvent, comme le vrai webhook.

import { db } from "@/lib/db";
import { ok, fail, handleApiError, parseBody } from "@/lib/api-utils";
import { simulatePaymentSchema } from "@/lib/validations";
import { processPaymentEvent } from "@/lib/workflow";
import { isSimulationMode } from "@/lib/payments";

/** Relit l'état réel d'une transaction (statut + contrat associé). */
async function readPayment(reference: string) {
  return db.payment.findUnique({
    where: { reference },
    select: { status: true, contract: { select: { publicId: true } } },
  });
}

export async function POST(req: Request) {
  try {
    const { data, error } = await parseBody(req, simulatePaymentSchema);
    if (error) return error;
    if (!data) return fail("Données invalides.", 400);

    // En production avec clés SaaSPay, cette route est désactivée.
    if (!isSimulationMode()) return fail("Indisponible.", 403);

    const expectedStatus = data.outcome === "success" ? "SUCCESS" : "FAILED";

    try {
      await processPaymentEvent(
        { reference: data.reference, event: data.outcome === "success" ? "payment.success" : "payment.failed" },
        "simulation",
      );
      const payment = await readPayment(data.reference);
      return ok({ status: payment?.status ?? expectedStatus, publicId: payment?.contract?.publicId ?? null });
    } catch (e) {
      if (e instanceof Error && (e.message === "PAYMENT_NOT_FOUND" || e.message === "MISSING_REFERENCE")) {
        return fail("Transaction introuvable.", 404);
      }
      // Une erreur secondaire (ex. envoi d'email de confirmation) peut survenir
      // APRÈS la transition d'état du paiement : on relit l'état réel pour ne pas
      // faire échouer le parcours client si la transition a bien été appliquée.
      const payment = await readPayment(data.reference).catch(() => null);
      if (payment && payment.status === expectedStatus) {
        return ok({ status: payment.status, publicId: payment.contract?.publicId ?? null });
      }
      throw e;
    }
  } catch (e) {
    return handleApiError(e, "PUBLIC/PAYMENTS/SIMULATE");
  }
}

export function GET() {
  return fail("Méthode non autorisée.", 405);
}
