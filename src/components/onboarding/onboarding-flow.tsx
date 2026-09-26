"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Code2, Palette, Laptop, Building2, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { PROFESSIONS } from "@/lib/status";

const PROFESSION_ICONS: Record<string, React.ElementType> = {
  DEVELOPER: Code2,
  DESIGNER: Palette,
  FREELANCE: Laptop,
  AGENCY: Building2,
  CONSULTANT: Briefcase,
  OTHER: Sparkles,
};

const COUNTRIES = ["Sénégal", "Côte d'Ivoire", "Cameroun", "Bénin", "Togo", "Mali", "Burkina Faso", "Guinée", "Gabon", "Congo", "France", "Belgique", "Canada", "Maroc", "Tunisie", "Algérie", "Autre"];

export function OnboardingFlow({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Sénégal");
  const [currency, setCurrency] = useState("XOF");

  const totalSteps = 4;

  async function finish() {
    if (!businessName.trim()) {
      toast.error("Le nom professionnel est requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, businessName: businessName.trim(), logoUrl: logoUrl || null, description: description || null, country, currency }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil créé 🎉");
      router.push("/projects/new");
      router.refresh();
    } catch {
      toast.error("Impossible d'enregistrer votre profil. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      {/* Progression */}
      <div className="mb-10 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
          {step === 1 && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">👋</span>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">Bienvenue sur DevSign, {userName.split(" ")[0]} !</h1>
              <p className="mt-3 text-muted-foreground">
                Transformez vos prospects en clients signés et payés. Création de contrat, signature électronique et acompte — tout au même endroit.
              </p>
              <Button size="lg" className="mt-8 h-12 px-8" onClick={() => setStep(2)}>
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quel est votre métier ?</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Cela nous aide à personnaliser vos modèles de contrats.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(PROFESSIONS).map(([key, label]) => {
                  const Icon = PROFESSION_ICONS[key] ?? Sparkles;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProfession(key)}
                      aria-pressed={profession === key}
                      className={cn(
                        "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                        profession === key ? "border-primary bg-emerald-50 text-primary ring-1 ring-primary" : "bg-card hover:border-zinc-300 hover:bg-accent",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
                <Button disabled={!profession} onClick={() => setStep(3)}>
                  Continuer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Présentez votre activité</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Ces informations apparaîtront dans l&apos;espace de vos clients.</p>
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Nom professionnel *</Label>
                  <Input id="businessName" placeholder="Studio Martin" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="logoUrl">Logo (URL)</Label>
                  <Input id="logoUrl" type="url" placeholder="https://…/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description courte</Label>
                  <Textarea id="description" placeholder="Studio de développement web & mobile…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Pays</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Devise</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dollar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Retour</Button>
                <Button onClick={finish} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Terminer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">🚀</span>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">Tout est prêt !</h1>
              <p className="mt-3 text-muted-foreground">Créez votre premier contrat, envoyez le lien à votre client et recevez votre acompte.</p>
              <Button size="lg" className="mt-8 h-12 px-8" onClick={() => router.push("/projects/new")}>
                Créer mon premier contrat <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 text-center">
        <Logo compact className="justify-center opacity-40" />
      </div>
    </div>
  );
}
