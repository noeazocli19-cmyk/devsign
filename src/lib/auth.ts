import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/lib/email/templates";

const emailDeliveryEnabled = !!process.env.RESEND_API_KEY;

/**
 * Multi-host support (sandbox previews *.space-z.ai, localhost, production).
 * En production, déclarer les domaines via BETTER_AUTH_ALLOWED_HOSTS="devsign.app,*.devsign.app".
 */
const allowedHosts = [
  "localhost:3000",
  "127.0.0.1:3000",
  "*.space-z.ai",
  ...(process.env.BETTER_AUTH_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean),
];

export const auth = betterAuth({
  // ── Connexion sociale : « Continuer avec Google » ──
  // Activée dès que GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont définis.
  // Redirect URI à déclarer dans Google Cloud Console :
  //   https://VOTRE-DOMAINE/api/auth/callback/google
  //   (+ http://localhost:3000/api/auth/callback/google en dev)
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  // baseURL dynamique : dérivé du Host de chaque requête, validé contre allowedHosts.
  // Nécessaire car l'app est servie sur plusieurs hôtes (aperçus sandbox, prod…).
  baseURL: {
    protocol: "auto",
    allowedHosts,
    fallback: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  },
  // CSRF : l'origine de la requête est de confiance si elle correspond à l'hôte
  // réellement servi (Origin === Host). Les origines additionnelles viennent de
  // BETTER_AUTH_TRUSTED_ORIGINS (lu nativement par Better Auth).
  trustedOrigins: (request) => {
    const origins = new Set<string>();
    const host = request?.headers?.get("host");
    if (host) {
      origins.add(`https://${host}`);
      origins.add(`http://${host}`);
    }
    return [...origins];
  },
  database: prismaAdapter(db, {
    provider: (process.env.DATABASE_URL ?? "").startsWith("file:") ? "sqlite" : "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600, // 1h
    sendResetPassword: async ({ user, url }) => {
      if (!emailDeliveryEnabled) {
        console.log(`[DEV:EMAIL] Réinitialisation mot de passe → ${user.email} : ${url}`);
        return;
      }
      await sendResetPasswordEmail(user.email, user.name || "", url);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // rafraîchi chaque jour
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER", input: false },
      profession: { type: "string", required: false },
      onboardingCompleted: { type: "boolean", defaultValue: false, input: false },
      plan: { type: "string", defaultValue: "FREE", input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Sans clé Resend (sandbox/dev), les comptes sont vérifiés automatiquement.
        before: async (user) => ({
          data: { ...user, emailVerified: emailDeliveryEnabled ? (user.emailVerified ?? false) : true },
        }),
      },
    },
  },
  emailVerification: {
    sendOnSignUp: emailDeliveryEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!emailDeliveryEnabled) {
        console.log(`[DEV:EMAIL] Vérification email → ${user.email} : ${url}`);
        return;
      }
      await sendVerificationEmail(user.email, user.name || "", url);
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    // Le reverse proxy (Caddy / Vercel) transmet x-forwarded-proto / x-forwarded-host :
    // permet à Better Auth de construire des URLs https correctes (emails, callbacks).
    trustedProxyHeaders: true,
  },
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
  profession?: string | null;
  onboardingCompleted: boolean;
  plan: string;
  notificationPrefs?: string | null;
};
