// ─── Système de statuts explicites (contrats, paiements, projets) ───

export type BadgeStyle = { label: string; className: string; dot: string; icon: string };

export const CONTRACT_STATUS: Record<string, BadgeStyle> = {
  DRAFT: { label: "Brouillon", className: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200", dot: "bg-zinc-400", icon: "FileEdit" },
  SENT: { label: "Envoyé", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", dot: "bg-sky-500", icon: "Send" },
  VIEWED: { label: "Ouvert", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500", icon: "Eye" },
  SIGNED: { label: "Signé", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", icon: "Check" },
  EXPIRED: { label: "Expiré", className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200", dot: "bg-orange-500", icon: "Clock" },
  CANCELLED: { label: "Annulé", className: "bg-red-50 text-red-600 ring-1 ring-red-200", dot: "bg-red-500", icon: "X" },
};

export const PAYMENT_STATUS: Record<string, BadgeStyle> = {
  PENDING: { label: "En attente", className: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200", dot: "bg-zinc-400", icon: "Clock" },
  PROCESSING: { label: "En cours", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500", icon: "Loader" },
  SUCCESS: { label: "Payé", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", icon: "Check" },
  FAILED: { label: "Échoué", className: "bg-red-50 text-red-600 ring-1 ring-red-200", dot: "bg-red-500", icon: "X" },
  CANCELLED: { label: "Annulé", className: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200", dot: "bg-zinc-400", icon: "X" },
  REFUNDED: { label: "Remboursé", className: "bg-purple-50 text-purple-700 ring-1 ring-purple-200", dot: "bg-purple-500", icon: "Undo" },
};

export const PROJECT_STATUS: Record<string, BadgeStyle> = {
  DRAFT: { label: "Brouillon", className: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200", dot: "bg-zinc-400", icon: "FileEdit" },
  WAITING_SIGNATURE: { label: "En attente de signature", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", dot: "bg-sky-500", icon: "PenLine" },
  WAITING_PAYMENT: { label: "En attente d'acompte", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500", icon: "Wallet" },
  IN_PROGRESS: { label: "En cours", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", icon: "Rocket" },
  COMPLETED: { label: "Terminé", className: "bg-teal-50 text-teal-700 ring-1 ring-teal-200", dot: "bg-teal-500", icon: "CheckCheck" },
  CANCELLED: { label: "Annulé", className: "bg-red-50 text-red-600 ring-1 ring-red-200", dot: "bg-red-500", icon: "X" },
};

export const PROJECT_TYPES: Record<string, string> = {
  SITE_VITRINE: "Site vitrine",
  ECOMMERCE: "E-commerce",
  WEB_APP: "Application web",
  MOBILE_APP: "Application mobile",
  SAAS: "SaaS",
  MAINTENANCE: "Maintenance",
  DESIGN: "Design",
  OTHER: "Autre",
};

export const IP_OWNERSHIP: Record<string, string> = {
  TRANSFER_AFTER_FULL_PAYMENT: "Transfert au client après paiement complet",
  PROVIDER_RETAINS: "Conservation par le prestataire",
  USAGE_LICENSE: "Licence d'utilisation accordée au client",
};

export const MAINTENANCE_TYPES: Record<string, string> = {
  NONE: "Aucune maintenance",
  MONTHLY: "Maintenance mensuelle",
  YEARLY: "Maintenance annuelle",
  CUSTOM: "Maintenance personnalisée",
};

export const PROFESSIONS: Record<string, string> = {
  DEVELOPER: "Développeur",
  DESIGNER: "Designer",
  FREELANCE: "Freelance",
  AGENCY: "Agence",
  CONSULTANT: "Consultant",
  OTHER: "Autre",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  CREATED: "Contrat créé",
  SENT: "Contrat envoyé",
  VIEWED: "Client a ouvert le contrat",
  SIGNED: "Contrat signé",
  PAID: "Acompte reçu",
  REMINDER: "Rappel envoyé",
  PROJECT_STARTED: "Projet lancé",
  CANCELLED: "Contrat annulé",
};

export const PAYMENT_TYPES: Record<string, string> = {
  DEPOSIT: "Acompte",
  BALANCE: "Solde",
  FULL: "Paiement intégral",
};
