// ─── Abstraction PaymentProvider ─────────────────────────────
// L'application ne dépend jamais directement de SaaSPay : elle dépend
// de cette interface. De nouveaux fournisseurs pourront être ajoutés
// sans réécrire le reste du système.

export type PaymentIntentInput = {
  reference: string; // référence interne du paiement (PAY-XXXX)
  amount: number;
  currency: string; // XOF | EUR | USD
  description: string;
  customerName: string;
  customerEmail: string;
  publicId: string; // identifiant public du contrat (pour les URLs de retour)
  checkoutBasePath?: string; // base du chemin de checkout simulé (défaut "/c"), ex. "/abonnement"
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  providerTxId: string;
  checkoutUrl: string;
  simulated: boolean;
};

export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED" | null;

export type VerificationResult = {
  status: TransactionStatus; // null = vérification indisponible
  raw?: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  /** true si les clés réelles sont configurées (mode production) */
  isConfigured(): boolean;
  /** Crée une transaction côté fournisseur et retourne l'URL de checkout */
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  /** Vérifie côté serveur l'état réel d'une transaction (source de vérité) */
  verifyTransaction(providerTxId: string): Promise<VerificationResult>;
}
