// ─── Formatage monétaire & dates (i18n prêt : XOF / EUR / USD) ───

export const CURRENCIES: Record<string, { label: string; symbol: string; zeroDecimal: boolean }> = {
  XOF: { label: "FCFA", symbol: "FCFA", zeroDecimal: true },
  EUR: { label: "Euro", symbol: "€", zeroDecimal: false },
  USD: { label: "Dollar US", symbol: "$", zeroDecimal: false },
};

export function formatAmount(amount: number, currency = "XOF"): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: currency === "XOF" ? 0 : 2 }).format(amount);
  if (currency === "XOF") return `${n} FCFA`;
  if (currency === "EUR") return `${n} €`;
  if (currency === "USD") return `$${n}`;
  return `${n} ${currency}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 31) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "DS";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Délai lisible entre deux dates : "1j 8h" */
export function durationBetween(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  if (days === 0) return `${h}h`;
  return `${days}j ${h}h`;
}
