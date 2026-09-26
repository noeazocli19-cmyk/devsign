import { FileSignature } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", compact = false }: { className?: string; href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)} aria-label="DevSign — Accueil">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <FileSignature className="h-4.5 w-4.5" size={18} />
      </span>
      {!compact && (
        <span className="text-lg">
          Dev<span className="text-primary">Sign</span>
        </span>
      )}
    </Link>
  );
}
