import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Le nom complet est requis (2 caractères minimum)."),
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token invalide."),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const onboardingSchema = z.object({
  profession: z.enum(["DEVELOPER", "DESIGNER", "FREELANCE", "AGENCY", "CONSULTANT", "OTHER"]),
  businessName: z.string().min(2, "Le nom professionnel est requis."),
  logoUrl: z.string().optional().nullable(),
  description: z.string().max(400, "Description trop longue (400 caractères max).").optional().nullable(),
  country: z.string().min(2, "Le pays est requis."),
  currency: z.enum(["XOF", "EUR", "USD"]),
  phone: z.string().optional().nullable(),
});

// ─── Clients ─────────────────────────────────────────────────
export const clientSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis."),
  lastName: z.string().min(2, "Le nom est requis."),
  email: z.string().email("Email client invalide."),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// ─── Projet + devis + contrat (wizard) ───────────────────────
export const quoteItemSchema = z.object({
  name: z.string().min(1, "Nom de la ligne requis."),
  description: z.string().optional().nullable(),
  quantity: z.number().min(0.5).max(1000).default(1),
  unitPrice: z.number().min(0, "Prix invalide."),
});

export const projectCreateSchema = z.object({
  client: z.object({
    existingClientId: z.string().optional().nullable(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email client invalide.").optional().or(z.literal("")),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
  }),
  project: z.object({
    name: z.string().min(2, "Le nom du projet est requis."),
    description: z.string().max(2000).optional().nullable(),
    type: z.enum(["SITE_VITRINE", "ECOMMERCE", "WEB_APP", "MOBILE_APP", "SAAS", "MAINTENANCE", "DESIGN", "OTHER"]),
    startDate: z.string().optional().nullable(),
    deliveryDate: z.string().optional().nullable(),
  }),
  quote: z.object({
    items: z.array(quoteItemSchema).min(1, "Ajoutez au moins une ligne au devis."),
    taxRate: z.number().min(0).max(50).default(0),
    discount: z.number().min(0).default(0),
    depositPercent: z.number().min(0).max(100, "L'acompte doit être entre 0 et 100 %."),
  }),
  contract: z.object({
    objectText: z.string().max(3000).optional().nullable(),
    deliverables: z.array(z.string()).default([]),
    revisions: z.number().min(0).max(10).default(2),
    paymentTermsText: z.string().max(300).optional().nullable(),
    ipOwnership: z.enum(["TRANSFER_AFTER_FULL_PAYMENT", "PROVIDER_RETAINS", "USAGE_LICENSE"]).default("TRANSFER_AFTER_FULL_PAYMENT"),
    maintenanceType: z.enum(["NONE", "MONTHLY", "YEARLY", "CUSTOM"]).default("NONE"),
    maintenanceText: z.string().max(500).optional().nullable(),
    cancellationText: z.string().max(1000).optional().nullable(),
  }),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

// ─── Contrat ─────────────────────────────────────────────────
export const contractUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  objectText: z.string().max(3000).optional().nullable(),
  deliverables: z.array(z.string()).optional(),
  revisions: z.number().min(0).max(10).optional(),
  paymentTermsText: z.string().max(300).optional().nullable(),
  ipOwnership: z.enum(["TRANSFER_AFTER_FULL_PAYMENT", "PROVIDER_RETAINS", "USAGE_LICENSE"]).optional(),
  maintenanceType: z.enum(["NONE", "MONTHLY", "YEARLY", "CUSTOM"]).optional(),
  maintenanceText: z.string().max(500).optional().nullable(),
  cancellationText: z.string().max(1000).optional().nullable(),
  taxRate: z.number().min(0).max(50).optional(),
  discount: z.number().min(0).optional(),
  depositPercent: z.number().min(0).max(100).optional(),
  items: z.array(quoteItemSchema).optional(),
});

export const contractActionSchema = z.object({
  action: z.enum(["send", "cancel", "archive", "reminder"]),
});

// ─── Signature publique ──────────────────────────────────────
export const signContractSchema = z.object({
  signerName: z.string().min(3, "Le nom complet est requis."),
  signatureType: z.enum(["TYPED", "DRAWN"]).default("TYPED"),
  signatureData: z.string().optional().nullable(),
  accepted: z.literal(true, { message: "Vous devez accepter les conditions du contrat." }),
});

// ─── Paiement public ─────────────────────────────────────────
export const createPaymentSchema = z.object({
  publicId: z.string().min(4),
});

export const simulatePaymentSchema = z.object({
  reference: z.string().min(4),
  outcome: z.enum(["success", "failed"]),
});

// ─── Profil / entreprise ─────────────────────────────────────
export const profileSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().nullable(),
});

export const companySchema = z.object({
  businessName: z.string().min(2, "Le nom de l'entreprise est requis.").optional(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().max(400).optional().nullable(),
  email: z.string().email("Email invalide.").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.enum(["XOF", "EUR", "USD"]).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #RRGGBB).").optional(),
  footerText: z.string().max(200).optional().nullable(),
  welcomeMessage: z.string().max(200).optional().nullable(),
});

// ─── Abonnement (Pro / Agency) ─────────────────────────────────
export const subscriptionCheckoutSchema = z.object({
  targetPlan: z.enum(["PRO", "AGENCY"]),
});
