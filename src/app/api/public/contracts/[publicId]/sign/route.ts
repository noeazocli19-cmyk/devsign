// ─── POST /api/public/contracts/[publicId]/sign ──────────────
// Signature électronique publique (aucune auth requise).

import { ok, fail, handleApiError, parseBody } from "@/lib/api-utils";
import { signContractSchema } from "@/lib/validations";
import { signContractPublic } from "@/lib/workflow";

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const { data, error } = await parseBody(req, signContractSchema);
    if (error) return error;
    if (!data) return fail("Données invalides.", 400);

    try {
      const result = await signContractPublic(publicId, {
        signerName: data.signerName,
        signatureType: data.signatureType,
        signatureData: data.signatureData ?? null,
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      });
      return ok({ signatureId: result.signatureId, signedAt: result.signedAt });
    } catch (e) {
      if (e instanceof Error && e.message === "NOT_FOUND") return fail("Contrat introuvable.", 404);
      if (e instanceof Error && e.message === "INVALID_STATUS") return fail("Ce contrat ne peut plus être signé.", 409);
      throw e;
    }
  } catch (e) {
    return handleApiError(e, "PUBLIC/SIGN");
  }
}

export function GET() {
  return fail("Méthode non autorisée.", 405);
}
