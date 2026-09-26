"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Bouton « Tout marquer comme lu » → PATCH /api/notifications { all: true }. */
export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? "Impossible de tout marquer comme lu.");
        return;
      }
      toast.success("Toutes les notifications sont marquées comme lues.");
      router.refresh();
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={markAll} disabled={loading || disabled} className="min-h-10">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Tout marquer comme lu
    </Button>
  );
}

/**
 * Bouton discret « Tester les rappels » → POST /api/dev/reminders.
 * Déclenche processDueReminders() : utile en démo pour voir les relances.
 */
export function TestRemindersButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/reminders", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? "Impossible de lancer les rappels.");
        return;
      }
      const sent = Number(json?.data?.sent ?? 0);
      if (sent > 0) {
        toast.success(`${sent} rappel${sent > 1 ? "s" : ""} envoyé${sent > 1 ? "s" : ""}.`);
        startTransition(() => router.refresh());
      } else {
        toast.info("Aucun rappel en attente pour le moment.");
      }
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={run} disabled={loading || pending} className="min-h-10 text-muted-foreground">
      {loading || pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
      Tester les rappels
    </Button>
  );
}
