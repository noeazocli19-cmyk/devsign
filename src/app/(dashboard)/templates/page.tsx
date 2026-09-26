import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  FileText,
  Globe,
  LayoutTemplate,
  Palette,
  PenLine,
  ShoppingCart,
  Smartphone,
  Wrench,
} from "lucide-react";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Modèles de contrats — DevSign" };

const TYPE_ICONS: Record<string, typeof FileText> = {
  SITE_VITRINE: Globe,
  ECOMMERCE: ShoppingCart,
  WEB_APP: Cloud,
  MOBILE_APP: Smartphone,
  SAAS: Cloud,
  MAINTENANCE: Wrench,
  DESIGN: Palette,
  OTHER: FileText,
};

function parseDeliverables(raw: string | null): string[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === "string") : [];
  } catch {
    return [];
  }
}

export default async function TemplatesPage() {
  await requireUser();

  const templates = await db.contractTemplate.findMany({
    where: { isSystem: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Modèles de contrats"
        description="Des contrats prêts à l'emploi, rédigés par des pros — préremplis en un clic dans le wizard."
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Aucun modèle disponible"
          description="Les modèles système DevSign apparaîtront ici pour démarrer vos contrats plus vite."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const Icon = TYPE_ICONS[template.type] ?? FileText;
            const deliverables = parseDeliverables(template.deliverables);
            return (
              <article
                key={template.id}
                className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                    <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
                  </span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50">
                    Modèle DevSign
                  </Badge>
                </div>

                <h2 className="mt-4 font-semibold">{template.name}</h2>
                {template.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>}

                <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5" aria-hidden />
                    <dt>
                      {deliverables.length} livrable{deliverables.length > 1 ? "s" : ""} · {template.revisions} révision{template.revisions > 1 ? "s" : ""}
                    </dt>
                  </div>
                  <div>
                    Utilisé {template.usageCount} fois
                  </div>
                </dl>

                <Button asChild variant="outline" className="mt-5 w-full sm:mt-auto">
                  <Link href={`/projects/new?template=${template.id}`}>
                    Utiliser ce modèle
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
