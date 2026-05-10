import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "font-bold rounded-lg transition-all duration-200 font-inter";
  
  const variantStyles = {
    primary: "bg-gold-gradient text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]",
    secondary: "bg-transparent border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-black",
    danger: "bg-danger text-white hover:opacity-90",
    ghost: "bg-transparent border-none hover:bg-white/5",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size as keyof typeof sizeStyles]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
