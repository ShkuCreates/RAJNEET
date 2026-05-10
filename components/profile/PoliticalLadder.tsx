"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROLE_THRESHOLDS, ROLE_DESCRIPTIONS } from "@/lib/constants";
import { Crown, HelpCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

interface PoliticalLadderProps {
  currentRole: string;
  currentFollowers: number;
  onClaimRole?: (role: string) => void;
}

export function PoliticalLadder({ currentRole, currentFollowers, onClaimRole }: PoliticalLadderProps) {
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Find the next role the user can unlock
  const roles = Object.entries(ROLE_THRESHOLDS).sort(([, a], [, b]) => a - b);
  const nextRoleEntry = roles.find(([_, threshold]) => threshold > currentFollowers);
  const nextRole = nextRoleEntry?.[0];
  const nextThreshold = nextRoleEntry?.[1] || 0;

  const progress = nextRole
    ? (currentFollowers / nextThreshold) * 100
    : 100;

  const canClaim = nextRole && currentFollowers >= nextThreshold;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-cinzel text-gold-gradient">Your Political Journey</h3>
        <button
          onClick={() => setIsTipsOpen(true)}
          className="text-gold-primary hover:text-gold-bright transition-colors"
        >
          <HelpCircle size={20} />
        </button>
      </div>

      <div className="bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-text-secondary text-sm font-inter">Current Role</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="gold" icon={Crown}>
                {currentRole}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-sm font-inter">Followers</p>
            <p className="text-white font-cinzel text-xl">
              {currentFollowers} / {nextThreshold}
            </p>
          </div>
        </div>

        {nextRole && (
          <>
            <ProgressBar
              progress={progress}
              color="#D4AF37"
              showLabel
              label="Progress to next role"
            />

            <p className="text-text-secondary text-sm font-inter mt-2">
              {nextThreshold - currentFollowers} more followers to become eligible for{" "}
              <span className="text-gold-primary font-bold">{nextRole}</span>
            </p>

            {canClaim && onClaimRole && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4"
              >
                <Button variant="primary" className="w-full" onClick={() => onClaimRole(nextRole)}>
                  Claim {nextRole} Role
                </Button>
              </motion.div>
            )}
          </>
        )}

        {!nextRole && (
          <div className="mt-4 text-center">
            <Badge variant="gold" icon={Crown}>
              You have reached the highest political rank!
            </Badge>
          </div>
        )}
      </div>

      {/* Role Progression List */}
      <div className="space-y-2">
        <p className="text-text-secondary text-sm font-inter mb-2">Political Ranks</p>
        {roles.map(([role, threshold], index) => {
          const isCurrent = role === currentRole;
          const isUnlocked = currentFollowers >= threshold;
          const isNext = role === nextRole;

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isCurrent
                  ? "border-gold-primary bg-gold-glow"
                  : isUnlocked
                  ? "border-[rgba(212,175,55,0.2)] bg-bg-tertiary"
                  : "border-gray-800 bg-bg-secondary opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isUnlocked ? "bg-gold-primary text-black" : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className={`font-inter ${isUnlocked ? "text-white" : "text-gray-500"}`}>
                    {role}
                  </p>
                  <p className="text-xs text-text-secondary">{threshold} followers</p>
                </div>
              </div>
              {isCurrent && (
                <Badge variant="gold" className="text-xs">
                  Current
                </Badge>
              )}
              {!isUnlocked && (
                <Crown className="text-gray-600" size={16} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tips Modal */}
      <Modal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        title="How to Gain Followers"
      >
        <div className="space-y-3">
          <p className="text-text-secondary font-inter">
            <strong className="text-gold-primary">Engage with content:</strong> Like, comment, and share posts to increase visibility.
          </p>
          <p className="text-text-secondary font-inter">
            <strong className="text-gold-primary">Create quality posts:</strong> Share insightful political commentary and news.
          </p>
          <p className="text-text-secondary font-inter">
            <strong className="text-gold-primary">Join debates:</strong> Participate in political discussions to showcase your expertise.
          </p>
          <p className="text-text-secondary font-inter">
            <strong className="text-gold-primary">Network actively:</strong> Follow and interact with other citizens.
          </p>
          <p className="text-text-secondary font-inter">
            <strong className="text-gold-primary">Join a party:</strong> Party members gain additional visibility.
          </p>
          <Button variant="primary" className="w-full mt-4" onClick={() => setIsTipsOpen(false)}>
            Got it!
          </Button>
        </div>
      </Modal>
    </div>
  );
}
