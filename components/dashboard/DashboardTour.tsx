"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardTour() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("rajneet_visited");
    if (!hasVisited) {
      setTimeout(() => setStep(1), 2000);
      setTimeout(() => setStep(2), 5000);
      setTimeout(() => {
        setStep(null);
        localStorage.setItem("rajneet_visited", "true");
      }, 8000);
    }
  }, []);

  if (step === null) return null;

  return (
    <AnimatePresence>
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          {/* Highlight Filter Tabs - approximately positioned */}
          <div className="absolute top-[280px] left-8 w-[400px] h-[60px] rounded-2xl border-4 border-accent-blue shadow-[0_0_0_9999px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.5)] animate-pulse" />
          <div className="absolute top-[350px] left-12 p-4 bg-accent-blue rounded-xl text-white font-bold text-xs shadow-xl">
            Filter news by region and category here.
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          {/* Highlight First Debate Button - approximately positioned */}
          <div className="absolute top-[650px] right-[40%] w-[120px] h-[40px] rounded-xl border-4 border-accent-amber shadow-[0_0_0_9999px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.5)] animate-pulse" />
          <div className="absolute top-[600px] right-[38%] p-4 bg-accent-amber rounded-xl text-white font-bold text-xs shadow-xl">
            Click Debate to join the conversation!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
