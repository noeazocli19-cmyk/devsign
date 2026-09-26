import { SettingsNav } from "@/components/dashboard/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez votre profil, votre entreprise et vos préférences.</p>
      </div>

      <SettingsNav />

      <div className="mt-6">{children}</div>
    </div>
  );
}
