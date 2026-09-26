"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CompanySettingsData = {
  businessName: string | null;
  logoUrl: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  currency: string;
  brandColor: string;
  footerText: string | null;
  welcomeMessage: string | null;
};

const BRAND_COLORS = ["#059669", "#0d9488", "#16a34a", "#65a30d", "#ca8a04", "#ea580c", "#dc2626", "#18181b"];

const COUNTRIES = ["Sénégal", "Côte d'Ivoire", "Cameroun", "Bénin", "Togo", "Mali", "Burkina Faso", "Guinée", "Gabon", "Congo", "France", "Belgique", "Canada", "Maroc", "Tunisie", "Algérie", "Autre"];

export function CompanySettings({ initial }: { initial: CompanySettingsData }) {
  const router = useRouter();
  const [data, setData] = useState<CompanySettingsData>(initial);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CompanySettingsData>(key: K, value: CompanySettingsData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      toast.success("Espace client personnalisé ✅");
      router.refresh();
    } catch {
      toast.error("Impossible d'enregistrer. Vérifiez les champs et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identité de marque</CardTitle>
          <CardDescription>Ces éléments sont affichés à vos clients dans leur espace dédié.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Nom de marque *</Label>
              <Input id="businessName" value={data.businessName ?? ""} onChange={(e) => set("businessName", e.target.value)} placeholder="Studio Martin" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">Logo (URL)</Label>
              <Input id="logoUrl" type="url" value={data.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value || null)} placeholder="https://…/logo.png" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} value={data.description ?? ""} onChange={(e) => set("description", e.target.value || null)} placeholder="Studio de développement web & mobile…" />
          </div>
          <div className="space-y-1.5">
            <Label>Couleur principale de votre espace client</Label>
            <div className="flex flex-wrap items-center gap-2">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Couleur ${c}`}
                  aria-pressed={data.brandColor === c}
                  onClick={() => set("brandColor", c)}
                  className={cn("h-9 w-9 rounded-full border-2 transition-transform hover:scale-110", data.brandColor === c ? "border-foreground ring-2 ring-ring ring-offset-2" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={data.brandColor}
                onChange={(e) => set("brandColor", e.target.value)}
                aria-label="Couleur personnalisée"
                className="h-9 w-9 cursor-pointer rounded-full border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées professionnelles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cEmail">Email de contact</Label>
            <Input id="cEmail" type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value || null)} placeholder="contact@votrestudio.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cPhone">Téléphone</Label>
            <Input id="cPhone" type="tel" value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value || null)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={data.address ?? ""} onChange={(e) => set("address", e.target.value || null)} placeholder="12 Rue de la Paix, Dakar" />
          </div>
          <div className="space-y-1.5">
            <Label>Pays</Label>
            <Select value={data.country ?? "Sénégal"} onValueChange={(v) => set("country", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Devise par défaut</Label>
            <Select value={data.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dollar (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages de votre espace client</CardTitle>
          <CardDescription>Personnalisez l&apos;accueil et le pied de page vus par vos clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="welcome">Message d&apos;accueil</Label>
            <Textarea id="welcome" rows={2} value={data.welcomeMessage ?? ""} onChange={(e) => set("welcomeMessage", e.target.value || null)} placeholder="Ravis de travailler avec vous ! Consultez votre offre, signez et lancez votre projet." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer">Pied de page</Label>
            <Input id="footer" value={data.footerText ?? ""} onChange={(e) => set("footerText", e.target.value || null)} placeholder="Studio Martin — Développement web & mobile" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-36">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
