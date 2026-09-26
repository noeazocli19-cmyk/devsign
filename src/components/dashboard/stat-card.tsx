import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning";

const TONES: Record<Tone, { iconBox: string }> = {
  default: { iconBox: "bg-muted text-muted-foreground" },
  success: { iconBox: "bg-emerald-50 text-emerald-600" },
  warning: { iconBox: "bg-amber-50 text-amber-600" },
};

/**
 * Carte de statistique réutilisable (dashboard, paiements, détail client).
 * Design : blanc/zinc + accent émeraude, rounded-xl border bg-card p-5.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            TONES[tone].iconBox,
          )}
          aria-hidden
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
