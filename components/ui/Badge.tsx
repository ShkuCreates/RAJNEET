import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "silver" | "danger" | "secondary";
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  icon: Icon,
  size = "md",
  className = "",
  style,
}) => {
  const variantStyles = {
    gold: "bg-gold-gradient text-black",
    silver: "bg-gray-400 text-black",
    danger: "bg-danger text-white",
    secondary: "bg-transparent border border-gold-primary text-gold-primary",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1 rounded-full font-bold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
    >
      {Icon && <Icon size={size === "sm" ? 12 : size === "lg" ? 18 : 14} />}
      <span>{children}</span>
    </motion.div>
  );
};
