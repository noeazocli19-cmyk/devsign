// ─── Templates emails DevSign (HTML responsive, inline styles) ───

import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { appUrl } from "@/lib/email";

const ACCENT = "#059669";
const INK = "#18181b";
const MUTED = "#71717a";
const BORDER = "#e4e4e7";

function layout(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
<span style="display:none;font-size:1px;color:#fafafa;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
  <tr><td style="padding:28px 32px 0 32px;">
    <table role="presentation" width="100%"><tr>
      <td style="font-size:18px;font-weight:700;color:${INK};">Dev<span style="color:${ACCENT};">Sign</span></td>
      <td align="right" style="font-size:12px;color:${MUTED};">Espace professionnel</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:24px 32px 8px 32px;font-size:22px;font-weight:700;">${title}</td></tr>
  <tr><td style="padding:0 32px 28px 32px;font-size:15px;line-height:1.65;color:#3f3f46;">${body}</td></tr>
  <tr><td style="padding:18px 32px;border-top:1px solid ${BORDER};font-size:12px;color:${MUTED};">
    Cet email a été envoyé via <a href="${appUrl()}" style="color:${ACCENT};text-decoration:none;font-weight:600;">DevSign</a> — Du premier message à l'acompte payé, un seul lien.<br>
    Vous recevez cet email car un contrat DevSign vous concerne.
  </td></tr>
</table></td></tr></table></body></html>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${ACCENT};border-radius:8px;">
  <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
</td></tr></table>`;
}

function highlightBox(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin:16px 0;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 16px;font-size:14px;color:${MUTED};border-bottom:1px solid ${BORDER};">${k}</td><td align="right" style="padding:10px 16px;font-size:14px;font-weight:600;border-bottom:1px solid ${BORDER};">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

export async function sendContractSentEmail(to: string, data: { clientFirstName: string; projectTitle: string; amount: string; url: string; developerName: string }) {
  const html = layout(
    `Votre contrat pour ${data.projectTitle}`,
    `${data.developerName} vous partage le contrat du projet ${data.projectTitle}.`,
    `<p>Bonjour ${data.clientFirstName},</p>
    <p><strong>${data.developerName}</strong> vous partage le contrat du projet <strong>${data.projectTitle}</strong>.</p>
    ${highlightBox([["Projet", data.projectTitle], ["Montant", data.amount]])}
    <p>Vous pouvez consulter l'offre, lire le contrat, le signer électroniquement et régler l'acompte — tout au même endroit.</p>
    ${button(data.url, "Consulter et signer le contrat")}
    <p style="font-size:13px;color:${MUTED};">🔒 Connexion sécurisée — aucune inscription n'est nécessaire.</p>`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: `Votre contrat pour ${data.projectTitle}`, html });
}

export async function sendContractSignedEmailToDeveloper(to: string, data: { projectTitle: string; clientName: string; contractRef: string; contractUrl: string }) {
  const html = layout(
    `Contrat signé — ${data.projectTitle}`,
    `${data.clientName} vient de signer le contrat ${data.contractRef}.`,
    `<p>Bonne nouvelle 🎉</p>
    <p><strong>${data.clientName}</strong> vient de signer le contrat <strong>${data.contractRef}</strong> pour le projet <strong>${data.projectTitle}</strong>.</p>
    ${highlightBox([["Référence", data.contractRef], ["Signé le", formatDateTime(new Date())]])}
    <p>La prochaine étape : la réception de l'acompte. Vous serez notifié dès que le paiement sera confirmé.</p>
    ${button(data.contractUrl, "Voir le contrat")}`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: `Contrat signé — ${data.projectTitle}`, html });
}

