import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  FileText,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton, TestRemindersButton } from "@/components/dashboard/notifications-actions";
import { timeAgo } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NOTIFICATION_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  SUCCESS: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  PAYMENT: { icon: Wallet, className: "bg-emerald-50 text-emerald-600" },
  CONTRACT: { icon: FileText, className: "bg-sky-50 text-sky-600" },
  WARNING: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
  INFO: { icon: Bell, className: "bg-zinc-100 text-zinc-600" },
};

export default async function NotificationsPage() {
  const user = await requireUser();

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
            : "Vous êtes à jour."
        }
        actions={
          <>
            <TestRemindersButton />
            <MarkAllReadButton disabled={unreadCount === 0} />
          </>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Aucune notification"
          description="Les évènements de vos contrats (envoi, signature, paiements, rappels) apparaîtront ici."
          className="border-solid"
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card" aria-label="Liste des notifications">
          {notifications.map((n) => {
            const conf = NOTIFICATION_ICONS[n.type] ?? NOTIFICATION_ICONS.INFO;
            const Icon = conf.icon;
            const rowClass = cn(
              "flex items-start gap-3 px-5 py-4 transition-colors",
              n.link && "hover:bg-accent/50",
            );
            const content = (
              <>
                <span
                  className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", conf.className)}
                  aria-hidden
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn("text-sm leading-snug", !n.read && "font-semibold")}>{n.title}</p>
                    <span className="mt-0.5 flex shrink-0 items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Non lue" />}
                      <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    </span>
                  </div>
                  {n.message && <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>}
                  {n.link && <span className="mt-1.5 inline-block text-xs font-medium text-primary">Consulter →</span>}
                </div>
              </>
            );

            return (
              <li key={n.id} className={cn(!n.read && "bg-emerald-50/50")}>
                {n.link ? (
                  <Link href={n.link} className={rowClass}>
                    {content}
                  </Link>
                ) : (
                  <div className={rowClass}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
