import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Logo de l'entreprise du prestataire (image ou initiales sur carré émeraude). */
export function CompanyBadge({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    return (
       
      <img
        src={logoUrl}
        alt={name}
        className={cn("h-9 w-9 shrink-0 rounded-lg border border-zinc-200 bg-white object-contain p-0.5", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
