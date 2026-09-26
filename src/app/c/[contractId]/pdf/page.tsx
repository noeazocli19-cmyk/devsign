// ─── Document imprimable — /c/[contractId]/pdf ───────────────
// Rendu A4 formel du contrat, avec signatures. Impression via
// le bouton "Télécharger en PDF" (window.print()).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { IP_OWNERSHIP, MAINTENANCE_TYPES, PROJECT_TYPES } from "@/lib/status";
import { CompanyBadge } from "@/components/public/company-badge";
import { PdfToolbar } from "@/components/public/pdf-toolbar";
import { CURSIVE_FONT, parseDeliverables } from "@/components/public/shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contrat — Document imprimable",
  robots: { index: false, follow: false },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-zinc-200 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-900">
        {title}
      </h2>
      <div className="mt-2.5 space-y-2 text-[13.5px] leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

export default async function ContractPdfPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  const contract = await db.contract.findUnique({
    where: { publicId: contractId },
    include: {
      client: true,
      project: true,
      items: { orderBy: { position: "asc" } },
      signatures: { orderBy: { signedAt: "asc" } },
      user: { include: { companyProfile: true } },
    },
  });
  if (!contract) notFound();

  const company = contract.user.companyProfile;
  const businessName = company?.businessName ?? contract.user.name;
  const deliverables = parseDeliverables(contract.deliverables);
  const signature = contract.signatures[contract.signatures.length - 1] ?? null;

  const companyLines = [company?.address, company?.email, company?.phone].filter(Boolean) as string[];
  const objectText =
    contract.objectText ??
    contract.project.description ??
    "Le prestataire réalisera pour le client le projet décrit ci-dessous, conformément aux conditions du présent contrat.";
  const paymentTerms = contract.paymentTermsText ?? `${contract.depositPercent} % à la signature, le solde à la livraison.`;
  const cancellationText =
    contract.cancellationText ??
    "Chaque partie peut résilier le contrat avec un préavis écrit. Les prestations réalisées jusqu'alors restent dues au prorata du travail effectué.";

  return (
    <div className="min-h-screen bg-zinc-100 pb-10 pt-16 print:bg-white print:p-0 print:pt-0">
      <PdfToolbar backUrl={`/c/${contract.publicId}`} />

      <article className="print-page mx-auto max-w-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-10 print:shadow-none print:ring-0">
        {/* En-tête */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyBadge name={businessName} logoUrl={company?.logoUrl} className="h-11 w-11 rounded-xl" />
            <div>
              <p className="font-serif text-lg font-bold tracking-tight text-zinc-900">{businessName}</p>
              {companyLines.length > 0 && <p className="text-xs text-zinc-500">{companyLines.join(" · ")}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold uppercase tracking-[0.14em] text-zinc-900">
              Contrat de prestation de services
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Référence : <span className="font-mono text-zinc-700">{contract.reference}</span>
            </p>
            <p className="text-xs text-zinc-500">Date : {formatDate(contract.createdAt)}</p>
          </div>
        </header>

        <hr className="mt-6 border-zinc-200" />

        {/* Parties */}
        <Section title="Entre les soussignés">
          <p>
            <span className="font-semibold text-zinc-900">Le prestataire :</span> {businessName}
            {contract.user.name ? `, représenté par ${contract.user.name}` : ""}
            {companyLines.length > 0 && <span className="text-zinc-500"> — {companyLines.join(" · ")}</span>}
          </p>
          <p>
            <span className="font-semibold text-zinc-900">Le client :</span> {contract.client.firstName}{" "}
            {contract.client.lastName}
            {contract.client.company ? ` (${contract.client.company})` : ""} — {contract.client.email}
          </p>
          <p className="text-zinc-500">
            Ci-après dénommés « les Parties ». Le projet concerné : {contract.title}
            {contract.project.type ? ` (${PROJECT_TYPES[contract.project.type] ?? contract.project.type})` : ""}.
          </p>
        </Section>

        <Section title="Article 1 — Objet du contrat">
          <p>{objectText}</p>
        </Section>

        {deliverables.length > 0 && (
          <Section title="Article 2 — Livrables">
            <ul className="list-disc space-y-1 pl-5">
              {deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title={`Article ${deliverables.length > 0 ? 3 : 2} — Délais d'exécution`}>
          <p>
            {contract.project.startDate ? `Début du projet : ${formatDate(contract.project.startDate)}.` : "Début du projet : à convenir entre les Parties."}{" "}
            {contract.project.deliveryDate ? `Livraison prévue : ${formatDate(contract.project.deliveryDate)}.` : "Livraison : à convenir entre les Parties."}
          </p>
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 4 : 3} — Prix`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-zinc-300 text-left text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Désignation</th>
                  <th className="py-2 pr-3 text-center font-medium">Qté</th>
                  <th className="py-2 pr-3 text-right font-medium">Prix unitaire</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {contract.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-3 font-medium text-zinc-800">{item.name}</td>
                    <td className="py-2 pr-3 text-center text-zinc-600">{item.quantity}</td>
                    <td className="py-2 pr-3 text-right text-zinc-600">{formatAmount(item.unitPrice, contract.currency)}</td>
                    <td className="py-2 text-right font-medium text-zinc-800">
                      {formatAmount(item.quantity * item.unitPrice, contract.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200">
                  <td colSpan={3} className="py-1.5 pr-3 text-right text-zinc-500">
                    Sous-total
                  </td>
                  <td className="py-1.5 text-right text-zinc-700">{formatAmount(contract.subtotal, contract.currency)}</td>
                </tr>
                {contract.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="py-1.5 pr-3 text-right text-zinc-500">
                      Remise
                    </td>
                    <td className="py-1.5 text-right text-zinc-700">−{formatAmount(contract.discount, contract.currency)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="py-1.5 pr-3 text-right text-zinc-500">
                    {contract.taxRate > 0 ? `TVA (${contract.taxRate} %)` : "Taxes"}
                  </td>
                  <td className="py-1.5 text-right text-zinc-700">{formatAmount(contract.taxAmount, contract.currency)}</td>
                </tr>
                <tr className="border-t border-zinc-300">
                  <td colSpan={3} className="py-2 pr-3 text-right font-semibold text-zinc-900">
                    Total
                  </td>
                  <td className="py-2 text-right font-bold text-zinc-900">
                    {formatAmount(contract.totalAmount, contract.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1.5 pr-3 text-right text-zinc-500">
                    Dont acompte à la signature ({contract.depositPercent}&nbsp;%)
                  </td>
                  <td className="py-1.5 text-right font-semibold text-zinc-900">
                    {formatAmount(contract.depositAmount, contract.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1.5 pr-3 text-right text-zinc-500">
                    Solde à la livraison
                  </td>
                  <td className="py-1.5 text-right text-zinc-700">{formatAmount(contract.balanceAmount, contract.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 5 : 4} — Révisions`}>
          <p>
            Le projet comprend {contract.revisions} série{contract.revisions > 1 ? "s" : ""} de modifications.
          </p>
          {contract.signatureNote && <p className="text-zinc-500">{contract.signatureNote}</p>}
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 6 : 5} — Paiement`}>
          <p>{paymentTerms}</p>
          <p className="text-zinc-500">
            L&apos;acompte conditionne le démarrage du projet. Un reçu est délivré au client dès confirmation du paiement.
          </p>
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 7 : 6} — Propriété intellectuelle`}>
          <p>{IP_OWNERSHIP[contract.ipOwnership] ?? "Les conditions de cession des droits sont précisées entre les Parties."}</p>
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 8 : 7} — Maintenance`}>
          <p>{MAINTENANCE_TYPES[contract.maintenanceType] ?? "Maintenance à définir entre les Parties."}</p>
          {contract.maintenanceText && <p className="text-zinc-500">{contract.maintenanceText}</p>}
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 9 : 8} — Annulation`}>
          <p>{cancellationText}</p>
        </Section>

        <Section title={`Article ${deliverables.length > 0 ? 10 : 9} — Signatures`}>
          <p>Fait en deux exemplaires électroniques, dont un remis à chaque Partie.</p>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {/* Prestataire */}
            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Le prestataire</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">{contract.user.name || businessName}</p>
              <p className="text-xs text-zinc-500">{businessName}</p>
              <div className="mt-3 h-14 border-b border-dashed border-zinc-300" aria-hidden />
              <p className="mt-1.5 text-xs text-zinc-500">Fait le {formatDate(contract.createdAt)}</p>
              <p className="mt-1 text-[11px] italic text-zinc-400">Signature manuscrite ou électronique</p>
            </div>

            {/* Client */}
            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Le client</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                {contract.client.firstName} {contract.client.lastName}
              </p>
              {contract.client.company && <p className="text-xs text-zinc-500">{contract.client.company}</p>}
              <div className="mt-3 min-h-14">
                {signature ? (
                  signature.signatureType === "DRAWN" && signature.signatureData?.startsWith("data:image") ? (
                     
                    <img
                      src={signature.signatureData}
                      alt={`Signature de ${signature.signerName}`}
                      className="h-14 w-auto"
                    />
                  ) : (
                    <p className="text-2xl leading-tight text-zinc-900" style={{ fontFamily: CURSIVE_FONT }}>
                      {signature.signatureData ?? signature.signerName}
                    </p>
                  )
                ) : (
                  <div className="h-14 border-b border-dashed border-zinc-300" aria-hidden />
                )}
              </div>
              {signature ? (
                <>
                  <p className="mt-1.5 text-xs text-zinc-500">Signé le {formatDateTime(signature.signedAt)}</p>
                  <p className="text-[11px] text-zinc-400">
                    Identifiant de signature : <span className="font-mono">{signature.signatureId}</span>
                  </p>
                </>
              ) : (
                <p className="mt-1.5 text-[11px] italic text-zinc-400">En attente de signature du client.</p>
              )}
            </div>
          </div>
        </Section>

        {/* Pied de document */}
        <footer className="mt-8 border-t border-zinc-200 pt-4 text-center text-[11px] text-zinc-400">
          <p>
            DevSign — Contrat <span className="font-mono">{contract.reference}</span>
          </p>
          <p className="mt-0.5">Document généré électroniquement le {formatDateTime(new Date())}</p>
        </footer>
      </article>
    </div>
  );
}
