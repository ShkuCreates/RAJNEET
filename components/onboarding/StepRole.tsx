"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIZEN_ROLES, ROLE_DESCRIPTIONS, ROLE_ICONS } from "@/lib/constants";
import * as Icons from "lucide-react";

interface StepRoleProps {
  onNext: (role: string) => void;
}

export function StepRole({ onNext }: StepRoleProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-cinzel text-gold-gradient mb-2">Choose Your Starting Role</h2>
        <p className="text-text-secondary font-inter">Every politician starts somewhere</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {CITIZEN_ROLES.map((role, index) => {
          const Icon = Icons[ROLE_ICONS[role] as keyof typeof Icons] as Icons.LucideIcon;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hover
                className={`p-4 cursor-pointer transition-all ${
                  selectedRole === role
                    ? "border-gold-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : ""
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-start gap-3">
                  {Icon && <Icon className="text-gold-primary flex-shrink-0" size={24} />}
                  <div className="flex-1">
                    <h3 className="text-white font-cinzel text-lg mb-1">{role}</h3>
                    <p className="text-text-secondary text-sm font-inter mb-2">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                    <Badge variant="silver">Citizen Tier</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button
        variant="primary"
        className="w-full py-3"
        onClick={() => selectedRole && onNext(selectedRole)}
        disabled={!selectedRole}
      >
        Continue →
      </Button>
    </motion.div>
  );
}
