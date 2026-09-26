import { SaaSPayProvider } from "./saaspay";
import type { PaymentProvider } from "./provider";

/** Provider actif — extensible : ajouter StripeProvider, MobileMoneyProvider… plus tard. */
export const paymentProvider: PaymentProvider = new SaaSPayProvider();

export { isSimulationMode } from "./saaspay";
export type { PaymentProvider, PaymentIntentInput, PaymentIntentResult } from "./provider";
