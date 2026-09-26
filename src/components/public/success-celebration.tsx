"use client";

// ─── Célébration de paiement réussi ──────────────────────────
// Confettis émeraude/zinc qui tombent UNE fois + check qui se dessine.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  round: boolean;
  color: string;
  drift: number;
  spin: number;
};

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a1a1aa", "#d4d4d8"];

/** Valeurs déterministes (pas de Math.random au rendu → pas de mismatch SSR). */
function generatePieces(): Piece[] {
  return Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: (i * 37) % 100,
    delay: ((i % 8) * 0.14 + ((i * 13) % 7) * 0.05) % 1.2,
    duration: 2.4 + ((i * 7) % 10) / 5,
    size: 6 + ((i * 11) % 9),
    round: i % 3 === 0,
    color: COLORS[i % COLORS.length],
    drift: ((i % 5) - 2) * 26,
    spin: 180 + (i % 4) * 90,
  }));
}

export function SuccessCelebration() {
  // Valeurs déterministes → rendu identique serveur/client, aucun état nécessaire.
  const [pieces] = useState<Piece[]>(() => generatePieces());

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-0"
            style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.round ? "9999px" : "2px" }}
            initial={{ y: "-8vh", x: 0, opacity: 0.9, rotate: 0 }}
            animate={{ y: "112vh", x: p.drift, opacity: [0.9, 0.9, 0.5], rotate: p.spin }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeIn", repeat: 0 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className="relative z-10 mx-auto"
      >
        <svg viewBox="0 0 52 52" className="h-24 w-24" aria-hidden>
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
    </>
  );
}
