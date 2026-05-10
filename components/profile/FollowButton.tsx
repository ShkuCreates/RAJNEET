"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
}

export function FollowButton({ isFollowing, onToggle }: FollowButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.div
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant={isFollowing ? "secondary" : "primary"}
        onClick={handleClick}
        className={isFollowing ? "" : "relative overflow-hidden"}
      >
        {isFollowing ? "Following ✓" : "Follow"}
        {!isFollowing && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        )}
      </Button>
    </motion.div>
  );
}
