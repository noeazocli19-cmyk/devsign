"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubscribeButtonProps = {
  targetPlan: "PRO" | "AGENCY";
  label: string;
  variant?: "default" | "outline";
};

export function SubscribeButton({ targetPlan, label, variant = "default" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error ?? "Impossible de démarrer le paiement. Réessayez.");
        setLoading(false);
        return;
      }
      window.location.href = json.data.checkoutUrl;
    } catch {
      setErrorMessage("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button className="w-full" variant={variant} disabled={loading} onClick={handleClick}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Redirection…
          </>
        ) : (
          label
        )}
      </Button>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}