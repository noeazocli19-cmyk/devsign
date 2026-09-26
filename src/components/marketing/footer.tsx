import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/#features" },
      { label: "Comment ça marche", href: "/#how" },
      { label: "Tarifs", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Modèles de contrats", href: "/templates" },
      { label: "Se connecter", href: "/login" },
      { label: "Créer un compte", href: "/register" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
      { label: "Politique de confidentialité", href: "/politique-confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Du premier message à l&apos;acompte payé. Un seul lien. Contrats, signature électronique et paiements pour développeurs, freelances et agences.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DevSign. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            🔒 Connexion sécurisée · Signature électronique traçable · Paiement SaaSPay
          </p>
        </div>
      </div>
    </footer>
  );
}
