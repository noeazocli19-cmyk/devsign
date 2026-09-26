"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, GoogleButton } from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password, callbackURL: callbackUrl });
    if (error) {
      setError(error.message === "Invalid email or password" ? "Email ou mot de passe incorrect." : (error.message ?? "Connexion impossible pour le moment."));
      setLoading(false);
      return;
    }
    toast.success("Connexion réussie 🎉");
    router.push(callbackUrl);
    router.refresh();
  }

  function fillDemo(kind: "demo" | "admin") {
    setEmail(kind === "demo" ? "demo@devsign.app" : "admin@devsign.app");
    setPassword(kind === "demo" ? "Demo1234!" : "Admin1234!");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Se connecter</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Bon retour ! Accédez à vos contrats et vos paiements.</p>

      <div className="mt-8">
        <GoogleButton callbackURL={callbackUrl} newUserCallbackURL="/onboarding" />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-3.5">
        <p className="text-xs font-medium text-muted-foreground">Comptes de démonstration :</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => fillDemo("demo")}>
            Freelance — demo@devsign.app
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => fillDemo("admin")}>
            Admin — admin@devsign.app
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Commencer gratuitement
        </Link>
      </p>
    </div>
  );
}
