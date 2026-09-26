// ─── Moteur de workflow central — partagé par toutes les routes API ───
// Chaque transition de statut passe par ici pour garantir la cohérence
// (activités, notifications, emails, relances, statuts projet).

import { db } from "@/lib/db";
import { generatePaymentReference, generateSignatureId, generatePublicId, contractReference } from "@/lib/reference";
import { sendContractSignedEmailToDeveloper, sendPaymentConfirmedEmails, sendReminderEmail } from "@/lib/email/templates";
import { contractPublicUrl } from "@/lib/email";
import { formatAmount } from "@/lib/format";
import { paymentProvider } from "@/lib/payments";

type Actor = "CLIENT" | "SYSTEM" | string;

async function addActivity(userId: string, contractId: string | null, type: string, message: string, actor?: Actor) {
  await db.activity.create({ data: { userId, contractId, type, message, actor: actor ?? null } });
}

async function notify(userId: string, title: string, message: string | null, type: string, link?: string | null) {
  await db.notification.create({ data: { userId, title, message, type, link: link ?? null } });
}

// ─── Création d'un contrat complet (wizard) ──────────────────

export type CreateFullContractInput = {
  userId: string;
  client: { existingClientId?: string | null; firstName?: string; lastName?: string; email?: string; phone?: string | null; company?: string | null };
  project: { name: string; description?: string | null; type: string; startDate?: string | null; deliveryDate?: string | null };
  quote: { items: { name: string; description?: string | null; quantity: number; unitPrice: number }[]; taxRate: number; discount: number; depositPercent: number };
  contract: {
    objectText?: string | null;
    deliverables: string[];
    revisions: number;
    paymentTermsText?: string | null;
    ipOwnership: string;
    maintenanceType: string;
    maintenanceText?: string | null;
    cancellationText?: string | null;
  };
  status?: string; // DRAFT par défaut
};

export async function createFullContract(input: CreateFullContractInput) {
  const { userId, client, project, quote, contract } = input;

  // Résolution du client
  let clientId = client.existingClientId ?? null;
  if (clientId) {
    const existing = await db.client.findFirst({ where: { id: clientId, userId } });
    if (!existing) clientId = null;
  }
  if (!clientId) {
    if (!client.firstName || !client.lastName || !client.email) throw new Error("CLIENT_REQUIRED");
    const created = await db.client.create({
      data: { userId, firstName: client.firstName, lastName: client.lastName, email: client.email, phone: client.phone ?? null, company: client.company ?? null },
    });
    clientId = created.id;
  }

  // Calculs du devis (source de vérité serveur)
  const subtotal = quote.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const afterDiscount = Math.max(0, subtotal - quote.discount);
  const taxAmount = Math.round(afterDiscount * quote.taxRate) / 100;
  const totalAmount = afterDiscount + taxAmount;
  const depositAmount = Math.round(totalAmount * quote.depositPercent) / 100;
  const balanceAmount = Math.max(0, totalAmount - depositAmount);

  const sequence = (await db.contract.count()) + 1;
  const currency = "XOF";

  let publicId = generatePublicId();
  while (await db.contract.findUnique({ where: { publicId } })) publicId = generatePublicId();

  const [created] = await db.$transaction(async (tx) => {
    const projectRecord = await tx.project.create({
      data: {
        userId,
        clientId: clientId!,
        name: project.name,
        description: project.description ?? null,
        type: project.type,
        startDate: project.startDate ? new Date(project.startDate) : null,
        deliveryDate: project.deliveryDate ? new Date(project.deliveryDate) : null,
        totalPrice: totalAmount,
        currency,
        depositPercent: quote.depositPercent,
        depositAmount,
        balanceAmount,
        status: input.status === "SENT" ? "WAITING_SIGNATURE" : "DRAFT",
      },
    });

    const contractRecord = await tx.contract.create({
      data: {
        userId,
        clientId: clientId!,
        projectId: projectRecord.id,
        reference: contractReference(sequence),
        publicId,
        title: project.name,
        status: input.status === "SENT" ? "SENT" : "DRAFT",
        objectText: contract.objectText ?? null,
        deliverables: JSON.stringify(contract.deliverables),
        revisions: contract.revisions,
        paymentTermsText:
          contract.paymentTermsText ??
          `${quote.depositPercent} % à la signature${quote.depositPercent < 100 ? `, ${100 - quote.depositPercent} % à la livraison` : ""}`,
        ipOwnership: contract.ipOwnership,
        maintenanceType: contract.maintenanceType,
        maintenanceText: contract.maintenanceText ?? null,
        cancellationText: contract.cancellationText ?? null,
        signatureNote: `Le projet comprend ${contract.revisions} série${contract.revisions > 1 ? "s" : ""} de modifications.`,
        subtotal,
        taxRate: quote.taxRate,
        taxAmount,
        discount: quote.discount,
        totalAmount,
        currency,
        depositPercent: quote.depositPercent,
        depositAmount,
        balanceAmount,
        items: {
          create: quote.items.map((it, i) => ({
            name: it.name,
            description: it.description ?? null,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            position: i,
          })),
        },
      },
    });

    await tx.activity.create({
      data: { userId, contractId: contractRecord.id, type: "CREATED", message: `Contrat ${contractRecord.reference} créé pour le projet « ${project.name} »`, actor: userId },
    });

    return [contractRecord];
  });

  return created;
}

