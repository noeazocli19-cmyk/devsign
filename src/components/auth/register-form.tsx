"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, GoogleButton } from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signUp.email({ name, email, password, callbackURL: "/onboarding" });
    if (error) {
      const msg =
        error.status === 422 || error.message?.toLowerCase().includes("already")
          ? "Un compte existe déjà avec cette adresse email."
          : (error.message ?? "Inscription impossible pour le moment.");
      setError(msg);
      setLoading(false);
      return;
    }
    toast.success("Compte créé 🎉 Bienvenue sur DevSign !");
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Commencer gratuitement</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Créez votre compte et lancez votre premier contrat en quelques minutes.</p>

      <div className="mt-8">
        <GoogleButton callbackURL="/dashboard" newUserCallbackURL="/onboarding" />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" autoComplete="name" placeholder="Alex Martin" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email professionnel</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/conditions-utilisation" className="font-medium text-foreground underline underline-offset-2 hover:text-primary" target="_blank">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/politique-confidentialite" className="font-medium text-foreground underline underline-offset-2 hover:text-primary" target="_blank">
            politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
