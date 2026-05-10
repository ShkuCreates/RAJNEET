"use client";

import { motion } from "framer-motion";
import { MapPin, Crown, Calendar } from "lucide-react";
import Link from "next/link";

interface DistrictIdentityCardProps {
  state?: string;
  district?: string;
  rulingParty?: {
    name: string;
    color: string;
  };
  nextElection?: Date;
}

export function DistrictIdentityCard({
  state,
  district,
  rulingParty,
  nextElection,
}: DistrictIdentityCardProps) {
  const daysUntilElection = nextElection
    ? Math.ceil((nextElection.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl"
      style={{
        background: "rgba(212,175,55,0.05)",
        border: "1px solid rgba(212,175,55,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="text-gold-primary" size={16} />
        <span className="text-gold-primary text-xs font-inter font-semibold tracking-wider uppercase">
          YOUR ARENA
        </span>
      </div>

      {state && district ? (
        <div className="space-y-3">
          <div>
            <div className="text-text-secondary text-sm font-inter">{state}</div>
            <div
              className="text-xl font-cinzel font-bold"
              style={{ color: "#D4AF37" }}
            >
              {district}
            </div>
          </div>

          <div
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
            }}
          />

          {rulingParty && (
            <div className="flex items-center gap-2">
              <Crown className="text-gold-primary" size={14} />
              <span className="text-white text-sm font-inter">
                Ruling: {rulingParty.name}
              </span>
            </div>
          )}

          {daysUntilElection !== null && daysUntilElection > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="text-gold-primary" size={14} />
              <span className="text-white text-sm font-inter">
                Next Election: {daysUntilElection} days
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-text-secondary text-sm font-inter">
            No district set
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 text-gold-primary text-sm font-inter hover:underline"
          >
            Set your district →
          </Link>
        </div>
      )}
    </motion.div>
  );
}
