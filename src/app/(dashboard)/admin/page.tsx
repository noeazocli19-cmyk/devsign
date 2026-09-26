import Link from "next/link";
import { Users, FileText, CheckCircle2, Wallet, AlertTriangle, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatAmount, formatShortDate, timeAgo, initials } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYMENT_TYPES } from "@/lib/status";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const [users, contracts, signedContracts, payments, errors, plans, recentUsers, transactions] = await Promise.all([
    db.user.count(),
    db.contract.count(),
    db.contract.count({ where: { status: "SIGNED" } }),
    db.payment.findMany({ where: { status: "SUCCESS" } }),
    db.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.user.groupBy({ by: ["plan"], _count: true }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true, contract: true } }),
  ]);

  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
  const planMap = Object.fromEntries(plans.map((p) => [p.plan, p._count]));

  const STATS = [
    { label: "Utilisateurs", value: String(users), icon: Users, hint: `${planMap.PRO ?? 0} Pro · ${planMap.AGENCY ?? 0} Agency` },
    { label: "Contrats créés", value: String(contracts), icon: FileText, hint: "tous statuts" },
    { label: "Contrats signés", value: String(signedContracts), icon: CheckCircle2, hint: contracts > 0 ? `${Math.round((signedContracts / contracts) * 100)} % du total` : "—" },
    { label: "Volume encaissé", value: formatAmount(totalVolume, "XOF"), icon: Wallet, hint: `${payments.length} transactions réussies` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration DevSign"
        description="Vue d'ensemble de la plateforme — utilisateurs, contrats, transactions et erreurs."
        actions={<Badge className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Accès admin</Badge>}
      />

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-4.5 w-4.5 text-muted-foreground/60" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Derniers utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers utilisateurs inscrits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-primary">{initials(u.name)}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.name}{u.role === "ADMIN" && <Badge variant="outline" className="ml-1.5 px-1.5 py-0 text-[10px]">ADMIN</Badge>}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{u.plan}</Badge></TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatShortDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transactions SaaSPay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions SaaSPay récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Client / Contrat</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-mono text-xs font-medium">{t.providerTxId ?? t.reference}</p>
                        <p className="text-[11px] text-muted-foreground">{timeAgo(t.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{t.user.name}</p>
                        {t.contract && <p className="text-[11px] text-muted-foreground">{t.contract.reference} · {PAYMENT_TYPES[t.type] ?? t.type}</p>}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold tabular-nums">{formatAmount(t.amount, t.currency)}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={t.status} kind="payment" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erreurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            Journal d&apos;erreurs système
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {errors.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">Aucune erreur enregistrée. La plateforme tourne parfaitement. ✨</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell><Badge variant="outline" className="font-mono text-[10px]">{e.source}</Badge></TableCell>
                      <TableCell className="max-w-md truncate text-xs text-muted-foreground">{e.message}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{timeAgo(e.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Besoin de données de démonstration fraîches ? Exécutez <code className="rounded bg-muted px-1.5 py-0.5 font-mono">bun run db:seed</code> · <Link href="/dashboard" className="text-primary hover:underline">Retour au dashboard</Link>
      </p>
    </div>
  );
}
