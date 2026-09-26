import { FileText, PenLine, Percent, Eye, Wallet, Banknote, Timer } from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { durationBetween, formatAmount } from "@/lib/format";
import { CONTRACT_STATUS } from "@/lib/status";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ContractsMonthChart, type MonthPoint } from "@/components/analytics/contracts-month-chart";
import { RevenueMonthChart, type RevenuePoint } from "@/components/analytics/revenue-month-chart";
import { StatusPieChart, type StatusSlice } from "@/components/analytics/status-pie-chart";

export const metadata = { title: "Analytics — DevSign" };

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#a1a1aa",
  SENT: "#0ea5e9",
  VIEWED: "#f59e0b",
  SIGNED: "#10b981",
  EXPIRED: "#f97316",
  CANCELLED: "#ef4444",
};

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default async function AnalyticsPage() {
  const user = await requireUser();

  const [contracts, payments] = await Promise.all([
    db.contract.findMany({
      where: { userId: user.id },
      select: { status: true, createdAt: true, sentAt: true, viewedAt: true, signedAt: true, paidAt: true },
    }),
    db.payment.findMany({
      where: { userId: user.id, status: "SUCCESS" },
      select: { amount: true, currency: true, paidAt: true },
    }),
  ]);

  // ── KPIs ──
  const created = contracts.length;
  const sent = contracts.filter((c) => c.sentAt);
  const opened = sent.filter((c) => c.viewedAt);
  const signed = sent.filter((c) => c.signedAt);
  const receivedPayments = payments.length;
  const collectedTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  const durations = signed
    .filter((c) => c.sentAt && c.signedAt)
    .map((c) => (c.signedAt!.getTime() - c.sentAt!.getTime()));
  const avgMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const avgLabel = avgMs !== null ? durationBetween(new Date(0), new Date(avgMs)) : "—";

  // ── Séries mensuelles (6 derniers mois) ──
  const now = new Date();
  const monthKeys: string[] = [];
  const monthLabels: string[] = [];
  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${d.getMonth()}`);
    monthLabels.push(formatter.format(d).replace(".", ""));
  }

  const contractsByMonth: MonthPoint[] = monthLabels.map((label) => ({ label, count: 0 }));
  for (const c of contracts) {
    const key = `${c.createdAt.getFullYear()}-${c.createdAt.getMonth()}`;
    const idx = monthKeys.indexOf(key);
    if (idx >= 0) contractsByMonth[idx].count += 1;
  }

  const revenueByMonth: RevenuePoint[] = monthLabels.map((label) => ({ label, amount: 0 }));
  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = `${p.paidAt.getFullYear()}-${p.paidAt.getMonth()}`;
    const idx = monthKeys.indexOf(key);
    if (idx >= 0) revenueByMonth[idx].amount += p.amount;
  }

  const statusSlices: StatusSlice[] = Object.keys(CONTRACT_STATUS)
    .map((status) => ({
      label: CONTRACT_STATUS[status].label,
      value: contracts.filter((c) => c.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((s) => s.value > 0);

  const kpis = [
    { label: "Contrats créés", value: String(created), icon: FileText },
    { label: "Contrats envoyés", value: String(sent.length), icon: PenLine },
    { label: "Taux d'ouverture", value: `${pct(opened.length, sent.length)} %`, icon: Eye },
    { label: "Taux de signature", value: `${pct(signed.length, sent.length)} %`, icon: Percent },
    { label: "Paiements reçus", value: String(receivedPayments), icon: Wallet },
    { label: "Montant encaissé", value: formatAmount(collectedTotal), icon: Banknote },
    { label: "Délai moyen de signature", value: avgLabel, icon: Timer },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader title="Analytics" description="La performance de vos propositions, de l'envoi à l'encaissement." />

      {created === 0 ? (
        <EmptyState
          icon={FileText}
          title="Pas encore de statistiques"
          description="Créez et envoyez votre premier contrat pour voir apparaître vos taux d'ouverture, de signature et vos encaissements."
          actionLabel="Créer un contrat"
          actionHref="/projects/new"
        />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                    <p className="truncate text-xs font-medium">{kpi.label}</p>
                  </div>
                  <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Graphiques */}
          <div className="grid gap-4 lg:grid-cols-5">
            <section className="rounded-xl border bg-card p-5 lg:col-span-3">
              <h2 className="text-sm font-semibold">Contrats créés par mois</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">6 derniers mois</p>
              <div className="mt-4">
                <ContractsMonthChart data={contractsByMonth} />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold">Répartition des contrats</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Par statut actuel</p>
              <div className="mt-4">
                <StatusPieChart data={statusSlices} />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 lg:col-span-5">
              <h2 className="text-sm font-semibold">Montants encaissés par mois</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Acomptes et paiements confirmés</p>
              <div className="mt-4">
                <RevenueMonthChart data={revenueByMonth} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
