import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  PenLine,
  Wallet,
  BellRing,
  Users,
  BarChart3,
  LayoutTemplate,
  FileDown,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { HeroContractCard } from "@/components/marketing/hero-contract-card";
import { PLANS } from "@/lib/plans";
import { formatAmount } from "@/lib/format";

const PROBLEMS = [
  "PDF envoyé par WhatsApp",
  "Client qui oublie de signer",
  "Messages interminables",
  "Contrat perdu dans les discussions",
  "Paiement difficile à suivre",
  "Absence de suivi",
  "Plusieurs outils différents",
];

const STEPS = [
  {
    number: "01",
    title: "Créez votre projet",
    description: "Renseignez le client, le projet, le prix, les délais, les livrables et l'acompte. Deux minutes suffisent.",
  },
  {
    number: "02",
    title: "Générez le contrat",
    description: "DevSign construit automatiquement un contrat professionnel à partir des informations fournies.",
  },
  {
    number: "03",
    title: "Envoyez le lien",
    description: "Le client reçoit une URL unique — par WhatsApp ou email — sans compte à créer.",
    code: "devsign.app/c/8xK29p",
  },
  {
    number: "04",
    title: "Signature + paiement",
    description: "Le client signe électroniquement puis règle son acompte via SaaSPay. Le projet est automatiquement activé.",
  },
];

const FEATURES = [
  { icon: PenLine, title: "Signature électronique", description: "Signature traçable avec horodatage, identifiant unique et métadonnées de vérification." },
  { icon: Wallet, title: "Acomptes via SaaSPay", description: "Le client paie l'acompte en ligne. Paiement vérifié côté serveur, projet activé automatiquement." },
  { icon: BellRing, title: "Relances automatiques", description: "Après 24 h, 3 jours puis 7 jours, DevSign relance poliment le client pour vous." },
  { icon: Users, title: "Espace client premium", description: "Une page élégante à votre marque, où le client consulte, lit, signe et paie — sans compte." },
  { icon: BarChart3, title: "Analytics", description: "Taux d'ouverture, taux de signature, délai moyen de signature et montants encaissés." },
  { icon: LayoutTemplate, title: "Modèles de contrats", description: "Site vitrine, e-commerce, mobile, SaaS, maintenance, design, SEO… utilisez et personnalisez." },
  { icon: FileDown, title: "PDF professionnel", description: "Téléchargez le contrat signé en PDF, avec signatures, référence et informations de paiement." },
  { icon: Smartphone, title: "Pensé mobile", description: "Gérez vos contrats depuis votre téléphone. Vos clients signent depuis le leur." },
];

