// ─── Zone d'actions selon le statut du contrat (server component) ──
// variant="card" : carte latérale desktop — variant="bar" : barre flottante mobile.

import { ArrowRight, Ban, CheckCircle2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayButton } from "@/components/public/pay-button";
import { SignDialog } from "@/components/public/sign-dialog";

type ContractActionsProps = {
  publicId: string;
  status: string; // SENT | VIEWED | SIGNED | CANCELLED | EXPIRED
  contractTitle: string;
  reference: string;
  totalLabel: string;
  depositLabel: string;
  depositPercent: number;
  balanceLabel: string;
  signedLabel: string | null; // "le 12 janvier 2026 à 14:30"
  pendingCheckoutUrl: string | null;
  variant: "card" | "bar";
};

export function ContractActions({
  publicId,
  status,
  contractTitle,
  reference,
  totalLabel,
  depositLabel,
  depositPercent,
  balanceLabel,
  signedLabel,
  pendingCheckoutUrl,
  variant,
}: ContractActionsProps) {
  const inactive = status === "CANCELLED" || status === "EXPIRED";
  const signed = status === "SIGNED";
  const signable = status === "SENT" || status === "VIEWED";

  // ── Contrat inactif ──
  if (inactive) {
    if (variant === "bar") return null;
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-100/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-zinc-600">
          <Ban className="h-4 w-4 text-zinc-400" aria-hidden />
          Ce contrat n&apos;est plus actif.
        </p>
        <p className="mt-1 text-sm text-zinc-500">Aucune action n&apos;est nécessaire de votre part.</p>
      </div>
    );
  }

  // ── Barre flottante mobile ──
  if (variant === "bar") {
    if (signable) {
      return <SignDialog publicId={publicId} contractTitle={contractTitle} reference={reference} />;
    }
    if (signed) {
      return pendingCheckoutUrl ? (
        <Button asChild size="lg" className="h-12 w-full text-base font-semibold">
          <a href={pendingCheckoutUrl}>
            Reprendre le paiement
            <ArrowRight className="h-5 w-5" aria-hidden />
          </a>
        </Button>
      ) : (
        <PayButton publicId={publicId} className="w-full" />
      );
    }
    return null;
  }

  // ── Carte latérale desktop ──
  if (signable) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-emerald-50/80 to-white px-5 pt-5">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-900">
            <PartyPopper className="h-5 w-5 text-emerald-600" aria-hidden />
            Prêt à démarrer ?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            Signez électroniquement, puis réglez votre acompte : votre projet démarre immédiatement.
          </p>
        </div>
        <div className="space-y-4 px-5 pb-5 pt-4">
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Montant du projet</dt>
              <dd className="font-medium text-zinc-800">{totalLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Acompte à la signature ({depositPercent}&nbsp;%)</dt>
              <dd className="font-medium text-zinc-800">{depositLabel}</dd>
            </div>
          </dl>
          <SignDialog publicId={publicId} contractTitle={contractTitle} reference={reference} />
          <p className="text-center text-xs text-zinc-400">Signature en 2 minutes · Aucun compte à créer</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-emerald-50/80 to-white px-5 pt-5">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-900">
            <PartyPopper className="h-5 w-5 text-emerald-600" aria-hidden />
            Votre contrat est signé !
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            Pour lancer le projet, veuillez régler votre acompte.
          </p>
          {signedLabel && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Signé {signedLabel}
            </p>
          )}
        </div>
        <div className="space-y-4 px-5 pb-5 pt-4">
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Montant du projet</dt>
              <dd className="font-medium text-zinc-800">{totalLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Acompte ({depositPercent}&nbsp;%)</dt>
              <dd className="font-medium text-zinc-800">{depositLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2.5">
              <dt className="font-medium text-emerald-800">À payer maintenant</dt>
              <dd className="text-base font-bold text-emerald-700">{depositLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Solde à la livraison</dt>
              <dd className="font-medium text-zinc-800">{balanceLabel}</dd>
            </div>
          </dl>

          {pendingCheckoutUrl ? (
            <div className="space-y-2">
              <Button asChild size="lg" className="h-12 w-full text-base font-semibold">
                <a href={pendingCheckoutUrl}>
                  Reprendre le paiement
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </a>
              </Button>
              <p className="text-center text-xs text-zinc-400">Un paiement est en cours d&apos;attente.</p>
            </div>
          ) : (
            <PayButton publicId={publicId} className="w-full" />
          )}
          <p className="text-center text-xs text-zinc-400">Paiement sécurisé SaaSPay · Reçu immédiat</p>
        </div>
      </div>
    );
  }

  return null;
}
