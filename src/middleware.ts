import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/clients",
  "/contracts",
  "/payments",
  "/templates",
  "/documents",
  "/analytics",
  "/notifications",
  "/settings",
  "/admin",
  "/onboarding",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("better-auth.session_token");

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/clients/:path*",
    "/contracts/:path*",
    "/payments/:path*",
    "/templates/:path*",
    "/documents/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
};
