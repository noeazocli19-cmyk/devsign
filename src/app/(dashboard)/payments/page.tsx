import { CheckCircle2, Clock, Wallet, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaymentsList, type PaymentListItem } from "@/components/dashboard/payments-list";
import { formatAmount } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await requireUser();

  const payments = await db.payment.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      reference: true,
      providerTxId: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      createdAt: true,
      contractId: true,
      contract: { select: { reference: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const items: PaymentListItem[] = payments.map((p) => ({
    id: p.id,
    reference: p.reference,
    providerTxId: p.providerTxId,
    type: p.type,
    status: p.status,
    amount: p.amount,
    currency: p.currency,
    createdAt: p.createdAt.toISOString(),
    contractId: p.contractId,
    contractReference: p.contract?.reference ?? null,
  }));

  const paid = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);
  const pending = payments
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0);
  const failed = payments.filter((p) => p.status === "FAILED").reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter((p) => p.status === "SUCCESS").length;
  const pendingCount = payments.filter((p) => ["PENDING", "PROCESSING"].includes(p.status)).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Paiements"
        description="Toutes les transactions SaaSPay de vos contrats, avec leur statut en temps réel."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total encaissé"
          value={formatAmount(paid)}
          icon={CheckCircle2}
          tone="success"
          hint={`${paidCount} paiement${paidCount > 1 ? "s" : ""} confirmé${paidCount > 1 ? "s" : ""}`}
        />
        <StatCard
          label="En attente"
          value={formatAmount(pending)}
          icon={Clock}
          tone="warning"
          hint={`${pendingCount} transaction${pendingCount > 1 ? "s" : ""} en cours`}
        />
        <StatCard label="Échoués" value={formatAmount(failed)} icon={XCircle} hint="à relancer côté client" />
        <StatCard label="Transactions" value={items.length} icon={Wallet} hint="depuis la création du compte" />
      </div>

      <PaymentsList items={items} />
    </div>
  );
}
