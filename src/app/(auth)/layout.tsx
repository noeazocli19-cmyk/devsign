import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Colonne formulaire */}
      <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <Logo />
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ← Retour au site
            </Link>
          </div>
          <div className="flex flex-1 items-center py-10">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>

      {/* Panneau de marque */}
      <div className="relative hidden overflow-hidden bg-zinc-900 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_60%)]" />
        <p className="relative text-lg font-semibold text-white">
          Dev<span className="text-emerald-400">Sign</span>
        </p>
        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-white">
            Du premier message à l&apos;acompte payé. <span className="text-emerald-400">Un seul lien.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              "Contrat professionnel généré en 2 minutes",
              "Signature électronique traçable",
              "Acompte encaissé via SaaSPay",
              "Projet activé automatiquement",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[15px] text-zinc-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm leading-relaxed text-zinc-400">
              « Je ne renvoie plus jamais un PDF par WhatsApp. Je crée le contrat, j&apos;envoie le lien, le client signe et paie. Fini. »
            </p>
            <p className="mt-3 text-xs font-medium text-zinc-500">— Un développeur freelance, utilisateur DevSign</p>
          </div>
        </div>
        <p className="relative text-xs text-zinc-600">© {new Date().getFullYear()} DevSign — Contrats, signature & paiements</p>
      </div>
    </div>
  );
}
