import { Resend } from "resend";
import { logError } from "@/lib/api-utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type SendEmailInput = { to: string; subject: string; html: string };

/**
 * Envoie un email transactionnel via Resend.
 * Sans clé API (dev/sandbox), l'email est simplement journalisé — le produit
 * reste fonctionnel de bout en bout.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean; dev?: boolean }> {
  if (!resend) {
    console.log(`[DEV:EMAIL] → ${to} | ${subject}`);
    return { sent: false, dev: true };
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "DevSign <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (e) {
    await logError("EMAIL", `Échec envoi email à ${to} : ${subject}`, e);
    return { sent: false };
  }
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

/**
 * URL de l'application telle que vue par l'utilisateur, dérivée de la requête.
 * Évite les mismatches d'origine quand l'app est servie sur plusieurs hôtes
 * (aperçus sandbox, prod derrière reverse proxy).
 * L'entête Origin du navigateur est la source la plus fiable pour le schéma
 * (http/https) — Next.js et les proxies réécrivent x-forwarded-proto.
 */
export function requestAppUrl(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin?.startsWith("http")) {
    try {
      const url = new URL(origin);
      if (url.host) return url.origin;
    } catch {
      /* entête invalide → fallback */
    }
  }
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return appUrl();
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Construit le lien public d'un contrat : https://devsign.app/c/8xK29p */
export function contractPublicUrl(publicId: string): string {
  return `${appUrl()}/c/${publicId}`;
}
