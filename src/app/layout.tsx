import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "DevSign — Signez vos contrats et lancez vos projets plus rapidement",
    template: "%s — DevSign",
  },
  description:
    "Créez vos contrats, faites-les signer et recevez vos acomptes depuis un seul espace professionnel. Devis, contrat, signature électronique et paiement au même endroit.",
  keywords: ["contrat", "signature électronique", "freelance", "développeur", "devis", "acompte", "facture", "projet"],
  authors: [{ name: "DevSign" }],
  openGraph: {
    title: "DevSign — Signez vos contrats et lancez vos projets plus rapidement",
    description: "Devis, contrat, signature et acompte dans un seul espace professionnel. Un seul lien, du premier message à l'acompte payé.",
    url: "/",
    siteName: "DevSign",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSign — Contrats, signature & paiements pour développeurs",
    description: "Créez → Envoyez → Signez → Payez → Commencez. Un seul lien.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
