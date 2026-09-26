"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Wallet,
  LayoutTemplate,
  FolderOpen,
  BarChart3,
  Settings,
  Bell,
  ShieldCheck,
  User,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV_MAIN = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projets", href: "/projects", icon: FolderKanban },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Contrats", href: "/contracts", icon: FileText },
  { label: "Paiements", href: "/payments", icon: Wallet },
  { label: "Modèles", href: "/templates", icon: LayoutTemplate },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Paramètres", href: "/settings/profile", icon: Settings },
];

export type ShellUser = {
  name: string;
  email: string;
  role: string;
  plan: string;
  image?: string | null;
  businessName?: string | null;
  unreadNotifications: number;
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 px-3" aria-label="Navigation du dashboard">
      {NAV_MAIN.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-emerald-50 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await authClient.signOut();
    toast.success("À bientôt !");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b px-5">
        <Logo href="/dashboard" />
      </div>
      <div className="flex flex-1 flex-col py-4 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="space-y-0.5 border-t px-3 py-3">
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin") ? "bg-emerald-50 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ShieldCheck className="h-5 w-5" /> Admin
          </Link>
        )}
        <Link href="/settings/profile" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <User className="h-5 w-5" /> Mon profil
        </Link>
        <Link href="/notifications" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" /> Notifications
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-5 w-5" /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await authClient.signOut();
    toast.success("À bientôt !");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-50/60">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r lg:block">
        <SidebarContent user={user} />
      </aside>

      {/* Zone principale */}
      <div className="flex min-h-screen w-full flex-col lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {/* Menu mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden" aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              {user.businessName ?? "Mon espace"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationsBell initialUnread={user.unreadNotifications} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-10 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-accent" aria-label="Menu du compte">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.image ? (
                       
                      <img src={user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(user.name)
                    )}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-[11px] font-medium text-primary">Plan {user.plan}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile"><User className="mr-2 h-4 w-4" /> Mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/company"><Settings className="mr-2 h-4 w-4" /> Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/#faq"><HelpCircle className="mr-2 h-4 w-4" /> Aide</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
