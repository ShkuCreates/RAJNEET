import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "font-bold rounded-lg transition-all duration-200 font-inter";
  
  const variantStyles = {
    primary: "bg-gold-gradient text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]",
    secondary: "bg-transparent border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-black",
    danger: "bg-danger text-white hover:opacity-90",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
