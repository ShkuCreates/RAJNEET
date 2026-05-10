import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", hover = true, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { translateY: -4, boxShadow: "0 0 20px rgba(212,175,55,0.3)" } : {}}
      className={`bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-12 ${className}`}
      style={{ borderRadius: "12px" }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
