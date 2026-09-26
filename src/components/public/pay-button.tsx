"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PayButtonProps = {
  publicId: string;
  children?: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
};

/**
 * Bouton "Payer avec SaaSPay" — crée la transaction d'acompte puis redirige
 * vers le checkoutUrl (route interne simulée ou vrai checkout SaaSPay).
 */
export function PayButton({ publicId, children, className, size = "lg", showIcon = true }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/public/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      const json = (await res.json().catch(() => null)) as
        | { success: boolean; data?: { checkoutUrl?: string }; error?: string }
        | null;

      if (!res.ok || !json?.success || !json.data?.checkoutUrl) {
        toast.error(json?.error ?? "Le paiement n'a pas pu être initié. Merci de réessayer dans un instant.");
        setLoading(false);
        return;
      }
      window.location.href = json.data.checkoutUrl;
    } catch {
      toast.error("Connexion impossible. Vérifiez votre réseau puis réessayez.");
      setLoading(false);
    }
  }

  return (
    <Button size={size} className={cn("h-12 text-base font-semibold", className)} onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : showIcon ? <Wallet className="h-5 w-5" aria-hidden /> : null}
      {children ?? "Payer avec SaaSPay"}
    </Button>
  );
}
