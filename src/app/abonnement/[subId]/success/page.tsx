// ─── Confirmation abonnement ─── /abonnement/[subId]/success

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { db } from "@/lib/db";
import { formatAmount, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abonnement activé — DevSign",
  robots: { index: false, follow: false },
};

export default async function SubscriptionSuccessPage({ params }: { params: Promise<{ subId: string }> }) {
  const { subId } = await params;
  const userId = subId.replace(/^sub-/, "");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const payment = await db.payment.findFirst({
    where: { userId: user.id, type: "SUBSCRIPTION", status: "SUCCESS" },
    orderBy: { paidAt: "desc" },
  });
  if (!payment) redirect("/settings/billing");

  const meta = payment.metadata ? JSON.parse(payment.metadata) : {};
  const targetPlan = meta.targetPlan ?? user.plan;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" aria-hidden>
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Abonnement activé !</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Votre paiement de {formatAmount(payment.amount, payment.currency)} a été confirmé. Votre compte est maintenant au plan{" "}
          <strong>{targetPlan}</strong>.
        </p>
        {payment.paidAt && <p className="mt-1 text-xs text-zinc-400">Confirmé le {formatDateTime(payment.paidAt)}</p>}

        <div className="mt-6 rounded-xl bg-emerald-50/60 p-4">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
            <PartyPopper className="h-4 w-4" aria-hidden />
            Contrats illimités, dès maintenant.
          </p>
        </div>

        <Button asChild size="lg" className="mt-6 h-12 w-full text-base font-semibold">
          <a href="/dashboard">Retour au tableau de bord</a>
        </Button>
      </div>
    </div>
  );
}