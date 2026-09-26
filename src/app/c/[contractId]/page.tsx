// ─── Espace client public — /c/[contractId] (contractId = contract.publicId) ──
// Page ouverte depuis WhatsApp : lecture de l'offre, signature, paiement d'acompte.
// AUCUNE authentification requise.

import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import {
  FileText,
  History,
  ListChecks,
  Lock,
  Package,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/db";
import { markContractViewed } from "@/lib/workflow";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { PROJECT_TYPES } from "@/lib/status";
import { StatusBadge } from "@/components/shared/status-badge";
import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompanyBadge } from "@/components/public/company-badge";
import { ContractActions } from "@/components/public/contract-actions";
import { ContractDocument } from "@/components/public/contract-document";
import { parseDeliverables } from "@/components/public/shared";

export const dynamic = "force-dynamic";

const CONTRACT_INCLUDE = {
  client: true,
  project: true,
  items: { orderBy: { position: "asc" } },
  signatures: { orderBy: { signedAt: "asc" } },
  payments: { orderBy: { createdAt: "desc" } },
  user: { include: { companyProfile: true } },
} satisfies Prisma.ContractInclude;

export async function generateMetadata({ params }: { params: Promise<{ contractId: string }> }): Promise<Metadata> {
  const { contractId } = await params;
  const contract = await db.contract.findUnique({ where: { publicId: contractId }, select: { title: true } });
  return {
    title: contract ? `${contract.title} — Votre espace client` : "Espace client",
    description: "Consultez votre offre, signez votre contrat et réglez votre acompte en toute sécurité.",
    robots: { index: false, follow: false },
  };
}

