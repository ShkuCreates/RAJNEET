"use client";

import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface CitizenCardProps {
  username: string;
  name: string;
  role: string;
  party?: string | null;
  partyColor?: string;
  followers: number;
  state: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  onView?: () => void;
}

export function CitizenCard({
  username,
  name,
  role,
  party,
  partyColor,
  followers,
  state,
  isFollowing = false,
  onFollow,
  onView,
}: CitizenCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar src={null} size="lg" showBorder />
          <div className="flex-1">
            <h3 className="text-white font-cinzel text-lg mb-1">{name}</h3>
            <Badge variant="gold" className="text-xs mb-2">
              {role}
            </Badge>
            {party && (
              <div
                className="inline-block px-2 py-1 rounded text-xs font-bold text-white"
                style={{ backgroundColor: partyColor || "#D4AF37" }}
              >
                {party}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
            <Users size={16} />
            <span>Followers: {followers}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
            <MapPin size={16} />
            <span>{state}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            className="flex-1"
            onClick={onFollow}
          >
            {isFollowing ? "Following ✓" : "Follow"}
          </Button>
          <Button variant="secondary" onClick={onView}>
            View
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
