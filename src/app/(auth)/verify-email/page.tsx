"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(() => (token ? "loading" : "idle"));
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authClient.verifyEmail({ query: { token } }).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setState("error");
        setMessage("Ce lien de vérification est invalide ou a expiré.");
      } else {
        setState("success");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-4 text-lg font-semibold">Vérification en cours…</h1>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold tracking-tight">Email vérifié ✅</h1>
          <p className="mt-2 text-sm text-muted-foreground">Votre compte est actif. Vous pouvez créer votre premier contrat.</p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Aller au dashboard</Link>
          </Button>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold tracking-tight">Vérification impossible</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </>
      )}
      {state === "idle" && (
        <>
          <h1 className="text-xl font-bold tracking-tight">Vérifiez votre boîte mail</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nous vous avons envoyé un lien de vérification. Cliquez dessus pour activer votre compte.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
