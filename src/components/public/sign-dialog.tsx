"use client";

// ─── Dialog de signature — cœur de la conversion ─────────────
// Onglets Dessiner (canvas tactile) / Taper (nom en cursive),
// checkbox d'acceptation, animation de réussite framer-motion.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Eraser, Keyboard, Loader2, PenLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayButton } from "@/components/public/pay-button";
import { CURSIVE_FONT } from "@/components/public/shared";
import { cn } from "@/lib/utils";

type SignDialogProps = {
  publicId: string;
  contractTitle: string;
  reference: string;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function SignDialog({ publicId, contractTitle, reference, triggerClassName, triggerLabel = "Signer le contrat" }: SignDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [signerName, setSignerName] = useState("");
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [drawnData, setDrawnData] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureId, setSignatureId] = useState<string | null>(null);

  const nameValid = signerName.trim().length >= 3;
  const signatureValid = mode === "type" || drawnData !== null;
  const canSubmit = nameValid && signatureValid && accepted && !loading;

  function resetForm() {
    setPhase("form");
    setSignerName("");
    setMode("draw");
    setDrawnData(null);
    setAccepted(false);
    setLoading(false);
    setError(null);
    setSignatureId(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) window.setTimeout(resetForm, 250);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/contracts/${publicId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signatureType: mode === "draw" ? "DRAWN" : "TYPED",
          signatureData: mode === "draw" ? drawnData : signerName.trim(),
          accepted: true,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { success: boolean; data?: { signatureId?: string }; error?: string }
        | null;

      if (!res.ok || !json?.success) {
        setError(
          json?.error ??
            (res.status === 409 || res.status === 400
              ? "Ce contrat ne peut plus être signé."
              : "Une erreur est survenue. Merci de réessayer dans un instant."),
        );
        setLoading(false);
        return;
      }
      setSignatureId(json.data?.signatureId ?? null);
      setLoading(false);
      setPhase("success");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className={cn("h-12 w-full text-base font-semibold", triggerClassName)}>
          <PenLine className="h-5 w-5" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={phase === "form"}
        className="flex h-dvh w-full max-w-none flex-col gap-0 overflow-y-auto rounded-none border-0 p-0 sm:h-auto sm:max-w-md sm:rounded-2xl sm:p-0"
      >
        {phase === "form" ? (
          <>
            <DialogHeader className="gap-1.5 border-b border-zinc-100 bg-zinc-50/70 px-5 py-4 text-left sm:px-6 sm:py-5">
              <DialogTitle className="text-lg">Signer le contrat</DialogTitle>
              <DialogDescription className="truncate">
                {contractTitle} · <span className="font-mono text-xs">{reference}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-5 px-5 py-5 sm:px-6">
              <p className="text-sm leading-relaxed text-zinc-600">
                Je reconnais avoir lu et accepté les conditions du présent contrat.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="signer-name">Nom complet</Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Ex. Marie Sow"
                  autoComplete="name"
                  className="h-11"
                />
                {signerName.length > 0 && !nameValid && (
                  <p className="text-xs text-red-600">Veuillez saisir votre nom complet (3 caractères minimum).</p>
                )}
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v === "type" ? "type" : "draw")}>
                <TabsList className="grid h-10 w-full grid-cols-2">
                  <TabsTrigger value="draw" className="gap-1.5">
                    <PenLine className="h-4 w-4" /> Dessiner
                  </TabsTrigger>
                  <TabsTrigger value="type" className="gap-1.5">
                    <Keyboard className="h-4 w-4" /> Taper
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="draw" className="mt-3">
                  <SignatureCanvas onChange={setDrawnData} />
                </TabsContent>

                <TabsContent value="type" className="mt-3">
                  <div className="flex min-h-36 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white p-6 text-center">
                    {signerName.trim() ? (
                      <span className="text-3xl leading-snug text-zinc-900" style={{ fontFamily: CURSIVE_FONT }}>
                        {signerName.trim()}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">
                        Saisissez votre nom ci-dessus : il apparaîtra ici comme signature.
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Votre nom sera converti en signature électronique horodatée.
                  </p>
                </TabsContent>
              </Tabs>

              <label
                htmlFor="accept-conditions"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5"
              >
                <Checkbox
                  id="accept-conditions"
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug text-zinc-700">
                  J&apos;accepte les conditions du contrat et je certifie l&apos;exactitude des informations fournies.
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <div className="space-y-2.5">
                <Button className="h-12 w-full text-base font-semibold" disabled={!canSubmit} onClick={handleSubmit}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      Signature en cours…
                    </>
                  ) : (
                    <>
                      <PenLine className="h-5 w-5" aria-hidden />
                      Signer le contrat
                    </>
                  )}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  Signature électronique horodatée et traçable
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center sm:py-12">
            <SignatureSuccessAnimation />
            <div className="space-y-1.5">
              <h2 className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
                <Check className="h-5 w-5 text-emerald-600" aria-hidden />
                Contrat signé
              </h2>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-500">
                Votre acompte peut maintenant être réglé. Le projet sera lancé dès sa confirmation.
              </p>
              {signatureId && (
                <p className="pt-1 font-mono text-xs text-zinc-400">Identifiant de signature : {signatureId}</p>
              )}
            </div>
            <div className="w-full max-w-xs space-y-2.5">
              <PayButton publicId={publicId} className="w-full">
                Payer l&apos;acompte
              </PayButton>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => {
                  handleOpenChange(false);
                  router.refresh();
                }}
              >
                Retour à l&apos;espace client
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Canvas de signature dessinée (pointer events, tactile) ──

function SignatureCanvas({ onChange }: { onChange: (data: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const paintBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    paintBackground();
  }, [paintBackground]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const point = getPoint(e);
    const last = lastPointRef.current ?? point;
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasInk) setHasInk(true);
  }

  function handlePointerEnd() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    paintBackground();
    setHasInk(false);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="h-36 w-full touch-none rounded-lg border-2 border-dashed border-zinc-300 bg-white sm:h-40"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
            Dessinez votre signature ici
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Avec le doigt ou la souris.</p>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-zinc-500" onClick={handleClear} disabled={!hasInk}>
          <Eraser className="h-3.5 w-3.5" aria-hidden />
          Effacer
        </Button>
      </div>
    </div>
  );
}

// ─── Animation de réussite (cercle + check qui se dessine) ───

export function SignatureSuccessAnimation({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 15 }}
      className={className}
    >
      <svg viewBox="0 0 52 52" className="h-20 w-20" aria-hidden>
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="#ecfdf5"
          stroke="#059669"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
        <motion.path
          d="M15.5 27.5l7 7L37 18.5"
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