export async function sendPaymentConfirmedEmails(params: {
  developerEmail: string;
  clientEmail: string | null;
  projectTitle: string;
  amount: number;
  currency: string;
  providerTxId: string | null;
  contractUrl: string;
}) {
  const amountStr = formatAmount(params.amount, params.currency);
  const devHtml = layout(
    `Paiement confirmé — ${params.projectTitle}`,
    `Acompte de ${amountStr} reçu pour ${params.projectTitle}.`,
    `<p>Le paiement a été confirmé ✅</p>
    ${highlightBox([["Projet", params.projectTitle], ["Montant reçu", amountStr], ["Transaction", params.providerTxId ?? "—"]])}
    <p>Le projet passe automatiquement au statut <strong>En cours</strong>. Vous pouvez démarrer le travail sereinement.</p>
    ${button(params.contractUrl, "Ouvrir le dashboard")}`,
  );
  const { sendEmail } = await import("@/lib/email");
  await sendEmail({ to: params.developerEmail, subject: `Paiement confirmé — ${params.projectTitle}`, html: devHtml });

  if (params.clientEmail) {
    const clientHtml = layout(
      `Paiement confirmé — ${params.projectTitle}`,
      `Merci ! Votre acompte de ${amountStr} a bien été reçu.`,
      `<p>Merci pour votre confiance 🎉</p>
      ${highlightBox([["Projet", params.projectTitle], ["Montant réglé", amountStr], ["Transaction", params.providerTxId ?? "—"]])}
      <p>Votre projet peut maintenant commencer. Vous recevrez les prochaines étapes directement de la part de votre prestataire.</p>`,
    );
    await sendEmail({ to: params.clientEmail, subject: `Paiement confirmé — ${params.projectTitle}`, html: clientHtml });
  }
}

export async function sendReminderEmail(to: string, data: { clientFirstName: string; projectTitle: string; url: string; developerName: string; isLast: boolean }) {
  const html = layout(
    `Votre contrat est toujours en attente`,
    `Rappel amical concernant le contrat du projet ${data.projectTitle}.`,
    `<p>Bonjour ${data.clientFirstName},</p>
    <p>${data.isLast ? "Dernier rappel :" : "Petit rappel amical :"} le contrat du projet <strong>${data.projectTitle}</strong> attend encore votre signature.</p>
    <p>La consultation et la signature ne prennent que deux minutes, et tout se fait en ligne.</p>
    ${button(data.url, "Consulter et signer le contrat")}
    <p style="font-size:13px;color:${MUTED};">Si vous avez des questions, ${data.developerName} reste à votre écoute.</p>`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: "Votre contrat est toujours en attente", html });
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const html = layout(
    `Bienvenue sur DevSign 👋`,
    `Confirmez votre adresse email pour activer votre compte.`,
    `<p>Bonjour ${name || ""},</p>
    <p>Merci de votre inscription ! Confirmez votre adresse email pour activer votre compte et créer votre premier contrat.</p>
    ${button(url, "Confirmer mon adresse email")}
    <p style="font-size:13px;color:${MUTED};">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: "Bienvenue sur DevSign — confirmez votre email", html });
}

export async function sendResetPasswordEmail(to: string, name: string, url: string) {
  const html = layout(
    `Réinitialisation du mot de passe`,
    `Cliquez pour définir un nouveau mot de passe.`,
    `<p>Bonjour ${name || ""},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
    ${button(url, "Définir un nouveau mot de passe")}
    <p style="font-size:13px;color:${MUTED};">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: "Réinitialisez votre mot de passe DevSign", html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = layout(
    `Bienvenue sur DevSign 🎉`,
    `Votre compte est prêt. Créez votre premier contrat.`,
    `<p>Bonjour ${name || ""},</p>
    <p>Votre compte est actif. DevSign vous permet de transformer un prospect en client signé et payé, avec un seul lien : proposition, devis, contrat, signature électronique et acompte.</p>
    ${button(`${appUrl()}/projects/new`, "Créer mon premier contrat")}`,
  );
  const { sendEmail } = await import("@/lib/email");
  return sendEmail({ to, subject: "Bienvenue sur DevSign 🎉", html });
}

export { formatDate };
