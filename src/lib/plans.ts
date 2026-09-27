// ─── Tarification DevSign — configurable depuis le code ───
// Les montants sont exprimés en FCFA/mois. Une interface admin pourra
// les piloter plus tard.

export type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  tagline: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    priceMonthly: 0,
    currency: "XOF",
    tagline: "Pour tester DevSign et signer vos premiers contrats.",
    features: ["3 contrats / mois", "Modèles basiques", "Signature électronique", "Espace client", "Lien de partage unique"],
    highlighted: false,
    cta: "Commencer gratuitement",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 2000,
    currency: "XOF",
    tagline: "Pour les freelances qui enchaînent les clients.",
    features: [
      "Contrats illimités",
      "Modèles personnalisés",
      "Branding de votre espace client",
      "Rappels automatiques",
      "Analytics avancés",
      "Paiements SaaSPay intégrés",
      "Historique complet & PDF",
    ],
    highlighted: true,
    cta: "Choisir Pro",
  },
  {
    id: "agency",
    name: "Agency",
    priceMonthly: 6000,
    currency: "XOF",
    tagline: "Pour les agences et équipes structurées.",
    features: [
      "Tout le plan Pro",
      "Plusieurs membres d'équipe",
      "Plusieurs marques (white-label)",
      "Gestion d'équipe & rôles",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    highlighted: false,
    cta: "Choisir Agency",
  },
];

// ─── Paywall — limites du plan Gratuit ───────────────────────
// Appliquée côté serveur dans POST /api/projects (jamais côté client seul).

export const FREE_PLAN_LIMITS = {
  /** Nombre maximum de contrats qu'un compte Gratuit peut créer par mois. */
  monthlyContracts: 3,
} as const;

/** true si le plan donne accès aux fonctionnalités payantes (Pro ou Agency). */
export function isPaidPlan(plan: string): boolean {
  return plan === "PRO" || plan === "AGENCY";
}