// ─── Envoi du contrat au client ──────────────────────────────

export async function sendContract(contractId: string, userId: string) {
  const contract = await db.contract.findFirst({ where: { id: contractId, userId }, include: { client: true, project: true, user: true } });
  if (!contract) throw new Error("NOT_FOUND");
  if (contract.status !== "DRAFT") throw new Error("INVALID_STATUS");

  const now = new Date();
  await db.contract.update({ where: { id: contract.id }, data: { status: "SENT", sentAt: now } });
  await db.project.update({ where: { id: contract.projectId }, data: { status: "WAITING_SIGNATURE" } });

  // Relances automatiques : 24 h, 3 j, 7 j
  await db.reminder.createMany({
    data: [
      { contractId: contract.id, type: "AFTER_24H", scheduledAt: new Date(now.getTime() + 24 * 3600 * 1000) },
      { contractId: contract.id, type: "AFTER_3D", scheduledAt: new Date(now.getTime() + 3 * 24 * 3600 * 1000) },
      { contractId: contract.id, type: "AFTER_7D", scheduledAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000) },
    ],
  });

  await addActivity(userId, contract.id, "SENT", `Contrat envoyé à ${contract.client.firstName} ${contract.client.lastName}`, userId);
  await notify(userId, "Contrat envoyé", `Le contrat ${contract.reference} a été envoyé à ${contract.client.firstName}.`, "CONTRACT", `/contracts/${contract.id}`);

  const url = contractPublicUrl(contract.publicId);
  const developerName = contract.user.name;
  await import("@/lib/email/templates").then((m) =>
    m.sendContractSentEmail(contract.client.email, {
      clientFirstName: contract.client.firstName,
      projectTitle: contract.title,
      amount: formatAmount(contract.totalAmount, contract.currency),
      url,
      developerName,
    }),
  );

  return contract;
}

// ─── Marquage "vu" par le client ─────────────────────────────

export async function markContractViewed(publicId: string) {
  const contract = await db.contract.findUnique({ where: { publicId }, include: { client: true } });
  if (!contract) return null;
  if (contract.status === "SENT") {
    await db.contract.update({ where: { id: contract.id }, data: { status: "VIEWED", viewedAt: new Date() } });
    await addActivity(contract.userId, contract.id, "VIEWED", `${contract.client.firstName} a ouvert le contrat`, "CLIENT");
    await notify(contract.userId, "Contrat consulté", `${contract.client.firstName} ${contract.client.lastName} a ouvert votre contrat ${contract.reference}.`, "CONTRACT", `/contracts/${contract.id}`);
  }
  return contract;
}

// ─── Signature électronique ──────────────────────────────────

