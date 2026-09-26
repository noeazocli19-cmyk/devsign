import { CONTRACT_STATUS, PAYMENT_STATUS, PROJECT_STATUS } from "@/lib/status";
import { cn } from "@/lib/utils";

type Kind = "contract" | "payment" | "project";

export function StatusBadge({ status, kind = "contract", className }: { status: string; kind?: Kind; className?: string }) {
  const map = kind === "contract" ? CONTRACT_STATUS : kind === "payment" ? PAYMENT_STATUS : PROJECT_STATUS;
  const conf = map[status];
  if (!conf) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", conf.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", conf.dot)} aria-hidden />
      {conf.label}
    </span>
  );
}
