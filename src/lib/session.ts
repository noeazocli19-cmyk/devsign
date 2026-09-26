import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, type SessionUser } from "@/lib/auth";

/** Récupère l'utilisateur courant (ou null) côté serveur. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/** Protège une page serveur : redirige vers /login si non connecté. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Protège une page admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
