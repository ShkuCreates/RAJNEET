"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INDIA_STATES } from "@/lib/constants";

interface StepStateProps {
  onNext: (state: string) => void;
}

export function StepState({ onNext }: StepStateProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-cinzel text-gold-gradient mb-2">Choose Your State</h2>
        <p className="text-text-secondary font-inter">Where will you begin your political journey?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {INDIA_STATES.map((state, index) => (
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card
              hover
              className={`p-4 cursor-pointer transition-all ${
                selectedState === state
                  ? "border-gold-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : ""
              }`}
              onClick={() => setSelectedState(state)}
            >
              <p className="text-white font-inter text-sm text-center">{state}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        variant="primary"
        className="w-full py-3"
        onClick={() => selectedState && onNext(selectedState)}
        disabled={!selectedState}
      >
        Continue →
      </Button>
    </motion.div>
  );
}
