"use client";

// ─── Bouton "Copier le lien" — copie l'URL publique du contrat ───

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CopyContractLinkButton({
  publicId,
  tooltip,
  variant = "outline",
  size = "sm",
  showLabel = false,
  className,
}: {
  publicId: string;
  tooltip?: string;
  variant?: "outline" | "ghost" | "secondary" | "default";
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/c/${publicId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien. Copiez-le manuellement : " + url);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={variant} size={showLabel ? "sm" : size} onClick={handleCopy} className={cn(!showLabel && size === "icon" && "h-8 w-8", className)} aria-label="Copier le lien du contrat">
          {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {showLabel && <span>{copied ? "Copié !" : "Copier le lien"}</span>}
        </Button>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  );
}
