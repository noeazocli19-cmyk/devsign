// ─── Confirmation finale — /c/[contractId]/success ───────────
// Atteinte après signature + acompte confirmé. Projet EN COURS.

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Download, FileText, PartyPopper, ReceiptText, Rocket, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatAmount, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SuccessCelebration } from "@/components/public/success-celebration";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tout est prêt ! — Espace client",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  const contract = await db.contract.findUnique({
    where: { publicId: contractId },
    include: {
      client: true,
      payments: true,
      user: { include: { companyProfile: true } },
    },
  });
  if (!contract) notFound();

  const payment = contract.payments.find((p) => p.status === "SUCCESS");
  if (!payment) redirect(`/c/${contract.publicId}`);

  const businessName = contract.user.companyProfile?.businessName ?? contract.user.name;
  const contactLine = [contract.user.companyProfile?.email, contract.user.companyProfile?.phone].filter(Boolean) as string[];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Confettis + check animé */}
      <div className="pt-14">
        <SuccessCelebration />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-xl px-4 pb-16 pt-6 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Tout est prêt !</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500">
          Votre contrat a été signé et votre acompte a été confirmé. Le projet peut maintenant commencer.
        </p>

        {/* Récapitulatif */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Projet
            </p>
            <p className="mt-1.5 font-semibold text-zinc-900">{contract.title}</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-700/80">
              <Wallet className="h-3.5 w-3.5" aria-hidden />
              Acompte payé
            </p>
            <p className="mt-1.5 text-lg font-bold text-emerald-700">{formatAmount(payment.amount, payment.currency)}</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-700/80">
              <Rocket className="h-3.5 w-3.5" aria-hidden />
              Statut du projet
            </p>
            <p className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                EN COURS
              </span>
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <ReceiptText className="h-3.5 w-3.5" aria-hidden />
              Transaction
            </p>
            <p className="mt-1.5 font-mono text-sm text-zinc-700">{payment.providerTxId ?? payment.reference}</p>
            {payment.paidAt && <p className="mt-0.5 text-xs text-zinc-400">Confirmée le {formatDateTime(payment.paidAt)}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-2.5">
          <Button asChild size="lg" className="h-12 w-full text-base font-semibold">
            <a href={`/c/${contract.publicId}/pdf`}>
              <Download className="h-5 w-5" aria-hidden />
              Télécharger le contrat
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
            <a href={`/c/${contract.publicId}`}>Retourner à l&apos;espace client</a>
          </Button>
        </div>

        {/* Message chaleureux du prestataire */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-800">
            <PartyPopper className="h-4 w-4 text-emerald-600" aria-hidden />
            Votre prestataire {businessName} vous recontacte très vite pour démarrer.
          </p>
          {contactLine.length > 0 && <p className="mt-1.5 text-xs text-zinc-500">{contactLine.join(" · ")}</p>}
        </div>
      </main>
    </div>
  );
}
