import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { CompanySettings } from "@/components/dashboard/company-settings";

export const metadata = { title: "Paramètres — Entreprise" };

const DEFAULTS = {
  businessName: null,
  logoUrl: null,
  description: null,
  email: null,
  phone: null,
  address: null,
  country: "Sénégal",
  currency: "XOF",
  brandColor: "#059669",
  footerText: null,
  welcomeMessage: null,
};

export default async function CompanySettingsPage() {
  const user = await requireUser();
  const company = (await db.companyProfile.findUnique({ where: { userId: user.id } })) ?? DEFAULTS;

  return <CompanySettings initial={company} />;
}
