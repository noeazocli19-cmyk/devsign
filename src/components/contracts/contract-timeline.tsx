// ─── Stepper du cycle de vie d'un contrat ────────────────────
// Créé → Envoyé → Ouvert → Signé → Payé → Lancé
// (composant présentationnel, utilisable depuis un Server Component)

import { Check } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ContractTimelineDates = {
  createdAt: Date | string | null;
  sentAt: Date | string | null;
  viewedAt: Date | string | null;
  signedAt: Date | string | null;
  paidAt: Date | string | null;
  launchedAt: Date | string | null;
};

export function ContractTimeline({ dates }: { dates: ContractTimelineDates }) {
  const steps = [
    { label: "Créé", date: dates.createdAt, done: Boolean(dates.createdAt) },
    { label: "Envoyé", date: dates.sentAt, done: Boolean(dates.sentAt) },
    { label: "Ouvert", date: dates.viewedAt, done: Boolean(dates.viewedAt) },
    { label: "Signé", date: dates.signedAt, done: Boolean(dates.signedAt) },
    { label: "Payé", date: dates.paidAt, done: Boolean(dates.paidAt) },
    { label: "Lancé", date: dates.launchedAt, done: Boolean(dates.launchedAt) },
  ];

  // L'étape actuelle = première non complétée (sinon toutes terminées)
  const currentIndex = steps.findIndex((s) => !s.done);
  const finished = currentIndex === -1;

  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const isDone = step.done;
        const isCurrent = !finished && i === currentIndex;
        const isFuture = !finished && i > currentIndex;

        return (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Rail de connexion */}
            {i < steps.length - 1 && (
              <span
                className={cn("absolute left-[9px] top-5 h-[calc(100%-1rem)] w-0.5", isDone ? "bg-emerald-400" : "bg-border")}
                aria-hidden
              />
            )}

            {/* Point d'étape */}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                isDone && "bg-emerald-500 text-white",
                isCurrent && "animate-pulse bg-emerald-100 ring-2 ring-emerald-500",
                isFuture && "border-2 border-border bg-muted"
              )}
              aria-hidden
            >
              {isDone && <Check className="h-3 w-3" />}
            </span>

            {/* Libellé + date */}
            <div className="min-w-0">
              <p className={cn("text-sm font-medium leading-5", isFuture ? "text-muted-foreground/70" : "text-foreground")}>
                {step.label}
                {isCurrent && <span className="ml-2 text-xs font-normal text-emerald-600">en attente</span>}
              </p>
              <p className={cn("text-xs", step.date ? "text-muted-foreground" : "text-muted-foreground/50")}>
                {step.date ? formatDateTime(step.date) : "—"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
