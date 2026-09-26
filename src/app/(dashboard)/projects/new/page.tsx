import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ProjectWizard, type WizardTemplate } from "@/components/projects/project-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Nouveau projet — DevSign" };

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await requireUser();
  const { template: templateId } = await searchParams;

  const [clients, template] = await Promise.all([
    db.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, email: true, company: true },
    }),
    templateId
      ? db.contractTemplate.findFirst({
          where: { id: templateId, OR: [{ isSystem: true }, { userId: user.id }] },
        })
      : Promise.resolve(null),
  ]);

  let defaults: WizardTemplate | null = null;
  if (template) {
    let deliverables: string[] = [];
    try {
      deliverables = JSON.parse(template.deliverables ?? "[]");
      if (!Array.isArray(deliverables)) deliverables = [];
    } catch {
      deliverables = [];
    }
    defaults = {
      name: template.name,
      objectText: template.objectText ?? null,
      deliverables,
      paymentTermsText: template.paymentTermsText ?? null,
      revisions: template.revisions,
      ipOwnership: template.ipOwnership,
      maintenanceType: template.maintenanceType,
      cancellationText: template.cancellationText ?? null,
    };
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader title="Nouveau projet" description="Configurez le client, le projet, le devis et le contrat en quelques minutes." />
      <ProjectWizard clients={clients} template={defaults} templateName={template?.name ?? null} />
    </div>
  );
}
