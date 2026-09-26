import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://devsign.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Espace client public indexé en noindex (déjà par page) et app protégée :
        disallow: ["/dashboard", "/admin", "/settings", "/api/", "/c/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
