import { requireUser } from "@/lib/session";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata = { title: "Bienvenue" };

export default async function OnboardingPage() {
  const user = await requireUser();
  return (
    <main className="flex min-h-screen flex-col justify-center bg-zinc-50/50">
      <OnboardingFlow userName={user.name} />
    </main>
  );
}
