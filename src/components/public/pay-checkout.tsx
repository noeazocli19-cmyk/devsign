"use client";

// ─── Checkout SaaSPay simulé — actions de paiement ───────────
// Affiché uniquement en mode simulation (sandbox sans clés SaaSPay).

import { useState } from "react";
import { Loader2, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

type PayCheckoutProps = {
  publicId: string;
  reference: string;
  payLabel: string; // ex. "Payer 300 000 FCFA"
  simulated: boolean;
};

export function PayCheckout({ publicId, reference, payLabel, simulated }: PayCheckoutProps) {
  const [phase, setPhase] = useState<"idle" | "processing" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function run(outcome: "success" | "failed") {
    if (phase === "processing") return;
    setPhase("processing");
    setErrorMessage(null);
    const startedAt = Date.now();
    try {
      const res = await fetch("/api/public/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, outcome }),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;

      // Délai artificiel (min 1,2 s) pour un parcours réaliste
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1200) await new Promise((resolve) => setTimeout(resolve, 1200 - elapsed));

      if (!res.ok || !json?.success) {
        setErrorMessage(json?.error ?? "Une erreur est survenue lors du traitement du paiement. Merci de réessayer.");
        setPhase("failed");
        return;
      }

      if (outcome === "success") {
        window.location.href = `/c/${publicId}/success`;
        return;
      }
      setErrorMessage("Paiement refusé. Aucun montant n'a été débité.");
      setPhase("failed");
    } catch {
      setErrorMessage("Connexion impossible. Vérifiez votre réseau puis réessayez.");
      setPhase("failed");
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button className="h-12 w-full text-base font-semibold" disabled={phase === "processing"} onClick={() => run("success")}>
        {phase === "processing" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Traitement…
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5" aria-hidden />
            {payLabel}
          </>
        )}
      </Button>

      {simulated && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs text-zinc-400 hover:text-zinc-600"
          disabled={phase === "processing"}
          onClick={() => run("failed")}
        >
          Simuler un échec de paiement
        </Button>
      )}

      <a
        href={`/c/${publicId}`}
        className="block pt-1 text-center text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-800 hover:underline"
      >
        Annuler et retourner à l&apos;espace client
      </a>
    </div>
  );
}