export async function signContractPublic(publicId: string, data: { signerName: string; signatureType: string; signatureData?: string | null; ip?: string | null; userAgent?: string | null }) {
  const contract = await db.contract.findUnique({ where: { publicId }, include: { client: true, user: true, project: true } });
  if (!contract) throw new Error("NOT_FOUND");
  if (!["SENT", "VIEWED"].includes(contract.status)) throw new Error("INVALID_STATUS");

  const now = new Date();
  const signatureId = generateSignatureId();

  await db.signature.create({
    data: {
      contractId: contract.id,
      signerName: data.signerName,
      signatureType: data.signatureType,
      signatureData: data.signatureData ?? null,
      signatureId,
      ipAddress: data.ip ?? null,
      userAgent: data.userAgent ?? null,
      signedAt: now,
    },
  });

  await db.contract.update({ where: { id: contract.id }, data: { status: "SIGNED", signedAt: now } });
  await db.project.update({ where: { id: contract.projectId }, data: { status: "WAITING_PAYMENT" } });
  await db.reminder.updateMany({ where: { contractId: contract.id, status: "PENDING" }, data: { status: "CANCELLED" } });

  await addActivity(contract.userId, contract.id, "SIGNED", `${data.signerName} a signé le contrat`, "CLIENT");
  await notify(contract.userId, "Contrat signé 🎉", `${data.signerName} vient de signer le contrat ${contract.reference}.`, "CONTRACT", `/contracts/${contract.id}`);

  await sendContractSignedEmailToDeveloper(contract.user.email, {
    projectTitle: contract.title,
    clientName: data.signerName,
    contractRef: contract.reference,
    contractUrl: `/contracts/${contract.id}`,
  });

  return { contract, signatureId, signedAt: now };
}

// ─── Création d'un paiement (après signature) ────────────────

export async function createDepositPayment(contractId: string) {
  const contract = await db.contract.findUnique({ where: { id: contractId }, include: { client: true, user: true, project: true } });
  if (!contract) throw new Error("NOT_FOUND");
  if (contract.status !== "SIGNED") throw new Error("INVALID_STATUS");

  const existing = await db.payment.findFirst({ where: { contractId: contract.id, type: "DEPOSIT", status: { in: ["PENDING", "PROCESSING", "SUCCESS"] } } });
  if (existing?.status === "SUCCESS") throw new Error("ALREADY_PAID");

  const reference = generatePaymentReference();
  const intent = await paymentProvider.createPaymentIntent({
    reference,
    amount: contract.depositAmount,
    currency: contract.currency,
    description: `Acompte — ${contract.title} (${contract.reference})`,
    customerName: `${contract.client.firstName} ${contract.client.lastName}`,
    customerEmail: contract.client.email,
    publicId: contract.publicId,
    metadata: { contractRef: contract.reference, projectId: contract.projectId },
  });

  const payment = await db.payment.create({
    data: {
      userId: contract.userId,
      contractId: contract.id,
      projectId: contract.projectId,
      reference,
      provider: "SAASPAY",
      providerTxId: intent.providerTxId,
      amount: contract.depositAmount,
      currency: contract.currency,
      type: "DEPOSIT",
      status: "PENDING",
      checkoutUrl: intent.checkoutUrl,
      metadata: JSON.stringify({ simulated: intent.simulated }),
    },
  });

  await addActivity(contract.userId, contract.id, "PAID", `Transaction ${intent.providerTxId} initiée (${formatAmount(payment.amount, payment.currency)})`, "CLIENT");

  return payment;
}

/**
 * Traite un événement webhook SaaSPay (ou l'équivalent simulé).
 * IDEMPOTENT : retraiter le même événement ne produit aucun doublon.
 */
export async function processPaymentEvent(event: { reference?: string; transaction_id?: string; id?: string; amount?: number; status?: string; event?: string }, source: string) {
  const reference = event.reference;
  if (!reference) throw new Error("MISSING_REFERENCE");

  const payment = await db.payment.findUnique({ where: { reference }, include: { contract: { include: { user: true, client: true } } } });
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");

  const mapped = mapEventStatus(event);
  if (!mapped) throw new Error("UNMAPPED_STATUS");

  // Idempotence : paiement déjà confirmé → no-op silencieux
  if (payment.status === mapped) {
    return { payment, changed: false };
  }
  if (payment.status === "SUCCESS" && mapped !== "REFUNDED") {
    return { payment, changed: false };
  }

  const now = new Date();
  const updated = await db.payment.update({
    where: { id: payment.id },
    data: { status: mapped, paidAt: mapped === "SUCCESS" ? now : null, providerTxId: event.transaction_id ?? event.id ?? payment.providerTxId },
  });

  if (mapped === "SUCCESS") {
    const contract = payment.contract!;
    await db.contract.update({ where: { id: contract.id }, data: { paidAt: now } });
    await db.project.update({ where: { id: contract.projectId }, data: { status: "IN_PROGRESS" } });

    await addActivity(contract.userId, contract.id, "PAID", `Acompte reçu : ${formatAmount(updated.amount, updated.currency)} (transaction ${updated.providerTxId ?? updated.reference})`, "SYSTEM");
    await notify(contract.userId, "Acompte reçu 💰", `Vous avez reçu ${formatAmount(updated.amount, updated.currency)} pour le contrat ${contract.reference}.`, "PAYMENT", `/payments`);
    await notify(contract.userId, "Projet lancé 🚀", `Le projet « ${contract.title} » est maintenant EN COURS.`, "SUCCESS", `/projects`);

    await sendPaymentConfirmedEmails({
      developerEmail: contract.user.email,
      clientEmail: contract.client.email,
      projectTitle: contract.title,
      amount: updated.amount,
      currency: updated.currency,
      providerTxId: updated.providerTxId,
      contractUrl: contractPublicUrl(contract.publicId),
    });
  } else if (mapped === "FAILED") {
    const contract = payment.contract!;
    await notify(contract.userId, "Paiement échoué", `Le paiement du contrat ${contract.reference} a échoué. Le client peut réessayer depuis l'espace client.`, "WARNING", `/payments`);
  }

  return { payment: updated, changed: true };
}

