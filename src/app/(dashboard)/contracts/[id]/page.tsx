import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Eye,
  FileEdit,
  FileText,
  History,
  Rocket,
  Send,
  Wallet,
  XCircle,
} from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatAmount, formatDateTime, timeAgo } from "@/lib/format";
import { ACTIVITY_LABELS, IP_OWNERSHIP, MAINTENANCE_TYPES, PROJECT_TYPES } from "@/lib/status";
import { StatusBadge } from "@/components/shared/status-badge";
import { ContractActions } from "@/components/contracts/contract-actions";
import { ContractTimeline } from "@/components/contracts/contract-timeline";
import { ContractEditor } from "@/components/contracts/contract-editor";
import { cn } from "@/lib/utils";

export const metadata = { title: "Détail du contrat — DevSign" };

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  CREATED: FileEdit,
  SENT: Send,
  VIEWED: Eye,
  SIGNED: CheckCircle2,
  PAID: Wallet,
  REMINDER: BellRing,
  PROJECT_STARTED: Rocket,
  CANCELLED: XCircle,
};

const REMINDER_LABELS: Record<string, string> = {
  AFTER_24H: "Relance automatique — 24 h",
  AFTER_3D: "Relance automatique — 3 jours",
  AFTER_7D: "Relance automatique — 7 jours",
  MANUAL: "Relance manuelle",
};

const REMINDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Programmée", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  SENT: { label: "Envoyée", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  CANCELLED: { label: "Annulée", className: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200" },
};

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [contract, company] = await Promise.all([
    db.contract.findFirst({
      where: { id, userId: user.id },
      include: {
        client: true,
        project: true,
        items: { orderBy: { position: "asc" } },
        signatures: true,
        payments: true,
        reminders: { orderBy: { scheduledAt: "asc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    }),
    db.companyProfile.findUnique({ where: { userId: user.id } }),
  ]);

  // Vérification de propriété → 404 si introuvable ou non autorisé
  if (!contract) notFound();

  let deliverables: string[] = [];
  try {
    const parsed = JSON.parse(contract.deliverables ?? "[]");
    if (Array.isArray(parsed)) deliverables = parsed.filter((d): d is string => typeof d === "string");
  } catch {
    deliverables = [];
  }

  const signature = contract.signatures[0] ?? null;
  const providerName = company?.businessName ?? user.name;
  const clientName = `${contract.client.firstName} ${contract.client.lastName}`;
  const launchedAt =
    contract.project.status === "IN_PROGRESS" || contract.project.status === "COMPLETED" ? contract.paidAt : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* ── En-tête ── */}
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-medium text-muted-foreground">{contract.reference}</span>
              <StatusBadge status={contract.status} kind="contract" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{contract.title}</h1>
            <p className="text-sm text-muted-foreground">
              Pour{" "}
              <span className="font-medium text-foreground">
                {clientName}
                {contract.client.company ? ` · ${contract.client.company}` : ""}
              </span>{" "}
              · Projet{" "}
              <Link href="/projects" className="font-medium text-primary hover:underline">
                {contract.project.name}
              </Link>{" "}
              <span className="text-muted-foreground/70">({PROJECT_TYPES[contract.project.type] ?? contract.project.type})</span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="lg:text-right">
              <p className="text-xs text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold tabular-nums text-primary sm:text-3xl">{formatAmount(contract.totalAmount, contract.currency)}</p>
              <p className="text-xs text-muted-foreground">
                Acompte {formatAmount(contract.depositAmount, contract.currency)} · Solde {formatAmount(contract.balanceAmount, contract.currency)}
              </p>
            </div>
            <ContractActions
              contractId={contract.id}
              status={contract.status}
              publicId={contract.publicId}
              clientFirstName={contract.client.firstName}
              projectTitle={contract.title}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Colonne principale ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Aperçu du contrat */}
          <article className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Aperçu du contrat</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Document envoyé à votre client — ce qu'il verra sur son espace sécurisé.
            </p>

            <div className="mt-5 space-y-5 rounded-xl border bg-background p-4 sm:p-5">
              {/* Parties */}
              <DocSection title="Parties">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Le prestataire</p>
                    <p className="font-medium">{providerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Le client</p>
                    <p className="font-medium">
                      {clientName}
                      {contract.client.company ? ` — ${contract.client.company}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{contract.client.email}</p>
                  </div>
                </div>
              </DocSection>

              {contract.objectText && (
                <DocSection title="Objet">
                  <p>{contract.objectText}</p>
                </DocSection>
              )}

              <DocSection title="Livrables">
                {deliverables.length > 0 ? (
                  <ul className="space-y-1.5">
                    {deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </DocSection>

              <DocSection title="Délais">
                <p>
                  {contract.project.startDate ? `Démarrage prévu le ${formatDateTime(contract.project.startDate).split(" à ")[0]}` : "Date de début à convenir"}
                  {contract.project.deliveryDate ? ` · Livraison prévue le ${formatDateTime(contract.project.deliveryDate).split(" à ")[0]}` : ""}
                </p>
              </DocSection>

              {/* Prix */}
              <DocSection title="Prix">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-2 font-medium">Prestation</th>
                        <th className="py-2 pr-2 text-right font-medium">Qté</th>
                        <th className="py-2 pr-2 text-right font-medium">Prix unitaire</th>
                        <th className="py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 pr-2">{item.name}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{item.quantity}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{formatAmount(item.unitPrice, contract.currency)}</td>
                          <td className="py-2 text-right font-medium tabular-nums">{formatAmount(item.quantity * item.unitPrice, contract.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="text-sm">
                      <tr>
                        <td colSpan={3} className="pt-2 text-right text-muted-foreground">Sous-total</td>
                        <td className="pt-2 text-right tabular-nums">{formatAmount(contract.subtotal, contract.currency)}</td>
                      </tr>
                      {contract.discount > 0 && (
                        <tr>
                          <td colSpan={3} className="text-right text-muted-foreground">Remise</td>
                          <td className="text-right tabular-nums text-destructive">− {formatAmount(contract.discount, contract.currency)}</td>
                        </tr>
                      )}
                      {contract.taxRate > 0 && (
                        <tr>
                          <td colSpan={3} className="text-right text-muted-foreground">Taxes ({contract.taxRate} %)</td>
                          <td className="text-right tabular-nums">{formatAmount(contract.taxAmount, contract.currency)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="pt-2 text-right font-semibold">TOTAL</td>
                        <td className="pt-2 text-right text-base font-bold tabular-nums text-primary">{formatAmount(contract.totalAmount, contract.currency)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="pt-1.5 text-right font-semibold">Acompte à la signature ({contract.depositPercent} %)</td>
                        <td className="pt-1.5 text-right font-bold tabular-nums">{formatAmount(contract.depositAmount, contract.currency)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right font-semibold">Solde</td>
                        <td className="text-right font-bold tabular-nums">{formatAmount(contract.balanceAmount, contract.currency)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </DocSection>

              <DocSection title="Révisions">
                <p>{contract.signatureNote ?? `Le projet comprend ${contract.revisions} série(s) de modifications.`}</p>
              </DocSection>

              {contract.paymentTermsText && (
                <DocSection title="Paiement">
                  <p>{contract.paymentTermsText}</p>
                </DocSection>
              )}

              <DocSection title="Propriété intellectuelle">
                <p>{IP_OWNERSHIP[contract.ipOwnership] ?? contract.ipOwnership}</p>
              </DocSection>

              <DocSection title="Maintenance">
                <p>
                  {MAINTENANCE_TYPES[contract.maintenanceType] ?? contract.maintenanceType}
                  {contract.maintenanceText ? ` — ${contract.maintenanceText}` : ""}
                </p>
              </DocSection>

              {contract.cancellationText && (
                <DocSection title="Annulation">
                  <p>{contract.cancellationText}</p>
                </DocSection>
              )}

              {/* Signatures */}
              <DocSection title="Signatures">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-dashed p-4">
                    <p className="text-xs text-muted-foreground">Le prestataire</p>
                    <p className="mt-2 font-medium">{providerName}</p>
                    <p className="mt-6 border-t pt-2 text-xs text-muted-foreground">Bon pour accord</p>
                  </div>
                  <div className={cn("rounded-xl border border-dashed p-4", signature && "border-emerald-300 bg-emerald-50/40")}>
                    <p className="text-xs text-muted-foreground">Le client</p>
                    {signature ? (
                      <>
                        <p className="mt-2 font-medium">{signature.signerName}</p>
                        <p className="mt-1 text-xs text-emerald-700">Signé électroniquement le {formatDateTime(signature.signedAt)}</p>
                        <p className="mt-3 border-t pt-2 font-mono text-[10px] text-muted-foreground">ID de vérification : {signature.signatureId}</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">En attente de signature</p>
                    )}
                  </div>
                </div>
              </DocSection>
            </div>
          </article>

          {/* Éditeur (brouillon uniquement) */}
          {contract.status === "DRAFT" && (
            <ContractEditor
              contract={{
                id: contract.id,
                title: contract.title,
                objectText: contract.objectText ?? "",
                deliverables,
                revisions: contract.revisions,
                paymentTermsText: contract.paymentTermsText ?? "",
                ipOwnership: contract.ipOwnership,
                maintenanceType: contract.maintenanceType,
                maintenanceText: contract.maintenanceText ?? "",
                cancellationText: contract.cancellationText ?? "",
                taxRate: contract.taxRate,
                discount: contract.discount,
                depositPercent: contract.depositPercent,
                currency: contract.currency,
                items: contract.items.map((it) => ({ name: it.name, quantity: it.quantity, unitPrice: it.unitPrice })),
              }}
            />
          )}

          {/* Activités récentes */}
          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <History className="h-4 w-4 text-muted-foreground" aria-hidden /> Activités récentes
            </h2>
            {contract.activities.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aucune activité pour le moment.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {contract.activities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                  return (
                    <li key={activity.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm leading-5">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {ACTIVITY_LABELS[activity.type] ?? activity.type} · {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ── Colonne latérale ── */}
        <div className="space-y-6">
          {/* Cycle de vie */}
          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Cycle de vie</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">De la création au lancement du projet.</p>
            <div className="mt-5">
              <ContractTimeline
                dates={{
                  createdAt: contract.createdAt,
                  sentAt: contract.sentAt,
                  viewedAt: contract.viewedAt,
                  signedAt: contract.signedAt,
                  paidAt: contract.paidAt,
                  launchedAt,
                }}
              />
            </div>
          </section>

          {/* Relances */}
          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <BellRing className="h-4 w-4 text-muted-foreground" aria-hidden /> Relances
            </h2>
            {contract.reminders.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Les relances seront programmées automatiquement à l'envoi du contrat (24 h, 3 j, 7 j).
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {contract.reminders.map((reminder) => {
                  const conf = REMINDER_STATUS[reminder.status] ?? REMINDER_STATUS.PENDING;
                  return (
                    <li key={reminder.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-5">{REMINDER_LABELS[reminder.type] ?? reminder.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.sentAt ? `Envoyée ${timeAgo(reminder.sentAt)}` : `Prévue le ${formatDateTime(reminder.scheduledAt)}`}
                        </p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", conf.className)}>{conf.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
