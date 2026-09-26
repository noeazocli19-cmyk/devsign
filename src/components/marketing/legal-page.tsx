import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Logo } from "@/components/shared/logo";

/**
 * Gabarit commun des pages légales (CGU, confidentialité, mentions légales).
 * Public, responsive, sans distraction : contenu centré lisible + retour accueil.
 */
export function LegalPage({
  title,
  description,
  updatedAt = "26 septembre 2026",
  children,
}: {
  title: string;
  description: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour au site</span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <FileText className="h-3.5 w-3.5" />
          Document légal
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Dernière mise à jour : {updatedAt} · DevSign — <span className="font-mono">devsign.app</span>
        </p>

        <div className="mt-10 space-y-10 border-t pt-10">{children}</div>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} DevSign. Tous droits réservés.</p>
          <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Pages légales">
            <Link href="/conditions-utilisation" className="hover:text-foreground">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ items, ordered = false }: { items: React.ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`ml-5 space-y-1.5 ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </Tag>
  );
}
