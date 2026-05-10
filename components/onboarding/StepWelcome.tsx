"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface StepWelcomeProps {
  username: string;
  onNext: () => void;
}

export function StepWelcome({ username, onNext }: StepWelcomeProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-8 py-8"
    >
      {/* Burst Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.5, delay: Math.random() * 0.5 }}
          className="absolute w-2 h-2 bg-gold-primary rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}

      {/* Pulsing Logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <Image
          src="/images/rajneet-logo.png"
          alt="RAJNEET"
          width={120}
          height={120}
          className="logo-pulse"
          style={{
            filter: "drop-shadow(0 0 40px rgba(212,175,55,0.6))",
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-cinzel text-white">
          Welcome to RAJNEET, <span className="text-gold-primary">{username}</span>.
        </h2>
        <p className="text-text-secondary font-inter text-lg">Your political journey begins.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button variant="primary" className="py-4 px-8 text-lg" onClick={onNext}>
          Enter the Arena →
        </Button>
      </motion.div>
    </motion.div>
  );
}
