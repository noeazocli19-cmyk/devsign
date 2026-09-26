"use client";

// ─── Barre d'actions du document PDF (masquée à l'impression) ──

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PdfToolbar({ backUrl }: { backUrl: string }) {
  return (
    <div className="no-print fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-zinc-900 text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour à l&apos;espace client
        </Link>
        <Button
          size="sm"
          className="h-9 bg-white font-medium text-zinc-900 hover:bg-zinc-200"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4" aria-hidden />
          Télécharger en PDF
        </Button>
      </div>
    </div>
  );
}
