import { fail, handleApiError, ok, parseBody, requireApiUser } from "@/lib/api-utils";
import { subscriptionCheckoutSchema } from "@/lib/validations";
import { createSubscriptionPayment } from "@/lib/workflow";
import { isSimulationMode } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);

    const { data, error } = await parseBody(req, subscriptionCheckoutSchema);
    if (error || !data) return error ?? fail("Données invalides.", 422);

    const payment = await createSubscriptionPayment(user.id, data.targetPlan);

    return ok({ checkoutUrl: payment.checkoutUrl, simulated: isSimulationMode() });
  } catch (e) {
    return handleApiError(e, "POST /api/subscription/checkout");
  }
}

export function GET() {
  return fail("Méthode non autorisée.", 405);
}