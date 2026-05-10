import React from "react";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-text-secondary text-sm font-inter">{label}</label>}
      <motion.input
        whileFocus={{ boxShadow: "0 0 10px rgba(212,175,55,0.3)" }}
        className={`bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:border-gold-primary focus:outline-none font-inter ${className}`}
        {...props}
      />
    </div>
  );
};