const FAQ = [
  {
    q: "Mes clients doivent-ils créer un compte pour signer ?",
    a: "Non. Le client ouvre votre lien, lit le contrat, signe et paie sans aucune inscription. C'est le parcours le plus court possible : lien reçu → lecture → signature → paiement → confirmation.",
  },
  {
    q: "La signature électronique a-t-elle une valeur ?",
    a: "Chaque signature est horodatée et associée à un identifiant unique, à l'adresse IP et à l'appareil du signataire. L'ensemble constitue une preuve de traçabilité du consentement.",
  },
  {
    q: "Comment se passe le paiement de l'acompte ?",
    a: "Après signature, le client règle son acompte via SaaSPay directement depuis votre espace client. Le paiement est confirmé côté serveur via un webhook sécurisé — jamais sur la seule parole du navigateur.",
  },
  {
    q: "Puis-je personnaliser mes contrats ?",
    a: "Oui : révisions, conditions de paiement, propriété intellectuelle, maintenance, annulation… Chaque section est modifiable, et vos modèles réutilisables accélèrent chaque nouveau projet.",
  },
  {
    q: "DevSign fonctionne-t-il avec des clients internationaux ?",
    a: "Oui. FCFA, EUR et USD sont pris en charge dès le départ, et l'architecture est prête pour d'autres devises.",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevSign",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Contrats, signature électronique et paiements d'acomptes pour développeurs, freelances et agences web.",
  offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.priceMonthly, priceCurrency: "XOF" })),
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      <MarketingNavbar />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_55%)]" />
          <div className="mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
            <div>
              <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Nouveau — Paiements d&apos;acompte intégrés
              </Badge>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Signez vos contrats et lancez vos projets <span className="text-primary">plus rapidement</span>.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Devis, contrat, signature et acompte dans un seul espace professionnel. Créez une proposition, envoyez un seul lien à votre client — et lancez-vous.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-6 text-base">
                  <Link href="/register">
                    Créer mon premier contrat
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                  <a href="#how">Voir comment ça marche</a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" /> Sans carte bancaire
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" /> Votre premier contrat en 3 minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" /> Aucune inscription côté client
                </span>
              </div>
            </div>
            <HeroContractCard />
          </div>
        </section>

        {/* ─── SOCIAL PROOF ─── */}
        <section className="border-y bg-zinc-50/70 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Conçu pour les développeurs, freelances et agences qui veulent être payés à temps</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold text-zinc-400">
              <span className="tracking-wide">Kélé SARL</span>
              <span className="tracking-wide">Atelier Sow</span>
              <span className="tracking-wide">Ndiaye Immobilier</span>
              <span className="tracking-wide">Ba Cosmetics</span>
              <span className="tracking-wide">+1 200 studios</span>
            </div>
          </div>
        </section>

        {/* ─── PROBLÈME ─── */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Le vrai problème des freelances ? Les frictions.</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Entre le premier message et l&apos;acompte versé, trop de projets s&apos;égarent. DevSign supprime les frictions.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {/* Avant */}
              <div className="rounded-2xl border bg-card p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Avant DevSign</p>
                <ul className="mt-5 space-y-3.5">
                  {PROBLEMS.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[15px] text-zinc-600">
                      <span className="flex h-5.5 w-5.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avec DevSign */}
              <div className="relative rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-card p-6 sm:p-8">
                <Badge className="absolute right-6 top-6 bg-emerald-600">DevSign</Badge>
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Avec DevSign</p>
                <div className="mt-8 space-y-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <p>Un seul lien.</p>
                  <p className="text-zinc-400">Contrat.</p>
                  <p className="text-zinc-500">Signature.</p>
                  <p className="text-zinc-600">Paiement.</p>
                  <p className="text-primary">Confirmation.</p>
                </div>
                <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                  Votre client ouvre le lien, découvre une page professionnelle à votre marque, signe électroniquement et règle son acompte. Vous recevez tout, vous lancez le projet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── COMMENT ÇA MARCHE ─── */}
        <section id="how" className="border-t bg-zinc-50/60 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
              <p className="mt-4 text-lg text-muted-foreground">Quatre étapes. Un seul outil. Zéro va-et-vient.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number} className="group relative rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                  <span className="font-mono text-sm font-semibold text-primary">{step.number}</span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  {step.code && (
                    <code className="mt-4 block rounded-md bg-zinc-900 px-3 py-2 font-mono text-xs text-emerald-400">{step.code}</code>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FONCTIONNALITÉS ─── */}
        <section id="features" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce qu&apos;il faut pour conclure</h2>
              <p className="mt-4 text-lg text-muted-foreground">Pas dix outils. Un seul espace professionnel, de la proposition à l&apos;acompte.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border bg-card p-5 transition-colors hover:border-emerald-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TARIFS ─── */}
        <section id="pricing" className="border-t bg-zinc-50/60 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Des tarifs simples</h2>
              <p className="mt-4 text-lg text-muted-foreground">Commencez gratuitement. Passez au niveau supérieur quand vos projets s&apos;enchaînent.</p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={
                    plan.highlighted
                      ? "relative rounded-2xl border-2 border-primary bg-card p-7 shadow-lg shadow-emerald-600/5"
                      : "relative rounded-2xl border bg-card p-7"
                  }
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Le plus populaire</Badge>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mt-5 text-4xl font-bold tracking-tight">
                    {plan.priceMonthly === 0 ? "0" : formatAmount(plan.priceMonthly, plan.currency)}
                    <span className="text-base font-medium text-muted-foreground"> /mois</span>
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-7 w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions fréquentes</h2>
              <p className="mt-4 text-lg text-muted-foreground">Tout ce que vous devez savoir avant votre premier contrat.</p>
            </div>
            <Accordion type="single" collapsible className="mt-10">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-zinc-900 px-6 py-16 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Du premier message à l&apos;acompte payé. <span className="text-emerald-400">Un seul lien.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Créez → Envoyez → Signez → Payez → Commencez.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 bg-white px-7 text-base text-zinc-900 hover:bg-zinc-200" asChild>
                <Link href="/register">Créer mon premier contrat</Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-7 text-base text-zinc-300 hover:bg-zinc-800 hover:text-white" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4" /> Paiements vérifiés serveur · Signatures traçables · Données chiffrées
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
