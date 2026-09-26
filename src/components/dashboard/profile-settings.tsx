"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

export function ProfileSettings({
  user,
  phone,
  businessName,
  logoUrl,
}: {
  user: { name: string; email: string; image?: string | null; profession?: string | null };
  phone: string | null;
  businessName: string | null;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phoneValue, setPhoneValue] = useState(phone ?? "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phoneValue || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      toast.success("Profil mis à jour ✅");
      router.refresh();
    } catch {
      toast.error("Impossible d'enregistrer. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>Votre avatar apparaît dans le dashboard et dans vos emails.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary text-base font-bold text-primary-foreground">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 rounded-lg border border-dashed px-3.5 py-2.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Utilisez <a href="https://gravatar.com" target="_blank" rel="noreferrer" className="mx-1 font-medium text-primary hover:underline">Gravatar</a> avec votre email pour personnaliser votre avatar.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Nom et coordonnées de contact.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Pour changer d&apos;email, contactez le support.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="+221 77 123 45 67" value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} />
            </div>
            {user.profession && (
              <div className="space-y-1.5">
                <Label>Métier</Label>
                <Input value={user.profession} disabled className="bg-muted" />
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {businessName && (
        <Card>
          <CardHeader>
            <CardTitle>Entreprise liée</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-50 text-primary text-xs font-bold">{initials(businessName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{businessName}</p>
              <p className="text-xs text-muted-foreground">Gérez les détails dans l&apos;onglet « Entreprise ».</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
