// ─── Checkout SaaSPay simulé pour un abonnement ─── /abonnement/[subId]/pay?ref={reference}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Loader2, Lock, SearchX, ShieldCheck, Wallet, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { isSimulationMode } from "@/lib/payments";
import { formatAmount } from "@/lib/format";
import { PayCheckout } from "@/components/public/pay-checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paiement sécurisé — SaaSPay",
  robots: { index: false, follow: false },
};

export default async function SubscriptionPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ subId: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { subId } = await params;
  const { ref } = await searchParams;
  const userId = subId.replace(/^sub-/, "");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const payments = await db.payment.findMany({ where: { userId: user.id, type: "SUBSCRIPTION" }, orderBy: { createdAt: "desc" } });

  if (payments.some((p) => p.status === "SUCCESS" && p.reference === ref)) {
    redirect(`/abonnement/${subId}/success?ref=${ref}`);
  }

  const payment = ref ? payments.find((p) => p.reference === ref) : null;
  const meta = payment?.metadata ? JSON.parse(payment.metadata) : {};
  const targetPlan = meta.targetPlan ?? "PRO";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
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
          {!ref || !payment ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400" aria-hidden>
                <SearchX className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Transaction introuvable</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Ce lien de paiement est incomplet ou a expiré. Retournez à vos paramètres de facturation pour relancer le paiement.
              </p>
                <a
                href="/settings/billing"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retourner aux paramètres
              </a>
            </div>
          ) : payment.status === "CANCELLED" || payment.status === "REFUNDED" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400" aria-hidden>
                <SearchX className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Cette transaction n&apos;est plus disponible</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Cette transaction a été {payment.status === "CANCELLED" ? "annulée" : "remboursée"}. Retournez à vos paramètres pour
                relancer le paiement.
              </p>
                <a
                href="/settings/billing"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retourner aux paramètres
              </a>
            </div>
          ) : !isSimulationMode() ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" aria-hidden />
              <h1 className="mt-4 text-lg font-semibold text-zinc-900">Vous allez être redirigé vers SaaSPay…</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Votre paiement est traité sur la plateforme sécurisée de notre partenaire.
              </p>
                <a
                href="/settings/billing"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Retourner aux paramètres
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Abonnement</p>
              <p className="mt-1 font-semibold text-zinc-900">Plan {targetPlan}</p>
              <p className="mt-0.5 text-sm text-zinc-500">DevSign — abonnement mensuel</p>

              <div className="my-5 border-t border-dashed border-zinc-200" aria-hidden />

              <p className="text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Montant à régler</p>
              <p className="mt-1 text-center text-4xl font-bold tracking-tight text-zinc-900">
                {formatAmount(payment.amount, payment.currency)}
              </p>

              <div className="mt-5 space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Email</p>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-600">{user.email}</div>
              </div>

              <div className="mt-6">
                <PayCheckout
                  publicId={subId}
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