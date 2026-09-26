"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, FileCheck2, Wallet, Timer, BarChart3 } from "lucide-react";

export type NotificationPrefs = {
  contractViewed: boolean;
  contractSigned: boolean;
  paymentReceived: boolean;
  reminders: boolean;
  weeklyReport: boolean;
};

const DEFAULTS: NotificationPrefs = {
  contractViewed: true,
  contractSigned: true,
  paymentReceived: true,
  reminders: true,
  weeklyReport: false,
};

const ROWS: { key: keyof NotificationPrefs; label: string; description: string; icon: React.ElementType }[] = [
  { key: "contractViewed", label: "Contrat consulté", description: "Quand un client ouvre votre contrat.", icon: FileCheck2 },
  { key: "contractSigned", label: "Contrat signé", description: "Quand un client signe électroniquement.", icon: BellRing },
  { key: "paymentReceived", label: "Paiement reçu", description: "Quand un acompte est confirmé par SaaSPay.", icon: Wallet },
  { key: "reminders", label: "Relances automatiques", description: "Rappels envoyés après 24 h, 3 jours puis 7 jours.", icon: Timer },
  { key: "weeklyReport", label: "Rapport hebdomadaire", description: "Un résumé de votre activité chaque lundi.", icon: BarChart3 },
];

export function NotificationSettings({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [loading, setLoading] = useState(false);

  async function save(next: NotificationPrefs) {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      setPrefs(next);
      toast.success("Préférences enregistrées ✅");
    } catch {
      toast.error("Impossible d'enregistrer les préférences.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choisissez les événements qui vous sont notifiés dans DevSign et par email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-accent/50">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <row.icon className="h-4.5 w-4.5 text-muted-foreground" />
              </span>
              <div>
                <Label htmlFor={row.key} className="text-sm font-medium">{row.label}</Label>
                <p className="text-xs text-muted-foreground">{row.description}</p>
              </div>
            </div>
            <Switch
              id={row.key}
              checked={prefs[row.key]}
              disabled={loading}
              onCheckedChange={(checked) => save({ ...prefs, [row.key]: checked })}
            />
          </div>
        ))}
        <p className="flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          Les modifications sont enregistrées automatiquement.
        </p>
      </CardContent>
    </Card>
  );
}
