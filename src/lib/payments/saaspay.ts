// ─── SaaSPayProvider ─────────────────────────────────────────
// Implémentation du PaymentProvider pour SaaSPay.
//
// ⚠️ IMPORTANT — conformément au cahier des charges :
// Aucun endpoint ni paramètre exact de l'API SaaSPay n'est inventé ici.
// Les appels réels sont structurés de manière conventionnelle (REST + Bearer)
// et restent à ajuster selon la documentation officielle SaaSPay.
//
// Tant que SAASPAY_API_URL / SAASPAY_API_KEY / SAASPAY_SECRET_KEY ne sont pas
// renseignés, le provider bascule en MODE SIMULATION (développement uniquement) :
// le parcours complet (checkout → webhook signé → confirmation → projet EN COURS)
// est jouable de bout en bout, avec validation serveur stricte identique au mode réel.

import { createHmac, timingSafeEqual, randomInt } from "crypto";
import type { PaymentProvider, PaymentIntentInput, PaymentIntentResult, VerificationResult } from "./provider";

export type SaaSPayConfig = {
  apiUrl: string | undefined;
  apiKey: string | undefined;
  secretKey: string | undefined;
  configured: boolean;
};

export function getSaaSPayConfig(): SaaSPayConfig {
  const apiUrl = process.env.SAASPAY_API_URL || undefined;
  const apiKey = process.env.SAASPAY_API_KEY || undefined;
  const secretKey = process.env.SAASPAY_SECRET_KEY || undefined;
  return { apiUrl, apiKey, secretKey, configured: Boolean(apiUrl && apiKey && secretKey) };
}

/** Mode simulation actif = clés SaaSPay absentes (jamais en production). */
export function isSimulationMode(): boolean {
  return !getSaaSPayConfig().configured;
}

function generateTxId(): string {
  return `SP-${randomInt(100000, 999999)}`;
}

export class SaaSPayProvider implements PaymentProvider {
  readonly name = "SAASPAY";

  isConfigured(): boolean {
    return getSaaSPayConfig().configured;
  }

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    const cfg = getSaaSPayConfig();

    // ── Mode simulation (développement) ──
    if (!cfg.configured) {
      return {
        providerTxId: generateTxId(),
        checkoutUrl: `/c/${input.publicId}/pay?ref=${encodeURIComponent(input.reference)}`,
        simulated: true,
      };
    }

    // ── Mode réel — à aligner sur la documentation officielle SaaSPay ──
    const response = await fetch(`${cfg.apiUrl}/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        reference: input.reference,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        customer: { name: input.customerName, email: input.customerEmail },
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/c/${input.publicId}/return`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/c/${input.publicId}`,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/webhooks/saaspay`,
        metadata: input.metadata ?? {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SaaSPay: création de transaction refusée (${response.status}). ${text.slice(0, 200)}`);
    }
    const data = (await response.json()) as { id?: string; transaction_id?: string; checkout_url?: string; payment_url?: string };
    const providerTxId = data.id ?? data.transaction_id;
    const checkoutUrl = data.checkout_url ?? data.payment_url;
    if (!providerTxId || !checkoutUrl) {
      throw new Error("SaaSPay: réponse inattendue lors de la création de la transaction.");
    }
    return { providerTxId, checkoutUrl, simulated: false };
  }

  async verifyTransaction(providerTxId: string): Promise<VerificationResult> {
    const cfg = getSaaSPayConfig();

    // En simulation, la source de vérité est la base locale (pas de fournisseur réel).
    if (!cfg.configured) return { status: null };

    const response = await fetch(`${cfg.apiUrl}/v1/transactions/${encodeURIComponent(providerTxId)}`, {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) return { status: null };
    const data = (await response.json()) as { status?: string };
    return { status: mapSaaSPayStatus(data.status), raw: data };
  }
}

/** Mappe le statut brut SaaSPay vers le statut interne (à affiner selon la doc officielle). */
export function mapSaaSPayStatus(rawStatus?: string): VerificationResult["status"] {
  if (!rawStatus) return null;
  const s = rawStatus.toLowerCase();
  if (["success", "succeeded", "completed", "paid"].includes(s)) return "SUCCESS";
  if (["failed", "failure", "declined", "error"].includes(s)) return "FAILED";
  if (["cancelled", "canceled"].includes(s)) return "CANCELLED";
  if (["refunded"].includes(s)) return "REFUNDED";
  if (["processing", "pending_confirmation"].includes(s)) return "PROCESSING";
  if (["pending", "created", "initiated"].includes(s)) return "PENDING";
  return null;
}

// ─── Signature de webhook (HMAC SHA-256) ─────────────────────

export function signPayload(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export type WebhookVerification = { valid: boolean; reason?: string };

/**
 * Vérifie l'authenticité d'un webhook SaaSPay.
 * - En production (secret configuré) : comparaison HMAC stricte, timing-safe.
 * - En simulation (pas de secret) : accepté uniquement hors production.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): WebhookVerification {
  const cfg = getSaaSPayConfig();
  if (!cfg.configured) {
    if (process.env.NODE_ENV === "production") return { valid: false, reason: "missing_secret" };
    return { valid: true, reason: "simulation_mode" };
  }
  if (!signature) return { valid: false, reason: "missing_signature" };
  const expected = signPayload(rawBody, cfg.secretKey!);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return { valid: false, reason: "bad_signature" };
  return timingSafeEqual(a, b) ? { valid: true } : { valid: false, reason: "bad_signature" };
}

export const WEBHOOK_SIGNATURE_HEADER = "x-saaspay-signature";

export type SaaSPayWebhookEvent = {
  event?: string; // ex: payment.success | payment.failed | payment.cancelled
  reference?: string; // référence interne transmise à la création (PAY-XXXX)
  transaction_id?: string;
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

export const singleton = new SaaSPayProvider();
