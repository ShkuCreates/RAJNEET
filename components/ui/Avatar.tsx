import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
  showBorder = false,
}) => {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`rounded-full overflow-hidden flex items-center justify-center bg-bg-tertiary ${sizeStyles[size]} ${showBorder ? "border-2 border-gold-primary" : ""} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="text-text-secondary" size={size === "xl" ? 48 : size === "lg" ? 32 : 20} />
      )}
    </motion.div>
  );
};
