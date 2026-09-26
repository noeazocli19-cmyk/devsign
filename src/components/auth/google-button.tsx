"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Logo officiel Google (G multicolore) — SVG inline, aucune dépendance. */
export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

/**
 * Bouton « Continuer avec Google » (OAuth Better Auth).
 * - callbackURL : destination après connexion d'un utilisateur existant
 * - newUserCallbackURL : destination après inscription via Google (onboarding)
 * Si les clés Google ne sont pas configurées côté serveur, l'API renvoie
 * une erreur affichée proprement (le bouton peut rester visible : il ne
 * casse rien en développement).
 */
export function GoogleButton({
  callbackURL = "/dashboard",
  newUserCallbackURL = "/onboarding",
  label = "Continuer avec Google",
  className = "",
}: {
  callbackURL?: string;
  newUserCallbackURL?: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        newUserCallbackURL,
      });
      if (error) {
        toast.error(
          error.message?.toLowerCase().includes("provider")
            ? "Google n'est pas encore configuré sur ce serveur. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET."
            : (error.message ?? "Connexion Google impossible pour le moment."),
        );
        setLoading(false);
      }
      // Sans erreur : redirection vers Google (page entière) — pas de setLoading(false).
    } catch {
      toast.error("Connexion Google impossible pour le moment.");
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" className={`h-11 w-full border-input bg-background font-medium ${className}`} onClick={signInWithGoogle} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2.5 h-[18px] w-[18px]" />}
      {label}
    </Button>
  );
}

/** Séparateur « ou continuer avec » entre email/mot de passe et OAuth. */
export function AuthDivider() {
  return (
    <div className="relative my-5" role="separator" aria-label="ou">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">ou</span>
      </div>
    </div>
  );
}
