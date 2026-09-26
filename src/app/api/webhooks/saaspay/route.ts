import { NextResponse } from "next/server";
import { verifyWebhookSignature, WEBHOOK_SIGNATURE_HEADER } from "@/lib/payments/saaspay";
import { processPaymentEvent } from "@/lib/workflow";
import { logError } from "@/lib/api-utils";

/**
 * Webhook SaaSPay — endpoint sécurisé.
 *
 * Flux :
 *  1. Lecture du body brut
 *  2. Vérification de l'authenticité (HMAC SHA-256 selon la doc SaaSPay)
 *  3. Récupération de la transaction → paiement correspondant
 *  4. Mise à jour idempotente du statut (jamais de double traitement)
 *  5. Notifications + emails + passage automatique du projet EN COURS
 *
 * ⚠️ Un paiement n'est JAMAIS validé sur la seule base d'un message frontend :
 * seul ce webhook (ou une vérification serveur directe) confirme le paiement.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get(WEBHOOK_SIGNATURE_HEADER);

  // 1-2. Authenticité
  const verification = verifyWebhookSignature(rawBody, signature);
  if (!verification.valid) {
    await logError("WEBHOOK", `Webhook SaaSPay rejeté : ${verification.reason ?? "signature invalide"}`, rawBody.slice(0, 500));
    return NextResponse.json({ success: false, error: "Signature invalide." }, { status: 401 });
  }

  // 3. Parsing
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    await logError("WEBHOOK", "Webhook SaaSPay : JSON invalide", rawBody.slice(0, 500));
    return NextResponse.json({ success: false, error: "Payload invalide." }, { status: 400 });
  }

  // 4-5. Traitement idempotent
  try {
    const result = await processPaymentEvent(event, "webhook");
    return NextResponse.json({ success: true, changed: result.changed, status: result.payment.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    // PAYMENT_NOT_FOUND n'est pas une erreur d'authenticité : on accuse réception
    // pour éviter les retries infinis, mais on journalise pour investigation.
    if (message === "PAYMENT_NOT_FOUND" || message === "MISSING_REFERENCE") {
      await logError("WEBHOOK", `Webhook SaaSPay : ${message}`, rawBody.slice(0, 500));
      return NextResponse.json({ success: true, ignored: message });
    }
    await logError("WEBHOOK", `Webhook SaaSPay : échec de traitement (${message})`, rawBody.slice(0, 800));
    return NextResponse.json({ success: false, error: "Traitement différé. Merci de réessayer." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
}
