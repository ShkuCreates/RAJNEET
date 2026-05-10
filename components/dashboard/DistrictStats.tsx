"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Landmark,
  Coins,
  TrendingUp,
  AlertTriangle,
  Crown,
  Clock,
} from "lucide-react";

interface StatItem {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  showBar?: boolean;
  barValue?: number;
}

export function DistrictStats() {
  const [stats, setStats] = useState<StatItem[]>([
    { icon: Users, label: "Total Citizens", value: 0 },
    { icon: CheckCircle, label: "Active Users", value: 0 },
    { icon: Landmark, label: "Ruling Party", value: "Independent" },
    { icon: Coins, label: "Treasury", value: "₹0" },
    { icon: TrendingUp, label: "Approval Rating", value: 0, showBar: true, barValue: 67 },
    { icon: AlertTriangle, label: "Corruption Score", value: 0, showBar: true, barValue: 23 },
    { icon: Crown, label: "Current MLA", value: "None" },
    { icon: Clock, label: "Election Countdown", value: "30d 12h" },
  ]);

  useEffect(() => {
    // Simulate count-up animation
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === "Total Citizens" && typeof stat.value === "number") {
            return { ...stat, value: Math.min(stat.value + 15, 1247) };
          }
          if (stat.label === "Active Users" && typeof stat.value === "number") {
            return { ...stat, value: Math.min(stat.value + 5, 342) };
          }
          if (stat.label === "Approval Rating" && typeof stat.value === "number") {
            return { ...stat, value: Math.min(stat.value + 2, 67) };
          }
          if (stat.label === "Corruption Score" && typeof stat.value === "number") {
            return { ...stat, value: Math.min(stat.value + 1, 23) };
          }
          return stat;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-72 bg-bg-secondary border-l border-[rgba(212,175,55,0.2)] min-h-screen p-4"
    >
      <h2 className="text-2xl font-cinzel text-gold-gradient mb-6">District Pulse</h2>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-bg-tertiary border border-[rgba(212,175,55,0.1)] rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="text-gold-primary" size={18} />
                <span className="text-text-secondary text-sm font-inter">{stat.label}</span>
              </div>
              
              {stat.showBar && stat.barValue !== undefined ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white font-inter font-bold">{stat.value}%</span>
                  </div>
                  <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.barValue}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: stat.barValue > 50 ? "#27AE60" : "#C0392B",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-white font-cinzel text-lg">{stat.value}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
