// ─── 404 propre de l'espace client public ────────────────────

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function PublicNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/70 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400" aria-hidden>
        <FileQuestion className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        Ce lien n&apos;est plus valide ou a été mal copié. Demandez un nouveau lien à votre prestataire.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
      >
        Retour à l&apos;accueil
      </Link>
      <Logo href="/" compact className="mt-10 text-zinc-300 hover:text-zinc-500" />
    </div>
  );
}
