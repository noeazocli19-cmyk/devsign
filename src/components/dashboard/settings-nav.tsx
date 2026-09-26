"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Building2, CreditCard, Bell, ShieldCheck, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "profile", label: "Profil", icon: User },
  { segment: "company", label: "Entreprise", icon: Building2 },
  { segment: "billing", label: "Facturation", icon: CreditCard },
  { segment: "notifications", label: "Notifications", icon: Bell },
  { segment: "security", label: "Sécurité", icon: ShieldCheck },
  { segment: "integrations", label: "Intégrations", icon: Blocks },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1" aria-label="Sections des paramètres">
      {TABS.map((tab) => {
        const active = pathname.endsWith(`/${tab.segment}`);
        return (
          <Link
            key={tab.segment}
            href={`/settings/${tab.segment}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-emerald-50 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
