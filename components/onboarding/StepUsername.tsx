"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepUsernameProps {
  onNext: (username: string) => void;
}

export function StepUsername({ onNext }: StepUsernameProps) {
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<"checking" | "available" | "taken" | null>(null);

  const checkAvailability = async (value: string) => {
    if (value.length < 3 || value.length > 20) {
      setAvailability(null);
      return;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      setAvailability(null);
      return;
    }

    setAvailability("checking");
    
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(value)}`);
      const data = await response.json();
      
      if (data.available) {
        setAvailability("available");
      } else {
        setAvailability("taken");
      }
    } catch (error) {
      setAvailability(null);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => checkAvailability(value), 500);
      return () => clearTimeout(timeoutId);
    }
    setAvailability(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-cinzel text-gold-gradient mb-2">Choose Your Username</h2>
        <p className="text-text-secondary font-inter">Your identity in the political arena</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={handleUsernameChange}
            className="text-lg"
          />
          {availability === "available" && (
            <Check className="absolute right-4 top-10 text-success" size={20} />
          )}
          {availability === "taken" && (
            <X className="absolute right-4 top-10 text-danger" size={20} />
          )}
        </div>

        <p className="text-text-secondary text-sm font-inter">
          3–20 characters, alphanumeric + underscores only
        </p>

        {availability === "taken" && (
          <p className="text-danger text-sm font-inter">This username is already taken</p>
        )}
      </div>

      <Button
        variant="primary"
        className="w-full py-3"
        onClick={() => onNext(username)}
        disabled={availability !== "available"}
      >
        Claim Your Identity →
      </Button>
    </motion.div>
  );
}
