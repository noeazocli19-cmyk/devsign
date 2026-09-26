import { Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { formatAmount } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Paramètres — Facturation" };

export default async function BillingSettingsPage() {
  const user = await requireUser();
  const currentPlan = PLANS.find((p) => p.id === user.plan) ?? PLANS[0]!;

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Plan actuel : {currentPlan.name}
              </CardTitle>
              <CardDescription>
                {currentPlan.priceMonthly === 0 ? "Gratuit, sans engagement." : `${formatAmount(currentPlan.priceMonthly, "XOF")} / mois — sans engagement.`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {currentPlan.features.slice(0, 4).map((f) => (
            <span key={f} className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
              <Check className="h-3 w-3 text-primary" />
              {f}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan.id;
          return (
            <Card key={plan.id} className={isCurrent ? "border-primary" : undefined}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <p className="text-2xl font-bold tracking-tight">
                  {plan.priceMonthly === 0 ? "0" : formatAmount(plan.priceMonthly, plan.currency)}
                  <span className="text-sm font-medium text-muted-foreground"> /mois</span>
                </p>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant={isCurrent ? "outline" : plan.highlighted ? "default" : "outline"} disabled={isCurrent}>
                  {isCurrent ? "Plan actuel" : "Changer de plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moyen de paiement</CardTitle>
          <CardDescription>Pour les abonnements payants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Aucun moyen de paiement enregistré. Les paiements d&apos;acomptes de vos clients transitent directement par SaaSPay — DevSign ne prélève rien sur leurs transactions.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique de facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Aucune facture d&apos;abonnement pour le moment. Les factures de vos contrats clients seront disponibles dans « Documents ».</p>
        </CardContent>
      </Card>
    </div>
  );
}
