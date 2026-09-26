// ─── Checkout SaaSPay simulé — /c/[contractId]/pay?ref={reference} ──
// Route interne utilisée quand le provider est en mode simulation
// (sandbox sans clés SaaSPay). En production, le client est envoyé
// directement vers le vrai checkout SaaSPay.

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Loader2, Lock, SearchX, ShieldCheck, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { isSimulationMode } from "@/lib/payments";
import { formatAmount } from "@/lib/format";
import { PayCheckout } from "@/components/public/pay-checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paiement sécurisé — SaaSPay",
  robots: { index: false, follow: false },
};

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ contractId: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { contractId } = await params;
  const { ref } = await searchParams;

  const contract = await db.contract.findUnique({
    where: { publicId: contractId },
    include: {
      client: true,
      payments: true,
      user: { include: { companyProfile: true } },
    },
  });
  if (!contract) notFound();

  // Déjà payé → confirmation
  if (contract.payments.some((p) => p.status === "SUCCESS")) {
    redirect(`/c/${contract.publicId}/success`);
  }

  const businessName = contract.user.companyProfile?.businessName ?? contract.user.name;
  const payment = ref ? contract.payments.find((p) => p.reference === ref) : null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* En-tête SaaSPay */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white" aria-hidden>
              <Wallet className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-zinc-900">SaaSPay</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Paiement sécurisé
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-md">
          {contract.payments.some((p) => p.status === "SUCCESS") ? null : !ref || !payment ? (
            /* ── Transaction introuvable ── */
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400" aria-hidden>
                <SearchX className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Transaction introuvable</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Ce lien de paiement est incomplet ou a expiré. Retournez à votre espace client pour relancer le paiement de votre
                acompte.
              </p>
              <a
                href={`/c/${contract.publicId}`}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retourner à l&apos;espace client
              </a>
            </div>
          ) : payment.status === "CANCELLED" || payment.status === "REFUNDED" ? (
            /* ── Transaction non payable ── */
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400" aria-hidden>
                <SearchX className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Cette transaction n&apos;est plus disponible</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Cette transaction a été {payment.status === "CANCELLED" ? "annulée" : "remboursée"}. Retournez à votre espace client
                pour régler votre acompte.
              </p>
              <a
                href={`/c/${contract.publicId}`}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retourner à l&apos;espace client
              </a>
            </div>
          ) : !isSimulationMode() ? (
            /* ── Mode production : redirection vers le vrai checkout SaaSPay ── */
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" aria-hidden />
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Vous allez être redirigé vers SaaSPay…</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Votre paiement est traité sur la plateforme sécurisée de notre partenaire. Si rien ne se passe, retournez à votre
                espace client et relancez le paiement.
              </p>
              <a
                href={`/c/${contract.publicId}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Retourner à l&apos;espace client
              </a>
            </div>
          ) : (
            /* ── Checkout simulé ── */
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Marchand</p>
              <p className="mt-1 font-semibold text-zinc-900">{businessName}</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                Acompte — {contract.title} <span className="font-mono text-xs">({contract.reference})</span>
              </p>

              <div className="my-5 border-t border-dashed border-zinc-200" aria-hidden />

              <p className="text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Montant à régler</p>
              <p className="mt-1 text-center text-4xl font-bold tracking-tight text-zinc-900">
                {formatAmount(payment.amount, payment.currency)}
              </p>

              <div className="mt-5 space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Email</p>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-600">
                  {contract.client.email}
                </div>
              </div>

              <div className="mt-6">
                <PayCheckout
                  publicId={contract.publicId}
                  reference={payment.reference}
                  payLabel={`Payer ${formatAmount(payment.amount, payment.currency)}`}
                  simulated
                />
              </div>
            </div>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400">
            <Lock className="h-3 w-3" aria-hidden />
            Transaction protégée{payment ? ` · ${payment.reference}` : ""}
          </p>
        </div>
      </main>
    </div>
  );
}
