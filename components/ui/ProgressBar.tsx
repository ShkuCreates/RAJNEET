"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "#D4AF37",
  showLabel = false,
  label,
}) => {
  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between mb-2">
          <span className="text-text-secondary text-sm font-inter">{label}</span>
          <span className="text-gold-primary text-sm font-inter">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden border border-[rgba(212,175,55,0.2)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};