function mapEventStatus(event: { event?: string; status?: string }): "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED" | null {
  const raw = event.event?.toLowerCase() ?? "";
  if (raw.includes("success") || raw.includes("completed")) return "SUCCESS";
  if (raw.includes("failed") || raw.includes("declined")) return "FAILED";
  if (raw.includes("cancel")) return "CANCELLED";
  if (raw.includes("refund")) return "REFUNDED";
  if (raw.includes("processing")) return "PROCESSING";
  if (raw.includes("pending") || raw.includes("created")) return "PENDING";
  // fallback : statut brut
  if (event.status) {
    const s = event.status.toLowerCase();
    if (["success", "succeeded", "completed", "paid"].includes(s)) return "SUCCESS";
    if (["failed", "failure", "declined"].includes(s)) return "FAILED";
    if (["cancelled", "canceled"].includes(s)) return "CANCELLED";
    if (["refunded"].includes(s)) return "REFUNDED";
    if (["processing"].includes(s)) return "PROCESSING";
    if (["pending", "created"].includes(s)) return "PENDING";
  }
  return null;
}

// ─── Relances automatiques ───────────────────────────────────

/** Traite les relances dues. Appelé au chargement du dashboard et via le bouton manuel. */
export async function processDueReminders() {
  const due = await db.reminder.findMany({
    where: { status: "PENDING", scheduledAt: { lte: new Date() } },
    include: { contract: { include: { client: true, user: true } } },
    take: 20,
  });

  let sent = 0;
  for (const reminder of due) {
    const contract = reminder.contract;
    if (!contract || !["SENT", "VIEWED"].includes(contract.status)) {
      await db.reminder.update({ where: { id: reminder.id }, data: { status: "CANCELLED" } });
      continue;
    }
    await sendReminderEmail(contract.client.email, {
      clientFirstName: contract.client.firstName,
      projectTitle: contract.title,
      url: contractPublicUrl(contract.publicId),
      developerName: contract.user.name,
      isLast: reminder.type === "AFTER_7D",
    });
    await db.reminder.update({ where: { id: reminder.id }, data: { status: "SENT", sentAt: new Date() } });
    await addActivity(contract.userId, contract.id, "REMINDER", `Rappel automatique envoyé à ${contract.client.firstName} (${reminder.type})`, "SYSTEM");
    await notify(contract.userId, "Rappel envoyé", `Un rappel a été envoyé à ${contract.client.firstName} pour le contrat ${contract.reference}.`, "CONTRACT", `/contracts/${contract.id}`);
    sent++;
  }
  return sent;
}

/** Envoie une relance manuelle immédiate. */
export async function sendManualReminder(contractId: string, userId: string) {
  const contract = await db.contract.findFirst({ where: { id: contractId, userId }, include: { client: true, user: true } });
  if (!contract) throw new Error("NOT_FOUND");
  if (!["SENT", "VIEWED"].includes(contract.status)) throw new Error("INVALID_STATUS");

  await sendReminderEmail(contract.client.email, {
    clientFirstName: contract.client.firstName,
    projectTitle: contract.title,
    url: contractPublicUrl(contract.publicId),
    developerName: contract.user.name,
    isLast: false,
  });
  await db.reminder.create({ data: { contractId: contract.id, type: "MANUAL", scheduledAt: new Date(), sentAt: new Date(), status: "SENT" } });
  await addActivity(userId, contract.id, "REMINDER", `Rappel manuel envoyé à ${contract.client.firstName}`, userId);
  return contract;
}
