// ─── Types & constantes partagées de l'espace client public ───
import type { Prisma } from "@prisma/client";

/** Contrat avec toutes les relations utilisées par les pages /c/* */
export type PublicContract = Prisma.ContractGetPayload<{
  include: {
    client: true;
    project: true;
    items: true;
    signatures: true;
    payments: true;
    user: { include: { companyProfile: true } };
  };
}>;

/** Police cursive pour les signatures tapées (dégradation gracieuse hors ligne). */
export const CURSIVE_FONT =
  "'Dancing Script', 'Segoe Script', 'Savoye LET', 'Brush Script MT', 'Apple Chancery', cursive";

/** Extrait la liste des livrables (JSON string) d'un contrat. */
export function parseDeliverables(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
    if (typeof parsed === "string" && parsed.trim()) return [parsed];
    return [];
  } catch {
    return [];
  }
}
