import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "silver" | "danger";
  icon?: LucideIcon;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  icon: Icon,
  className = "",
}) => {
  const variantStyles = {
    gold: "bg-gold-gradient text-black",
    silver: "bg-gray-400 text-black",
    danger: "bg-danger text-white",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon size={14} />}
      <span>{children}</span>
    </motion.div>
  );
};
