"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth-misc/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setSent(true);
      if (json?.data?.devResetUrl) setDevUrl(json.data.devResetUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>

      {sent ? (
        <div className="mt-8 rounded-xl border bg-card p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-semibold">Email envoyé</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Si un compte existe avec <strong>{email}</strong>, vous recevrez un lien pour définir un nouveau mot de passe dans quelques minutes.
          </p>
          {devUrl && (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/40 p-3 text-left">
              <p className="text-xs font-medium text-amber-600">Mode développement (email non configuré) — lien direct :</p>
              <a href={devUrl} className="mt-1 block break-all text-xs text-primary underline">
                {devUrl}
              </a>
            </div>
          )}
          <Button variant="outline" className="mt-5" asChild>
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Envoyer le lien de réinitialisation
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