export default async function PublicContractPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  const found = await db.contract.findUnique({
    where: { publicId: contractId },
    include: CONTRACT_INCLUDE,
  });
  if (!found) notFound();
  const contract = found;

  // Un paiement déjà confirmé → confirmation finale directement
  if (contract.payments.some((p) => p.status === "SUCCESS")) {
    redirect(`/c/${contract.publicId}/success`);
  }

  // Passage SENT → VIEWED + notification au développeur (échec silencieux)
  try {
    await markContractViewed(contract.publicId);
  } catch {
    // silencieux — ne jamais bloquer l'affichage client
  }
  const status = contract.status === "SENT" ? "VIEWED" : contract.status;

  const company = contract.user.companyProfile;
  const businessName = company?.businessName ?? contract.user.name;
  const footerText = company?.footerText ?? null;
  const welcomeMessage =
    company?.welcomeMessage ??
    "Voici votre espace dédié : consultez votre offre, signez votre contrat et réglez votre acompte en toute sécurité.";

  const totalLabel = formatAmount(contract.totalAmount, contract.currency);
  const depositLabel = formatAmount(contract.depositAmount, contract.currency);
  const balanceLabel = formatAmount(contract.balanceAmount, contract.currency);
  const pendingCheckoutUrl = contract.payments.find((p) => p.status === "PENDING")?.checkoutUrl ?? null;
  const sentAt = contract.sentAt ?? contract.createdAt;
  const deliverables = parseDeliverables(contract.deliverables);

  const actionsProps = {
    publicId: contract.publicId,
    status,
    contractTitle: contract.title,
    reference: contract.reference,
    totalLabel,
    depositLabel,
    depositPercent: contract.depositPercent,
    balanceLabel,
    signedLabel: contract.signedAt ? `le ${formatDateTime(contract.signedAt)}` : null,
    pendingCheckoutUrl,
  };

  const navItems = [
    { href: "#offre", label: "Votre offre" },
    { href: "#livrables", label: "Livrables" },
    { href: "#contrat", label: "Contrat" },
    { href: "#signatures", label: "Signatures" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/70">
      {/* En-tête entreprise */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <CompanyBadge name={businessName} logoUrl={company?.logoUrl} />
            <div className="min-w-0">
              <p className="truncate font-semibold tracking-tight text-zinc-900">{businessName}</p>
              <p className="flex items-center gap-1 text-xs text-zinc-500">
                <Lock className="h-3 w-3 text-emerald-600" aria-hidden />
                Espace client sécurisé
              </p>
            </div>
          </div>
          <StatusBadge status={status} kind="contract" className="hidden sm:inline-flex" />
        </div>
      </header>

      {/* Navigation par sections (discret, sticky) */}
      <nav aria-label="Sections" className="sticky top-16 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 sm:px-6 lg:pb-14">
        {/* Accueil personnalisé */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Bonjour {contract.client.firstName} 👋
          </h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-zinc-500">{welcomeMessage}</p>
        </div>

        {/* Hero — projet & montant */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100/70 bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-transparent px-5 py-3.5 sm:px-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Package className="h-3.5 w-3.5" aria-hidden />
              Votre projet
            </p>
          </div>
          <div className="px-5 pb-6 pt-5 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{contract.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {PROJECT_TYPES[contract.project.type] ?? "Projet"} · Envoyé le {formatDate(sentAt)}
                </p>
              </div>
              <StatusBadge status={status} kind="contract" className="sm:hidden" />
            </div>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Montant total du projet</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">{totalLabel}</p>
              </div>
              <p className="text-sm text-zinc-500">
                Contract ID : <span className="font-mono text-zinc-700">{contract.reference}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenu + actions latérales */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {/* Votre offre */}
            <Card id="offre" className="scroll-mt-36 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ReceiptText className="h-5 w-5 text-emerald-600" aria-hidden />
                  Votre offre
                </CardTitle>
                <CardDescription>Le détail des prestations et des tarifs proposés.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contract.project.description && (
                  <p className="text-[15px] leading-relaxed text-zinc-600">{contract.project.description}</p>
                )}
                {contract.objectText && (
                  <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600">
                    <span className="font-medium text-zinc-800">Objet du contrat : </span>
                    {contract.objectText}
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-zinc-200">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Prestation</th>
                        <th className="px-2 py-2.5 text-center font-medium">Qté</th>
                        <th className="px-2 py-2.5 text-right font-medium">P.U.</th>
                        <th className="px-4 py-2.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {contract.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-zinc-800">
                            {item.name}
                            {item.description && <p className="text-xs font-normal text-zinc-500">{item.description}</p>}
                          </td>
                          <td className="px-2 py-3 text-center text-zinc-600">{item.quantity}</td>
                          <td className="px-2 py-3 text-right text-zinc-600">{formatAmount(item.unitPrice, contract.currency)}</td>
                          <td className="px-4 py-3 text-right font-medium text-zinc-800">
                            {formatAmount(item.quantity * item.unitPrice, contract.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Sous-total</dt>
                    <dd className="text-zinc-700">{formatAmount(contract.subtotal, contract.currency)}</dd>
                  </div>
                  {contract.discount > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Remise</dt>
                      <dd className="text-emerald-600">−{formatAmount(contract.discount, contract.currency)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">
                      {contract.taxRate > 0 ? `TVA (${contract.taxRate} %)` : "Taxes"}
                    </dt>
                    <dd className="text-zinc-700">{formatAmount(contract.taxAmount, contract.currency)}</dd>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold text-zinc-900">Total</dt>
                    <dd className="text-base font-bold text-zinc-900">{totalLabel}</dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <Wallet className="h-4 w-4 text-emerald-600" aria-hidden />
                    Acompte à la signature : {contract.depositPercent}&nbsp;% →{" "}
                    <span className="font-bold">{depositLabel}</span>
                  </p>
                  <p className="mt-1 pl-6 text-sm text-emerald-800/80">Solde à la livraison : {balanceLabel}</p>
                </div>
              </CardContent>
            </Card>

            {/* Livrables */}
            <Card id="livrables" className="scroll-mt-36 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="h-5 w-5 text-emerald-600" aria-hidden />
                  Livrables inclus
                </CardTitle>
                <CardDescription>Ce que vous recevrez à la fin du projet.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {deliverables.length > 0 ? (
                    deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-zinc-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
                        </svg>
                      </span>
                      {d}
                    </li>
                    ))
                  ) : (
                    <li className="text-[15px] text-zinc-500">Les livrables seront précisés par votre prestataire.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Contrat — document complet */}
            <Card id="contrat" className="scroll-mt-36 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-emerald-600" aria-hidden />
                  Contrat de prestation
                </CardTitle>
                <CardDescription>
                  Prenez le temps de lire l&apos;ensemble des clauses — tout est visible ci-dessous.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractDocument contract={contract} />
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale : actions + garanties */}
          <aside className="space-y-4 lg:sticky lg:top-32">
            <ContractActions {...actionsProps} variant="card" />

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Vos garanties</p>
              <ul className="mt-3 space-y-2.5 text-sm text-zinc-600">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Connexion sécurisée
                </li>
                <li className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                  Signature électronique horodatée
                </li>
                <li className="flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Paiement sécurisé SaaSPay
                </li>
                <li className="flex items-center gap-2.5">
                  <History className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Historique des actions
                </li>
              </ul>
            </div>

            {(status === "SIGNED" || contract.signatures.length > 0) && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                {contract.signatures.map((s) => (
                  <p key={s.id} className="flex items-start gap-2 text-sm text-emerald-900">
                    <span className="mt-0.5 text-emerald-600" aria-hidden>
                      ✓
                    </span>
                    <span>
                      Signé par <span className="font-medium">{s.signerName}</span> le {formatDateTime(s.signedAt)}
                      <span className="block font-mono text-xs text-emerald-700/70">Identifiant {s.signatureId}</span>
                    </span>
                  </p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 pb-28 text-center sm:px-6 lg:flex-row lg:pb-8 lg:text-left">
          <p className="text-sm text-zinc-500">{footerText ?? "Propulsé par DevSign"}</p>
          <Logo href="/" compact className="text-zinc-400 hover:text-zinc-600" />
        </div>
      </footer>

      {/* Barre d'action flottante — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <ContractActions {...actionsProps} variant="bar" />
      </div>
    </div>
  );
}
