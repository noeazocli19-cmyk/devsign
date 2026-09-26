import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

/** Log une erreur en base (ErrorLog) sans interrompre le flux. */
export async function logError(source: string, message: string, details?: unknown) {
  try {
    await db.errorLog.create({
      data: {
        source,
        message: message.slice(0, 500),
        details: details ? (typeof details === "string" ? details.slice(0, 2000) : JSON.stringify(details).slice(0, 2000)) : null,
      },
    });
  } catch {
    console.error(`[${source}] ${message}`);
  }
}

/** Convertit une exception en réponse API propre — jamais d'erreur technique brute. */
export async function handleApiError(e: unknown, source: string) {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return fail(first?.message ?? "Données invalides.", 422);
  }
  console.error(`[${source}]`, e);
  await logError(source, e instanceof Error ? e.message : "Erreur inconnue", e instanceof Error ? e.stack : undefined);
  return fail("Une erreur est survenue. Merci de réessayer dans un instant.", 500);
}

/** Authentification pour les routes API — null si non connecté. */
export async function requireApiUser(): Promise<SessionUser | null> {
  return await getSessionUser();
}

/** Parse et valide le body JSON d'une requête (union discriminée : soit data, soit error). */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: fail("Corps de requête invalide.", 400) };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const first = result.error.issues[0];
    return { error: fail(first?.message ?? "Données invalides.", 422) };
  }
  return { data: result.data };
}
