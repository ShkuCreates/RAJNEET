"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PartyCard } from "@/components/parties/PartyCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";

const mockParties = [
  {
    name: "Progressive Party",
    tagline: "Building Tomorrow Together",
    color: "#D4AF37",
    leader: "rahul_politics",
    members: 342,
    approval: 67,
  },
  {
    name: "People's Movement",
    tagline: "Voice of the Common Citizen",
    color: "#27AE60",
    leader: "amit_activist",
    members: 189,
    approval: 54,
  },
  {
    name: "Digital India Party",
    tagline: "Innovation for Progress",
    color: "#3498DB",
    leader: "vikram_influencer",
    members: 256,
    approval: 72,
  },
  {
    name: "National Unity Front",
    tagline: "United We Stand",
    color: "#C0392B",
    leader: "neeta_law",
    members: 412,
    approval: 48,
  },
];

export default function PartiesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [partyTagline, setPartyTagline] = useState("");
  const [partyColor, setPartyColor] = useState("#D4AF37");
  const { data: session } = useSession();

  const handleCreateParty = () => {
    // In real implementation, call API to create party
    console.log("Creating party:", { partyName, partyTagline, partyColor });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-cinzel text-gold-gradient mb-2">
                Political Parties of RAJNEET
              </h1>
              <p className="text-text-secondary font-inter">
                Join forces with like-minded citizens to amplify your influence
              </p>
            </div>
            {session?.user && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Party
              </Button>
            )}
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockParties.map((party, index) => (
              <PartyCard key={party.name} {...party} />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Create Party Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Party"
      >
        <div className="space-y-4">
          <Input
            label="Party Name"
            placeholder="Enter party name"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />
          <Input
            label="Party Tagline"
            placeholder="Enter party tagline"
            value={partyTagline}
            onChange={(e) => setPartyTagline(e.target.value)}
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
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateParty}
              disabled={!partyName.trim()}
            >
              Create Party
            </Button>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
