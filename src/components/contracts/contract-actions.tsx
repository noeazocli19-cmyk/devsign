"use client";

// ─── Actions de l'en-tête d'un contrat — selon son statut ────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Ban,
  BellRing,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Loader2,
  MessageCircle,
  PencilLine,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyContractLinkButton } from "@/components/contracts/copy-link-button";

export function ContractActions({
  contractId,
  status,
  publicId,
  clientFirstName,
  projectTitle,
}: {
  contractId: string;
  status: string;
  publicId: string;
  clientFirstName: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState<"send" | "cancel" | "reminder" | null>(null);

  function publicUrl(): string {
    return `${window.location.origin}/c/${publicId}`;
  }

  function scrollToEditor() {
    document.getElementById("contract-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function shareWhatsApp() {
    const message = `Bonjour ${clientFirstName}, je vous partage votre proposition et votre contrat pour le projet ${projectTitle}. Vous pouvez consulter les détails, signer électroniquement et régler l'acompte directement ici : ${publicUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  async function performAction(action: "send" | "cancel" | "reminder", successMessage: string) {
    setBusy(action);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "L'action n'a pas pu être effectuée.");
        return;
      }
      toast.success(successMessage);
      setSendOpen(false);
      setCancelOpen(false);
      router.refresh();
    } catch {
      toast.error("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setBusy(null);
    }
  }

  const busyIcon = (key: "send" | "cancel" | "reminder") =>
    busy === key ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ── Brouillon ── */}
      {status === "DRAFT" && (
        <>
          <Button onClick={() => setSendOpen(true)} disabled={busy !== null}>
            {busyIcon("send") ?? <Send className="h-4 w-4" aria-hidden />} Envoyer le contrat
          </Button>
          <Button variant="outline" onClick={scrollToEditor}>
            <PencilLine className="h-4 w-4" aria-hidden /> Modifier
          </Button>
          <CopyContractLinkButton publicId={publicId} tooltip="Le lien s'activera à l'envoi" />
        </>
      )}

      {/* ── Envoyé / Ouvert ── */}
      {(status === "SENT" || status === "VIEWED") && (
        <>
          <CopyContractLinkButton publicId={publicId} tooltip="Copier le lien client" />
          <Button variant="outline" onClick={shareWhatsApp}>
            <MessageCircle className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          <Button variant="outline" onClick={() => performAction("reminder", `Rappel envoyé à ${clientFirstName} 🔔`)} disabled={busy !== null}>
            {busyIcon("reminder") ?? <BellRing className="h-4 w-4" aria-hidden />} Rappel
          </Button>
          <Button variant="outline" asChild>
            <a href={`/c/${publicId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Espace client</span>
              <span className="sr-only sm:hidden">Espace client</span>
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/c/${publicId}/pdf`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">PDF</span>
              <span className="sr-only sm:hidden">PDF</span>
            </a>
          </Button>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setCancelOpen(true)} disabled={busy !== null}>
            <Ban className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Annuler</span>
          </Button>
        </>
      )}

      {/* ── Signé ── */}
      {status === "SIGNED" && (
        <>
          <CopyContractLinkButton publicId={publicId} tooltip="Copier le lien client" />
          <Button variant="outline" asChild>
            <a href={`/c/${publicId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Espace client</span>
              <span className="sr-only sm:hidden">Espace client</span>
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/c/${publicId}/pdf`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">PDF</span>
              <span className="sr-only sm:hidden">PDF</span>
            </a>
          </Button>
        </>
      )}

      {/* ── Expiré / Annulé ── */}
      {(status === "EXPIRED" || status === "CANCELLED") && (
        <>
          <CopyContractLinkButton publicId={publicId} tooltip="Copier le lien client" />
          <Button variant="outline" asChild>
            <a href={`/c/${publicId}/pdf`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">PDF</span>
              <span className="sr-only sm:hidden">PDF</span>
            </a>
          </Button>
        </>
      )}

      {/* ── Dialog : envoi ── */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer le contrat à {clientFirstName} ?</DialogTitle>
            <DialogDescription>
              {clientFirstName} recevra un email avec un lien sécurisé pour consulter la proposition, signer électroniquement et régler l'acompte. Des relances automatiques seront programmées (24 h, 3 j, 7 j).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSendOpen(false)} disabled={busy !== null}>
              Retour
            </Button>
            <Button onClick={() => performAction("send", `Contrat envoyé à ${clientFirstName} ✉️`)} disabled={busy !== null}>
              {busyIcon("send") ?? <Send className="h-4 w-4" aria-hidden />} Envoyer maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : annulation ── */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler ce contrat ?</DialogTitle>
            <DialogDescription>
              Le contrat « {projectTitle} » passera en annulé et votre client ne pourra plus y accéder. Cette action est définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={busy !== null}>
              Retour
            </Button>
            <Button variant="destructive" onClick={() => performAction("cancel", "Contrat annulé.")} disabled={busy !== null}>
              {busyIcon("cancel") ?? <Ban className="h-4 w-4" aria-hidden />} Annuler le contrat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
