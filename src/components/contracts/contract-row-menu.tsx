"use client";

// ─── Menu "plus d'actions" d'une ligne de contrat ─────────────
// WhatsApp (partage prérempli), Rappel (contrats envoyés/ouverts), PDF.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellRing, FileDown, Loader2, MessageCircle, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ContractRowMenu({
  contractId,
  publicId,
  status,
  clientFirstName,
  projectTitle,
}: {
  contractId: string;
  publicId: string;
  status: string;
  clientFirstName: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sendingReminder, setSendingReminder] = useState(false);

  const canRemind = status === "SENT" || status === "VIEWED";

  function publicUrl(): string {
    return `${window.location.origin}/c/${publicId}`;
  }

  function shareWhatsApp() {
    const url = publicUrl();
    const message = `Bonjour ${clientFirstName}, je vous partage votre proposition et votre contrat pour le projet ${projectTitle}. Vous pouvez consulter les détails, signer électroniquement et régler l'acompte directement ici : ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  async function sendReminder() {
    setSendingReminder(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reminder" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Le rappel n'a pas pu être envoyé.");
        return;
      }
      toast.success(`Rappel envoyé à ${clientFirstName} 🔔`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setSendingReminder(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Plus d'actions" disabled={pending}>
          {pending || sendingReminder ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MoreHorizontal className="h-4 w-4" aria-hidden />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareWhatsApp}>
          <MessageCircle className="h-4 w-4" aria-hidden /> Partager sur WhatsApp
        </DropdownMenuItem>
        {canRemind && (
          <DropdownMenuItem onClick={sendReminder} disabled={sendingReminder}>
            <BellRing className="h-4 w-4" aria-hidden /> Envoyer un rappel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`/c/${publicId}/pdf`} target="_blank" rel="noopener noreferrer">
            <FileDown className="h-4 w-4" aria-hidden /> Télécharger le PDF
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
