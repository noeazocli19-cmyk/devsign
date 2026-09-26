import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Gardien d'onboarding : tout utilisateur non onboardé passe par l'onboarding.
  if (!user.onboardingCompleted) {
    // Les admins système onboardés par le seed passent ; les nouveaux non.
    if (user.email !== "admin@devsign.app") {
      const { redirect } = await import("next/navigation");
      redirect("/onboarding");
    }
  }

  const [company, unreadNotifications] = await Promise.all([
    db.companyProfile.findUnique({ where: { userId: user.id } }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        image: user.image,
        businessName: company?.businessName ?? null,
        unreadNotifications,
      }}
    >
      {children}
    </DashboardShell>
  );
}
