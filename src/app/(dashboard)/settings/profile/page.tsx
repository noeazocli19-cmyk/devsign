import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ProfileSettings } from "@/components/dashboard/profile-settings";

export const metadata = { title: "Paramètres — Profil" };

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const company = await db.companyProfile.findUnique({ where: { userId: user.id } });

  return (
    <ProfileSettings
      user={{ name: user.name, email: user.email, image: user.image, profession: user.profession }}
      phone={company?.phone ?? null}
      businessName={company?.businessName ?? null}
      logoUrl={company?.logoUrl ?? null}
    />
  );
}
