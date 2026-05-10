"use client";

import { motion } from "framer-motion";
import { Crown, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

interface PartyCardProps {
  name: string;
  tagline?: string;
  color: string;
  logo?: string;
  leader: string;
  members: number;
  approval: number;
  isMember?: boolean;
  onJoin?: () => void;
  onView?: () => void;
}

export function PartyCard({
  name,
  tagline,
  color,
  logo,
  leader,
  members,
  approval,
  isMember = false,
  onJoin,
  onView,
}: PartyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="p-6">
        {/* Party Color Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {logo ? (
              <Image
                src={logo}
                alt={`${name} logo`}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <Crown className="text-white" size={24} />
            )}
          </div>
          <div>
            <h3 className="text-white font-cinzel text-xl">{name}</h3>
            {tagline && (
              <p className="text-text-secondary text-sm font-inter italic">{tagline}</p>
            )}
          </div>
        </div>

        {/* Party Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
            <Crown size={16} />
            <span>Leader: @{leader}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
            <Users size={16} />
            <span>Members: {members}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-primary" />
            <span className="text-white text-sm font-inter">Approval: {approval}%</span>
          </div>
          {/* Approval Bar */}
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${approval}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isMember ? (
            <Button variant="secondary" className="flex-1" disabled>
              Member ✓
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={onJoin}>
              Join Party
            </Button>
          )}
          <Button variant="secondary" onClick={onView}>
            View
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
