// ─── Document de contrat rendu dans l'espace client (sections numérotées) ──
// Server component — utilisé par /c/[contractId] dans la section "Contrat".

import type { ReactNode } from "react";
import { CheckCircle2, Clock, PenLine } from "lucide-react";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { IP_OWNERSHIP, MAINTENANCE_TYPES } from "@/lib/status";
import { CURSIVE_FONT, parseDeliverables, type PublicContract } from "@/components/public/shared";

function DocSection({ index, id, title, children }: { index: number; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40">
      <h3 className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-600">
          {index}
        </span>
        {title}
      </h3>
      <div className="mt-2.5 space-y-2 pl-[36px] text-[15px] leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

export function ContractDocument({ contract }: { contract: PublicContract }) {
  const { client, project, user } = contract;
  const companyProfile = user.companyProfile;
  const businessName = companyProfile?.businessName ?? user.name;
  const deliverables = parseDeliverables(contract.deliverables);

  const companyLines = [companyProfile?.address, companyProfile?.email, companyProfile?.phone].filter(Boolean) as string[];
  const startDate = project.startDate ? formatDate(project.startDate) : null;
  const deliveryDate = project.deliveryDate ? formatDate(project.deliveryDate) : null;
  const objectText =
    contract.objectText ??
    project.description ??
    "Le prestataire réalisera pour le client le projet décrit ci-dessus, conformément aux conditions du présent contrat.";
  const paymentTerms = contract.paymentTermsText ?? `${contract.depositPercent} % à la signature, le solde à la livraison.`;
  const cancellationText =
    contract.cancellationText ??
    "Chaque partie peut résilier le contrat avec un préavis écrit. Les prestations réalisées jusqu'alors restent dues au prorata du travail effectué.";

  return (
    <div className="space-y-7">
      <DocSection index={1} id="parties" title="Parties">
        <p>
          <span className="font-medium text-zinc-800">Le prestataire :</span> {businessName}
          {user.name ? `, représenté par ${user.name}` : ""}
          {companyLines.length > 0 && <span className="text-zinc-500"> — {companyLines.join(" · ")}</span>}
        </p>
        <p>
          <span className="font-medium text-zinc-800">Le client :</span> {client.firstName} {client.lastName}
          {client.company ? ` (${client.company})` : ""} — {client.email}
        </p>
      </DocSection>

      <DocSection index={2} id="objet" title="Objet du contrat">
        <p>{objectText}</p>
      </DocSection>

      {deliverables.length > 0 && (
        <DocSection index={3} id="livrables-contrat" title="Livrables">
          <ul className="space-y-1.5">
            {deliverables.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600" aria-hidden>
                  ✓
                </span>
                {d}
              </li>
            ))}
          </ul>
        </DocSection>
      )}

      <DocSection index={deliverables.length > 0 ? 4 : 3} id="delais" title="Délais d'exécution">
        <p>
          {startDate ? `Début du projet : ${startDate}.` : "Début du projet : à convenir entre les parties."}{" "}
          {deliveryDate ? `Livraison prévue : ${deliveryDate}.` : "Livraison : à convenir entre les parties."}
        </p>
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 5 : 4} id="prix" title="Prix et conditions financières">
        <p>
          Le montant total du projet s&apos;élève à{" "}
          <span className="font-semibold text-zinc-800">{formatAmount(contract.totalAmount, contract.currency)}</span> (sous-total{" "}
          {formatAmount(contract.subtotal, contract.currency)}
          {contract.discount > 0 ? `, remise de ${formatAmount(contract.discount, contract.currency)}` : ""}
          {contract.taxRate > 0
            ? `, TVA ${contract.taxRate} % incluse (${formatAmount(contract.taxAmount, contract.currency)})`
            : ", hors taxes"}
          ).
        </p>
        <p>
          Un acompte de{" "}
          <span className="font-semibold text-zinc-800">{formatAmount(contract.depositAmount, contract.currency)}</span> (
          {contract.depositPercent}&nbsp;%) est dû à la signature du présent contrat. Le solde de{" "}
          <span className="font-semibold text-zinc-800">{formatAmount(contract.balanceAmount, contract.currency)}</span> est payable à la
          livraison.
        </p>
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 6 : 5} id="revisions" title="Révisions">
        <p>
          Le projet comprend {contract.revisions} série{contract.revisions > 1 ? "s" : ""} de modifications
          {contract.revisions === 0 ? "." : contract.revisions > 1 ? " incluses dans le forfait." : " incluse dans le forfait."}
        </p>
        {contract.signatureNote && <p className="text-zinc-500">{contract.signatureNote}</p>}
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 7 : 6} id="paiement" title="Modalités de paiement">
        <p>{paymentTerms}</p>
        <p className="text-zinc-500">
          L&apos;acompte conditionne le démarrage du projet. Un reçu vous est délivré dès confirmation du paiement.
        </p>
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 8 : 7} id="propriete" title="Propriété intellectuelle">
        <p>{IP_OWNERSHIP[contract.ipOwnership] ?? "Les conditions de cession des droits sont précisées entre les parties."}</p>
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 9 : 8} id="maintenance" title="Maintenance">
        <p>{MAINTENANCE_TYPES[contract.maintenanceType] ?? "Maintenance à définir entre les parties."}</p>
        {contract.maintenanceText && <p className="text-zinc-500">{contract.maintenanceText}</p>}
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 10 : 9} id="annulation" title="Annulation">
        <p>{cancellationText}</p>
      </DocSection>

      <DocSection index={deliverables.length > 0 ? 11 : 10} id="signatures" title="Signatures">
        {contract.signatures.length > 0 ? (
          <ul className="space-y-3">
            {contract.signatures.map((s) => (
              <li key={s.id} className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800">
                    Signé par {s.signerName} le {formatDateTime(s.signedAt)}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">Identifiant {s.signatureId}</p>
                  {s.signatureType === "DRAWN" && s.signatureData?.startsWith("data:image") && (
                     
                    <img src={s.signatureData} alt={`Signature de ${s.signerName}`} className="mt-2 h-14 w-auto rounded-md border border-emerald-100 bg-white" />
                  )}
                  {s.signatureType === "TYPED" && s.signatureData && (
                    <p className="mt-1 text-2xl leading-tight text-zinc-800" style={{ fontFamily: CURSIVE_FONT }}>
                      {s.signatureData}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-zinc-500">
            <Clock className="h-4 w-4 text-zinc-400" aria-hidden />
            En attente de signature — aucun contrat signé pour le moment.
          </p>
        )}
        {contract.status !== "SIGNED" && contract.status !== "CANCELLED" && contract.status !== "EXPIRED" && (
          <p className="flex items-center gap-2 text-sm text-zinc-500">
            <PenLine className="h-4 w-4 text-emerald-600" aria-hidden />
            Utilisez le bouton « Signer le contrat » pour signer électroniquement ce document.
          </p>
        )}
      </DocSection>
    </div>
  );
}
