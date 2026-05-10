"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface StepPartyProps {
  onNext: (partyData: { action: "join" | "create" | "skip"; partyId?: string; partyName?: string; partyColor?: string; partyLogo?: string }) => void;
}

export function StepParty({ onNext }: StepPartyProps) {
  const [action, setAction] = useState<"join" | "create" | "skip" | null>(null);
  const [partyName, setPartyName] = useState("");
  const [partyColor, setPartyColor] = useState("#D4AF37");
  const [partyLogo, setPartyLogo] = useState("");

  const handleCreateParty = () => {
    if (partyName.trim()) {
      onNext({ action: "create", partyName, partyColor, partyLogo });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-cinzel text-gold-gradient mb-2">Join or Create a Party</h2>
        <p className="text-text-secondary font-inter">Political parties amplify your influence</p>
      </div>

      {!action ? (
        <div className="space-y-4">
          <Card
            hover
            className="p-6 cursor-pointer"
            onClick={() => setAction("join")}
          >
            <h3 className="text-white font-cinzel text-xl mb-2">Join a Party</h3>
            <p className="text-text-secondary font-inter">Browse and join existing parties in your state</p>
          </Card>

          <Card
            hover
            className="p-6 cursor-pointer"
            onClick={() => setAction("create")}
          >
            <h3 className="text-white font-cinzel text-xl mb-2">Create New Party</h3>
            <p className="text-text-secondary font-inter">Start your own political movement</p>
          </Card>

          <Card
            hover
            className="p-6 cursor-pointer"
            onClick={() => onNext({ action: "skip" })}
          >
            <h3 className="text-gold-dim font-cinzel text-xl mb-2">Skip — Stay Independent</h3>
            <p className="text-text-secondary font-inter">You can always join a party later</p>
          </Card>
        </div>
      ) : action === "join" ? (
        <div className="space-y-4">
          <p className="text-text-secondary font-inter">No parties available in your state yet. Be the first to create one!</p>
          <Button variant="secondary" className="w-full" onClick={() => setAction("create")}>
            Create a Party Instead
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setAction(null)}>
            Go Back
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Party Name"
            placeholder="Enter party name"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />

          <Input
            label="Party Logo URL (optional)"
            placeholder="https://example.com/logo.png"
            value={partyLogo}
            onChange={(e) => setPartyLogo(e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-text-secondary text-sm font-inter">Party Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={partyColor}
                onChange={(e) => setPartyColor(e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <span className="text-white font-inter">{partyColor}</span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full py-3"
            onClick={handleCreateParty}
            disabled={!partyName.trim()}
          >
            Create Party →
          </Button>

          <Button variant="secondary" className="w-full" onClick={() => setAction(null)}>
            Go Back
          </Button>
        </div>
      )}
    </motion.div>
  );
}
