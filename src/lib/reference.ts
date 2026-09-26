import { randomInt, randomBytes } from "crypto";

/** Référence de contrat : DS-2026-000241 */
export function contractReference(sequence: number): string {
  return `DS-${new Date().getFullYear()}-${String(sequence).padStart(6, "0")}`;
}

/** Identifiant public court pour le lien client : devsign.app/c/8xK29p */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz"; // sans caractères ambigus
export function generatePublicId(length = 7): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

/** Référence de paiement interne : PAY-4F7K2A */
export function generatePaymentReference(): string {
  return `PAY-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/** Identifiant de signature : SIG-2026-48213 */
export function generateSignatureId(): string {
  return `SIG-${new Date().getFullYear()}-${randomInt(10000, 99999)}`;
}

/** Référence de transaction SaaSPay (mode simulation) : SP-829183 */
export function generateProviderTxId(): string {
  return `SP-${randomInt(100000, 999999)}`;
}

/** Numéro de facture : FAC-2026-000112 */
export function invoiceNumber(sequence: number): string {
  return `FAC-${new Date().getFullYear()}-${String(sequence).padStart(6, "0")}`;
}
