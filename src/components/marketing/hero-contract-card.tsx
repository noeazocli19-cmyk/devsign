"use client";

import { motion } from "framer-motion";
import { Check, Bell, PenLine, Wallet, Rocket } from "lucide-react";

/**
 * Représentation visuelle premium d'un dashboard DevSign (hero de la landing).
 * Animations Framer Motion subtiles : apparition en cascade + pulsation légère.
 */
export function HeroContractCard() {
  return (
    <div className="relative" aria-hidden>
      {/* Halo décoratif */}
      <div className="absolute -inset-8 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Carte principale : Contrat #024 */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl border bg-card p-6 shadow-xl shadow-zinc-900/5"
      >
        {/* Barre fenêtre */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">devsign.app/c/8xK29p</span>
        </div>

        <div className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">Contrat #024 · DS-2026-000241</p>
              <h3 className="mt-1.5 text-lg font-semibold">Site web professionnel</h3>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">Jean Dupont</span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight">
            600 000 <span className="text-base font-medium text-muted-foreground">FCFA</span>
          </p>

          <div className="mt-5 space-y-3">
            <Row icon={<Check className="h-3.5 w-3.5" />} label="Signature" value="Signé" tone="success" delay={0.9} />
            <Row icon={<Check className="h-3.5 w-3.5" />} label="Acompte" value="300 000 FCFA payé" tone="success" delay={1.1} />
            <Row icon={<span className="block h-2 w-2 rounded-full bg-emerald-500" />} label="Projet" value="En cours" tone="live" delay={1.3} />
          </div>

          {/* Progression */}
          <div className="mt-6">
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>Créé</span>
              <span>Envoyé</span>
              <span>Signé</span>
              <span className="text-emerald-600">Payé</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification flottante : signature */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-3 -top-5 hidden rounded-xl border bg-card p-3.5 shadow-lg shadow-zinc-900/5 sm:block lg:-right-10"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <PenLine className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold">Jean a signé le contrat</p>
            <p className="text-[11px] text-muted-foreground">il y a 2 minutes</p>
          </div>
        </div>
      </motion.div>

      {/* Notification flottante : paiement */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-6 -left-3 hidden rounded-xl border bg-card p-3.5 shadow-lg shadow-zinc-900/5 sm:block lg:-left-10"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold">
              +300 000 FCFA <span className="font-normal text-muted-foreground">reçus</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Transaction SP-829183 · SaaSPay</p>
          </div>
        </div>
      </motion.div>

      {/* Notification flottante : projet lancé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-14 right-4 hidden rounded-xl border bg-card p-3 shadow-lg shadow-zinc-900/5 lg:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Rocket className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs font-semibold">Projet lancé 🚀</p>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ icon, label, value, tone, delay }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "live"; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 px-3.5 py-2.5"
    >
      <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <span
          className={
            tone === "success"
              ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
              : "flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50"
          }
        >
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </motion.div>
  );
}

export function HeroBell() {
  return <Bell className="h-4 w-4" aria-hidden />;
}
