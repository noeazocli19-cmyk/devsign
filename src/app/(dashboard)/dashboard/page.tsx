import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Eye,
  FileText,
  Hourglass,
  Rocket,
  Send,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ContractsChart } from "@/components/dashboard/contracts-chart";
import { formatAmount, timeAgo } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { processDueReminders } from "@/lib/workflow";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  SIGNED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  PAID: { icon: Wallet, className: "bg-emerald-50 text-emerald-600" },
  PROJECT_STARTED: { icon: Rocket, className: "bg-emerald-50 text-emerald-600" },
  SENT: { icon: Send, className: "bg-sky-50 text-sky-600" },
  VIEWED: { icon: Eye, className: "bg-amber-50 text-amber-600" },
  REMINDER: { icon: BellRing, className: "bg-orange-50 text-orange-600" },
  CREATED: { icon: FileText, className: "bg-zinc-100 text-zinc-600" },
  CANCELLED: { icon: XCircle, className: "bg-red-50 text-red-600" },
};

function actorLabel(actor: string | null, userName: string): string {
  if (actor === "CLIENT") return "Client";
  if (actor === "SYSTEM") return "Système";
  if (actor && actor.length > 0) return actor === "SYSTEM" ? "Système" : userName;
  return "—";
}

export default async function DashboardPage() {
  const user = await requireUser();

  // Déclencheur des relances automatiques (24h / 3j / 7j) — fire-and-forget, jamais bloquant.
  try {
    void processDueReminders().catch(() => {});
  } catch {
    // silencieux : le dashboard ne doit jamais échouer à cause des relances
  }

  const [contracts, payments, activities] = await Promise.all([
    db.contract.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        reference: true,
        title: true,
        status: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: { userId: user.id },
      select: { status: true, amount: true, currency: true },
    }),
    db.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  // ─── Statistiques ───
  const totalContracts = contracts.length;
  const sent = contracts.filter((c) => c.status !== "DRAFT").length;
  const signed = contracts.filter((c) => c.status === "SIGNED").length;
  const pending = contracts.filter((c) => c.status === "SENT" || c.status === "VIEWED").length;
  const viewed = contracts.filter((c) => c.status === "VIEWED").length;
  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const paidTotal = successPayments.reduce((sum, p) => sum + p.amount, 0);
  const signatureRate = sent > 0 ? Math.round((signed / sent) * 100) : 0;

  // ─── Graphique : contrats créés sur les 6 derniers mois ───
  const now = new Date();
  const chartData: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    chartData.push({
      month: MONTH_LABELS[d.getMonth()],
      count: contracts.filter((c) => c.createdAt >= d && c.createdAt < next).length,
    });
  }

  const hasContracts = totalContracts > 0;
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title={`Bonjour, ${firstName}`}
        description="Voici un aperçu de votre activité : contrats, signatures et paiements encaissés."
      />

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Contrats envoyés"
          value={sent}
          icon={Send}
          hint={totalContracts > 0 ? `sur ${totalContracts} contrat${totalContracts > 1 ? "s" : ""}` : "aucun contrat pour l'instant"}
        />
        <StatCard
          label="Contrats signés"
          value={signed}
          icon={CheckCircle2}
          tone="success"
          hint={sent > 0 ? `taux de signature ${signatureRate} %` : "—"}
        />
        <StatCard
          label="En attente"
          value={pending}
          icon={Hourglass}
          tone="warning"
          hint={pending > 0 ? (viewed > 0 ? `dont ${viewed} déjà consulté${viewed > 1 ? "s" : ""}` : "relances automatiques actives") : "aucune signature attendue"}
        />
        <StatCard
          label="Montant encaissé"
          value={formatAmount(paidTotal)}
          icon={Wallet}
          tone="success"
          hint={successPayments.length > 0 ? `${successPayments.length} transaction${successPayments.length > 1 ? "s" : ""}` : "aucun paiement reçu"}
        />
      </div>

      {!hasContracts ? (
        <EmptyState
          icon={FileText}
          title="Créez votre premier contrat"
          description="Renseignez un client et un devis : DevSign génère un contrat professionnel, l'envoie pour signature et suit les paiements automatiquement."
          actionLabel="Créer un contrat"
          actionHref="/projects/new"
          className="border-solid"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Graphique */}
            <section className="rounded-xl border bg-card p-5 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Contrats créés</h2>
                  <p className="text-xs text-muted-foreground">6 derniers mois</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {totalContracts} au total
                </span>
              </div>
              <ContractsChart data={chartData} />
            </section>

            {/* Activité récente */}
            <section className="rounded-xl border bg-card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold">Activité récente</h2>
              <p className="text-xs text-muted-foreground">Les 6 derniers évènements</p>
              {activities.length === 0 ? (
                <p className="mt-6 text-center text-sm text-muted-foreground">Aucune activité pour le moment.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {activities.map((a) => {
                    const conf = ACTIVITY_ICONS[a.type] ?? { icon: FileText, className: "bg-zinc-100 text-zinc-600" };
                    const Icon = conf.icon;
                    return (
                      <li key={a.id} className="flex items-start gap-3">
                        <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", conf.className)} aria-hidden>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">{a.message}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {actorLabel(a.actor, user.name)} · {timeAgo(a.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Contrats récents */}
          <section className="rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Contrats récents</h2>
                <p className="text-xs text-muted-foreground">Les 4 derniers contrats créés</p>
              </div>
              <Link href="/contracts" className="min-h-11 text-sm font-medium text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            <ul className="divide-y">
              {contracts.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/contracts/${c.id}`}
                    className="flex min-h-14 flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100" aria-hidden>
                        <FileText className="h-4 w-4 text-zinc-500" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          <span className="font-mono">{c.reference}</span> · {c.client.firstName} {c.client.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <p className="font-semibold tabular-nums">{formatAmount(c.totalAmount, c.currency)}</p>
                      <StatusBadge status={c.status} kind="contract" />
                      <span className="hidden w-24 text-right text-xs text-muted-foreground lg:inline">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
