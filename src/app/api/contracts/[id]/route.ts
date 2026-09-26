// ─── /api/contracts/[id] — détail, édition (brouillon) & actions ──
// Les transitions d'état passent TOUJOURS par le moteur workflow.

import { db } from "@/lib/db";
import { ok, fail, handleApiError, requireApiUser, parseBody } from "@/lib/api-utils";
import { contractUpdateSchema, contractActionSchema } from "@/lib/validations";
import { sendContract, sendManualReminder } from "@/lib/workflow";

type Params = { params: Promise<{ id: string }> };

const CONTRACT_INCLUDE = {
  client: true,
  project: true,
  items: { orderBy: { position: "asc" as const } },
  signatures: true,
  payments: true,
  reminders: { orderBy: { scheduledAt: "asc" as const } },
  activities: { orderBy: { createdAt: "desc" as const }, take: 30 },
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);
    const { id } = await params;

    const contract = await db.contract.findFirst({ where: { id, userId: user.id }, include: CONTRACT_INCLUDE });
    if (!contract) return fail("Contrat introuvable.", 404);

    return ok({ contract });
  } catch (e) {
    return handleApiError(e, "GET /api/contracts/[id]");
  }
}

// ─── PATCH — édition d'un brouillon (contenu + devis) ────────
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);
    const { id } = await params;

    const contract = await db.contract.findFirst({ where: { id, userId: user.id } });
    if (!contract) return fail("Contrat introuvable.", 404);
    if (contract.status !== "DRAFT") return fail("Seuls les brouillons peuvent être modifiés.", 409);

    const { data, error } = await parseBody(req, contractUpdateSchema);
    if (error || !data) return error ?? fail("Données invalides.", 422);

    // Recalcul serveur des montants (source de vérité unique)
    const items = data.items ?? null;
    const subtotal = items ? items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0) : contract.subtotal;
    const discount = data.discount ?? contract.discount;
    const taxRate = data.taxRate ?? contract.taxRate;
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(afterDiscount * taxRate) / 100;
    const totalAmount = afterDiscount + taxAmount;
    const depositPercent = data.depositPercent ?? contract.depositPercent;
    const depositAmount = Math.round(totalAmount * depositPercent) / 100;
    const balanceAmount = Math.max(0, totalAmount - depositAmount);

    const signatureNote =
      data.revisions !== undefined
        ? `Le projet comprend ${data.revisions} série${data.revisions > 1 ? "s" : ""} de modifications.`
        : contract.signatureNote;

    const updated = await db.contract.update({
      where: { id: contract.id },
      data: {
        title: data.title ?? contract.title,
        objectText: data.objectText !== undefined ? data.objectText : contract.objectText,
        deliverables: data.deliverables !== undefined ? JSON.stringify(data.deliverables) : contract.deliverables,
        revisions: data.revisions ?? contract.revisions,
        paymentTermsText: data.paymentTermsText !== undefined ? data.paymentTermsText : contract.paymentTermsText,
        ipOwnership: data.ipOwnership ?? contract.ipOwnership,
        maintenanceType: data.maintenanceType ?? contract.maintenanceType,
        maintenanceText: data.maintenanceText !== undefined ? data.maintenanceText : contract.maintenanceText,
        cancellationText: data.cancellationText !== undefined ? data.cancellationText : contract.cancellationText,
        signatureNote,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        totalAmount,
        depositPercent,
        depositAmount,
        balanceAmount,
        ...(items
          ? {
              items: {
                deleteMany: {},
                create: items.map((it, i) => ({
                  name: it.name,
                  description: it.description ?? null,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  position: i,
                })),
              },
            }
          : {}),
      },
    });

    // Synchronisation des montants du projet lié
    await db.project.update({
      where: { id: contract.projectId },
      data: { totalPrice: totalAmount, depositPercent, depositAmount, balanceAmount },
    });

    return ok({ id: updated.id });
  } catch (e) {
    return handleApiError(e, "PATCH /api/contracts/[id]");
  }
}

// ─── POST — actions : send | cancel | reminder | archive ─────
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    if (!user) return fail("Vous devez être connecté.", 401);
    const { id } = await params;

    const { data, error } = await parseBody(req, contractActionSchema);
    if (error || !data) return error ?? fail("Données invalides.", 422);

    const contract = await db.contract.findFirst({ where: { id, userId: user.id } });
    if (!contract) return fail("Contrat introuvable.", 404);

    switch (data.action) {
      case "send": {
        try {
          await sendContract(contract.id, user.id);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "NOT_FOUND") return fail("Contrat introuvable.", 404);
            if (e.message === "INVALID_STATUS") return fail("Seuls les brouillons peuvent être envoyés.", 409);
          }
          throw e;
        }
        return ok({ id: contract.id, status: "SENT" });
      }

      case "reminder": {
        try {
          await sendManualReminder(contract.id, user.id);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "NOT_FOUND") return fail("Contrat introuvable.", 404);
            if (e.message === "INVALID_STATUS") return fail("Un rappel ne peut être envoyé que pour un contrat envoyé ou ouvert.", 409);
          }
          throw e;
        }
        return ok({ id: contract.id, reminderSent: true });
      }

      case "cancel": {
        if (contract.status === "SIGNED") return fail("Un contrat signé ne peut pas être annulé.", 409);
        if (contract.status === "CANCELLED") return fail("Ce contrat est déjà annulé.", 409);

        await db.$transaction([
          db.contract.update({ where: { id: contract.id }, data: { status: "CANCELLED" } }),
          db.project.update({ where: { id: contract.projectId }, data: { status: "CANCELLED" } }),
          db.reminder.updateMany({ where: { contractId: contract.id, status: "PENDING" }, data: { status: "CANCELLED" } }),
          db.activity.create({
            data: { userId: user.id, contractId: contract.id, type: "CANCELLED", message: `Contrat ${contract.reference} annulé`, actor: user.id },
          }),
        ]);
        return ok({ id: contract.id, status: "CANCELLED" });
      }

      case "archive":
        return fail("Bientôt disponible.", 400);

      default:
        return fail("Action inconnue.", 400);
    }
  } catch (e) {
    return handleApiError(e, "POST /api/contracts/[id]");
  }
}
