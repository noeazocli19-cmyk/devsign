"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function SecuritySettings() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid password" ? "Le mot de passe actuel est incorrect." : (error.message ?? "Modification impossible."));
      return;
    }
    toast.success("Mot de passe mis à jour ✅ Les autres sessions ont été déconnectées.");
    setCurrent("");
    setNext("");
    setConfirm("");
    router.refresh();
  }

  async function revokeOtherSessions() {
    setRevoking(true);
    await authClient.revokeSessions();
    setRevoking(false);
    toast.success("Toutes les autres sessions ont été déconnectées.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            Changer de mot de passe
          </CardTitle>
          <CardDescription>Utilisez un mot de passe unique d&apos;au moins 8 caractères.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="current">Mot de passe actuel</Label>
              <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">Nouveau mot de passe</Label>
              <Input id="next" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
              <Input id="confirm" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
            Sessions actives
          </CardTitle>
          <CardDescription>Vos sessions restent actives 30 jours par appareil.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={revokeOtherSessions} disabled={revoking}>
            {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Déconnecter les autres appareils
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
